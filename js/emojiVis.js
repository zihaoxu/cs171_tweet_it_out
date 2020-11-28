/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class EmojiVis {

    constructor(parentElement, tweetData, scoreData){
        this.parentElement = parentElement;
        this.tweetData = tweetData;
        this.scoreData = scoreData;
        // parse date method
        this.parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
        this.monthFormat = d3.timeFormat("%m")
        this.legendx = 150;
        this.colors=
            ['white',
                '#67000d',
                '#a50f15',
                '#cb181d',
                '#ef3b2c',
                '#fb6a4a',
                '#fc9272',
                '#fcbba1',
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
        vis.title = "Top 10 Frequent Emoji Sentiment"

        // console.log(vis.tweetData);
        // console.log(vis.scoreData);

        document.querySelector(".emoji").innerHTML = 'Aside from traditional emoticons, ' + String.fromCodePoint(0X1F637)+' is also used throughout the outbreak to remind each other of preventing the virus spread.';


        vis.margin = {top: 20, right: 20, bottom: 0, left: 40};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom-50;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        // vis.svg.append('g')
        //     .attr('class', 'title bar-title')
        //     .append('text')
        //     .text(vis.title)
        //     .attr('transform', `translate(${vis.width / 2}, 20)`)
        //     .attr('text-anchor', 'middle');

        vis.list = [{'index':0},{'index':1},{'index':2},{'index':3},{'index':4},{'index':5},{'index':6},{'index':7},{'index':8},{'index':9}];

        // Scales
        vis.xscale = d3.scaleBand()
            .range([20, vis.width])
            .domain(vis.list.map(d=>d.index));

        vis.yscale = d3.scaleLinear()
            .range([120, vis.height-8]);

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
            //.attr("transform","translate(0, 0)");


        // initialize the tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

        // draw the emoji border
        vis.border = vis.svg.selectAll(".emoji-border")
            .data(vis.list)
        vis.border.enter().append("rect")
            .merge(vis.border)
            .attr("class","emoji-border")
            .transition()
            .duration(200)
            .attr("x", function(d){return - 22 + vis.xscale(d['index'])})
            .attr("y",65)
            .attr("stroke","url(#gradient)")
            .attr("stroke-width","3px")
            .attr("fill","none")
            .attr("width", 45)
            .attr("height",45)
        vis.border.exit().remove()


        this.wrangleData();
    }

    wrangleData(){
        let vis = this


        // check if there is a time region selected
        if (selectedEmojiTime.length !== 0 ){
            if (selectedEmojiTime[1]-selectedEmojiTime[0]!=0){
                vis.filteredData = [];
                // iterate over all rows the csv (dataFill)
                vis.tweetData.forEach(row => {
                    // and push rows with proper dates into filteredData
                    if (selectedEmojiTime[0] <= vis.monthFormat(vis.parseDate(row.date)) && vis.monthFormat(vis.parseDate(row.date)) <= selectedEmojiTime[1]) {
                        vis.filteredData.push(row);
                    }
                });
            }
        } else {
            vis.filteredData = [];
            vis.tweetData.forEach(row=>{
                vis.filteredData.push(row);
            });
        }

        // unroll all the emojis to one list
        vis.tweetArray =[];
        vis.filteredData.forEach(row=>{
            vis.tweetArray.push(eval(row['encode']));
        });
        vis.flattenedTweet = [].concat.apply([], vis.tweetArray);


        // find unique emoji and calculate counts
        vis.finalData = []
        vis.uniqueEmoji = []
        vis.flattenedTweet.forEach(d=>{
            if(!vis.uniqueEmoji.includes(d)){
                vis.uniqueEmoji.push(d);
                vis.finalData.push({'encode':d,'count':0});
            }
            else{
                let index = vis.uniqueEmoji.indexOf(d)
                vis.finalData[index]['count'] += 1;
            }
        })

        // sort the top 10 frequent emoji
        vis.finalData = vis.finalData.sort(function(a,b){return b.count-a.count}).slice(0,10)
        let encodes = vis.scoreData.map(d=>d.encode);

        // add the sentiment_score and emoji attribute
        vis.finalData.forEach(d=>{
            let index = encodes.indexOf(d.encode)
            d.sentiment_score = vis.scoreData[index]['sentiment_score'];
            d.emoji = vis.scoreData[index]['Emoji'];
        })

        // assign each emoji with a sentiment score category (for coloring)
        vis.categories = [-1,-0.85,-0.70,-0.55,-0.40,-0.25,-0.10,0,0.10,0.25,0.40,0.55,0.70,0.85,1.0];
        let ind = 0;
        vis.finalData.forEach(d=>{
                for(var i = 0;i<vis.categories.length;i++){
                    if (d.sentiment_score > vis.categories[i]){
                        continue
                    }
                    else{
                        if(d.sentiment_score<0){
                            d.sentiment = 'Negative'
                        }
                        else{
                            d.sentiment = 'Positive'
                        }
                        d.category = vis.categories[i];
                        d.index = ind;
                        ind = ind + 1;
                        break
                    }
                }

        });

        // finalData contains emoji, encode, sentiment, count, category, index(for ordering the emojis on the sentiment axis)
        console.log(vis.finalData)
        vis.finalData.sort((a,b) => {return a['sentiment_score'] - b['sentiment_score']})
        vis.displayData = vis.finalData;

        // console.log(vis.displayData);
        vis.updateVis()

    }

    updateVis(){
        let vis = this;


        // update the scales with correct domains
        vis.xscale.domain(vis.displayData.map( d=> d['index']))
        vis.yscale.domain([0,d3.max(vis.displayData.map( d=> d['count']))+50])


        // y-axis label
        vis.svg.append("text")
            .attr("class","y-axis-label")

        vis.svg.select(".y-axis-label")
            .text("Count")
            .attr('fill','black')
            .attr('font-size',10)
            .attr("class","y-axis-label")
            .attr("y",vis.height-5)
            .attr("x",5)


        // discrete color scale
        vis.colorScale = d3.scaleThreshold()
            .domain(vis.categories.slice(1))
            .range(vis.colors);

        // draw the axes
        // vis.svg.select(".x-axis").call(vis.xAxis); // we don't need the x axis for this plot
        vis.svg.select(".y-axis").call(vis.yAxis);

        // draw the emojis on top
        vis.emoji = vis.svg.selectAll(".emoji-title")
            .data(vis.displayData)
        vis.emoji.enter().append("text")
            .merge(vis.emoji)
            .attr("class","emoji-title")
            .text(function(d){return String.fromCodePoint(d.encode);})
            .on('click', function(event, d){
                $("#example-emoji").text(d.emoji);
            })
            .transition()
            .duration(200)
            .attr("x", function(d){return -20 + vis.xscale(d['index'])})
            .attr("y",105)

        vis.emoji.exit().remove()

        // draw the bar chart
        vis.rect = vis.svg.selectAll(".bar")
            .data(vis.displayData)
        vis.rect.enter().append("rect")
            .merge(vis.rect)
            .attr("class","bar")
            .attr('fill', function(d) {
                return vis.colorScale(d['sentiment_score']) })
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
                     <h4 style ="color:saddlebrown"> Sentiment: ${d.sentiment}</h4>   
                     <h4 style ="color:saddlebrown"> Count: ${d.count}</h4>
                                         
                 </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('opacity',1)
                    .attr('fill',function(d) {
                            return vis.colorScale(d['sentiment_score'])})

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(200)
            .attr("x", d=> -18+vis.xscale(d['index']))
            .attr("y", 120)
            .attr("width",34)
            .attr("height", function(d){return -120+vis.yscale(d['count'])})


        vis.rect.exit().remove()

        // annotation for the sentiment color scale
        vis.svg.selectAll('#scale-annotation')
            .text('Sentiment Color Scale')
            .attr("fill","saddlebrown")
            .attr("x",150)
            .attr("y",30)


        // create a legend group
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.legendx}, ${vis.height-(vis.y_interval*1+vis.ytransform)})`)
         vis.legend_scale = vis.svg.append("g")
            .attr('class', 'legend-scale')
            .attr('transform', `translate(${vis.legendx}, ${vis.height-(vis.y_interval*1+vis.ytransform)})`)

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
            .attr("y",-20)
            .attr("width",function(d){return vis.xcolorScale(mapRange(d)[1])-vis.xcolorScale(mapRange(d)[0])})
            .attr("height", 20)
            .attr("class",'legend')
            .attr("fill",d=>d)

        // call the color axis
        vis.svg.select(".legend-scale").call(vis.colorAxis);


    }




}

