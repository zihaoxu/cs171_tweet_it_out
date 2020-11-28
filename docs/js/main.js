/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables, switches, helper functions
let myBarChart,
    myMapVis,
    emoji;


let selectedTimeRange = [];
let selectedEmojiTime = [];

function updateAllVisualizations(){
    myBarChart.wrangleData()
}

// load viz_data using promises
let promises = [
    d3.csv("viz_data/trump_raw_tweets.csv"),
    d3.csv("viz_data/trump_topics.csv"),
    d3.csv("viz_data/emoji_data.csv"),
    d3.csv("viz_data/emoji_score.csv")
];

Promise.all(promises)
    .then( function(data_list){
        data_list[0].forEach(function(d){
            d.sentiment_score =+ d.sentiment_score;
            d.tweet_length =+ d.tweet_length})
        data_list[1].forEach(function(d){
            d.month =+ d.month;
            d.coronavirus =+ d.coronavirus;
            d['great job'] =+ d['great job'];
            d['fake news media'] =+ d['fake news media'];
            d['nothing democrats'] =+ d['nothing democrats'];
            d['million tests'] =+ d['million tests'];
            d['stay home'] =+ d['stay home'];

        })
    initMainPage(data_list) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(allDataArray) {

    // log viz_data
    console.log(allDataArray);

    // emoji piano plot
    emoji = new EmojiVis("bar_emoji", allDataArray[2], allDataArray[3])

    // // bar chart for trump tweet sentiments
    myBarChart = new BarVis('bar_trump', allDataArray[0], 'sentiment')

    // // area plot as the timeline
    timeline = new Timeline("timeline_trump", allDataArray[0])
    timeline.initVis()

    myTopicChart = new TopicVis("topic_trump", allDataArray[1])




}



// code for the multiple-value slider (for emojiVis)
let months = ['Jan', 'Tue', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
$("#slider-range").slider({
    range: true,
    min: 1,
    max: 9,
    values: [1, 9],
    slide: function (event, ui) {
        $("#month").val(months[ui.values[0]-1] + " - " + months[ui.values[1]-1]);
        selectedEmojiTime = [ui.values[0],ui.values[1]]
        emoji.wrangleData();

    }
});
$("#month").val(months[$("#slider-range").slider("values", 0)-1] +
    " - " + months[$("#slider-range").slider("values", 1)-1]);
