document.addEventListener('DOMContentLoaded', function() {
    // Initialize a chart for each section
    createSectionChart('baseline');
    createSectionChart('cognitive');
    createSectionChart('survey');
    createTimeDistributionPlot();
    initBrainwaveViz();
    
    
    // Set up scroll behavior
    setupScrollingBehavior();
});

function createSectionChart(phase) {
    // Get the container
    const container = document.getElementById(`${phase}-visualization`);
    
    // Set up radio button listeners
    const radioButtons = document.querySelectorAll(`input[name="${phase}-dataType"]`);
    radioButtons.forEach(button => {
        button.addEventListener('change', function() {
            if (this.checked) {
                updateSectionChart(phase, this.value);
            }
        });
    });
    
    // Create initial chart with BVP data
    updateSectionChart(phase, 'bvp');
}

function updateSectionChart(phase, dataType) {
    // Clear previous visualization
    const container = document.getElementById(`${phase}-visualization`);
    container.innerHTML = '';
    
    // Create dimensions with INCREASED HEIGHT from 400 to 500
    const margin = {top: 40, right: 30, bottom: 50, left: 60},
          width = container.clientWidth - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom; // Increased from 400 to 500
    
    // Create SVG
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom) // Increased height
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Get file paths
    const preFilePath = `../averages/pre/${phase}/averaged_${dataType}_measurements.csv`;
    const postFilePath = `../averages/post/${phase}/averaged_${dataType}_measurements.csv`;
    
    // Load data
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
  
        // Combined data for scales
        const allData = [...preData, ...postData];
        
        // Set X domain
        let xDomain;
        if (dataType === 'eda') {
            const preMax = d3.max(preData, d => d.time);
            const postMax = d3.max(postData, d => d.time);
            xDomain = [0, Math.min(preMax, postMax)];
        } else {
            xDomain = d3.extent(allData, d => d.time);
        }
        
        // Filter data to match x-axis domain
        preData = preData.filter(d => d.time >= xDomain[0] && d.time <= xDomain[1]);
        postData = postData.filter(d => d.time >= xDomain[0] && d.time <= xDomain[1]);
        
        // Create scales
        const x = d3.scaleLinear()
            .domain(xDomain)
            .range([0, width]);
  
        // Y domain based on data type
        let yDomain = dataType === 'bvp' ? [-150, 150] : 
                     dataType === 'eda' ? [0.2, 1.6] : 
                     d3.extent(allData, d => d.value);
        
        // Filter data to match both x and y domains
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

        // Create tooltip for hover functionality
        const tooltip = d3.select(container)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background-color", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "15px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("font-size", "20px") // Updated to match your CSS
            .style("border", "2px solid #209cee") // Added blue border to match title
            .style("z-index", 100);

        // Add axes
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
        
        // Create gradients
        const gradientPre = svg.append("defs")
            .append("linearGradient")
            .attr("id", `gradient-pre-${phase}-${dataType}`)
            .attr("gradientTransform", "rotate(90)");
        gradientPre.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#ff6b6b");
        gradientPre.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#ff8787");

        const gradientPost = svg.append("defs")
            .append("linearGradient")
            .attr("id", `gradient-post-${phase}-${dataType}`)
            .attr("gradientTransform", "rotate(90)");
        gradientPost.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#4dabf7");
        gradientPost.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#74c0fc");

        // Line generator
        const line = d3.line()
            .defined(d => !isNaN(d.value) && !isNaN(d.time))
            .curve(d3.curveCatmullRom)
            .x(d => x(d.time))
            .y(d => y(d.value));
            
        // Add post line
        const postPath = svg.append("path")
            .datum(postData)
            .attr("fill", "none")
            .attr("stroke", `url(#gradient-post-${phase}-${dataType})`)
            .attr("stroke-width", 2.5)
            .attr("opacity", 0.7)
            .attr("d", line);
            
        // Add pre line
        const prePath = svg.append("path")
            .datum(preData)
            .attr("fill", "none")
            .attr("stroke", `url(#gradient-pre-${phase}-${dataType})`)
            .attr("stroke-width", 2.5)
            .attr("opacity", 0.7)
            .attr("d", line);
            
        // Add hover points for pre data
        const prePoints = svg.selectAll(".pre-point")
            .data(preData)
            .enter()
            .append("circle")
            .attr("class", "pre-point")
            .attr("cx", d => x(d.time))
            .attr("cy", d => y(d.value))
            .attr("r", 0)
            .attr("fill", "#ff6b6b")
            .attr("opacity", 0);
            
        // Add hover points for post data
        const postPoints = svg.selectAll(".post-point")
            .data(postData)
            .enter()
            .append("circle")
            .attr("class", "post-point")
            .attr("cx", d => x(d.time))
            .attr("cy", d => y(d.value))
            .attr("r", 0)
            .attr("fill", "#4dabf7")
            .attr("opacity", 0);
            
        // Add hover area for interactivity
        svg.append("rect")
            .attr('font-family', "'Gill Sans', sans-serif")
            .attr("width", width)
            .attr("height", height)
            .attr("opacity", 0)
            .on("mousemove", function(event) {
                const [mouseX] = d3.pointer(event);
                const x0 = x.invert(mouseX);
                
                // Find closest data points
                const preIndex = d3.bisector(d => d.time).left(preData, x0);
                const postIndex = d3.bisector(d => d.time).left(postData, x0);
                
                const pre = preData[preIndex];
                const post = postData[postIndex];
                
                if (pre && post) {
                    // Show tooltip
                    tooltip.style("opacity", 1)
                        .html(`<strong>Time:</strong> ${x0.toFixed(2)}s<br>` + 
                              `<strong>Pre ${dataType.toUpperCase()}:</strong> ${pre.value.toFixed(3)}<br>` +
                              `<strong>Post ${dataType.toUpperCase()}:</strong> ${post.value.toFixed(3)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                    
                    // Highlight points
                    prePoints.attr("opacity", d => Math.abs(d.time - x0) < 0.1 ? 1 : 0)
                             .attr("r", d => Math.abs(d.time - x0) < 0.1 ? 4 : 0);
                             
                    postPoints.attr("opacity", d => Math.abs(d.time - x0) < 0.1 ? 1 : 0)
                              .attr("r", d => Math.abs(d.time - x0) < 0.1 ? 4 : 0);
                }
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
                prePoints.attr("opacity", 0).attr("r", 0);
                postPoints.attr("opacity", 0).attr("r", 0);
            });
            
        // Add legend
        const legend = svg.append("g")
            .attr("font-family", "'Gill Sans', sans-serif")
            .attr("font-size", "12px")
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(["Pre-Gamified", "Post-Gamified"])
            .enter().append("g")
            .attr("transform", (d, i) => `translate(${width - 100},${i * 25 + 10})`);

        legend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("rx", 2)
            .attr("fill", d => d === "Pre-Gamified" ? "#ff6b6b" : "#4dabf7");

        legend.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(d => d);

        // Add title and labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top/2)
            .attr("text-anchor", "middle")
            .style("font-family", "'Gill Sans', sans-serif")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(`${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase - ${dataType.toUpperCase()} Measurements`);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
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
            .text(dataType.toUpperCase() + (dataType === 'bvp' ? " Value (µV)" : " Value"));
            
    }).catch(function(error) {
        console.error(`Error loading data for ${phase} ${dataType}:`, error);
        container.innerHTML = `<div class="error-message">Error loading data. Please check console for details.</div>`;
    });
}

function setupScrollingBehavior() {
    const sections = document.querySelectorAll('.viz-section');
    const navLinks = document.querySelectorAll('.scroll-indicator a');
    
    // Update active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scrolling for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 50,
                behavior: 'smooth'
            });
            
            // Update active link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initBrainwaveViz() {
    // Set up the dropdown listener
    const waveSelect = document.getElementById('wave-select');
    waveSelect.addEventListener('change', function() {
        updateBrainwaveViz(this.value);
    });
    
    // Initialize with first option (alpha)
    updateBrainwaveViz('alpha');
}

function updateBrainwaveViz(waveType) {
    // Clear previous visualization
    const container = document.getElementById('brainwave-visualization');
    container.innerHTML = '';
    
    console.log(`Updating brain wave visualization for wave type: ${waveType}`);
    
    // Define layout parameters
    const margin = {top: 40, right: 30, bottom: 50, left: 60};
    const vizWidth = container.clientWidth;
    const width = (vizWidth / 2) - margin.left - margin.right - 20; // Add spacing
    const height = 250 - margin.top - margin.bottom; // Smaller height for each chart
    const locations = ['af7', 'af8', 'tp9', 'tp10'];
    const phases = ['pre', 'post'];
    
    // Use fixed maximum time as requested
    const maxTime = 235.960938; 
    
    // Create grid layout 
    const grid = d3.select(container)
        .append('div')
        .style('display', 'grid')
        .style('grid-template-columns', 'repeat(2, 1fr)')
        .style('grid-gap', '20px');
    
    // Title for columns
    const header = grid.append('div')
        .style('grid-column', 'span 2')
        .style('text-align', 'center')
        .style('margin-bottom', '10px');
    
    header.append('div')
        .style('display', 'flex')
        .style('justify-content', 'space-around');
        
    header.select('div')
        .selectAll('.title')
        .data(['Pre-Gamified', 'Post-Gamified'])
        .enter()
        .append('div')
        .attr('class', 'title')
        .style('font-family', "'Gill Sans', sans-serif")
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text(d => d);
    
    // File paths - keep the same paths
    const filePaths = {
        pre_cog: '../brain_waves/pre_cog_mean.csv',
        pre_sur: '../brain_waves/pre_sur_mean.csv',
        post_cog: '../brain_waves/post_cog_mean.csv',
        post_sur: '../brain_waves/post_sur_mean.csv'
    };
    
    // Load all data files
    Promise.all([
        d3.csv(filePaths.pre_cog),
        d3.csv(filePaths.pre_sur),
        d3.csv(filePaths.post_cog),
        d3.csv(filePaths.post_sur)
    ]).then(function([preCogData, preSurData, postCogData, postSurData]) {
        
        // Process the data - just extract values without modifying them
        const processedData = {
            pre_cog: processWaveData(preCogData, waveType, locations),
            pre_sur: processWaveData(preSurData, waveType, locations),
            post_cog: processWaveData(postCogData, waveType, locations),
            post_sur: processWaveData(postSurData, waveType, locations)
        };
        
        // Create a chart for each location
        locations.forEach((location, idx) => {
            phases.forEach((phase, phaseIdx) => {
                // Create chart container
                const chartDiv = grid.append('div')
                    .style('width', '100%')
                    .style('height', '100%');
                
                // Create SVG
                const svg = chartDiv.append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', `translate(${margin.left},${margin.top})`);
                
                // Add title
                svg.append('text')
                    .attr('x', width / 2)
                    .attr('y', -margin.top / 2)
                    .attr('text-anchor', 'middle')
                    .style('font-family', "'Gill Sans', sans-serif")
                    .style('font-size', '14px')
                    .style('font-weight', 'bold')
                    .text(`${location.toUpperCase()}`);

                svg.append('text')
                    .attr('x', width / 2)
                    .attr('y', height + margin.bottom - 10)
                    .attr('text-anchor', 'middle')
                    .style('font-family', "'Gill Sans', sans-serif")
                    .style('font-size', '12px')
                    .text('Time (seconds)');

                // Add y-axis label
                svg.append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -height / 2)
                    .attr('y', -margin.left + 15)
                    .attr('text-anchor', 'middle')
                    .style('font-family', "'Gill Sans', sans-serif")
                    .style('font-size', '12px')
                    .text('Amplitude');
                // Add legend
                const legend = svg.append('g')
                    .attr('class', 'legend')
                    .attr('transform', `translate(${width - 100}, 10)`);

                legend.append('line')
                    .attr('x1', 0)
                    .attr('x2', 20)
                    .attr('y1', 0)
                    .attr('y2', 0)
                    .attr('stroke', '#ff6b6b')
                    .attr('stroke-width', 2.5);

                legend.append('line')
                    .attr('x1', 0)
                    .attr('x2', 20)
                    .attr('y1', 20)
                    .attr('y2', 20)
                    .attr('stroke', '#4dabf7')
                    .attr('stroke-width', 2.5);

                legend.append('text')
                    .attr('x', 25)
                    .attr('y', 4)
                    .style('font-family', "'Gill Sans', sans-serif")
                    .style('font-size', '12px')
                    .text('Cognitive');

                legend.append('text')
                    .attr('x', 25)
                    .attr('y', 24)
                    .style('font-family', "'Gill Sans', sans-serif")
                    .style('font-size', '12px')
                    .text('Survey');
                // Get data for this electrode
                const cogTimeSeries = processedData[`${phase}_cog`][location] || [];
                const surTimeSeries = processedData[`${phase}_sur`][location] || [];
                
                // If either data series is empty, show an error message
                if (cogTimeSeries.length === 0 || surTimeSeries.length === 0) {
                    svg.append('text')
                        .attr('x', width / 2)
                        .attr('y', height / 2)
                        .attr('text-anchor', 'middle')
                        .style('font-family', "'Gill Sans', sans-serif")
                        .style('font-size', '12px')
                        .style('fill', 'red')
                        .text(`No data available for ${location.toUpperCase()}`);
                    return;
                }
                
                // Only filter by time, not by value range
                const filteredCogTimeSeries = cogTimeSeries.filter(d => d.time_sec <= maxTime);
                const filteredSurTimeSeries = surTimeSeries.filter(d => d.time_sec <= maxTime);
                
                // Find combined domain for x and y
                const allTimeSeries = [...filteredCogTimeSeries, ...filteredSurTimeSeries];
                
                // Use fixed time domain
                const xDomain = [0, maxTime];
                
                // Calculate y domain with enough padding and ensure negative values show
                const yValues = allTimeSeries.map(d => d.value);
                const yMax = d3.max(yValues) || 0.1;
                const yMin = d3.min(yValues) || -0.1;
                
                // Make sure we have a bit of padding on both ends
                const padding = Math.max(Math.abs(yMax), Math.abs(yMin)) * 0.15;
                const yDomain = [yMin - padding, yMax + padding];
                
                // Create scales
                const x = d3.scaleLinear()
                    .domain(xDomain)
                    .range([0, width]);
                
                const y = d3.scaleLinear()
                    .domain(yDomain)
                    .range([height, 0]);
                
                // Add axes
                svg.append('g')
                    .attr('transform', `translate(0,${height})`)
                    .call(d3.axisBottom(x))
                    .style('font-family', "'Gill Sans', sans-serif")
                    .style('font-size', '12px');
                    
                svg.append('g')
                    .call(d3.axisLeft(y))
                    .style('font-family', "'Gill Sans', sans-serif")
                    .style('font-size', '12px');
                
                // Add gridlines
                svg.append('g')
                    .attr('class', 'grid')
                    .attr('opacity', 0.1)
                    .call(d3.axisLeft(y)
                        .tickSize(-width)
                        .tickFormat('')
                    );
                
                // Create line generators with smoothing
                const line = d3.line()
                    .defined(d => !isNaN(d.value) && !isNaN(d.time_sec))
                    .x(d => x(d.time_sec))
                    .y(d => y(d.value))
                    .curve(d3.curveMonotoneX);
                
                // Draw cognitive line
                svg.append('path')
                    .datum(filteredCogTimeSeries)
                    .attr('fill', 'none')
                    .attr('stroke', '#ff6b6b')
                    .attr('stroke-width', 2.5)
                    .attr('stroke-opacity', 0.8)
                    .attr('d', line);

                // Draw survey line
                svg.append('path')
                    .datum(filteredSurTimeSeries)
                    .attr('fill', 'none')
                    .attr('stroke', '#4dabf7')
                    .attr('stroke-width', 2.5)
                    .attr('stroke-opacity', 0.8) 
                    .attr('d', line);
                
                addHoverInteraction(
                    svg, 
                    chartDiv, 
                    width, 
                    height, 
                    x, 
                    y, 
                    filteredCogTimeSeries, 
                    filteredSurTimeSeries
                );
                
                // Add zero line if within domain
                if (yDomain[0] <= 0 && yDomain[1] >= 0) {
                    svg.append('line')
                        .attr('x1', 0)
                        .attr('y1', y(0))
                        .attr('x2', width)
                        .attr('y2', y(0))
                        .attr('stroke', '#aaa')
                        .attr('stroke-width', 1)
                        .attr('stroke-dasharray', '4,4');
                }
            });
        });
    }).catch(function(error) {
        console.error('Error loading brain wave data:', error);
        container.innerHTML = `<div class="error-message">Error loading data. Please check console for details.</div>`;
    });
}
// Process data once to improve performance
function processWaveData(data, waveType, locations) {
    const result = {};
    
    // For each location, extract the time series
    locations.forEach(location => {
        result[location] = [];
        
        // Get column name - columns are structured as WaveType_LOCATION (e.g. Alpha_AF7)
        const formattedWaveType = waveType.charAt(0).toUpperCase() + waveType.slice(1);
        const formattedLocation = location.toUpperCase();
        const columnName = `${formattedWaveType}_${formattedLocation}`;
        
        // Check if column exists
        if (data.length > 0 && !(columnName in data[0])) {
            console.error(`Column ${columnName} not found in data!`);
            console.log('Available columns:', Object.keys(data[0]).join(', '));
            return;
        }
        
        // Extract data from the CSV
        data.forEach(row => {
            if (row.time_sec && row[columnName]) {
                // Parse as float and ensure it's not NaN
                const timeVal = parseFloat(row.time_sec);
                const dataVal = parseFloat(row[columnName]);
                
                if (!isNaN(timeVal) && !isNaN(dataVal)) {
                    result[location].push({
                        time_sec: timeVal,
                        value: dataVal
                    });
                }
            }
        });
        
        // Sort by time
        result[location].sort((a, b) => a.time_sec - b.time_sec);
    });
    
    return result;
}
// Add this function after processWaveData
function addHoverInteraction(svg, chartDiv, width, height, x, y, cogTimeSeries, surTimeSeries) {
    // Create tooltip in the chart div
    const tooltip = chartDiv.append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', 1000)
        .style('border', '1px solid rgba(255,255,255,0.2)');

    // Create a group for the hover elements
    const hoverGroup = svg.append('g')
        .attr('class', 'hover-elements');

    // Add hover points to the SVG
    const cogPoint = hoverGroup.append('circle')
        .attr('class', 'cog-point')
        .attr('r', 0)
        .attr('fill', '#ff6b6b');

    const surPoint = hoverGroup.append('circle')
        .attr('class', 'sur-point')
        .attr('r', 0)
        .attr('fill', '#4dabf7');

    // Add vertical line for hover
    const verticalLine = hoverGroup.append('line')
        .attr('class', 'hover-line')
        .attr('y1', 0)
        .attr('y2', height)
        .style('stroke', '#666')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0);

    // Add invisible hover area
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mousemove', function(event) {
            const [mouseX] = d3.pointer(event);
            const x0 = x.invert(mouseX);

            // Find nearest points using binary search
            const cogIndex = d3.bisector(d => d.time_sec).left(cogTimeSeries, x0);
            const surIndex = d3.bisector(d => d.time_sec).left(surTimeSeries, x0);

            const cogData = cogTimeSeries[cogIndex];
            const surData = surTimeSeries[surIndex];

            if (cogData && surData) {
                // Calculate difference between Survey and Cognitive values
                const difference = (surData.value - cogData.value).toFixed(4);
                const differenceColor = difference > 0 ? '#4dabf7' : '#ff6b6b';

                // Show vertical line
                verticalLine
                    .attr('x1', mouseX)
                    .attr('x2', mouseX)
                    .style('opacity', 1);

                // Update points
                cogPoint
                    .attr('cx', x(cogData.time_sec))
                    .attr('cy', y(cogData.value))
                    .attr('r', 4)
                    .style('opacity', 1);

                surPoint
                    .attr('cx', x(surData.time_sec))
                    .attr('cy', y(surData.value))
                    .attr('r', 4)
                    .style('opacity', 1);

                // Update tooltip with difference
                tooltip
                    .style('opacity', 1)
                    .html(`<strong>Time:</strong> ${x0.toFixed(2)}s<br>` +
                          `<strong>Cognitive:</strong> ${cogData.value.toFixed(4)}<br>` +
                          `<strong>Survey:</strong> ${surData.value.toFixed(4)}<br>` +
                          `<strong>Difference:</strong> <span style="color:${differenceColor}">${difference}</span>`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            }
        })
        .on('mouseout', function() {
            // Hide all hover elements
            verticalLine.style('opacity', 0);
            cogPoint.attr('r', 0).style('opacity', 0);
            surPoint.attr('r', 0).style('opacity', 0);
            tooltip.style('opacity', 0);
        });
}

// Add this helper function
function findNearestPoint(data, x0, y0, xScale, yScale) {
    if (!data.length) return { point: null, distance: Infinity };
    
    let nearest = data[0];
    let minDist = Infinity;
    
    data.forEach(d => {
        const dx = xScale(d.time_sec) - xScale(x0);
        const dy = yScale(d.value) - yScale(y0);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
            minDist = dist;
            nearest = d;
        }
    });
    
    return { 
        point: nearest, 
        distance: minDist / Math.sqrt(xScale.range()[1] * xScale.range()[1] + 
                                    yScale.range()[0] * yScale.range()[0]) 
    };
}


function createTimeDistributionPlot() { 
    const container = document.getElementById('time-distribution');
    if (!container) {
        console.error("Container not found");
        return;
    }
    
    container.innerHTML = '';
    
    const margin = {top: 40, right: 120, bottom: 50, left: 100}; 
    const width = Math.max(container.clientWidth - margin.left - margin.right, 400); // Increased minimum width
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#time-distribution')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv('../survey/survey_completion_times.csv')
        .then(data => {
            const processedData = data.map((d, i) => ({
                pre: parseFloat(d.pre),
                post: parseFloat(d.post),
                difference: parseFloat(d.time_difference),
                id: `Participant ${i + 1}`  // Changed to numbered participants
            })).filter(d => !isNaN(d.pre) && !isNaN(d.post) && !isNaN(d.difference));

            // Create scales
            const x = d3.scaleLinear()
                .domain([0, d3.max(processedData, d => Math.max(d.pre, d.post))])
                .range([0, width]);

            const y = d3.scaleBand()
                .domain(processedData.map(d => d.id))
                .range([0, height])
                .padding(0.5);

            // Add axes
            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .style('font-family', "'Gill Sans', sans-serif")
                .style('font-size', '12px');

            svg.append('g')
                .call(d3.axisLeft(y))  // Add y-axis
                .style('font-family', "'Gill Sans', sans-serif")
                .style('font-size', '12px');

            // Add lines between points
            svg.selectAll('.dumbbell-line')
                .data(processedData)
                .enter()
                .append('line')
                .attr('class', 'dumbbell-line')
                .attr('x1', d => x(d.pre))
                .attr('x2', d => x(d.post))
                .attr('y1', d => y(d.id))
                .attr('y2', d => y(d.id))
                .attr('stroke', '#aaa')
                .attr('stroke-width', 1);

            // Add pre points
            svg.selectAll('.pre-point')
                .data(processedData)
                .enter()
                .append('circle')
                .attr('class', 'pre-point')
                .attr('cx', d => x(d.pre))
                .attr('cy', d => y(d.id))
                .attr('r', 5)
                .attr('fill', '#ff6b6b');

            // Add post points
            svg.selectAll('.post-point')
                .data(processedData)
                .enter()
                .append('circle')
                .attr('class', 'post-point')
                .attr('cx', d => x(d.post))
                .attr('cy', d => y(d.id))
                .attr('r', 5)
                .attr('fill', '#4dabf7');

            // Add labels
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height + margin.bottom - 10)
                .attr('text-anchor', 'middle')
                .style('font-family', "'Gill Sans', sans-serif")
                .style('font-size', '14px')
                .text('Completion Time (seconds)');

            // Add title
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', -margin.top / 2)
                .attr('text-anchor', 'middle')
                .style('font-family', "'Gill Sans', sans-serif")
                .style('font-size', '16px')
                .style('font-weight', 'bold')
                .text('Survey Completion Times: Pre vs Post Gamification');

            // Add legend
            const legend = svg.append('g')
                .attr('font-family', "'Gill Sans', sans-serif")
                .attr('font-size', '12px')
                .attr('text-anchor', 'start')
                .selectAll('g')
                .data(['Pre-Gamified', 'Post-Gamified'])
                .enter()
                .append('g')
                .attr('transform', (d, i) => `translate(${width + 10},${i * 20 + 10})`);

            legend.append('circle')
                .attr('r', 5)
                .attr('fill', d => d === 'Pre-Gamified' ? '#ff6b6b' : '#4dabf7');

            legend.append('text')
                .attr('x', 10)
                .attr('y', 4)
                .text(d => d);

            // Add hover interactions
            const tooltip = d3.select('#time-distribution')
                .append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('background', 'rgba(0, 0, 0, 0.8)')
                .style('color', 'white')
                .style('padding', '8px')
                .style('border-radius', '4px')
                .style('font-size', '12px')
                .style('pointer-events', 'none');

            // Add hover interaction for points
            // Update the hover interaction
            svg.selectAll('circle')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('r', 7)
                    .style('stroke', 'white')
                    .style('stroke-width', 2);
                
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                
                const timeType = this.classList.contains('pre-point') ? 'Pre' : 'Post';
                const time = this.classList.contains('pre-point') ? d.pre : d.post;
                const diffColor = d.difference > 0 ? '#4dabf7' : '#ff6b6b';
                
                tooltip.html(`
                    ${timeType}-Gamified<br>
                    Time: ${time.toFixed(2)}s<br>
                    <span style="color:${diffColor}">
                        Difference: ${Math.abs(d.difference).toFixed(2)}s 
                    </span>`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('r', 5)
                    .style('stroke', 'none');
                
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
        })
        .catch(error => {
            console.error('Error creating time distribution plot:', error);
            container.innerHTML = `
                <div class="error-message" style="color: red; padding: 20px;">
                    Error loading survey completion time data: ${error.message}
                </div>`;
        });
}