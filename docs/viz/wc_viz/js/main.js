let wordCloud, monthMenu, selected_month;
let dataset_orig;

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

// load data using promises
let promises = [
    d3.json("viz_data/month_dict.json"),
    d3.json("viz_data/senti_data.json")
];

Promise.all(promises)
    .then(function(dataset){initPage(dataset)})
    .catch( function (err){console.log(err)} );


function initPage(dataset){
    dataset_orig = dataset;
    // Start with Sep
    selected_month = 9;
    wordCloud = new WordCloud("wc-word_cloud", dataset[0]);
    monthMenu = new MonthMenu('wc-month_menu', dataset[1]);
}

function updatePage(){
    let WCDiv = document.getElementById("wc-word_cloud");
    WCDiv.innerHTML='';
    wordCloud = new WordCloud("wc-word_cloud", dataset_orig[0]);
}
