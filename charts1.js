function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;
    
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Create the buildCharts function.
function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // Create a variable that holds the samples array. 
    var samples = data.samples;
    var metadata = data.metadata;
    // Create a variable that filters the samples for the object with the desired sample number.
    var filteredSamples = samples.filter(item => item.id == sample);
    var filteredMeta = metadata.filter(item => item.id == sample);
    //  Create a variable that holds the first sample in the array.
    var firstSample = filteredSamples[0];
    var firstMeta = filteredMeta[0];
    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = firstSample.otu_ids;
    var otuLabels = firstSample.otu_labels;
    var sampleValues = firstSample.sample_values;
    var washFreq = firstMeta.wfreq;

    // Create the yticks for the bar chart.
    // Get the the top 10 otu_ids and map them in descending order  
    // so the otu_ids with the most bacteria are last. 

    var yticks = otuIds.sort((a,b) => b.otu_ids - a.otu_ids).slice(0,10).map(x => `OTU ID ${x}`);
    console.log(data)
    // Create the trace for the bar chart. 
    var barData = {
      x: sampleValues.slice(0,10).reverse(),
      y: yticks.reverse(),
      type: "bar",
      marker: {color: sampleValues.slice(0,10).reverse(),
        colorscale: 'Rainbow'},
      orientation: "h",
      text: otuLabels
    };
    // Create the layout for the bar chart. 
    var barLayout = {
     title: "<b>Top 10 Bacteria Cultures Found</b>",
     plot_bgcolor: "transparent"
    };
    // Use Plotly to plot the data with the layout. 
    Plotly.newPlot('bar', [barData], barLayout)
    // Create the trace for the bubble chart.
    var bubbleData = {
      type: "bubble",
      x: otuIds,
      y: sampleValues,
      text:  otuLabels,
      mode: "markers",
      marker: {
        size: sampleValues,
        color: otuIds,
        colorscale: 'Earth'
        }
    };
    var bubbleTrace = [bubbleData];
    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: '<b>Bacteria Cultures Per Sample</b>',
      xaxis: { title:'OTU ID' },
      hovermode: 'closest' 
    };
    
    // Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleTrace, bubbleLayout); 

    // Making the guage chart
    // Creating the trace for the gauge chart
    var guageData = {
      value: washFreq,
      type: "indicator",
      mode: "gauge+number",
      title: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
      gauge: {
        axis: {range: [null,10]},
        bar: { color: "black"},
        steps: [ { range: [0,2], color: 'red'}, { range: [2,4], color: 'orange'}, { range: [4,6], color: 'yellow'}, { range: [6,8], color: 'yellowgreen'}, { range: [8,10], color: 'green'}]
      },
    }

    // Creating the layout for the gauge chart
    var gaugeLayout = {
      width: 600, height: 500, margin: {t: 0, b: 75}
    }

    // Using plotly to plot the data with the layout
    Plotly.newPlot("gauge", [guageData], gaugeLayout);
  });
}
init();
