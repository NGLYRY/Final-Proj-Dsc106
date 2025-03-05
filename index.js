import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let slideIndex = 0;

const when = ["pre", "post"];
const types = ["cognitive", "survey"];
const measured = ["bvp", "eda", "PPG GREEN", "temp"];
const bvp_files = when.map(w => types.map(t => `./averages/${w}/${t}/averaged_bvp_measurements.csv`)).flat(2);
const participants = ["Participant_11", "Participant_12", "Participant_13", 
        "Participant_14", "Participant_15", "Participant_16", 
        "Participant_17", "Participant_18", "Participant_22", 
        "Participant_23", "Participant_24"];
console.log(bvp_files);

function showSlides(n) {
  const slides = document.getElementsByClassName("slide");
  
  // Handle wrapping around
  if (n >= slides.length) slideIndex = 0;
  if (n < 0) slideIndex = slides.length - 1;
  
  // Hide all slides
  for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  
  // Show the current slide
  if (slides.length > 0) {
      slides[slideIndex].style.display = "block";
  }
}


// Modify the plotting code to use async/await properly
async function loadAllPlots() {
  // Clear existing slides
  d3.select(".slideshow-container").html("");
  
  // Wait for each file to be processed sequentially
  for (let file of bvp_files) {
      await plot_bvps(file);
  }
  // Only initialize the slideshow after all plots are loaded
  showSlides(slideIndex);
}

// Modify plot_bvps to return a promise
async function plot_bvps(file) {
  return d3.csv(file).then(data => {
        // Parse the data
        data.forEach(d => {
            d.Timestamp = +d.Timestamp;
            participants.forEach(p => {
                d[`${p}`] = +d[`${p}`];
            });
        });

        participants.forEach((participant, index) => {
            // Dimensions & margins for each plot
            const margin = { top: 20, right: 20, bottom: 30, left: 50 },
                  width  = 600 - margin.left - margin.right,
                  height = 200 - margin.top - margin.bottom;

            // Create a slide for this participant
            const slide = d3.select(".slideshow-container")
              .append("div")
                .attr("class", "slide")
                .style("display", index === 0 ? "block" : "none");

            // Create an SVG for this participant
            const svg = slide.append("svg")
                .attr("width",  width  + margin.left + margin.right)
                .attr("height", height + margin.top  + margin.bottom)
              .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // X scale (Timestamp)
            const x = d3.scaleLinear()
              .domain(d3.extent(data, d => d.Timestamp))
              .range([0, width]);

            // Y scale (Participant’s BVP)
            const y = d3.scaleLinear()
              .domain(d3.extent(data, d => d[participant]))
              .range([height, 0]);

            // Define the line generator
            const line = d3.line()
              .defined(d => !isNaN(d[participant])) // Only include defined data points
              .x(d => x(d.Timestamp))
              .y(d => y(d[participant]));

            // Add X axis
            svg.append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(x));

            // Add Y axis
            svg.append("g")
              .call(d3.axisLeft(y));

            // Draw the line path
            svg.append("path")
              .datum(data)
              .attr("fill", "none")
              .attr("stroke", "steelblue")
              .attr("stroke-width", 1.5)
              .attr("d", line);

            // Add a title (the participant’s label)
            svg.append("text")
              .attr("x", width / 2)
              .attr("y", -5)
              .attr("text-anchor", "middle")
              .style("font-weight", "bold")
              .text(participant);
        });
    });
}

// Create multiple plots and initialize slideshow
loadAllPlots().then(() => {
  showSlides(slideIndex);
});

// Make plusSlides function globally available
window.plusSlides = function(n) {
  showSlides(slideIndex += n);
}