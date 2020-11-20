class MonthMenu{
    constructor(parentElement, senti_data) {
        this.parentElement = parentElement;
        this.month_df = senti_data.month_df;
        this.months = {1:"Jan", 2:"Feb", 3:"Mar", 4:"Apr", 5:"May", 6:"June", 7:"July", 8:"Aug", 9:"Sep"};

        console.log(this.month_df)
        this.updateViz();
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

        // define margins
        vis.margin = {top: 40, right: 40, bottom: 40, left: 40};
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

        // define scales
        vis.r_min = vis.width*0.012;
        vis.r_max = vis.width*0.024;
        vis.xtransform = vis.r_max * 2;
        vis.x = d3.scaleLinear()
            .domain(d3.extent(vis.month_df, d=>d.month))
            .range([0, vis.height*vis.month_df.length*1.5]);
        vis.r = d3.scaleSqrt()
            .domain(d3.extent(vis.month_df, d=>d.count))
            .range([vis.r_min, vis.r_max]);

        // straight line to pass through all months
        vis.svg.append("line")
            .style("stroke", "black")
            .attr("x1", vis.x(1)+vis.xtransform)     // x position of the first end of the line
            .attr("y1", vis.height/4)      // y position of the first end of the line
            .attr("x2", vis.x(9)+vis.xtransform)     // x position of the second end of the line
            .attr("y2", vis.height/4)
        console.log(vis.x(1)+vis.xtransform, vis.x(9)+vis.xtransform)

        // Draw circles for months
        vis.monthGroup = vis.svg.selectAll("g")
            .data(vis.month_df)
            .enter()
            .append("g")

        vis.month = vis.monthGroup.append("text")
            .attr('x', d=>vis.x(d.month)+vis.xtransform)
            .attr('y', vis.height*1.2)
            .text(d=>vis.months[d.month])
            .attr("text-anchor", 'middle');

        vis.nodes = vis.monthGroup.append("circle")
            .attr('r', d=>vis.r(d.count))
            .attr('cx', d=>vis.x(d.month)+vis.xtransform)
            .attr('cy', vis.height/4)
            .attr('fill', d=>vis.nodeColor(d.senti))
            .attr("stroke", '#ccc')
            .attr("stroke-width", 2)
            .on('mouseover', function (i, d){
                // Highlight the center nodes
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke-width", vis.r(d.count)/2)
                    .style("stroke-opacity", 0.5)
                    .style("stroke", vis.nodeColor(d.senti));
            })
            .on('mouseout', function (d) {
                // restore the nodes and edges
                vis.nodes
                    .style('opacity', 1)
                    .style("stroke", '#ccc')
                    .style("stroke-width", 2)
                    .style("stroke-opacity", 1);
            })
            .on("click", function (event, d){
                selected_month = vis.months[d.month];
                updatePage()
            });


    }
}