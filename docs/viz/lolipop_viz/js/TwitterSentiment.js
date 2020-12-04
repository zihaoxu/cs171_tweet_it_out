function createSentimentTopicSpectrum() {

    let cluster_config = [
        { id: "sentiment_cluster_5", color: "#67000d"},
        { id: "sentiment_cluster_1", color: "#a50f15"},
        { id: "sentiment_cluster_2", color: "#cb181d"},
        { id: "sentiment_cluster_3", color: "#ef3b2c"},
        { id: "sentiment_cluster_9", color: "#fc9272"},
        { id: "sentiment_cluster_4", color: "#4292c6"},
        { id: "sentiment_cluster_6", color: "#2171b5"},
        { id: "sentiment_cluster_7", color: "#08519c"},
        { id: "sentiment_cluster_8", color: "#08306b"},
    ]

    let cluster_ids = cluster_config.map(d => d.id)
    let color_cluster_scale = d3.scaleOrdinal()
        .domain(cluster_ids)
        .range(cluster_config.map(d => d.color))


    let cluster_radius = d3.scaleSqrt()
        .domain([0, 30])
        .range([0, 80])


    let node_radius = 20
    let radius_elements = 600
    let radius_elements_offset = 1.1 * node_radius
    let radius_elements_title = 680
    let arc_nodes = d3.arc()
    let pie_nodes = d3.pie()
        .sort(null)
        .value(1)

    let radius_size = 580
    let curved_line_height = 30

    let concept_radius = 6
    let radius_concept = 600
    let concept_arcs
    let arc_concept = d3.arc()
    let pie_concept = d3.pie()
        .value(d => d.values.length)
        .sort(null)
    let threats_nest

    let base_size = 2100
    let width = 600, height = 400
    let total_width, total_height
    let margin = {top: 10, right: 0,  bottom: 0, left: 0}
    let svg, g
    let g_scale
    let canvas_edges, canvas_nodes, canvas_hover
    let ctx_edges, ctx_nodes, ctx_hover
    let sf = 2 //canvas scale factor
    let sf_original = sf
    let sf_set = false
    let sf_set_original = sf_set
    let nodes
    let elements
    let concepts
    let language
    let edges
    let edges_concepts = [], edges_elements = []
    let node_by_id = {}
    let linked_to_id = {}
    let tweet_by_id = {}
    let concept_by_id = {}
    let edge_concept_by_id = {}

    let pi = Math.PI
    let pi2 = Math.PI * 2
    let pi1_2 = Math.PI / 2

    //Visual styles
    let opacity_concept_default = 0.5
    let opacity_element_default = 0.1
    let arc_gradient_nodes
    let arc_gradient_hover

    let diagram
    let mouse_hover_active = false
    let current_hover = null
    let hover_type = null
    let timer_draw = null

    //Mouse clicks
    let current_click = null
    let click_active = false
    let hover_concept, hover_category

    //Other
    let font_family = "Oswald"
    let scale_factor = 1
    let scale_multiplier = 1
    let sentimentClusters
    let ICH_num, ICH_num_all

    let line = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveBasis)

    let cr1_offset_scale = d3.scaleLinear()
        .domain([0, 2 * radius_size])
        .range([-20, -150])
        .clamp(true)
    let cr2_offset_scale = d3.scaleLinear()
        .domain([0, radius_size])
        .range([0, 175])
        .clamp(true)
    let angle2_offset_scale = d3.scaleLinear()
        .domain([0, radius_size])
        .range([1, 0.5])
        .clamp(true)

    function chart(selection, nodes_raw, edges_raw, lang = "en", callback) {

        language = lang
        nodes = nodes_raw
        edges = edges_raw

        sentimentClusters = sentiment_clusters[language].definitions

        canvas_edges = selection.append("canvas").attr("id", "canvas-edges")
        ctx_edges = canvas_edges.node().getContext("2d")

        canvas_nodes = selection.append("canvas").attr("id", "canvas-nodes")
        ctx_nodes = canvas_nodes.node().getContext("2d")

        canvas_hover = selection.append("canvas").attr("id", "canvas-hover")
        ctx_hover = canvas_hover.node().getContext("2d")

        svg = selection.append("svg")
            .on("mousemove", findElement)
            .on("click", d => {
                click_active = false
                mouseOverReset()
            })

        //Group for all visual elements
        g = svg.append("g").attr("id","visual-elements-group")

        g_scale = g.append("g").attr("id", "scaling-group")

        dataPreparation()
        nodePlacement()
        edgePlacement()

        chart.resize()

        function createGradient(ctx) {
            let num = cluster_config.length-1
            let grd = ctx.createLinearGradient(-radius_elements_title,0,radius_elements_title,0)
            for(let i = 0; i <= num; i++) grd.addColorStop(i/num, cluster_config[i].color)
            return grd
        }
        arc_gradient_nodes = createGradient(ctx_nodes)
        arc_gradient_hover = createGradient(ctx_hover)

        prepareArcs()

        calculateEdgeCenters(edges_concepts)

        drawHiddenElements()
        setHiddenHovers()

        drawCanvas()

        if(callback) callback(elements)

    }//function chart


    chart.resize = () => {
        total_width = width + margin.left + margin.right
        total_height = height + margin.top + margin.bottom

        //Change sizes of the svg
        svg.attr("width", total_width).attr("height", total_height)
        g.attr("transform", "translate(" + (margin.left + width/2) + "," + (margin.top + height/2) + ")")

        //Get the scale factor to resize
        let size = Math.min(total_height, total_width)
        scale_factor = roundTo(size / base_size * scale_multiplier, 2)
        //Scale everything to fit
        g_scale.attr("transform", "scale(" + scale_factor + ")")

        if(!sf_set) {
            sf = Math.min(2, getPixelRatio(ctx_nodes) ) //no more than 2
            sf_original = sf
        }

        crispyCanvas(canvas_edges, ctx_edges)
        crispyCanvas(canvas_nodes, ctx_nodes)
        crispyCanvas(canvas_hover, ctx_hover)

        //Redraw
        drawCanvas()

        return 1 //Needed for the saveImage function
    }//function resize

    function dataPreparation() {
        node_by_id = {}
        nodes.forEach(d => { node_by_id[d.id] = d })

        linked_to_id = {}
        edges.forEach(d => {
            //Save all of the connections to a specific node
            if (!linked_to_id[d.source]) linked_to_id[d.source] = []
            if (!linked_to_id[d.target]) linked_to_id[d.target] = []
            linked_to_id[d.source].push(node_by_id[d.target])
            linked_to_id[d.target].push(node_by_id[d.source])
        })

        nodes = nodes.filter(d => {
            if (d.type === "element") return d.meta.list === "USL" ? true : false
            else if (d.type === "concept") return (d.group === "threat" ? true : false)
            else return false
        })//filter

        node_by_id = {}
        nodes.forEach(d => { node_by_id[d.id] = d })
        //Filter out any edges that were associated to the nodes filtered above
        edges = edges.filter(d => { return node_by_id[d.source] && node_by_id[d.target] })

        //Second filtering based on connections
        nodes = nodes.filter(d => {
            d.degree = edges.filter(l => l.source == d.id || l.target == d.id).length
            //Filter out any element that has 0 degrees
            if(d.type === "element") return d.degree >= 1 ? true : false
            else if(cluster_ids.indexOf(d.id) >= 0) return true
            else {
                let connections = edges.filter(l => (l.source === d.id && node_by_id[l.target].type === "element") || (l.target === d.id && node_by_id[l.source].type === "element"))
                return connections.length >= 1 ? true : false
            }//else
        })//forEach

        node_by_id = {}
        nodes.forEach(d => { node_by_id[d.id] = d })

        linked_to_id = {}
        edges.forEach(d => {
            if (!linked_to_id[d.source]) linked_to_id[d.source] = []
            if (!linked_to_id[d.target]) linked_to_id[d.target] = []
            linked_to_id[d.source].push(node_by_id[d.target])
            linked_to_id[d.target].push(node_by_id[d.source])
        })//forEach


        //Connect the translations to the cluster_config
        let data_translations = sentiment_clusters[language].categories
        cluster_config.forEach(d => d.label = data_translations[data_translations.map(b => b.id).indexOf(d.id)].label)

        //Find the threat categories - ones that are not connected to a ICH element
        threats = nodes.filter(d => {
            //Is this id in the predefined list
            return cluster_ids.indexOf(d.id) >= 0
        })//filter
        threats.forEach(d => {
            d.meta = cluster_config[cluster_ids.indexOf(d.id)]
            d.title = d.meta.label
            d.group = "threat category"
            d.degree = 0
            tweet_by_id[d.id] = d
        })//forEach
        //Sort them by the id defined above
        threats = threats.sort((a, b) => cluster_ids.indexOf(a.id) - cluster_ids.indexOf(b.id))


        let tw_ids = sentimentClusters.map(d => d.id)

        //The remaining concepts are threats
        concepts = nodes.filter(d => d.type === "element" || cluster_ids.indexOf(d.id) >= 0 ? false : true)
        concepts.forEach(d => {
            //Get this node's threat category
            let e_connected = linked_to_id[d.id].filter(n => n.group === "threat category")
            if(e_connected.length !== 1) console.log("not 1 threat category", d.id, d.label, e_connected)
            d.threat_category = e_connected[0].id

            d.opacity = 1
            d.fill = color_cluster_scale(d.threat_category)
            concept_by_id[d.id] = d

            let def = tw_ids.indexOf(d.id)
            d.definition = def >= 0 ? sentimentClusters[def].definition : "definition to be added"
        })//forEach

        //Sort by the threat category and then alphabetically
        concepts = concepts.sort((a,b) => {
            if(cluster_ids.indexOf(a.threat_category) < cluster_ids.indexOf(b.threat_category)) return -1
            if(cluster_ids.indexOf(a.threat_category) > cluster_ids.indexOf(b.threat_category)) return 1
            if(a.label < b.label) return -1
            if(a.label > b.label) return 1
            return 0
        })//sort

        concepts_other = concepts.filter(d => d.threat_category !== "foo")
        concepts_weak = concepts.filter(d => d.threat_category === "foo")


        elements = nodes.filter(d => d.type === "element")

        elements.forEach(d => {
            let e_connected = linked_to_id[d.id].filter(n => n.group === "threat")
            d.threats = e_connected.map(n => n.id)
            d.threats = d.threats.sort((a, b) => {
                let a_threat = cluster_ids.indexOf(concept_by_id[a].threat_category)
                let b_threat = cluster_ids.indexOf(concept_by_id[b].threat_category)
                if(a_threat < b_threat) return -1
                if(a_threat > b_threat) return 1
                return 0
            })//sort
            d.threat_categories = [...new Set(d.threats.map(l => concept_by_id[l].threat_category))]
        })//forEach
        ICH_num_all = elements.length

        //Sort alphabetically
        elements = elements.sort((a,b) => {
            if(a.label < b.label) return -1
            if(a.label > b.label) return 1
            return 0
        })
    }//function dataPreparation

    function nodePlacement() {
        let num, start_angle, end_angle
        let offset = 0.025 * pi2

        num = elements.length
        start_angle = pi1_2 + offset
        end_angle = pi2 - (pi1_2 + offset)
        elements.forEach((d,i) => {
            d.angle = i/(num-1) * (end_angle - start_angle) + start_angle
            let sign = i%2 === 0 ? -1 : 1
            let rad = radius_elements + sign * radius_elements_offset
            d.x = rad * Math.cos(d.angle - pi1_2)
            d.y = rad * Math.sin(d.angle - pi1_2)
        })//forEach



        num = threats.length
        let total_width = 2 * radius_size
        let space = total_width / num
        threats.forEach((d,i) => {
            d.x = (i + 0.5) * space - radius_size
            d.y = 0
            d.space = space

            d.fill = color_cluster_scale(d.id)
            d.opacity = 1

            //Get the total number of lines
            ctx_nodes.font = "normal normal 400 24px " + font_family
            d.num_lines = wrapText(ctx_nodes, d.title, 0, 0, space, curved_line_height, false, true)

            //Get the locations of the circles
            let circle_offset = 10
            let offset = d.num_lines * curved_line_height
            d.circle_offset = offset / 2 + circle_offset
        })//forEach

        ////////////////////// CONCEPT ARCS //////////////////////

        //Roll up the countries into an array of areas and the number of countries per area
        threats_nest = d3.nest()
            .key(d => d.threat_category)
            .entries(concepts)

        // offset = 0
        start_angle = -pi1_2 + offset
        end_angle = pi1_2 - offset
        let padding = 0.04
        pie_concept
            .startAngle(start_angle)
            .endAngle(end_angle)
            .padAngle(padding)

        ctx_nodes.font = 'normal normal 300 19px ' + font_family //Needed to get the text width
        concept_arcs = pie_concept(threats_nest)
        concept_arcs.forEach(d => {
            d.totalAngle = d.endAngle - d.startAngle
            d.centerAngle = d.startAngle + d.totalAngle/2
            d.opacity = 1

            let num = d.data.values.length
            let angle_step = (d.totalAngle - 2*padding) / num
            let angle = d.startAngle + 1.5*padding

            //Loop over each concept within this threat category
            d.data.values.forEach(n => {
                n.angle = angle
                n.angle_width = angle_step
                n.x = radius_concept * Math.cos(angle - pi1_2)
                n.y = radius_concept * Math.sin(angle - pi1_2)
                n.r = concept_radius
                n.width = ctx_nodes.measureText(n.label).width
                angle = angle + angle_step
            })//forEach
        })//forEach
    }//function nodePlacement

    ////////////////// Calculate edge placement //////////////////
    function edgePlacement() {
        ////////////////////// Concept edges /////////////////////

        //Get all the edges that should run between the threat categories and the threats
        let concept_ids = concepts.map(l => l.id)
        edges_concepts = edges.filter(d => {
            if (cluster_ids.indexOf(d.source) >= 0 && concept_ids.indexOf(d.target) >= 0) return true
            else if (cluster_ids.indexOf(d.target) >= 0 && concept_ids.indexOf(d.source) >= 0) return true
            else return false
        })//filter

        edges_concepts.forEach(d => {
            edge_concept_by_id[d.source + "," + d.target] = true
            d.source = concept_by_id[d.source] //Threat
            d.target = tweet_by_id[d.target] //Threat category
            d.sign_pos = -1
            d.opacity = opacity_concept_default
        })//forEach

        ////////////////////// Element edges /////////////////////

        elements.forEach(d => {
            d.threat_categories.forEach(l => {
                edges_elements.push({
                    source: d.id,
                    target: l
                })//push
            })//forEach
        })//forEach

        edges_elements.forEach(d => {
            edge_concept_by_id[d.source + "," + d.target] = true
            d.source = node_by_id[d.source] //ICH element
            d.target = tweet_by_id[d.target] //Threat category
            d.sign_pos = 1
            d.opacity = opacity_element_default

            d.target.degree += 1
        })//forEach

        //Calculate the line points for the edges
        line.context(ctx_edges)
        edges_elements.forEach(d => {
            let target_y = d.target.y + d.sign_pos * d.target.circle_offset

            let dx = d.target.x - d.source.x
            let dy = d.target.y - d.source.y

            let r_source = radius_elements //Math.sqrt(sq(d.source.x) + sq(d.source.y))
            let r_source_offset = Math.sqrt(sq(dx) + sq(dy))
            let angle_offset = Math.atan2(dy, dx) - pi1_2 + pi2

            let cr1 = r_source + cr1_offset_scale(r_source_offset)
            let cx1 = cr1 * Math.cos(d.source.angle - pi1_2)
            let cy1 = cr1 * Math.sin(d.source.angle - pi1_2)

            let angle2 = pi + (angle_offset - pi)*0.5 * angle2_offset_scale(r_source_offset)
            let cr2 = cr2_offset_scale(r_source_offset)
            let cx2 = d.target.x + cr2 * Math.cos(angle2 - pi1_2)
            let cy2 = target_y + cr2 * Math.sin(angle2 - pi1_2)

            d.line_data = [[d.source.x, d.source.y],[cx1,cy1],[cx2,cy2],[d.target.x, target_y]]
        })//forEach

    }//function edgePlacement

    //////////////////////////////////////////////////////////////
    ///////////////////////////// Arcs ///////////////////////////
    //////////////////////////////////////////////////////////////

    ////////////////// Prepare the arc functions /////////////////
    function prepareArcs() {
        ///////////////////// Node pie charts ////////////////////
        //Node pie charts
        arc_nodes
            .outerRadius(node_radius)
            .innerRadius(0)
            .context(ctx_nodes)

        ///////////////////// Concept threats ////////////////////
        arc_concept
            .startAngle(d => d.angle - 0.5 * d.angle_width)
            .endAngle(d => d.angle + 0.5 * d.angle_width)
            .innerRadius(radius_concept - 2*concept_radius)
            .outerRadius(d => radius_concept + 2*concept_radius + d.width + 10)
    }//function prepareArcs

    //////////////////////////////////////////////////////////////
    //////////////////////////// Texts ///////////////////////////
    //////////////////////////////////////////////////////////////

    ////////////// ICH element label outside circle //////////////
    function showElementTitle(ctx, type, text, ICH_num) {
        //text = text ? text : ICH_num + " | " + sentiment_clusters[language].titles[0]
        text="";
        //Create a white arc on the background so cover the potential fixed title
        if(type === "hover") {
            ctx.fillStyle = "white"
            ctx.beginPath()
            // ctx.arc(0, 0, radius_elements + 2*radius_elements_offset + 10, pi * 0.05, pi * 0.95)
            // ctx.arc(0, 0, radius_elements_title + 40, pi * 0.95, pi * 0.05, true)
            ctx.closePath()
            ctx.fill()
        }//if

        //Draw a background arc
        ctx.fillStyle = (type === "nodes" ? arc_gradient_nodes : arc_gradient_hover)
        ctx.beginPath()
        ctx.arc(0, 0, radius_elements_title, pi * 0.15, pi * 0.85)
        ctx.arc(0, 20, radius_elements_title - 8, pi * 0.87, pi * 0.17, true)
        ctx.fill() //18 -8 0.82 0.22

        //Draw the text
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.font = "normal normal 400 36px " + font_family
        ctx.fillStyle = "black"
        drawTextAlongArc(ctx, text, pi, radius_elements_title, "down", 0.6, false)


    }//function showElementTitle

    /////////////////// Concept label in circle //////////////////
    function showConceptTitle(ctx, d) {
        ctx.textBaseline = 'bottom'
        ctx.textAlign = 'center'
        ctx.fillStyle = d.fill
        ctx.strokeStyle = "white"
        ctx.lineWidth = 8

        let offset = -350
        ctx.font = "normal normal 400 " + 73 + "px " + font_family
        ctx.strokeText(d.label, 0, offset)
        ctx.fillText(d.label, 0, offset)

        //Add small rectangle below
        let width_text = ctx.measureText(d.label).width * 0.4
        ctx.strokeRect(0 - width_text/2, offset, width_text, 5)
        ctx.fillRect(0 - width_text/2, offset, width_text, 5)

        ctx.font = "normal normal 400 30px Gotham Narrow SSm"
        ctx.textBaseline = 'middle'
        let line_height = 30
        let max_width = 2 * radius_size * 0.6
        ctx.fillStyle = "black"
        wrapText(ctx, d.definition, 0, -270, max_width, line_height, true)
    }//function showConceptTitle



    ////////////////// Fit & wrap text on canvas /////////////////
    //From: https://codepen.io/bramus/pen/eZYqoO
    function wrapText(ctx, text, x, y, max_width, line_height = curved_line_height, do_stroke = false, get_num_lines = false) {
        let words = text.split(' ')
        let line = ''
        let num_lines = 0

        for (let n = 0; n < words.length; n++) {
            let new_line = line + words[n] + ' '
            let new_width = ctx.measureText(new_line).width
            if (new_width > max_width && n > 0) {
                if(!get_num_lines) {
                    if(do_stroke) ctx.strokeText(line.trim(), x, y)
                    ctx.fillText(line.trim(), x, y)
                }//if
                num_lines += 1
                line = words[n] + ' '
                y += line_height
            }
            else line = new_line
        }//for n
        if(!get_num_lines) {
            if(do_stroke) ctx.strokeText(line.trim(), x, y)
            ctx.fillText(line.trim(), x, y)
        }//if
        num_lines += 1

        if(get_num_lines) return num_lines
    }//function wrapText

    ////////////////////// Draw curved text //////////////////////
    function drawTextAlongArc(ctx, str, angle, radius, side, kerning = 0.6){
        let startAngle = (side === "up" ? angle : angle - pi)
        if(side === "up") str = str.split("").reverse().join("") // Reverse letters

        //Rotate 50% of total angle for center alignment
        for (let j = 0; j < str.length; j++) {
            let charWid = ctx.measureText(str[j]).width
            startAngle += ((charWid + (j === str.length-1 ? 0 : kerning)) / radius) / 2
        }//for j

        //Draw thick white stroke as background
        ctx.strokeStyle = "white"
        ctx.lineWidth = 22
        ctx.lineCap = "butt"
        ctx.beginPath()
        ctx.arc(0, 0, radius_elements_title + 4, pi1_2 - startAngle - 0.01, pi1_2 + startAngle + 0.01)
        ctx.stroke()

        //Draw the text
        ctx.beginPath()
        ctx.save()
        ctx.rotate(startAngle)
        for (let n = 0; n < str.length; n++) {
            let charWid = ctx.measureText(str[n]).width/2 // half letter
            //Rotate half letter
            ctx.rotate(-charWid/radius)
            // ctx.strokeText(str[n], 0, (side === "up" ? -1 : 1) * radius)
            ctx.fillText(str[n], 0, (side === "up" ? -1 : 1) * radius)
            //Rotate another half letter
            ctx.rotate(-(charWid + kerning) / radius)
        }//for n
        ctx.restore()
    }//function drawTextAlongArc

    /////////////// Draw the hidden mouseover nodes //////////////
    function drawHiddenElements() {
        //Draw the invisible ICH element circles on the SVG

        hover_ich = g_scale.append("g")
            .attr("class", "element-hover-group")
            .selectAll(".element-circle")
            .data(elements)
            .enter().append("circle")
            .attr("class", "element-circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", node_radius)
            .style("fill", "none")
            // .style("opacity", "0.4")
            .style("pointer-events", "all")
            .style("cursor", "pointer")

        //Draw the invisible rectangles of the threat categories
        hover_category = g_scale.append("g")
            .attr("class", "category-hover-group")
            .selectAll(".category-rect")
            .data(threats)
            .enter().append("rect")
            .attr("class", "category-rect")
            .attr("x", d => d.x - d.space/2)
            .attr("y", d => d.y - (d.num_lines + 1) * curved_line_height / 2)
            .attr("width", d => d.space)
            .attr("height", d => (d.num_lines + 1) * curved_line_height)
            .style("fill", "none")
            // .style("opacity", "0.4")
            .style("pointer-events", "all")
            .style("cursor", "pointer")


        //Draw the invisible arcs over the outside threats
        hover_concept = g_scale.selectAll(".threat-hover-path")
            .data(concepts)
            .enter().append("path")
            .attr("class", "threat-hover-path")
            .attr("d", arc_concept)
            .style("fill", "none")
            // .style("opacity", "0.4")
            .style("pointer-events", "all")
            .style("cursor", "pointer")
    }//function drawHiddenElements

    /////////////// Set the mouseover functionality //////////////
    function setHiddenHovers() {
        hover_ich
            .on("click", d => {
                mouseClick(d,"element")
                showModal(d)
            })

        hover_category
            .on("click", d => mouseClick(d,"category"))
            .on("mouseover", d => {
                if(!click_active) mouseOverCategory(d)
                else {
                    clearCanvas([ctx_hover])
                    ctx_hover.textBaseline = 'middle'
                    ctx_hover.textAlign = 'center'
                    ctx_hover.font = "normal normal 400 24px " + font_family
                    drawCategories(ctx_hover, d, 1)
                }
            })
            .on("mouseout", d => {
                if(!click_active) mouseOverReset()
                else clearCanvas([ctx_hover])
            })

        hover_concept
            .on("click", d => mouseClick(d,"concept"))
            .on("mouseover", d => {
                if(!click_active) mouseOverConcept(d)
                else {
                    clearCanvas([ctx_hover])
                    ctx_hover.textBaseline = 'middle'
                    ctx_hover.font = "normal normal 300 19px " + font_family
                    drawConcepts(ctx_hover, d, 1)
                    showConceptTitle(ctx_hover, d)
                }//else
            })
            .on("mouseout", d => {
                if(!click_active) mouseOverReset()
                else clearCanvas([ctx_hover])
            })
    }//function setHiddenHovers

    //////////////////////////////////////////////////////////////
    //////////////////// Node drawing functions //////////////////
    //////////////////////////////////////////////////////////////

    /////////////////////// Draw the nodes ///////////////////////
    function drawElements(ctx, d, opacity) {
        opacity = opacity ? opacity : d.opacity

        //Draw the circles as mini pie charts
//        let arcs = pie_nodes(d.threat_categories)
        /* ctx.save()
         ctx.translate(d.x, d.y)
         ctx.rotate(d.angle)
         //Draw each slice

         var img = new Image();
         img.src = 'https://i2.wp.com/9to5mac.com/wp-content/uploads/sites/6/2019/09/Twitter.jpg?w=2500&quality=82&strip=all&ssl=1';

         */
        /*
                arcs.forEach(a => {
                    ctx.beginPath()
                    ctx.moveTo(0, 0) //Needed to make sure Chrome keeps them as circles even at small sizes
                    arc_nodes.context(ctx)(a)
                    ctx.closePath()
                    var pattern = ctx.createPattern(img, 'repeat');
                    ctx.fillStyle = "#4A99E4"
                  //  ctx.fillStyle = chroma(color_cluster_scale(a.data)).alpha(opacity).css()
                    ctx.fill()
                })//forEach*/

        //Outside white stroke
        /*  ctx.strokeStyle = chroma("white").alpha(opacity).css()
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.arc(0, 0, node_radius + 1.2, 0, pi2)
          ctx.closePath()
          ctx.stroke()

          ctx.restore()*/
    }//function drawElements

    ////////////////// Draw the concept circles //////////////////
    function drawConcepts(ctx, d, opacity) {
        //At what angle different from 0 to flip the text direction
        let flip = 0//-0.1 * pi
        opacity = opacity ? opacity : d.opacity

        //Rotate and then move the canvas origin to the concept "dot" location
        ctx.save()
        ctx.rotate(d.angle > 0 + flip ? d.angle - pi1_2 : d.angle + pi1_2)
        ctx.translate((d.angle > 0 + flip ? 1 : -1) * radius_concept, 0)


        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, concept_radius, 0, pi2)
        ctx.closePath()
        ctx.fillStyle = chroma(d.fill).alpha(opacity).css()
        ctx.fill()

        //Draw the text
        ctx.textAlign = d.angle > 0  + flip ? 'start' : 'end'
        let color_text = chroma.mix('black', d.fill, 0.1)
        ctx.fillStyle = chroma(color_text).alpha(opacity).css()
        ctx.translate((d.angle > 0 + flip ? 1 : -1) * (concept_radius + 5), 0)
        ctx.fillText(d.label, 0, -2)
        ctx.restore()
    }//function drawConcepts

    ///////////////// Draw the threat categories /////////////////
    function drawCategories(ctx, d, opacity) {
        opacity = opacity ? opacity : d.opacity

        //Background degree circle
        ctx.globalCompositeOperation = "multiply"
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        //ctx.arc(d.x, d.y, cluster_radius(d.degree), 0, pi2)
        ctx.arc(d.x, d.y, 90, 0, pi2)
        ctx.closePath()
        ctx.fillStyle = chroma(d.fill).alpha(opacity/6).css()
        ctx.fill()
        ctx.globalCompositeOperation = "source-over"

        ctx.fillStyle = chroma(d.fill).alpha(opacity).css()
        // //Small circles around the text
        // ctx.beginPath()
        // //Top circle
        // ctx.moveTo(d.x, d.y - d.circle_offset)
        // ctx.arc(d.x, d.y - d.circle_offset, threat_circle_radius, 0, pi2)
        // //Bottom circle
        // ctx.moveTo(d.x, d.y + d.circle_offset)
        // ctx.arc(d.x, d.y + d.circle_offset, threat_circle_radius, 0, pi2)
        // ctx.closePath()
        // ctx.fill()

        //Rectangles on top and bottom
        let space = d.space * 0.4
        ctx.fillRect(d.x - space/2, d.y - d.circle_offset - 2, space, 4)
        ctx.fillRect(d.x - space/2, d.y + d.circle_offset - 2, space, 4)

        //Draw the text
        // let color_text = chroma.mix('black', d.fill, 0.9)
        ctx.fillStyle = chroma(d.fill).alpha(opacity).css()
        //Draw the text over multiple lines
        wrapText(ctx, d.title, d.x, d.y - (d.num_lines-1) * curved_line_height / 2 - 2.5, d.space)
    }//function drawCategories

    function showCategoryRing(ctx, d, opacity) {
        ctx.globalCompositeOperation = "multiply"
        ctx.beginPath()
        ctx.arc(d.x, d.y, 10000 + 4, 0, pi2)
        ctx.closePath()
        ctx.lineWidth = 4
        ctx.strokeStyle = chroma(d.fill).alpha(opacity).css()
        ctx.stroke()
        ctx.globalCompositeOperation = "source-over"
    }//function showCategoryRing


    function drawEdgesConcepts() {
        ctx_edges.globalCompositeOperation = "multiply"
        edges_concepts.forEach(d => {
            let stroke = color_cluster_scale(d.target.id)
            ctx_edges.strokeStyle = chroma(stroke).alpha(d.opacity).css()
            ctx_edges.beginPath()
            ctx_edges.moveTo(d.source.x, d.source.y)
            let target_y = d.target.y + d.sign_pos * d.target.circle_offset
            if(d.center) drawCircleArc(ctx_edges, d.center, d.r, d.source, d.target, d.sign, target_y)
            else ctx_edges.lineTo(d.target.x, target_y)
            ctx_edges.stroke()
        })//forEach
        ctx_edges.globalCompositeOperation = "source-over"
    }

    function drawCircleArc(ctx, c, r, p1, p2, side, target_y) {
        let ang1 = Math.atan2(p1.y - c.y, p1.x - c.x)
        let ang2 = Math.atan2(target_y - c.y, p2.x - c.x)
        ctx.arc(c.x, c.y, r, ang1, ang2, side)
    }//function drawCircleArc

    function calculateEdgeCenters(edges_data) {

        let scale_curve = d3.scaleLinear() //Slightly magical-numbers like....
            .domain([0, 0.1 * radius_size, radius_size])
            .range([50, 2, 1])

        let scale_curve_center = d3.scalePow() //Slightly magical-numbers like....
            .exponent(0.3)
            .domain([0, 0.45 * radius_size])
            .range([35, 2])
            .clamp(true)

        edges_data.forEach(d => {
            let curve_factor
            let target_y = d.target.y + d.sign_pos * d.target.circle_offset

            //Find a good radius
            if(d.target.x !== 0) curve_factor = scale_curve(Math.abs(d.target.x))
            else curve_factor = scale_curve_center(Math.abs(d.target.x - d.source.x))
            d.r = Math.sqrt(sq(d.target.x - d.source.x) + sq(target_y - d.source.y)) * curve_factor

            //Find center of the arc function
            let centers = findCenters(d.r, d.source, d.target, target_y)
            if(d.source.y < 0) d.sign = d.target.x < d.source.x ? 1 : 0 //1 flows from center to right
            else d.sign = d.target.x < d.source.x ? 0 : 1
            d.center = d.sign ? centers.c2 : centers.c1
        })//forEach

        function findCenters(r, p1, p2, target_y) {
            // pm is middle point of (p1, p2)
            let pm = { x: 0.5 * (p1.x + p2.x), y: 0.5 * (p1.y + target_y) }
            // compute leading vector of the perpendicular to p1 p2 == C1C2 line
            let perpABdx = - (target_y - p1.y)
            let perpABdy = p2.x - p1.x
            // normalize vector
            let norm = Math.sqrt(sq(perpABdx) + sq(perpABdy))
            perpABdx /= norm
            perpABdy /= norm
            // compute distance from pm to p1
            let dpmp1 = Math.sqrt(sq(pm.x - p1.x) + sq(pm.y - p1.y))
            // sin of the angle between { circle center,  middle , p1 }
            let sin = dpmp1 / r
            // is such a circle possible ?
            if (sin < -1 || sin > 1) return null // no, return null
            // yes, compute the two centers
            let cos = Math.sqrt(1 - sq(sin))   // build cos out of sin
            let d = r * cos
            let res1 = { x: pm.x + perpABdx * d, y: pm.y + perpABdy * d }
            let res2 = { x: pm.x - perpABdx * d, y: pm.y - perpABdy * d }
            return { c1: res1, c2: res2 }
        }//function findCenters
    }//function calculateEdgeCenters

    function clearCanvas(ctxs) {
        ctxs.forEach(d => {
            d.clearRect((-margin.left - width/2)/scale_factor, (-margin.top - height/2)/scale_factor,
                total_width/scale_factor, total_height/scale_factor)
        })
    }//function clearCanvas

    function drawCanvas() {
        //Clear everything
        clearCanvas([ctx_edges, ctx_nodes, ctx_hover])

        ctx_edges.lineWidth = 3
        drawEdgesConcepts()

        //Draw threat categories
        ctx_nodes.textBaseline = 'middle'
        ctx_nodes.textAlign = 'center'
        ctx_nodes.font = "normal normal 400 26px " + font_family
        threats.forEach(d => { drawCategories(ctx_nodes, d) })

        //Draw the other topics around the top outside
        ctx_nodes.textBaseline = 'middle'
        ctx_nodes.font = "normal normal 300 30px " + font_family
        concepts.forEach(d => { drawConcepts(ctx_nodes, d) })

        //Draw the ICH elements around the bottom outside
        elements.forEach(d => { drawElements(ctx_nodes, d) })

        //Show the title
        if(mouse_hover_active) {
            if(hover_type === "element") showElementTitle(ctx_nodes, "nodes", current_hover.label)
            else showElementTitle(ctx_nodes, "nodes", null, ICH_num)
            //Show threat concept title when hovered over top threat
            if(hover_type === "concept") showConceptTitle(ctx_nodes, current_hover)
            if(hover_type === "category") showCategoryRing(ctx_nodes, current_hover, 1)
        } else if(click_active) {
            if(hover_type === "element") showElementTitle(ctx_nodes, current_click.label, "nodes")
            else if(hover_type === "concept") showConceptTitle(ctx_nodes, current_click)
        } else {
            showElementTitle(ctx_nodes, "nodes", null, ICH_num_all)
        }//else
    }//function drawCanvas


    function mouseClick(d, click_type) {
        if(d3.event) d3.event.stopPropagation()
        click_active = true

        //Call the correct drawing function
        if(click_type === "element") mouseOverElement(d)
        else if(click_type === "concept") mouseOverConcept(d)
        else if(click_type === "category") mouseOverCategory(d)

        current_click = d
    }//function mouseClick

    chart.fixNode = (node_id) => {
        //Check if it's in the data
        let node = node_by_id[node_id]
        if(node) mouseClick(node, "element")
    }//function fixNode

    function findElement() {
        let m = d3.mouse(this)
        let x = (m[0] - total_width/2)/scale_factor
        let y = (m[1] - total_height/2)/scale_factor
        let r = Math.sqrt(x*x + y*y)

        //Only continue of the mouse is somewhere near the ICH element arc
        if(y > 70 && r > radius_elements - 2*radius_elements_offset && r < radius_elements + 2*radius_elements_offset) {
            //Search for nearby ICH element
            // let found = diagram.find(x, y, (node_radius * 2)/scale_factor)
            //A match is found and it's a new one
            if (found && current_hover !== found.data) {
                if(!click_active) mouseOverElement(found.data)
                //If a click is active and you hover over another element
                else if(click_active) {
                    current_hover = found.data
                    clearCanvas([ctx_hover])
                    drawElements(ctx_hover, found.data, 1)
                    showElementTitle(ctx_hover, "hover", found.data.label)
                }//else if
            }//if
            //When hovering away from an element and no click is active
            else if (!click_active && !found && mouse_hover_active) mouseOverReset()
            //When a click is active and you hover away
            else if(click_active && !found) {
                clearCanvas([ctx_hover])
                current_hover = null
            }//else if
        } //if
        else if(click_active && y > 70 && r > radius_elements - 2*radius_elements_offset - 40) clearCanvas([ctx_hover])
        else if (!click_active && mouse_hover_active && hover_type === "element")  mouseOverReset()
    }//function findElement

    function mouseOverElement(d) {
        //If the canvas fade is still active, stop it
        if(timer_draw) timer_draw.stop()
        mouse_hover_active = true
        hover_type = "element"
        current_hover = d
        let id = d.id

        //Draw the edges from element to threat category
        edges_elements.forEach(l => { l.opacity = (l.source.id === id ? 0.5 : 0) })

        //Draw the edges from the threat category to the threats
        edges_concepts.forEach(l => { l.opacity = (d.threats.indexOf(l.source.id) >= 0 && d.threat_categories.indexOf(l.target.id) >= 0 ? 0.5 : 0) })

        //Draw the ICH circles
        elements.forEach(n => { n.opacity = (n.id === id ? 1 : 0.1) })

        //Draw connected threat categories
        threats.forEach(n => { n.opacity = (d.threat_categories.indexOf(n.id) >= 0 ? 1 : 0.1) })

        //Draw connected threats
        concepts.forEach(n => { n.opacity = (d.threats.indexOf(n.id) >= 0 ? 1 : 0.1) })

        //Draw it all
        drawCanvas()
    }//function mouseOverElement

    function mouseOverCategory(d) {
        if(timer_draw) timer_draw.stop()
        mouse_hover_active = true
        hover_type = "category"
        current_hover = d
        let id = d.id

        //Draw the edges from threat category to the elements
        edges_elements.forEach(l => { l.opacity = (l.target.id === id ? 0.5 : 0) })

        //Draw the edges from the threat category to the threats
        edges_concepts.forEach(l => { l.opacity = (l.target.id === id ? 0.5 : 0) })

        //Draw the ICH circles
        elements.forEach(n => { n.opacity = (n.threat_categories.indexOf(id) >= 0 ? 1 : 0.1) })
        ICH_num = elements.filter(n => n.threat_categories.indexOf(id) >= 0 ).length

        //Draw connected threat categories
        threats.forEach(n => { n.opacity = (n.id === id ? 1 : 0.1) })

        //Draw connected threats
        concepts.forEach(n => { n.opacity = (n.threat_category === id ? 1 : 0.1) })

        //Draw it all
        drawCanvas()
    }//function mouseOverElement

    ///////////////////// Mouse over threats /////////////////////
    function mouseOverConcept(d) {
        //If the canvas fade is still active, stop it
        if(timer_draw) timer_draw.stop()
        mouse_hover_active = true
        hover_type = "concept"
        current_hover = d
        let id = d.id

        //Draw the edges from the threat to the threat category
        edges_concepts.forEach(l => { l.opacity = (l.source.id === id ? 0.5 : 0) })

        //Draw the edges from connected elements to threat category
        edges_elements.forEach(l => { l.opacity = (l.source.threats.indexOf(id) >= 0 && l.target.id === d.threat_category ? 0.5 : 0) })

        //Draw the connected ICH circles
        elements.forEach(n => { n.opacity = (n.threats.indexOf(id) >= 0 ? 1 : 0.1) })
        ICH_num = elements.filter(n => n.threats.indexOf(id) >= 0 ).length

        //Draw connected threat categories
        threats.forEach(n => { n.opacity = (n.id === d.threat_category ? 1 : 0.1) })

        //Draw threats
        concepts.forEach(n => { n.opacity = (n.id === id ? 1 : 0.1) })

        //Draw it all
        drawCanvas()
    }//function mouseOverConcept


    function mouseOverReset() {
        if(timer_draw) timer_draw.stop()
        mouse_hover_active = false
        hover_type = null
        current_hover = null

        //Animate the opacities coming back
        fadeCanvasBackIn()
    }//function mouseOverReset

    function fadeCanvasBackIn() {
        //Transition settings
        let duration = 250
        let ease = d3.easeQuadInOut

        //Calculate the opacity interpolator
        nodes.forEach(n => { n.interpolate_opacity = d3.interpolate(n.opacity, 1) })
        edges_concepts.forEach(l => { l.interpolate_opacity = d3.interpolate(l.opacity, opacity_concept_default) })
        edges_elements.forEach(l => { l.interpolate_opacity = d3.interpolate(l.opacity, opacity_element_default) })

        //Fade everything back in
        timer_draw = d3.timer(elapsed => {
            //How far along the total duration are we (taking the easing into account)
            let t = ease(Math.min(1,elapsed/duration))

            //Set new opacities
            nodes.forEach(n => { n.opacity = n.interpolate_opacity(t) })
            edges_concepts.forEach(l => { l.opacity = l.interpolate_opacity(t) })
            edges_elements.forEach(l => { l.opacity = l.interpolate_opacity(t) })

            //Draw the canvas
            drawCanvas()

            //Stop when the duration has been reached
            if (elapsed >= duration) timer_draw.stop()
        })//timer
    }//function fadeCanvasBackIn

    //////////////////////////////////////////////////////////////
    ///////////////////// Save result to PNG /////////////////////
    //////////////////////////////////////////////////////////////

    chart.saveImage = (width_print = 20, units = "cm") => {
        ///////////// Calculate new sizes /////////////
        //https://www.pixelcalculator.com/index.php?lang=en&dpi1=300&FS=2
        let dpi_scale = 300 / 2.54 //300 dpi / 2.54cm
        //Calculate the new scale factor
        let sf_new
        if(units === "px") sf_new = width_print / width
        else sf_new = (width_print * dpi_scale) / width
        sf_scale = sf_new / sf
        //Check sizes
        if(sf_new * width * sf_new * height > 268435456) Error("requested canvas is probably too big for the browser to handle")
        sf = sf_new
        sf_set = true

        ///////////// Resize everything /////////////
        //Resize the actual canvas to this
        let resizeDone = new Promise(function(resolve, reject) {
            let result = chart.resize()
            if(result === 1) resolve("resizing done")
            else reject(Error("Resizing broke"))
        })
        //Do the next step after the resizing is done
        resizeDone.then(result => {
            createPrintCanvas()
            //Resize back
            sf = sf_original
            sf_set = sf_set_original
            chart.resize()
        }, error => { console.log(error) })

        function createPrintCanvas() {
            //Create "off-screen" canvas to combine the different layers
            let canvas_save = document.createElement('canvas')
            canvas_save.id = "canvas-print"
            let ctx_save = canvas_save.getContext('2d')
            canvas_save.width = total_width * sf
            canvas_save.height = total_height * sf

            //Draw all the layers onto 1 canvas
            ctx_save.drawImage(canvas_edges.node(), 0, 0, canvas_save.width, canvas_save.height)
            ctx_save.drawImage(canvas_nodes.node(), 0, 0, canvas_save.width, canvas_save.height)
            ctx_save.drawImage(canvas_hover.node(), 0, 0, canvas_save.width, canvas_save.height)

            //Get the image
            // a.href = canvas_save.toDataURL("image/png") //won' work, too large a URL
            try {
                //Automatically download the canvas
                canvas_save.toBlob(blob => {
                    let a = document.createElement("a")
                    let url = URL.createObjectURL(blob)
                    a.href = url
                    a.download = "ICH_Threats.png"
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                },'image/png')
            } catch(err) {
                //Manually download the canvas
                document.body.appendChild(canvas_save)
                document.body.style.overflow = "auto"
                window.scrollTo(0,document.body.scrollHeight)
                console.log("Unable to automatically download the file due to photo and wrong URL")
            }//try-catch
        }//function createPrintCanvas

    }//function saveImage

    //////////////////////////////////////////////////////////////
    /////////////////////// Helper functions /////////////////////
    //////////////////////////////////////////////////////////////

    function sq(x) { return x * x }

    function roundTo(n, digits) {
        let multiplicator = Math.pow(10, digits)
        n = parseFloat((n * multiplicator).toFixed(11))
        return Math.round(n) / multiplicator
    }//function roundTo

    ///////////////// Find the device pixel ratio ////////////////
    function getPixelRatio(ctx) {
        //From https://www.html5rocks.com/en/tutorials/canvas/hidpi/
        let devicePixelRatio = window.devicePixelRatio || 1
        let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1
        let ratio = devicePixelRatio / backingStoreRatio
        return ratio
    }//function getPixelRatio

    function crispyCanvas(canvas, ctx) {
        canvas
            .attr("width", Math.round(sf * total_width))
            .attr("height", Math.round(sf * total_height))
            .style("width", `${total_width}px`)
            .style("height", `${total_height}px`)
        ctx.scale(sf*scale_factor, sf*scale_factor)
        ctx.translate((margin.left + width/2)/scale_factor, (margin.top + height/2)/scale_factor)
    }//function crispyCanvas


    chart.width = function (value) {
        if (!arguments.length) return width
        width = value
        return chart
    }

    chart.height = function (value) {
        if (!arguments.length) return height
        height = value
        return chart
    }

    chart.nodeRadius = function (value) {
        if (!arguments.length) return node_radius
        node_radius = value
        return chart
    }//function nodeRadius

    chart.scaleFactor = function (value) {
        if (!arguments.length) return sf
        sf = value
        sf_original = sf
        sf_set = true
        sf_set_original = true
        return chart
    }//function scaleFactor

    chart.zoomFactor = function (value) {
        if (!arguments.length) return scale_multiplier
        scale_multiplier = value
        return chart
    }//function zoomFactor

    chart.showModal = function(_) {
        return arguments.length ? (showModal = _, chart) : showModal
    }//function showModal

    return chart

}//function createThreatVisual

