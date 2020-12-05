class WordCloud{
    constructor(parentElement, month_data) {
        this.parentElement = parentElement;
        this.month_data = month_data;

        // for legend
        this.legend_colors= ["#08306b","#08519c","#2171b5","#4292c6","#6baed6","#9ecae1","#c6dbef","#deebf7","#fee0d2", "#fcbba1","#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15","#67000d"];

        this.initViz()
    }

    initViz(){
        let vis = this;
        // define margins
        vis.margin = {top: 40, right: 40, bottom: 40, left: 0};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.xtransform = vis.width * 0.55;
        vis.ytransform = vis.height * .97;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.cloud_group = vis.svg
            .append('g')
            .attr('transform', `translate (${vis.width/2}, ${vis.height / 2})`)
            .attr("class", 'WC-group');

        // define scales
        vis.r_min = vis.width*0.02;
        vis.r_max = vis.r_min * 8;
        vis.f_size = d3.scaleSqrt().range([12, 100]);


        // initialize tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "mapTooltip")

        vis.legendX = d3.scaleLinear().range([0, vis.r_min*vis.legend_colors.length]).domain([0, vis.legend_colors.length]);

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this;

        vis.displayData = vis.month_data[selected_month];
        vis.updateViz()
    }

    nodeColor(score){
        let pos_colors = ["#08306b", "#08519c","#2171b5", "#4292c6", "#6baed6", "#9ecae1","#c6dbef", "#deebf7"],
            neg_colors = ["#fee0d2", "#fcbba1","#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15","#67000d"];
        if (score > 0){
            let id = pos_colors.length - parseInt(score * pos_colors.length) -1;
            return pos_colors[id]
        }else{
            let id = - parseInt(score * pos_colors.length);
            return neg_colors[id]
        }
    }

    updateViz(){
        let vis = this;

        vis.f_size.domain(d3.extent(vis.displayData, d=>d.size));

        vis.WC = d3.layout.cloud()
            .size([vis.width, vis.height])
            .words(vis.displayData)
            .padding(5)
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .font("Impact")
            .fontSize(d=>vis.f_size(d.size))
            .on("end", function(words){
                vis.cloud = vis.cloud_group.selectAll("wc-text")
                    .data(words);

                vis.cloud.exit().remove();

                vis.cloud_enter = vis.cloud.enter()
                    .append("text")
                    .attr("class", "wc-text")
                    .style("font-family", "Impact")
                    .style("fill", d=>vis.nodeColor(d.senti))
                    .attr("text-anchor", "middle")
                    .text(d=>d.text)
                    .on("mouseover", function(event, d){
                        vis.tooltip
                            .style("opacity", 1)
                            .style("left", event.pageX + 20 + "px")
                            .style("top", event.pageY + "px")
                            .html(`<div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                                     <h5> ${d.text}<h3>
                                     <h6> Importance: ${d.size.toFixed(0)}</h6>
                                     <h6> Sentiment Score: ${d.senti.toFixed(4)}</h6>
                                   </div>`);
                    })
                    .on('mouseout', function(event, d){
                        vis.tooltip
                            .style("opacity", 0)
                            .style("left", 0)
                            .style("top", 0)
                            .html(``);
                    })
                    .on('click', function(event, d){
                        let sampleDiv =  document.getElementById("sample-tweet");
                        sampleDiv.innerHTML = d.sample_tweet;
                        d3.select("#sample-tweet").attr('font-size', "5px");
                    });

                //Entering and existing words
                vis.cloud
                    .merge(vis.cloud_enter)
                    .transition()
                    .duration(600)
                    .style("font-size", function(d) {return d.size + "px"; })
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .style("fill-opacity", 1);
            })
            .start();

        // add legend group
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.xtransform}, ${vis.ytransform})`)
        vis.legend_scale = vis.svg.append("g")
            .attr('class', 'legend-scale')
            .attr('transform', `translate(${vis.xtransform}, ${vis.ytransform+7})`)

        // create the color scale legend
        vis.legend.selectAll().data(vis.legend_colors.reverse())
            .enter()
            .append('rect')
            .attr("x", (d, i) => vis.legendX(i))
            .attr("y", 0)
            .attr("width", vis.r_min)
            .attr("height", 7)
            .attr("class",'legend')
            .attr("fill", d=>d);

        // define x axis for the color scale
        vis.colorAxis = d3.axisBottom()
            .scale(vis.legendX)
            .tickValues([0, 16])
            .tickFormat(function(d){if(d==0){return 'Negative'}else{return 'Positive'}});

        // call the color axis
        vis.svg.select(".legend-scale").call(vis.colorAxis);
    }
}