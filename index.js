import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const when = ["pre", "post"];
const types = [ "cognitive", "survey"];
const measured = ["bvp", "eda", "PPG GREEN", "temp"];
const bvp_files = when.map(w => types.map(t => `./averages/${w}/${t}/averaged_bvp_measurements.csv`)).flat(2);
const participants = ["Participant_11", "Participant_12", "Participant_13", 
        "Participant_14", "Participant_15", "Participant_16", 
        "Participant_17", "Participant_18", "Participant_22", 
        "Participant_23", "Participant_24"];
console.log(bvp_files);

async function checkFileExists(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(`File exists: ${file}`);
    } catch (error) {
        console.error(`File does not exist: ${file}`, error);
    }
}

async function plot_bvps(file) {
    // Check if the file exists before loading it
    await checkFileExists(file);

    // Load the CSV data
    d3.csv(file).then(data => {
        // Parse the data
        data.forEach(d => {
            d.Timestamp = +d.Timestamp;
            participants.forEach(p => {
                d[`${p}`] = +d[`${p}`];
            });
        });

        participants.forEach(participant => {
            // Dimensions & margins for each plot
            const margin = { top: 20, right: 20, bottom: 30, left: 50 },
                  width  = 600 - margin.left - margin.right,
                  height = 200 - margin.top - margin.bottom;
  
            // Create an SVG for this participant
            const svg = d3.select(".plots") // Select the div with class 'plots'
              .append("svg")
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

// Create multiple plots
bvp_files.forEach((file, index) => {
    plot_bvps(file, `chart${index + 1}`);
});