
/*
 * Timeline - ES6 Class
 * @param  parentElement 	-- the HTML element in which to draw the visualization
 * @param  viz_data             -- the viz_data the timeline should use
 */

class Timeline {

    // constructor method to initialize Timeline object
    constructor(parentElement, data){
        this._parentElement = parentElement;
        this._data = data;
        this._displayData = data;
        this._parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
        this._timeFormat = d3.timeFormat("%Y-%m-%d")
        this._yearFormat = d3.timeFormat("%Y")
        this._monthFormat = d3.timeFormat("%m")
        this._months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep"];
        this._monthAxis = function(d){return this._months[d-1]}
    }

    // create initVis method for Timeline class
    initVis() {

        // store keyword this which refers to the object it belongs to in variable vis
        let vis = this;

        vis.margin = {top: 10, right: 40, bottom: 20, left: 40};

        vis.width = $('#' + vis._parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis._parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis._parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        console.log(vis._displayData)
        vis.agg_data =[]
        vis._displayData.forEach(d=>{
            d.day = vis._timeFormat(vis._parseDate(d.date));
            d.year = vis._yearFormat(vis._parseDate(d.date))
            d.month = vis._monthFormat(vis._parseDate(d.date));
            if(d.year == '2020'){
                vis.agg_data.push(d);}
        })

        vis.AreaData = Array.from(d3.group(vis.agg_data, d =>d.sentiment),
            ([key, value]) => ({key, value}));

        vis.PosData = Array.from(d3.group(vis.AreaData[0]['value'], d =>d.month),
            ([key, value]) => ({key, value}));
        vis.NegData = Array.from(d3.group(vis.AreaData[1]['value'], d =>d.month),
            ([key, value]) => ({key, value}));

        let NegData = []
        vis.NegData.forEach(d=>{
                d.key = parseFloat(d.key);
                d.len = d.value.length;
                NegData.push(d)
        });
        vis.NegData = NegData;

        let PosData = []
        vis.PosData.forEach(d=>{
                d.key = parseFloat(d.key);
                d.len = d.value.length;
                PosData.push(d)
        });
        vis.PosData = PosData;
        console.log(vis.NegData,vis.PosData);
        let neg_len = NegData.map(a => a.len);
        let pos_len = PosData.map(a => a.len);
        let total_len = neg_len.concat(pos_len);
        vis.max_y = Math.max(...total_len)
        vis.min_y = Math.min(...total_len)


        // similar to linspace in python; reusable
        function makeArr(startValue, stopValue, cardinality) {
            var arr = [];
            var step = (stopValue - startValue) / (cardinality - 1);
            for (var i = 0; i < cardinality; i++) {
                arr.push(startValue + (step * i));
            }
            return arr;
        }

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width])
            .domain(d3.extent(vis.NegData, function(d) { return d.key; }));

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, vis.max_y]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickFormat(function(d){return vis._monthAxis(d)})

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .tickValues(makeArr(0,vis.max_y,vis.max_y/2))


        // SVG area path generator
        vis.area = d3.area()
            .x(function(d) { return vis.x(d.key); })
            .y0(vis.height)
            .y1(function(d) { return vis.y(d.len); });

        // Draw area by using the path generator
        vis.svg.append("path")
            .datum(vis.PosData)
            .attr("fill", "#08519c")
            .attr("opacity","0.5")
            .attr("d", vis.area);
        vis.svg.append("path")
            .datum(vis.NegData)
            .attr("fill", "#a50f15")
            .attr("opacity","0.5")
            .attr("d", vis.area);


        // TO-DO: Initialize brush component
        let brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush",  function(event){
                selectedTimeRange = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];
                myBarChart.wrangleData();
                // myTopicChart.wrangleData();
});


        // TO-DO: Append brush component here
        vis.svg.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height",vis.height + 7);

        vis.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // Append x-axis
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        // Append y-axis
        vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(0,0)")
            .call(vis.yAxis);

        vis.svg.append("text")
            .attr("class","legend-label")

        vis.svg.select(".legend-label")
            .text("# of tweets")
            .attr('fill','black')
            .attr('font-size',8)
            .attr("class","y-axis-label")
            .attr("y",0)
            .attr("x",0)
    }
}

