
/*
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

class TweetSentimentSpectrum {

    /*
     *  Constructor method
     */
    constructor(parentElement, displayData, mapCenter, lineData) {
        this.parentElement = parentElement;
        this.displayData = displayData;
        this.mapCenter = mapCenter;
        this.lineData = lineData;

        this.initVis();
    }


    initVis() {
        let viz = this;
        viz.cluster_config = [
            { id: "sentiment_cluster_5", color: "#E01A25"},
            { id: "sentiment_cluster_1", color: "#C20049"},
            { id: "sentiment_cluster_2", color: "#991C71"},
            { id: "sentiment_cluster_3", color: "#66489F"},
            { id: "sentiment_cluster_9", color: "#EFB605"},
            { id: "sentiment_cluster_4", color: "#E58903"},
            { id: "sentiment_cluster_6", color: "#2074A0"},
            { id: "sentiment_cluster_7", color: "#10A66E"},
            { id: "sentiment_cluster_8", color: "#7EB852"},
        ]


        viz.width = 1600, height = 1400
        viz.total_width, total_height
        viz.margin = {top: 100, right: 0,  bottom: 0, left: 0}
        viz.svg, g
        viz.g_scale
        viz.canvas_edges, canvas_nodes, canvas_hover
        viz.ctx_edges, ctx_nodes, ctx_hover
        viz.sf = 2 //canvas scale factor
        viz.sf_original = sf
        viz.sf_set = false
        viz.sf_set_original = sf_set
        viz.nodes
        viz.elements
        viz.concepts
        viz.language
        viz.edges
        viz.edges_concepts = [], edges_elements = []
        viz.node_by_id = {}
        viz.linked_to_id = {}
        viz.threat_by_id = {}
        viz.concept_by_id = {}
        viz.edge_concept_by_id = {}

        viz.pi = Math.PI
        viz.pi2 = Math.PI * 2
        viz.pi1_2 = Math.PI / 2

        viz.cluster_ids = cluster_config.map(d => d.id)
        viz.color_cluster_scale = d3.scaleOrdinal()
            .domain(cluster_ids)
            .range(cluster_config.map(d => d.color))


        viz.cluster_radius = d3.scaleSqrt()
            .domain([0, 30])
            .range([0, 80])


        viz.node_radius = 20
        viz.radius_elements = 600
        viz.radius_elements_offset = 1.1 * node_radius
        viz.radius_elements_title = 680
        viz.arc_nodes = d3.arc()
        viz.pie_nodes = d3.pie()
            .sort(null)
            .value(1)

        viz.radius_size = 580
        viz.curved_line_height = 30

        viz.concept_radius = 6
        viz.radius_concept = 600
        viz.concept_arcs
        viz.arc_concept = d3.arc()
        viz.pie_concept = d3.pie()
            .value(d => d.values.length)
            .sort(null)
        viz.threats_nest

        //Visual styles
        viz.opacity_concept_default = 0.5
        viz.opacity_element_default = 0.1
        viz.arc_gradient_nodes
        viz.arc_gradient_hover

        viz.diagram
        viz.mouse_hover_active = false
        viz.current_hover = null
        viz.hover_type = null
        viz.timer_draw = null

        //Mouse clicks
        viz.current_click = null
        viz.click_active = false
        viz.hover_concept, hover_category

        //Other
        viz.font_family = "Oswald"
        viz.scale_factor = 1
        viz.scale_multiplier = 1
        viz.sentimentClusters
        viz.ICH_num, ICH_num_all

        viz.line = d3.line()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveBasis)

        viz.cr1_offset_scale = d3.scaleLinear()
            .domain([0, 2 * radius_size])
            .range([-20, -150])
            .clamp(true)
        viz.cr2_offset_scale = d3.scaleLinear()
            .domain([0, radius_size])
            .range([0, 175])
            .clamp(true)
        viz.angle2_offset_scale = d3.scaleLinear()
            .domain([0, radius_size])
            .range([1, 0.5])
            .clamp(true)



    }

    wrangleData () {

    }

    updateVis() {

    }
}
