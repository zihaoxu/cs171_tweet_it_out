
class TopicVis{

    constructor(parentElement, topicData){
        this.parentElement = parentElement;
        this.topicData = topicData;
        // parse date method
        this.parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
        this.monthFormat = d3.timeFormat("%m")
        this.legendx = 150;
        this.yloc = 120;

        this.initVis()
    }
    angleToCoordinate(angle, value){
        let vis = this;
        let x = Math.cos(angle) * vis.radialScale(value);
        let y = Math.sin(angle) * vis.radialScale(value);
        return {"x": 70 + x, "y": vis.yloc - y};
    }

    initVis(){
        let vis = this;
        console.log(vis.topicData)

        // title for the radar plot
        vis.title = "Topics Plot"
        vis.subtitle = "*Six topics are manually picked."

        vis.margin = {top: 0, right: 20, bottom: 0, left: 20};
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
            .attr('transform', `translate(80,20)`)
            .attr('text-anchor', 'middle');

        // add subtitle
        vis.svg.append('g')
            .attr('class', 'title topic-subtitle')
            .append('text')
            .text(vis.subtitle)
            .attr('transform', `translate(80,220)`)
            .attr('text-anchor', 'middle');

        // initialize the circles & axes & the six topic names (since they will be fixed)
        // sum the topics occurrence for the entire time range
        vis.finalfilteredData = {}
        vis.finalfilteredData['coronavirus'] = 0;
        vis.finalfilteredData['great job'] = 0;
        vis.finalfilteredData['fake news media'] = 0;
        vis.finalfilteredData['nothing democrats'] = 0;
        vis.finalfilteredData['million tests'] = 0;
        vis.finalfilteredData['stay home'] = 0;
        vis.topicData.forEach(function(month){
            vis.finalfilteredData['coronavirus'] += month['coronavirus'];
            vis.finalfilteredData['great job'] += month['great job'];
            vis.finalfilteredData['fake news media'] += month['fake news media'];
            vis.finalfilteredData['nothing democrats'] += month['nothing democrats'];
            vis.finalfilteredData['million tests'] += month['million tests'];
            vis.finalfilteredData['stay home'] += month['stay home'];
        })
        vis.displayData = [vis.finalfilteredData];

        // radar plot code adapted from https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart
        vis.radialScale = d3.scaleLinear()
            .domain([0,d3.max(vis.displayData.map(d=>d.coronavirus))])
            .range([0,55]);
        vis.ticks = [1,Math.round(d3.max(vis.displayData.map(d=>d.coronavirus))/3),
            Math.round(d3.max(vis.displayData.map(d=>d.coronavirus))*2/3), d3.max(vis.displayData.map(d=>d.coronavirus))];

        vis.ticks.forEach(t =>
            vis.svg.append("circle")
                .attr("cx", 70)
                .attr("cy", vis.yloc)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", vis.radialScale(t))
        );

        vis.features = vis.topicData.columns.slice(1,) //six topics
        for (var i = 0; i < vis.topicData.length; i++) {
            let ft_name = vis.features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
            let line_coordinate = vis.angleToCoordinate(angle, d3.max(vis.displayData.map(d=>d.coronavirus)));
            let label_coordinate = vis.angleToCoordinate(angle+0.1, d3.max(vis.displayData.map(d=>d.coronavirus))+4);

                //draw axis line
                vis.svg.append("line")
                    .attr("x1", 70)
                    .attr("y1", vis.yloc)
                    .attr("x2", line_coordinate.x)
                    .attr("y2", line_coordinate.y)
                    .attr("stroke","black");

            //draw axis label
            vis.svg.append("text")
                .attr("x", label_coordinate.x)
                .attr("y", label_coordinate.y)
                .attr("fill","#333333")
                .attr("class","radar-topics")
                .text(ft_name);
        }

        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        // check if there is a time range selected
        if (selectedTimeRange.length !== 0 ){

            if (selectedTimeRange[1]-selectedTimeRange[0]<1 & Math.ceil(selectedTimeRange[0]) === Math.ceil(selectedTimeRange[1])){
                vis.filteredData = vis.filteredData;
            }

            else {
                vis.filteredData = [];
                // iterate over all rows in the csv (dataFill)
                vis.topicData.forEach(row => {
                    // and push rows with proper dates into filteredData
                    if (selectedTimeRange[0] <= row['month'] && row['month'] <= selectedTimeRange[1]) {
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

        // sum the topics occurrence for the entire time range
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
        // console.log(vis.displayData)

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        // find the maximum occurrence for the axes (minimum is 6 for at least three layers)
        let max_c = d3.max(vis.displayData.map(d=>d['coronavirus']));
        let max_g = d3.max(vis.displayData.map(d=>d['great job']));
        let max_f = d3.max(vis.displayData.map(d=>d['fake news media']));
        let max_n = d3.max(vis.displayData.map(d=>d['nothing democrats']));
        let max_m = d3.max(vis.displayData.map(d=>d['million tests']));

        let max_value = d3.max([max_c,max_g,max_f,max_n,max_m,6]);

        vis.radialScale = d3.scaleLinear()
            .domain([0,max_value])
            .range([0,55]);

        vis.ticks = [1,Math.round(max_value/3),
            Math.round(max_value*2/3), max_value];

        // draw the axis numbers
        vis.axis = vis.svg.selectAll(".circle-axis")
            .data(vis.ticks)
        vis.axis.enter().append("text")
            .merge(vis.axis)
            .attr("class","circle-axis")
            .attr("x", 75)
            .attr("y", d=>vis.yloc - vis.radialScale(d))
            .attr("font-size","0.5rem")
            .attr("fill","gray")
            .text(d=>d.toString())
        vis.axis.exit().remove()


        vis.color = "navy";
        // get the coordinates on the radar plot for each topic
        function getPathCoordinates(data_point){
            let coordinates = [];
            for (var i = 0; i < vis.features.length; i++){
                let ft_name = vis.features[i];
                let angle = (Math.PI / 2) + (2 * Math.PI * i / vis.features.length);
                coordinates.push(vis.angleToCoordinate(angle, data_point[ft_name]));
            }
            return coordinates;
        }

        vis.coordinates = [];
        for (var i = 0; i < vis.displayData.length; i ++){
            let d = vis.displayData[i];
            vis.coordinates.push(getPathCoordinates(d));
        }

        vis.line = d3.line()
            .x(d=>d.x)
            .y(d=>d.y)

        // draw the path connecting the six topics
        vis.topicPath = vis.svg.selectAll(".path")
            .data(vis.coordinates)
        vis.enter = vis.topicPath.enter()
            .append("path")
            .attr("class","path")
            .attr("stroke-width", 3)
            .attr("stroke", vis.color)
            .attr("fill", vis.color)
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5);
        vis.merge = vis.enter.merge(vis.topicPath)
            .transition()
            .duration(100)
            .attr("d",vis.line)

        vis.topicPath.exit().remove();





    }




}
