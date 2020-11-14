class TagNetwork {
    // TODO 0: reproduce the plot using entirely javascript
    // TODO 1: change color palette to reflect sentiment
    // TODO 2: add hoverover-highlight effect
    // TODO 3: add a right panel to show additional details

    constructor(parentElement, node_data, edge_data) {
        this.parentElement = parentElement;
        this.node_data = node_data;
        this.edge_data = edge_data;

        console.log(node_data, edge_data);

        this.initVis()
    }

    initVis(){
        let vis = this;

        // define margins
        vis.margin = {top: 40, right: 40, bottom: 40, left: 40};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // initialize a simple force layout, using the nodes and edges in dataset
        vis.force = d3.forceSimulation(vis.node_data.nodes)
            .force("charge", d3.forceManyBody().strength(-vis.height*0.6))
            .force("link", d3.forceLink(vis.edge_data.edges).distance(vis.height*0.3))
            .force("center", d3.forceCenter().x(vis.width/2).y(vis.height/2));

        // define scales
        vis.nodeColor = d3.scaleOrdinal(d3.schemeCategory10);
        vis.edgeScale = d3.scaleLog().range([1,10]);
        vis.nodeScale = d3.scaleSqrt().range([16,40]);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
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
            .style("fill", function(d, i) {
                return vis.nodeColor(i);
            })
            .call(vis.dragFunc(vis.force))
            .on('mouseover', function (i, d){
                console.log(d.id, d.tag_name, d.tag_count);
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