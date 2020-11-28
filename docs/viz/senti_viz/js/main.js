let sentiPlot, brushPlot;
let dataset_clean;
let selected_view;

let selectedTime = [],
    selectedTimeConverted = [];

// Function to convert date objects to strings or reverse
let parseDate = d3.timeParse("%Y-%m-%d");
let formatDate = d3.timeFormat("%Y-%m-%d");

// load data using promises
let promises = [
    d3.json("viz_data/senti_data.json")
];

Promise.all(promises)
    .then(function(dataset){processData(dataset)})
    .catch(function (err){console.log(err)});

function processData(dataset){
    dataset_clean = dataset[0].day_df;
    dataset_clean.forEach(d => {
        d.date = parseDate(d.date);
    })

    initPage();
}
function initPage(){
    selected_view = d3.select("#month").property("value");
    sentiPlot = new SentiPlot("senti-sentiplot", dataset_clean);
    brushPlot = new BrushVis("senti-brush", dataset_clean);
    // Show the tutorial
    togglePopup();
}

function updatePage(){
    selected_view = d3.select("#month").property("value")
    sentiPlot.wrangleData();
}

function togglePopup(){
    document.getElementById("popup-1").classList.toggle("active");
}