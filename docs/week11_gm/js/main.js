let language = 'en'
let parentElement = d3.select("#chart")
let threatVisual = createSentimentTopicSpectrum()
    .width(1000)
    .height(1000)

let promises = []
promises.push(d3.json("data/sentiment_graph.json"))
Promise.all(promises).then(values => {
    graph = values[0]
    let nodes = prepareSentimentCluster(graph)
    let edges = prepareTopics(graph)
    parentElement.call(threatVisual, nodes, edges, language)
})

function prepareSentimentCluster(graph) {
    let nodes = []
    for(let element in graph.nodes) {
        graph.nodes[element].id = element
        nodes.push(graph.nodes[element])
    }
    return nodes
}

function prepareTopics(graph) {
    let edges = graph.edges
    edges.forEach(d => {
        d.source = d.subject
        d.target = d.object
        delete d.subject
        delete d.object
    })
    return edges
}