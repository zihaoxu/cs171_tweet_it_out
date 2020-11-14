let tagNetwork, processor;
let dataset_orig, dataset_clean;

let selectedTimeRange = [];
let selectedTag = '';
let selected_month = '';

let monthDict = {
    'Feb': ['2020-02-01', '2020-03-01'],
    'Mar':['2020-03-01', '2020-04-01'],
    'Apr': ['2020-04-01', '2020-05-01'],
    'May':['2020-05-01', '2020-06-01'],
    'Jun': ['2020-06-01', '2020-07-01'],
    'Jul':['2020-07-01', '2020-08-01'],
    'Aug': ['2020-08-01', '2020-09-01'],
    'Sep':['2020-09-01', '2020-10-01'],
    'All':['2020-01-27', '2020-12-01'],
}

// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

// load data using promises
let promises = [
    d3.json("data/node.json"),
    d3.json("data/edge.json")
];

Promise.all(promises)
    .then(function(dataset){initPage(dataset)})
    .catch( function (err){console.log(err)} );


function initPage(dataset){
    selected_month = d3.select("#month").property("value")
    let month = monthDict[selected_month];
    let start_date = month[0],
        end_date = month[1];
    console.log(month)
    dataset_orig = dataset;
    processor = new TagDataProcessor(dataset);
    dataset_clean = processor.processData(start_date, end_date);
    tagNetwork = new TagNetwork("tagNetwork", dataset_clean[0], dataset_clean[1]);
}

function updatePage(){
    let tagNetworkDiv = document.getElementById("tagNetwork");
    tagNetworkDiv.innerHTML='';

    selected_month = d3.select("#month").property("value")
    let month = monthDict[selected_month];
    let start_date = month[0],
        end_date = month[1];
    processor = new TagDataProcessor(dataset_orig);
    dataset_clean = processor.processData(start_date, end_date);
    tagNetwork = new TagNetwork("tagNetwork", dataset_clean[0], dataset_clean[1]);
}
