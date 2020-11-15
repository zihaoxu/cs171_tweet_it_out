/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables, switches, helper functions
let myBarChart,
    myMapVis;

let selectedTimeRange = [];

function updateAllVisualizations(){
    myBarChart.wrangleData()
    // myMapVis.wrangleData()
}

// load data using promises
let promises = [
    d3.csv("data/trump_raw_tweets.csv"),
    //d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
];

Promise.all(promises)
    .then( function(data){
        data[0].forEach(function(d){
            d.sentiment_score =+ d.sentiment_score;
            d.tweet_length =+ d.tweet_length})
    initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(allDataArray) {

    // log data
    console.log(allDataArray);

    // // bar chart for trump tweet sentiments
    myBarChart = new BarVis('bar_trump', allDataArray, 'sentiment')
    //
    // // activity 2, force layout
    // myMapVis = new MapVis('mapDiv', allDataArray[0], allDataArray[1])

    timeline = new Timeline("timeline_trump", allDataArray)
    timeline.initVis()

}


