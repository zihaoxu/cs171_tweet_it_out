
class TopicVis{

    constructor(parentElement, topicData){
        this.parentElement = parentElement;
        this.topicData = topicData;
        // parse date method
        this.parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
        this.monthFormat = d3.timeFormat("%m")
        this.legendx = 150;
        this.xtransform = 90;
        this.ytransform = 35;
        this.y_interval = 10;

        this.initVis()
    }
    angleToCoordinate(angle, value){
        let vis = this;
        let x = Math.cos(angle) * vis.radialScale(value);
        let y = Math.sin(angle) * vis.radialScale(value);
        return {"x": 70 + x, "y": 75 - y};
    }

    initVis(){
        let vis = this;
        console.log(vis.topicData)

        // title for the radar plot
        vis.title = "Topics Plot"

        vis.margin = {top: 0, right: 20, bottom: 0, left: 40};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr('transform', `translate (20,0)`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title topic-title')
            .append('text')
            .text(vis.title)
            .attr('transform', `translate(25,-10)`)
            .attr('text-anchor', 'middle');
        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        // if there is a region selected
        if (selectedTimeRange.length !== 0 ){
            if (selectedTimeRange[1]-selectedTimeRange[0]!=0){
                vis.filteredData = [];
                // iterate over all rows the csv (dataFill)
                vis.topicData.forEach(row => {
                    // and push rows with proper dates into filteredData
                    if (selectedTimeRange[0] <= vis.month && vis.month <= selectedTimeRange[1]) {
                        vis.filteredData.push(row);
                    }
                });
            }
        } else {
            vis.filteredData = [];
            vis.topicData.forEach(row=>{
                vis.filteredData.push(row);
            });
        }

        vis.finalfilteredData = {}
        vis.finalfilteredData['coronavirus'] = 0;
        vis.finalfilteredData['great job'] = 0;
        vis.finalfilteredData['fake news media'] = 0;
        vis.finalfilteredData['nothing democrats'] = 0;
        vis.finalfilteredData['million tests'] = 0;
        vis.finalfilteredData['stay home'] = 0;
        vis.filteredData.forEach(function(month){
            vis.finalfilteredData['coronavirus'] += month['coronavirus'];
            vis.finalfilteredData['great job'] += month['great job'];
            vis.finalfilteredData['fake news media'] += month['fake news media'];
            vis.finalfilteredData['nothing democrats'] += month['nothing democrats'];
            vis.finalfilteredData['million tests'] += month['million tests'];
            vis.finalfilteredData['stay home'] += month['stay home'];
        })
        vis.displayData = [vis.finalfilteredData];
        console.log(vis.displayData);
        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        vis.radialScale = d3.scaleLinear()
            .domain([0,d3.max(vis.displayData.map(d=>d.coronavirus))])
            .range([0,55]);
        vis.ticks = [1,Math.round(d3.max(vis.displayData.map(d=>d.coronavirus))/3),
            Math.round(d3.max(vis.displayData.map(d=>d.coronavirus))*2/3), d3.max(vis.displayData.map(d=>d.coronavirus))];

        vis.ticks.forEach(t =>
            vis.svg.append("circle")
                .attr("cx", 70)
                .attr("cy", 75)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", vis.radialScale(t))
        );

        vis.ticks.forEach(t =>
            vis.svg.append("text")
                .attr("x", 75)
                .attr("y", 75 - vis.radialScale(t))
                .attr("font-size","0.5rem")
                .attr("fill","gray")
                .text(t.toString())
        );

        vis.features = vis.topicData.columns.slice(1,)
        for (var i = 0; i < vis.topicData.length; i++) {
            let ft_name = vis.features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
            let line_coordinate = vis.angleToCoordinate(angle, d3.max(vis.displayData.map(d=>d.coronavirus)));
            let label_coordinate = vis.angleToCoordinate(angle+0.1, d3.max(vis.displayData.map(d=>d.coronavirus))+4);
            +

            //draw axis line
            vis.svg.append("line")
                .attr("x1", 70)
                .attr("y1", 75)
                .attr("x2", line_coordinate.x)
                .attr("y2", line_coordinate.y)
                .attr("stroke","black");

            //draw axis label
            vis.svg.append("text")
                .attr("x", label_coordinate.x)
                .attr("y", label_coordinate.y)
                .attr("font-size","smaller")
                .text(ft_name);
        }


        vis.line = d3.line()
            .x(d => d.x)
            .y(d => d.y);
        vis.color = "navy";
        function getPathCoordinates(data_point){
            let coordinates = [];
            for (var i = 0; i < vis.features.length; i++){
                let ft_name = vis.features[i];
                let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
                coordinates.push(vis.angleToCoordinate(angle, data_point[ft_name]));
            }
            return coordinates;
        }
        for (var i = 0; i < vis.displayData.length; i ++){
            let d = vis.displayData[i];
            let color = vis.color;
            let coordinates = getPathCoordinates(d);

            //draw the path element
            vis.svg.append("path")
                .datum(coordinates)
                .attr("d",vis.line)
                .attr("stroke-width", 3)
                .attr("stroke", color)
                .attr("fill", color)
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5);
        }



    }




}
