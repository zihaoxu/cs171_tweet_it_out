/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, airportData, geoData) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.airportData = airportData;

        // define colors
        vis.colors = ['#fddbc7','#f4a582','#d6604d','#b2182b']

        this.initVis()
    }

    initVis() {
        let vis = this;


        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title map-title')
            .append('text')
            .text('Global Map')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        vis.projection = d3.geoEqualEarth() // geoOrthographic()
            .translate([vis.width / 2, 235])
            .scale(150)

        // define a geo generator and pass the projection to it
        vis.path = d3.geoPath()
            .projection(vis.projection);
        console.log(vis.geoData)

        // convert the TopoJSON viz_data into GeoJSON viz_data structure
        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')



        let m0,
            o0;

        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                })
        )

        // sphere
        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // graticule
        vis.svg.append("path")
            .datum(d3.geoGraticule())
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // define scale for category colors
        vis.xScale = d3.scaleLinear()
            .domain([0,100])
            .range([100,200])
        // define x axis
        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)
            .tickValues([0,50,100])




        vis.wrangleData()

    }

    wrangleData(){
        let vis = this;

        // create random viz_data structure with information for each land
        vis.countryInfo = {};
        vis.geoData.objects.countries.geometries.forEach( d => {
            let randomCountryValue = Math.random() * 4
            vis.countryInfo[d.properties.name] = {
                name: d.properties.name,
                category: 'category_' + Math.floor(randomCountryValue),
                color: vis.colors[Math.floor(randomCountryValue)],
                value: randomCountryValue/4 * 100
            }
        })

        vis.updateVis()
    }



    updateVis(){
        let vis = this;


        // draw countries
        vis.countries = vis.svg.selectAll(".country")
            .data(vis.world)

        vis.countries.enter().append("path")
            .merge(vis.countries)
            .attr('class', 'country')
            .attr("d", vis.path)
            .attr("stroke",'grey')
            .attr('fill',function(d, index) {
                return vis.countryInfo[d.properties.name]['color']; })
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke', 'black')
                    .attr('fill', 'lightgray')
                    .style('opacity',0.8)


                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")

                    .html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3>${d.properties.name}<h3>
                     <h4> Name: ${d.properties.name}</h4>      
                     <h4> Category: ${vis.countryInfo[d.properties.name]['category']}</h4> 
                     <h4> Color: ${vis.countryInfo[d.properties.name]['color']}</h4>   
                     <h4> Value: ${vis.countryInfo[d.properties.name]['value']}</h4>                         
                 </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr("stroke",'grey')
                    .style('opacity',1)
                    .attr('fill',function(d, index) {
                        return vis.countryInfo[d.properties.name]['color']; })

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

        // x axis
        vis.svg.append("g")
            .attr("class","x axis")
            .attr("transform",`translate(200, ${vis.height - 30})`)
            .call(vis.xAxis)
            .selectAll("text")

        function mapRange(d){
            if (d == '#fddbc7'){
                return [0,25]
            }
            if (d == '#f4a582'){
                return [26,50]
            }
            if (d == '#d6604d'){
                return [51,75]
            }
            if (d == '#b2182b'){
                return [76,100]
            }

        }
        // create a legend group
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(200, ${vis.height - 50})`)

        vis.legend.selectAll().data(vis.colors)
            .enter()
            .append('rect')
            .attr("x", function(d) {return vis.xScale(mapRange(d)[0])})
            .attr("y",0)
            .attr("width", 25)
            .attr("height", 20)
            .attr("class",'rect')
            .attr("fill",d=>d)







    }
}