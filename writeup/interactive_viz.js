function createInteractiveChart(containerId) {
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    // Categories for filtering
    const categories1 = ['baseline', 'cognitive', 'survey'];
    const categories2 = ['bvp', 'eda', 'temp', 'PPG GREEN'];
    
    // Create container for dropdowns
    var filterContainer = d3.select("#" + containerId)
        .append("div")
        .attr("class", "filter-container");
    
    // Create first dropdown
    var select1 = filterContainer
        .append("select")
        .attr("id", containerId + "-select1")
        .style("margin-right", "10px");
    
    select1.selectAll('option')
        .data(categories1)
        .enter()
        .append('option')
        .text(d => d)
        .attr("value", d => d);
    
    // Create second dropdown
    var select2 = filterContainer
        .append("select")
        .attr("id", containerId + "-select2");
    
    select2.selectAll('option')
        .data(categories2)
        .enter()
        .append('option')
        .text(d => d)
        .attr("value", d => d);
    
    // Create SVG
    var svg = d3.select("#" + containerId)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Load data
    // Update the getFilePath function to handle both pre and post
    function getFilePath(type1, type2, period) {
      return `../averages/${period}/${type1}/averaged_${type2}_measurements.csv`;
    }
    
    // Update the updateChart function
    function updateChart() {
      let selectedType1 = d3.select("#" + containerId + "-select1").property("value");
      let selectedType2 = d3.select("#" + containerId + "-select2").property("value");
      
      // Get both file paths
      let preFilePath = getFilePath(selectedType1, selectedType2, "pre");
      let postFilePath = getFilePath(selectedType1, selectedType2, "post");
      
      console.log("Current selection:", selectedType1, selectedType2);
      
      // Load both datasets
      Promise.all([
          d3.csv(preFilePath),
          d3.csv(postFilePath)
      ]).then(function([preData, postData]) {
          // Process pre data
          preData = preData.filter(d => {
              d.time = parseFloat(d.Timestamp);
              d.value = parseFloat(d.Average);
              return !isNaN(d.value) && !isNaN(d.time);
          });
    
          // Process post data
          postData = postData.filter(d => {
              d.time = parseFloat(d.Timestamp);
              d.value = parseFloat(d.Average);
              return !isNaN(d.value) && !isNaN(d.time);
          });
    
          // Clear existing elements
          svg.selectAll("*").remove();
    
          // Compute combined extent for both datasets
          const allData = [...preData, ...postData];
          
          // Add X axis
          const x = d3.scaleLinear()
              .domain(d3.extent(allData, d => d.time))
              .range([0, width]);
          svg.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x));
    
          // Add Y axis
          const y = d3.scaleLinear()
              .domain(d3.extent(allData, d => d.value))
              .range([height, 0]);
          svg.append("g")
              .call(d3.axisLeft(y));
    
          // Line generator
          const line = d3.line()
              .defined(d => !isNaN(d.value) && !isNaN(d.time))
              .x(d => x(d.time))
              .y(d => y(d.value));
    
          // Add the pre line
          svg.append("path")
              .datum(preData)
              .attr("fill", "none")
              .attr("stroke", "red")  // Different color for pre
              .attr("stroke-width", 1.5)
              .attr("d", line);
    
          // Add the post line
          svg.append("path")
              .datum(postData)
              .attr("fill", "none")
              .attr("stroke", "steelblue")  // Original color for post
              .attr("stroke-width", 1.5)
              .attr("d", line);
    
          // Add legend
          const legend = svg.append("g")
              .attr("font-family", "sans-serif")
              .attr("font-size", 10)
              .attr("text-anchor", "start")
              .selectAll("g")
              .data(["Pre", "Post"])
              .enter().append("g")
              .attr("transform", (d, i) => `translate(0,${i * 20})`);
    
          legend.append("rect")
              .attr("x", width - 60)
              .attr("width", 19)
              .attr("height", 19)
              .attr("fill", d => d === "Pre" ? "red" : "steelblue");
    
          legend.append("text")
              .attr("x", width - 35)
              .attr("y", 9.5)
              .attr("dy", "0.32em")
              .text(d => d);
    
      }).catch(function(error) {
          console.error("Error loading the data:", error);
      });
    }
    
    // Add event listeners to dropdowns
    d3.select("#" + containerId + "-select1").on("change", updateChart);
    d3.select("#" + containerId + "-select2").on("change", updateChart);
    
    // Initial chart load
    updateChart();
    }