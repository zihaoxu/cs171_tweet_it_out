/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class BarVis {

    constructor(parentElement, covidData){
        this.parentElement = parentElement;
        this.covidData = covidData;
        // parse date method
        this.parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
        this.monthFormat = d3.timeFormat("%m")
        this.colors=
            ['white',
            '#67000d',
            '#a50f15',
            '#cb181d',
            '#ef3b2c',
            '#fb6a4a',
            '#fc9272',
            '#fcbba1',
            '#fee0d2',
            '#deebf7',
            '#c6dbef',
            '#9ecae1',
            '#6baed6',
            '#4292c6',
            '#2171b5',
            '#08519c',
            '#08306b',
            ];
        this.xtransform = 90;
        this.ytransform = 35;
        this.y_interval = 10;

        this.initVis()
    }

    initVis(){
        let vis = this;

        // title for the barchart
        vis.title = "Sentiment of Trump's Tweets"


        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text(vis.title)
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // Scales
        vis.xscale = d3.scaleBand()
            .range([0, vis.width]);

        vis.yscale = d3.scaleLinear()
            .range([vis.height, 30]);

        // x axis
        vis.xAxis = d3.axisBottom()
            .scale(vis.xscale)

        // y axis
        vis.yAxis = d3.axisLeft()
            .scale(vis.yscale)

        // Axis groups
        vis.svg.append("g")
            .attr("class","x-axis")
            .attr("id","barx")
            .attr("transform","translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("id","bary")
            .attr("class","y-axis")
            //.attr("transform","translate(-10, 0)");

        // initialize the tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        this.wrangleData();
    }

    wrangleData(){
        let vis = this;

        // first, filter according to selectedTimeRange, init empty array
        if (selectedTimeRange.length !== 0 ){
            if (selectedTimeRange[1]-selectedTimeRange[0]<1 & Math.ceil(selectedTimeRange[0]) === Math.ceil(selectedTimeRange[1])){
                vis.filteredData = vis.filteredData;
            }

            //console.log('region selected', vis.selectedTimeRange, vis.selectedTimeRange[0].getTime() )
            else {
                vis.filteredData = [];
                // iterate over all rows in the csv (dataFill)
                vis.covidData.forEach(row => {
                    // and push rows with proper dates into filteredData
                    if (selectedTimeRange[0] <= vis.monthFormat(vis.parseDate(row.date)) && vis.monthFormat(vis.parseDate(row.date)) <= selectedTimeRange[1]) {
                        vis.filteredData.push(row);
                    }
                });
            }
        } else {
            vis.filteredData = [];
            vis.covidData.forEach(row=>{
                vis.filteredData.push(row);
            });
        }




        vis.categories = [-1,-0.95,-0.9,-0.85,-0.8,-0.75,-0.7,-0.65,0,0.65,0.7,0.75,0.8,0.85,0.9, 0.95,1.0];

        let cateData = [...vis.filteredData]
        cateData.forEach(d=>{
                for(var i = 0;i<vis.categories.length;i++){
                    if (d.sentiment_score > vis.categories[i]){
                        continue
                    }
                    else{
                        d.category = vis.categories[i];
                        break
                    }
                }

        });


        // prepare covid viz_data by grouping all rows by sentiment score category
        cateData = Array.from(d3.group(cateData, d =>d.category),
            ([key, value]) => ({key, value}));
        cateData.forEach(d=>{
            d.len = d.value.length;
            if(d.key<=0){
                d.sentiment = 'Negative'
            }
            else{
                d.sentiment = 'Positive'
            }
        })
        let omitted_categories = [...vis.categories];
        for (var i=0;i<cateData.length;i++){
            if(omitted_categories.includes(cateData[i]['key'])){
                let index = omitted_categories.indexOf(cateData[i]['key']);
                omitted_categories.splice(index,1);
            }
        }
        omitted_categories.forEach(d=>{
            cateData.push({'key':d,'value':[],'len':0})
        })
        vis.displayData = cateData;
        vis.displayData.sort((a,b) => {return a['key'] - b['key']})

        vis.displayData.forEach((d,i)=> {
                d.category_str = vis.categories[i - 1] + '~' + vis.categories[i];

        })

        // console.log(vis.displayData);

        vis.updateVis()

    }

    updateVis(){
        let vis = this;

        // update the scales with correct domains
        vis.xscale.domain(vis.displayData.map( d=> d['key']))
        vis.yscale.domain(d3.extent(vis.displayData.map( d=> d['len'])))


        // discrete color scale
        vis.colorScale = d3.scaleThreshold()
            .domain(vis.categories.slice(1))
            .range(vis.colors);

        // draw the axes
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        vis.svg.append("text")
            .attr("class","y-axis-label")

        vis.svg.select(".y-axis-label")
            .text("# of tweets")
            .attr('fill','black')
            .attr('font-size',10)
            .attr("class","y-axis-label")
            .attr("y",25)
            .attr("x",0)



        // draw the bar chart
        vis.rect = vis.svg.selectAll(".bar")
            .data(vis.displayData)
        vis.rect.enter().append("rect")
            .merge(vis.rect)
            .attr("class","bar")
            .attr('fill', function(d) {
                return vis.colorScale(d['key']) })
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('fill', 'lightgray')
                    .style('opacity',0.8)

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY - 50 + "px")

                    .html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: white; padding: 5px"> 
                     <h4 style ="color:saddlebrown"> Sentiment Score Category: ${d.category_str}</h4> 
                     <h4 style ="color:saddlebrown"> Sentiment: ${d.sentiment}</h4>   
                     <h4 style ="color:saddlebrown"> Count: ${d.len}</h4>
                                         
                 </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('opacity',1)
                    .attr('fill',function(d) {
                            return vis.colorScale(d['key'])})

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(200)
            .attr("x", d=> -18+vis.xscale(d['key']))
            .attr("y", d=> vis.yscale(d['len']))
            .attr("width",34)
            .attr("height", d=> vis.height - vis.yscale(d['len']))


        vis.rect.exit().remove()

        // annotation for the negative sentiment color scale
        vis.svg.selectAll('#scale-annotation')
            .text('Sentiment Color Scale')
            .attr("fill","saddlebrown")
            .attr("x",150)
            .attr("y",30)


        // create a legend group
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${0}, ${vis.y_interval*4+vis.ytransform})`)
         vis.legend_scale = vis.svg.append("g")
            .attr('class', 'legend-scale')
            .attr('transform', `translate(${0}, ${vis.y_interval*6+vis.ytransform})`)

        // similar to linspace in python; reusable
        function makeArr(startValue, stopValue, cardinality) {
            var arr = [];
            var step = (stopValue - startValue) / (cardinality - 1);
            for (var i = 0; i < cardinality; i++) {
                arr.push(startValue + (step * i));
            }
            return arr;
        }

        // define scale for category colors
        vis.xcolorScale = d3.scaleLinear()
            .domain(vis.categories)
            .range(makeArr(170,270,vis.categories.length))

        // define x axis for the color scale
        vis.colorAxis = d3.axisBottom()
            .scale(vis.xcolorScale)
            .tickValues([-1,1])
            .tickFormat(function(d){if(d==-1){return 'Negative'}else{return 'Positive'}})

        // map the color back to the lower bound of the value
        function mapRange(d){
            let index = vis.colors.indexOf(d);
            return [vis.categories[index-1],vis.categories[index]];

        }

        // create the color scale legend
        vis.legend.selectAll().data(vis.colors.slice(1))
            .enter()
            .append('rect')
            .attr("x", function(d) {return vis.xcolorScale(mapRange(d)[0])})
            .attr("y",0)
            .attr("width",function(d){return vis.xcolorScale(mapRange(d)[1])-vis.xcolorScale(mapRange(d)[0])})
            .attr("height", 20)
            .attr("class",'legend')
            .attr("fill",d=>d)

        // call the color axis
        vis.svg.select(".legend-scale").call(vis.colorAxis);




    }



}

