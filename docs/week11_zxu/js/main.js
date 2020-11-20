let tagNetwork, processor, monthMenu;
let dataset_orig, dataset_clean;

let selectedTimeRange = [];
let selectedTag = '';
let selected_month_range = '';

let monthDict = {
    'Jan': ['2020-01-01', '2020-02-01'],
    'Feb': ['2020-02-01', '2020-03-01'],
    'Mar':['2020-03-01', '2020-04-01'],
    'Apr': ['2020-04-01', '2020-05-01'],
    'May':['2020-05-01', '2020-06-01'],
    'June': ['2020-06-01', '2020-07-01'],
    'July':['2020-07-01', '2020-08-01'],
    'Aug': ['2020-08-01', '2020-09-01'],
    'Sep':['2020-09-01', '2020-10-01'],
}

// Function to convert date objects to strings or reverse
let dateFormatter = d3.timeFormat("%Y-%m-%d");
let dateParser = d3.timeParse("%Y-%m-%d");

// load data using promises
let promises = [
    d3.json("viz_data/node.json"),
    d3.json("viz_data/edge.json"),
    d3.json("viz_data/senti_data.json")
];

Promise.all(promises)
    .then(function(dataset){initPage(dataset)})
    .catch( function (err){console.log(err)} );


function initPage(dataset){
    // Start with Sep
    selected_month = 'Sep';
    selectedTimeRange = monthDict[selected_month];
    let start_date = selectedTimeRange[0],
        end_date = selectedTimeRange[1];
    dataset_orig = dataset;
    processor = new TagDataProcessor(dataset.slice(0,2));
    dataset_clean = processor.processData(start_date, end_date);
    tagNetwork = new TagNetwork("tagnet-tagNetwork", dataset_clean[0], dataset_clean[1]);
    monthMenu = new MonthMenu('tagnet-month_menu', dataset[2]);

}

function updatePage(){
    let tagNetworkDiv = document.getElementById("tagnet-tagNetwork");
    tagNetworkDiv.innerHTML='';

    selectedTimeRange = monthDict[selected_month];
    let start_date = selectedTimeRange[0],
        end_date = selectedTimeRange[1];
    processor = new TagDataProcessor(dataset_orig.slice(0,2));
    dataset_clean = processor.processData(start_date, end_date);
    tagNetwork = new TagNetwork("tagnet-tagNetwork", dataset_clean[0], dataset_clean[1]);
}
