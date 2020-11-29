class SentiPlot{
    // TODO 1: highlight by weekday
    // TODO 2: dropdown line for important events
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;
        this.nodeColor = {0:"#E8E83E",
            1:"#FFC78B",
            2:"#E27B9E",
            3:"#477413",
            4:"#1DA1F2",
            5:"#9960AB",
            6:"#2D1A6C"};
        this.id_to_weekday = {
            0:"Monday",
            1:"Tuesday",
            2:"Wednesday",
            3:"Thursday",
            4:"Friday",
            5:"Saturday",
            6:"Sunday",
        }

        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 50, right: 50, bottom: 50, left: 50};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add y-name
        vis.svg.append('g')
            .append('text')
            .text('Sentiment Score')
            .attr('transform', `translate(${vis.height*0.02}, ${vis.height*0.13}) rotate(90)`)
            .attr('text-anchor', 'middle')
            .attr("font-size", 'small');

        // init scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);
        vis.r_min = vis.width / 500;
        vis.r_max = vis.r_min * 2;
        vis.nodeScale = d3.scaleSqrt().range([vis.r_min,vis.r_max]);

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y");

        // init path generator
        vis.drawLine = d3.line()
            .curve(d3.curveLinear)
            .x(function(d) { return vis.x(d.date); });

        // zoom function
        vis.zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([
                [0, 0],
                [vis.width, vis.height],
            ]).extent([
                [0, 0],
                [vis.width, vis.height],
            ])

        // clip path for zooming
        vis.clip = vis.svg
            .append("defs")
            .append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("x", 0)
            .attr("y", 0);

        // add group to lines with clip path
        vis.lineGroup = vis.svg
            .append("g")
            .attr("class", "lineGroup")
            .attr("clip-path", "url(#clip)");

        // initialize tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "mapTooltip")

        // draw legend for weekday
        vis.weekday_legend = vis.svg
            .append("g")
            .attr("class", "weekday_legend")
            .attr("transform", "translate(" + vis.width*0.51 + ",0)");;

        vis.weekday_nodes = vis.weekday_legend.selectAll(".weekday-legend")
            .data(Object.values(vis.nodeColor))
            .enter()
            .append("circle")
            .attr("class", "weekday-legend")
            .attr("fill", (d,i)=>vis.nodeColor[i])
            .attr("r", 5)
            .attr('stroke-width', '1px')
            .attr('stroke', "black")
            .attr("cx", (d,i) => i*vis.width/15)
            .attr("cy", 0);

        vis.weekday_legend.selectAll(".weekday-legend-text")
            .data(Object.values(vis.nodeColor))
            .enter()
            .append("text")
            .attr("class", "weekday-legend-text")
            .attr("font-size", 'xx-small')
            .text((d,i) => vis.id_to_weekday[i])
            .attr("x", (d,i) => i*vis.width/15+10)
            .attr("y", 5);

        // init selectedTimeConverted
        selectedTimeConverted = vis.x.range();

        this.wrangleData();
    }

    wrangleData(){
        let vis = this;

        vis.data.forEach((d, i)=>{
            let min_id_7 = Math.max(0, i-7+1),
                min_id_30 = Math.max(0, i-30+1);
            let last_7 = [],
            last_30 = [];
            vis.data.slice(min_id_7, i+1).forEach(dd => {
                last_7.push(dd.senti);
            })
            vis.data.slice(min_id_30, i+1).forEach(dd => {
                last_30.push(dd.senti);
            })
            d.senti_SMA7 = last_7.reduce((acc, c) => acc + c, 0) / last_7.length;
            d.senti_SMA30 = last_30.reduce((acc, c) => acc + c, 0) / last_30.length;
        })

        vis.displayData = vis.data;

        this.updateVis();
    }

    updateVis(){
        let vis = this;

        // update domains
        vis.x.domain(selectedTimeConverted);
        let y_min = d3.min(vis.displayData, d=>d[selected_view]),
            y_max = d3.max(vis.displayData, d=>d[selected_view]),
            y_range = y_max - y_min;
        let y_min_expand = y_min - y_range*0.05,
            y_max_expand = y_max + y_range*0.05;
        vis.y.domain([y_min_expand, y_max_expand]);
        vis.nodeScale.domain(d3.extent(vis.displayData, d=>d.count));

        // draw x & y axis
        vis.xAxis.transition().duration(500).call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(500).call(d3.axisLeft(vis.y));

        // draw sentiment line
        vis.drawLine
            .y(function(d) { return vis.y(d[selected_view]); });

        vis.line = vis.lineGroup
            .selectAll(".senti-line")
            .data([vis.displayData]);

        vis.line.exit().remove();

        vis.line.enter()
            .append("path")
            .attr("class", "senti-line")
            .attr("fill", "none")
            .attr("stroke", "black")
            .merge(vis.line)
            .transition()
            .duration(500)
            .attr("d", vis.drawLine);

        // draw sentiment circles
        vis.nodes = vis.lineGroup
            .selectAll(".senti-nodes")
            .data(vis.displayData);

        vis.nodes.exit().remove();

        vis.nodes.enter()
            .append("circle")
            .attr("class", "senti-nodes")
            .attr("fill", d=>vis.nodeColor[d.weekday])
            .attr("r", d=>vis.nodeScale(d.count))
            .attr('stroke-width', '1px')
            .attr('stroke', "black")
            .attr('stroke-opacity', 1)
            .on("mouseover", function(event, d){
                d3.select(this)
                    .attr('stroke', d=>vis.nodeColor[d.weekday])
                    .attr('stroke-width', '15px')
                    .attr('stroke-opacity', 0.8);
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
             <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                 <h5> ${formatDate(d.date)}<h3>
                 <h6> Number of Sample Tweets: ${d.count}</h6>
                 <h6> Sentiment Score: ${d.senti.toFixed(4)}</h6>
                 <h6> Sentiment Score (7-day MA): ${d.senti_SMA7.toFixed(4)}</h6>
                 <h6> Sentiment Score (30-day MA): ${d.senti_SMA30.toFixed(4)}</h6>
             </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr('stroke', "black")
                    .attr('stroke-opacity', 1)
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .merge(vis.nodes)
            .transition()
            .duration(500)
            .attr("cx", d=>vis.x(d.date))
            .attr("cy", d=>vis.y(d[selected_view]));

        // call zoom
        vis.svg.call(vis.zoom);
    }
}