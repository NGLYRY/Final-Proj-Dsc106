document.addEventListener('DOMContentLoaded', function() {
    // Initialize a chart for each section
    createSectionChart('baseline');
    createSectionChart('cognitive');
    createSectionChart('survey');
    
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