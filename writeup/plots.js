import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Create separate slide indices for each measurement type
let slideIndices = {
    'bvp': 0,
    'eda': 0,
    'temp': 0,
    'ppg': 0
};

const when = ["pre", "post"];
const types = ["cognitive", "survey"];
const measured = ["bvp", "eda", "temp", "PPG GREEN"];
const participants = ["Participant_11", "Participant_12", "Participant_13", 
        "Participant_14", "Participant_15", "Participant_16", 
        "Participant_17", "Participant_18", "Participant_22", 
        "Participant_23", "Participant_24"];

// Generate file paths for each measurement type
const generateFiles = (measureType) => {
    return when.map(w => types.map(t => `../averages/${w}/${t}/averaged_${measureType}_measurements.csv`)).flat(2);
};

// Create file lists for each measurement
const filesByType = {
    'bvp': generateFiles('bvp'),
    'eda': generateFiles('eda'),
    'temp': generateFiles('temp'),
    'ppg': generateFiles('PPG GREEN')
};

function showSlides(n, containerId) {
    const type = containerId.split('-')[0]; // Extract type from containerId (e.g., 'bvp' from 'bvp-slideshow')
    const slides = document.querySelector(`#${containerId}`).getElementsByClassName("slide");
    
    // Handle wrapping around
    if (n >= slides.length) slideIndices[type] = 0;
    if (n < 0) slideIndices[type] = slides.length - 1;
    
    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    // Show the current slide
    if (slides.length > 0) {
        slides[slideIndices[type]].style.display = "block";
    }
}

async function loadAllPlots() {
    // Load plots for each measurement type
    for (const [type, files] of Object.entries(filesByType)) {
        const containerId = `${type}-slideshow`;
        // Clear existing slides
        d3.select(`#${containerId}`).html("");
        
        // Wait for each file to be processed sequentially
        for (let file of files) {
            await plotData(file, type, containerId);
        }
        // Initialize the slideshow for this type
        showSlides(0, containerId);
    }
}

async function plotData(file, type, containerId) {
    return d3.csv(file).then(data => {
        // Parse the data
        data.forEach(d => {
            d.Timestamp = +d.Timestamp;
            participants.forEach(p => {
                d[`${p}`] = +d[`${p}`];
            });
        });

        participants.forEach((participant, index) => {
            const margin = { top: 20, right: 20, bottom: 30, left: 50 },
                  width = 600 - margin.left - margin.right,
                  height = 200 - margin.top - margin.bottom;

            // Create a slide for this participant
            const slide = d3.select(`#${containerId}`)
              .append("div")
                .attr("class", "slide")
                .style("display", index === 0 ? "block" : "none");

            // Create SVG and rest of visualization code...
            const svg = slide.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Rest of your visualization code remains the same...
            const x = d3.scaleLinear()
              .domain(d3.extent(data, d => d.Timestamp))
              .range([0, width]);

            const y = d3.scaleLinear()
              .domain(d3.extent(data, d => d[participant]))
              .range([height, 0]);

            const line = d3.line()
              .defined(d => !isNaN(d[participant]))
              .x(d => x(d.Timestamp))
              .y(d => y(d[participant]));

            svg.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x));

            svg.append("g")
              .call(d3.axisLeft(y));

            svg.append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "steelblue")
              .attr("stroke-width", 1.5)
              .attr("d", line);

            svg.append("text")
              .attr("x", width / 2)
              .attr("y", -5)
              .attr("text-anchor", "middle")
              .style("font-weight", "bold")
              .text(participant);
        });
    });
}

// Initialize all slideshows
loadAllPlots();

// Make plusSlides function globally available
window.plusSlides = function(n, containerId) {
    const type = containerId.split('-')[0];
    slideIndices[type] += n;
    showSlides(slideIndices[type], containerId);
}