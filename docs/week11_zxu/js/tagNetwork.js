class TagNetwork {
    // TODO 3: add a right panel to show additional details
    // TODO 4: aesthtics touchup

    constructor(parentElement, node_data, edge_data) {
        this.parentElement = parentElement;
        this.node_data = node_data;
        this.edge_data = edge_data;

        // for legend
        this.legend_colors= ["#08306b","#08519c","#2171b5","#4292c6","#6baed6","#9ecae1","#c6dbef","#deebf7","#fee0d2", "#fcbba1","#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15","#67000d"];

        this.initVis()
    }

    initVis(){
        let vis = this;

        // define margins
        vis.margin = {top: 0, right: 40, bottom: 40, left: 0};
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

        // initialize a simple force layout, using the nodes and edges in dataset
        let strength = Math.min(vis.height, vis.width)*0.32;
        vis.force = d3.forceSimulation(vis.node_data.nodes)
            .force("charge", d3.forceManyBody().strength(-strength))
            .force("link", d3.forceLink(vis.edge_data.edges).distance(strength))
            .force("center", d3.forceCenter().x(vis.width/2).y(vis.height/2));

        // define scales
        // vis.nodeColor = d3.scaleOrdinal(d3.schemeCategory10);
        vis.edgeScale = d3.scaleLog().range([1.3,12]);
        vis.nodeScale = d3.scaleSqrt().range([16,40]);
        vis.legendX = d3.scaleLinear().range([0, 20*vis.legend_colors.length]).domain([0, vis.legend_colors.length]);

        vis.updateViz();
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

    wrangleData() {
        let vis = this;

        let start_date = selectedTimeRange[0],
            end_date = selectedTimeRange[1];
        let new_data = processor.processData(start_date, end_date);
        vis.node_data_display = new_data[0];
        vis.edge_data_display = new_data[1];

        vis.updateViz();
    }
    updateViz(){
        let vis = this;

        // define domains for scales
        vis.edgeScale.domain(d3.extent(vis.edge_data.edges, d=>d.edge_count));
        vis.nodeScale.domain(d3.extent(vis.node_data.nodes, d=>d.tag_count));

        // create edges as lines
        vis.edges = vis.svg.selectAll("line")
            .data(vis.edge_data.edges)
            .enter()
            .append("line")
            .style("stroke", "#ccc")
            .style("stroke-width", d=>vis.edgeScale(d.edge_count));

        // create nodes as circles
        vis.nodesGroup = vis.svg.selectAll("g")
            .data(vis.node_data.nodes)
            .enter()
            .append("g")

        // create the nodes
        vis.nodes = vis.nodesGroup
            .append("circle")
            .attr("r", d=>vis.nodeScale(d.tag_count))
            .style("fill", d=>vis.nodeColor(d.senti))
            .style("stroke", '#ccc')
            .style("stroke-width", 2)
            .call(vis.dragFunc(vis.force))
            .on('mouseover', function (i, d){
                // update the detail area
                // let detail_area = document.getElementById("tagDails");
                // detail_area.innerHTML = `<!--Hashtag: ${d.tag_name}</br>Count: ${d.tag_count}</br>Sentiment Score: -->${d.senti}`;
                d3.select("#tagent-tag").html("").append("text").text(d.tag_name);
                d3.select("#tagent-count").html("").append("text").text(d.tag_count);
                d3.select("#tagent-senti").html("").append("text").text(d.senti.toFixed(4));
                d3.select("#tagent-timeRange").html("").append("text").text(`${selected_month[0]} ~ ${selected_month[1]}`);

                // Highlight the nodes: every node is green except of him
                vis.nodes
                    .style('opacity', 0.4); // fill everything with gray
                d3.select(this)
                    .style('fill', vis.nodeColor(d.senti))
                    .style('opacity', 1)
                    .style("stroke-width", 4)
                    .style("stroke", vis.nodeColor(d.senti));
                // Highlight the edges
                vis.edges
                    .style('stroke', function (link_d) {
                        return link_d.source.id === d.id || link_d.target.id === d.id ? vis.nodeColor(d.senti) : '#b8b8b8';
                    })
                    .style('stroke-width', function (link_d) {
                        return link_d.source.id === d.id || link_d.target.id === d.id ? vis.edgeScale(link_d.edge_count) : 2;
                    })
                    .style('opacity', function (link_d) {
                        return link_d.source.id === d.id || link_d.target.id === d.id ? 1 : 0.1;
                    })
            })
            .on('mouseout', function (d) {
                // restore the nodes and edges
                vis.nodes
                    .style("fill", d=>vis.nodeColor(d.senti))
                    .style('opacity', 1)
                    .style("stroke", '#ccc')
                    .style("stroke-width", 2);
                vis.edges
                    .style('stroke', "#ccc")
                    .style('stroke-width', d=>vis.edgeScale(d.edge_count))
                    .style("opacity", 1);
            });


        // add hashtag to circles
        vis.nodeTags = vis.nodesGroup
            .append("text")
            .text(d=>d.tag_name)
            .attr("font-size", d=>vis.nodeScale(d.tag_count) * 0.75);

        // add tick event for forces
        vis.force.on("tick", function() {
            vis.edges.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
            vis.nodes.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            vis.nodeTags.attr("x", function(d) { return d.x+vis.nodeScale(d.tag_count) ; })
                .attr("y", function(d) { return d.y+vis.nodeScale(d.tag_count)*0.2; });
        });

        // add legend group
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.xtransform}, ${vis.ytransform})`)
        vis.legend_scale = vis.svg.append("g")
            .attr('class', 'legend-scale')
            .attr('transform', `translate(${vis.xtransform}, ${vis.ytransform})`)

        // create the color scale legend
        vis.legend.selectAll().data(vis.legend_colors.reverse())
            .enter()
            .append('rect')
            .attr("x", (d, i) => vis.legendX(i))
            .attr("y",0)
            .attr("width", 20)
            .attr("height", 5)
            .attr("class",'legend')
            .attr("fill",d=>d)

        // define x axis for the color scale
        vis.colorAxis = d3.axisBottom()
            .scale(vis.legendX)
            .tickValues([0, 16])
            .tickFormat(function(d){if(d==0){return 'Negative'}else{return 'Positive'}});

        // call the color axis
        vis.svg.select(".legend-scale").call(vis.colorAxis);
    }

    dragFunc(simulation){
        function dragStarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        function dragEnded(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        return d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded);
    }
}