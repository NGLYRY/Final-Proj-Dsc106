function createInteractiveChart(containerId) {
    var margin = {top: 40, right: 30, bottom: 30, left: 60}, 
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    // Categories for filtering
    const categories2 = ['bvp', 'eda'];
    
    // Create container for dropdown (hidden from view)
    var filterContainer = d3.select("#" + containerId)
        .append("div")
        .attr("class", "filter-container")
        .style("display", "none");
    
    // Create phase input (hidden but functional)
    var select1 = filterContainer
        .append("select")
        .attr("id", containerId + "-select1");
    
    select1.selectAll('option')
        .data(['baseline', 'cognitive', 'survey'])
        .enter()
        .append('option')
        .text(d => d)
        .attr("value", d => d);
    
    // Create data type dropdown
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
    
    // Function to update the chart
    function updateChart() {
        let selectedType1 = d3.select("#" + containerId + "-select1").property("value");
        let selectedType2 = d3.select("#" + containerId + "-select2").property("value");
        
        // Get both file paths
        let preFilePath = `../averages/pre/${selectedType1}/averaged_${selectedType2}_measurements.csv`;
        let postFilePath = `../averages/post/${selectedType1}/averaged_${selectedType2}_measurements.csv`;
        
        console.log("Loading data for:", selectedType1, selectedType2);
        console.log("Paths:", preFilePath, postFilePath);
        
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
            let xDomain;
            if (selectedType2 === 'eda') {
                const preMax = d3.max(preData, d => d.time);
                const postMax = d3.max(postData, d => d.time);
                xDomain = [0, Math.min(preMax, postMax)];
            } else {
                xDomain = d3.extent(allData, d => d.time);
            }

            // Filter data to match x-axis domain
            preData = preData.filter(d => d.time >= xDomain[0] && d.time <= xDomain[1]);
            postData = postData.filter(d => d.time >= xDomain[0] && d.time <= xDomain[1]);
            
            // Add X axis
            const x = d3.scaleLinear()
                .domain(xDomain)
                .range([0, width]);
      
            // Add Y axis
            let yDomain = selectedType2 === 'bvp' ? [-150, 150] : 
                         selectedType2 === 'eda' ? [0.2, 1.6] : 
                         d3.extent(allData, d => d.value);

            // Filter data to match both x and y axis domains
            preData = preData.filter(d => 
                d.time >= xDomain[0] && 
                d.time <= xDomain[1] && 
                d.value >= yDomain[0] && 
                d.value <= yDomain[1]
            );
            postData = postData.filter(d => 
                d.time >= xDomain[0] && 
                d.time <= xDomain[1] && 
                d.value >= yDomain[0] && 
                d.value <= yDomain[1]
            );

            const y = d3.scaleLinear()
                .domain(yDomain)
                .range([height, 0]);

            // Style the axes with better fonts
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .style("font-family", "'Gill Sans', sans-serif")
                .style("font-size", "12px");
            
            svg.append("g")
                .call(d3.axisLeft(y))
                .style("font-family", "'Gill Sans', sans-serif")
                .style("font-size", "12px");
            

            // Add gridlines
            svg.append("g")
                .attr("class", "grid")
                .attr("opacity", 0.1)
                .call(d3.axisRight(y)
                    .tickSize(width)
                    .tickFormat("")
                );
            
            // Create gradient definitions
            const gradientPre = svg.append("defs")
                .append("linearGradient")
                .attr("id", "gradientPre")
                .attr("gradientTransform", "rotate(90)");
            gradientPre.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#ff6b6b");
            gradientPre.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#ff8787");

            const gradientPost = svg.append("defs")
                .append("linearGradient")
                .attr("id", "gradientPost")
                .attr("gradientTransform", "rotate(90)");
            gradientPost.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#4dabf7");
            gradientPost.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#74c0fc");

            // Add smoothed lines with gradients
            const line = d3.line()
                .defined(d => !isNaN(d.value) && !isNaN(d.time))
                .curve(d3.curveCatmullRom)
                .x(d => x(d.time))
                .y(d => y(d.value));

            // Add the post line
            svg.append("path")
                .datum(postData)
                .attr("fill", "none")
                .attr("stroke", "url(#gradientPost)")
                .attr("stroke-width", 2.5)
                .attr("opacity", 0.7)  // Add transparency
                .attr("d", line);

            // Add the pre line
            svg.append("path")
                .datum(preData)
                .attr("fill", "none")
                .attr("stroke", "url(#gradientPre)")
                .attr("stroke-width", 2.5)
                .attr("opacity", 0.7)  // Add transparency
                .attr("d", line);

            

            // Enhanced legend
            const legend = svg.append("g")
                .attr("font-family", "'Gill Sans', sans-serif")
                .attr("font-size", "12px")
                .attr("text-anchor", "start")
                .selectAll("g")
                .data(["Pre", "Post"])
                .enter().append("g")
                .attr("transform", (d, i) => `translate(${width - 100},${i * 25 + 10})`);

            legend.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("rx", 2)
                .attr("fill", d => d === "Pre" ? "#ff6b6b" : "#4dabf7");

            legend.append("text")
                .attr("x", 20)
                .attr("y", 12)
                .text(d => d);

            // Enhanced title and labels
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", -margin.top/2)
                .attr("text-anchor", "middle")
                .style("font-family", "'Gill Sans', sans-serif")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text(`${selectedType1.charAt(0).toUpperCase() + selectedType1.slice(1)} Phase - ${selectedType2.toUpperCase()} Measurements`);

            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom)
                .attr("text-anchor", "middle")
                .style("font-family", "'Gill Sans', sans-serif")
                .style("font-size", "14px")
                .text("Time (seconds)");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -(height / 2))
                .attr("y", -margin.left + 15)
                .attr("text-anchor", "middle")
                .style("font-family", "'Gill Sans', sans-serif")
                .style("font-size", "14px")
                .text(selectedType2.toUpperCase() + (selectedType2 === 'bvp' ? " Value (µV)" : " Value"));


        }).catch(function(error) {
            console.error("Error loading the data:", error);
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .text("Error loading data. Check console for details.");
        });
    }
    
    // Add event listeners to dropdowns
    d3.select("#" + containerId + "-select1").on("change", updateChart);
    d3.select("#" + containerId + "-select2").on("change", updateChart);
}