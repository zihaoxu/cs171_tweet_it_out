/* * * * * * * * * * * * * *
*     class BrushVis       *
* * * * * * * * * * * * * */
class BrushVis{
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // call method initVis
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

        // clip path
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // add y-name
        vis.svg.append('g')
            .append('text')
            .text('Number of Tweets by Date')
            .attr('transform', `translate(${vis.width*0.05}, -30)`)
            .attr('text-anchor', 'middle')
            .attr("font-size", 'small');

        // init scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y");

        // init pathGroup
        vis.pathGroup = vis.svg.append('g').attr('class','pathGroup');

        // init path one (average)
        vis.line = vis.pathGroup
            .append('path')
            .attr("class", "line");

        // init path generator
        vis.area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return vis.x(d.date); })
            .y0(vis.y(0))
            .y1(function(d) { return vis.y(d.count); });

        // init brushGroup:
        vis.brushGroup = vis.svg.append("g")
            .attr("class", "brush");

        // init brush
        vis.brush = d3.brushX()
            .extent([[0, -10], [vis.width, vis.height],])
            .on("brush end", function(event){
                if (event.sourceEvent && event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
                selectedTime = event.selection || vis.x.range();
                selectedTimeConverted = [vis.x.invert(selectedTime[0]), vis.x.invert(selectedTime[1])];
                sentiPlot.wrangleData();
                vis.brushHandle
                    .attr("display", null)
                    .attr("transform", (d, i) => "translate(" + [selectedTime[i], -vis.height - 20] + ")");
            })

        // custom brushHandlePath
        vis.brushHandlePath = d => {
            let e = +(d.type === "e"),
                x = e ? 1 : -1,
                y = vis.height + 10;
            return (
                "M" +0.5 * x +"," +y +
                "A6,6 0 0 " +e +" " +6.5 * x +
                "," +(y + 6) +"V" +(2 * y - 6) +
                "A6,6 0 0 " +e +" " +0.5 * x +
                "," +2 * y +"Z" +"M" +
                2.5 * x +"," +(y + 8) +"V" +
                (2 * y - 8) +"M" +
                4.5 * x +"," +(y + 8) +
                "V" +(2 * y - 8)
            );
        };

        // init basic data processing
        vis.wrangleData();

        // init brushlocation
        vis.initBrushLocation();
    }

    wrangleData(){
        let vis = this;
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // update domains
        vis.x.domain( d3.extent(vis.data, function(d) { return d.date }) );
        vis.y.domain( [0, d3.max(vis.data, function(d) { return d.count }) * 1.1] );

        // draw x & y axis
        vis.xAxis.call(d3.axisBottom(vis.x));
        vis.yAxis.call(d3.axisLeft(vis.y));

        // draw line
        vis.line.datum(vis.data)
            .attr("d", vis.area)
            .attr("fill", "#1DA1F2")
            .attr("opacity", 0.5)
            .attr("stroke", "#1DA1F2")
            .attr("clip-path", "url(#clip)");

        vis.contextBrush = vis.brushGroup
            .call(vis.brush);

        vis.brushHandle = vis.contextBrush
            .selectAll(".handle--custom")
            .data([{ type: "w" }, { type: "e" }])
            .enter()
            .append("path")
            .attr("class", "handle--custom")
            .attr("stroke", "#000")
            .attr("cursor", "ew-resize")
            .attr("d", vis.brushHandlePath);

        vis.contextBrush.call(vis.brush.move, [0, vis.width / 2]);
    }

    initBrushLocation(){
        let vis = this;

        let brushSelection = [vis.width*0.88, vis.width];
        vis.svg.select(".brush").call(vis.brush.move, brushSelection);
        vis.brushHandle
            .attr("display", null)
            .attr("transform", (d, i) => "translate(" + [brushSelection[i], - vis.height - 20] + ")");
    }
}