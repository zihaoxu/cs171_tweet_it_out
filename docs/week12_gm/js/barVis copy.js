/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class BarVis {

    constructor(parentElement, covidData, cat){
        this.parentElement = parentElement;
        this.covidData = covidData[0];
        // parse date method
        this.parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
        this.key = cat;
        this.colors_neg = ["red","#deebf7","#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c","#08306b"];
        this.colors_pos = ["white","#fee0d2",  "#fcbba1","#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15","#67000d"];
        this.xtransform = 90;
        this.ytransform = 35;
        this.y_interval = 10;

        this.initVis()
    }

    initVis(){
        let vis = this;

        // title for the barchart
        vis.title = "Sentiment of Trump's Tweet"


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

        // color scale neg
        vis.svg.append("g")
            .attr("class","x-axis-color")
            .attr("transform",`translate(${-vis.xtransform}, ${vis.ytransform})`)
            .append('text')
            .attr("id","scale-annotation-neg")

        vis.svg.append("g")
            .attr("class","x-axis-color")
            .attr("transform",`translate(${-vis.xtransform}, ${vis.ytransform*2})`)
            .append('text')
            .attr("id","scale-annotation-pos")



        this.wrangleData();
    }

    wrangleData(){
        let vis = this

        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];
        // if there is a region selected
        if (selectedTimeRange.length !== 0){
            //console.log('region selected', vis.selectedTimeRange, vis.selectedTimeRange[0].getTime() )

            // iterate over all rows the csv (dataFill)
            vis.covidData.forEach( row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0].getTime() <= vis.parseDate(row.date).getTime() && vis.parseDate(row.date).getTime() <= selectedTimeRange[1].getTime() ){
                    filteredData.push(row);
                }
            });
        } else {
            vis.covidData.forEach(row=>{
                filteredData.push(row);
            });
        }



        vis.categories = [0,0.65,0.7,0.75,0.8,0.85,0.9, 0.95,1.0];
        console.log(filteredData)

        filteredData.forEach(d=>{
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

        let filterdNegData = [];
        filteredData.forEach(d=>{
            if (d.sentiment =='NEGATIVE'){
                filterdNegData.push(d)
            }
        })

        let filterdPosData = [];
        filteredData.forEach(d=>{
            if (d.sentiment =='POSITIVE'){
                filterdPosData.push(d)
            }
        })

        // prepare covid data by grouping all rows by sentiment score category
        filterdNegData = Array.from(d3.group(filterdNegData, d =>d.category), ([key, value]) => ({key, value}));
        filterdNegData.forEach(d=>{
            d.len = d.value.length;
        })
        let omitted_categories = [...vis.categories];
        for (var i=0;i<filterdNegData.length;i++){
            if(omitted_categories.includes(filterdNegData[i]['key'])){
                let index = omitted_categories.indexOf(filterdNegData[i]['key']);
                omitted_categories.splice(index,1);
            }
        }
        omitted_categories.forEach(d=>{
            filterdNegData.push({'key':d,'value':[],'len':0})
        })
        vis.displayNegData = filterdNegData;
        vis.displayNegData.sort((a,b) => {return a['key'] - b['key']})
        vis.displayNegData.forEach((d,i)=>{
            if(i != 1){
                d.category_str = vis.categories[i-1] + '-' + vis.categories[i];}
            else{
                d.category_str = '<0.65'
            }
        })

        filterdPosData = Array.from(d3.group(filterdPosData, d =>d.category), ([key, value]) => ({key, value}));
        filterdPosData.forEach(d=>{
            d.len = d.value.length;
        })
        let omitted_categories2 = [...vis.categories];
        for (var i=0;i<filterdPosData.length;i++){
            if(omitted_categories2.includes(filterdPosData[i]['key'])){
                let index = omitted_categories2.indexOf(filterdPosData[i]['key']);
                omitted_categories2.splice(index,1);
            }
        }
        omitted_categories2.forEach(d=>{
            filterdPosData.push({'key':d,'value':[],'len':0})
        })
        vis.displayPosData = filterdPosData;
        vis.displayPosData.sort((a,b) => {return a['key'] - b['key']})
        vis.displayPosData.forEach((d,i)=>{
            if(i != 1){
                d.category_str = vis.categories[i-1] + '-' + vis.categories[i];}
            else{
                d.category_str = '<0.65'
            }
        })
        console.log(vis.displayNegData)
        console.log(vis.displayPosData)




        vis.updateVis()

    }

    updateVis(){
        let vis = this;


        // update the scales with correct domains
        vis.xscale.domain(vis.displayNegData.map( d=> d['key']))
        vis.yscale.domain(d3.extent(vis.displayNegData.map( d=> d['len'])))


        // discrete color scale
        vis.colorScaleNeg = d3.scaleThreshold()
            .domain(vis.categories.slice(1))
            .range(vis.colors_neg);
        vis.colorScalePos = d3.scaleThreshold()
            .domain(vis.categories.slice(1))
            .range(vis.colors_pos);



        // draw the axes
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        // draw the bar chart
        vis.rect_neg = vis.svg.selectAll(".bar_neg")
            .data(vis.displayNegData)
        vis.rect_neg.enter().append("rect")
            .merge(vis.rect_neg)
            .attr("class","bar bar_neg")
            .attr('fill', function(d) {
                return vis.colorScaleNeg(d['key']) })
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
                     <h4 style ="color:saddlebrown"> Sentiment: Negative</h4>   
                     <h4 style ="color:saddlebrown"> Count: ${d.len}</h4>
                                         
                 </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('opacity',1)
                    .attr('fill',function(d) {
                            return vis.colorScaleNeg(d['key'])})

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(200)
            .attr("x", d=> vis.xscale(d['key']))
            .attr("y", d=> vis.yscale(d['len']))
            .attr("width",34)
            .attr("height", d=> vis.height - vis.yscale(d['len']))


        vis.rect_neg.exit().remove()


        vis.rect_pos = vis.svg.selectAll(".bar_pos")
            .data(vis.displayPosData)
        vis.rect_pos.enter().append("rect")
            .merge(vis.rect_pos)
            .attr("class","bar bar_pos")
            .attr('fill', function(d) {
                return vis.colorScalePos(d['key']) })
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
                     <h4 style ="color:saddlebrown"> Sentiment: Positive</h4>  
                     <h4 style ="color:saddlebrown"> Count: ${d.len}</h4> 
                                         
                 </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('opacity',1)
                    .attr('fill',function(d) {
                        return vis.colorScalePos(d['key'])})

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(200)
            .attr("x", d=> -34 + vis.xscale(d['key']))
            .attr("y", d=> vis.yscale(d['len']))
            .attr("width",34)
            .attr("height", d=> vis.height - vis.yscale(d['len']))


        vis.rect_pos.exit().remove()


        // map the color back to the lower bound of the value
        function mapRange(d,k){
            if(k=='neg'){
                let index = vis.colors_neg.indexOf(d);
                return [vis.categories[index-1],vis.categories[index]]
            }
            if(k=='pos'){
                let index = vis.colors_pos.indexOf(d);
                return [vis.categories[index-1],vis.categories[index]]
            }

        }
        // annotation for the negative sentiment color scale
        vis.svg.selectAll('#scale-annotation-neg')
            .text('Negative Sentiments')
            .attr("fill","#08306b")
            .attr("x",150)
            .attr("y",30)

        vis.svg.selectAll('#scale-annotation-pos')
            .text('Positive Sentiments')
            .attr("fill","#67000d")
            .attr("x",150)
            .attr("y",60)

        // create a legend group
        vis.legend_neg = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${-vis.xtransform}, ${vis.y_interval*4+vis.ytransform})`)
        vis.legend_pos = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${-vis.xtransform}, ${vis.y_interval*7+2*vis.ytransform})`)
        vis.legend_neg_scale = vis.svg.append("g")
            .attr('class', 'legend negscale')
            .attr('transform', `translate(${-vis.xtransform}, ${vis.y_interval*6+vis.ytransform})`)
        vis.legend_pos_scale = vis.svg.append("g")
            .attr('class', 'legend posscale')
            .attr('transform', `translate(${-vis.xtransform}, ${vis.y_interval*9+2*vis.ytransform})`)


        // define scale for category colors
        vis.xScale = d3.scaleLinear()
            .domain([vis.categories[1],vis.categories[vis.categories.length-1]])
            .range([170,270])

        // define x axis
        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)
            .tickValues([0.65,1])

        // create the color scale legend
        vis.legend_neg.selectAll().data(vis.colors_neg.slice(1))
            .enter()
            .append('rect')
            .attr("x", function(d) {return vis.xScale(mapRange(d,'neg')[0])})
            .attr("y",0)
            .attr("width",function(d){return vis.xScale(mapRange('#4292c6','neg')[1])-vis.xScale(mapRange('#4292c6','neg')[0])})
            .attr("height", 20)
            .attr("class",'legend')
            .attr("fill",d=>d)

        vis.legend_pos.selectAll().data(vis.colors_pos.slice(1))
            .enter()
            .append('rect')
            .attr("x", function(d) {return vis.xScale(mapRange(d,'pos')[0])})
            .attr("y",0)
            .attr("width",function(d){return vis.xScale(mapRange('#4292c6','neg')[1])-vis.xScale(mapRange('#4292c6','neg')[0])})
            .attr("height", 20)
            .attr("class",'legend')
            .attr("fill",d=>d)
        vis.svg.select(".negscale").call(vis.xAxis);
        vis.svg.select(".posscale").call(vis.xAxis);


    }



}

