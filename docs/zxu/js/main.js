let tagNetwork, processor;
let dataset_clean;

let selectedTimeRange = [];
let selectedTag = '';

// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

// load data using promises
let promises = [
    d3.json("viz_data/node.json"),
    d3.json("viz_data/edge.json")
];

Promise.all(promises)
    .then(function(dataset){initPage(dataset)})
    .catch( function (err){console.log(err)} );


function initPage(dataset){
    let start_date = '2020-09-01',
        end_date = '2020-10-10';
    processor = new TagDataProcessor(dataset);
    dataset_clean = processor.processData(start_date, end_date);
    tagNetwork = new TagNetwork("tagNetwork", dataset_clean[0], dataset_clean[1]);
}