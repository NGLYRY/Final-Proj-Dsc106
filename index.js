import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const pre_files = [
    "pre_cleaned/participant_11_pre_combined.csv",
    "pre_cleaned/participant_12_pre_combined.csv",
    "pre_cleaned/participant_13_pre_combined.csv",
    "pre_cleaned/participant_14_pre_combined.csv",
    "pre_cleaned/participant_15_pre_combined.csv",
    "pre_cleaned/participant_16_pre_combined.csv",
    "pre_cleaned/participant_17_pre_combined.csv",
    "pre_cleaned/participant_18_pre_combined.csv",
    "pre_cleaned/participant_22_pre_combined.csv",
    "pre_cleaned/participant_23_pre_combined.csv",
    "pre_cleaned/participant_24_pre_combined.csv",
];

const post_files = [
    "post_cleaned/participant_11_post_combined.csv",
    "post_cleaned/participant_12_post_combined.csv",
    "post_cleaned/participant_13_post_combined.csv",
    "post_cleaned/participant_14_post_combined.csv",
    "post_cleaned/participant_15_post_combined.csv",
    "post_cleaned/participant_16_post_combined.csv",
    "post_cleaned/participant_17_post_combined.csv",
    "post_cleaned/participant_18_post_combined.csv",
    "post_cleaned/participant_22_post_combined.csv",
    "post_cleaned/participant_23_post_combined.csv",
    "post_cleaned/participant_24_post_combined.csv",
];

async function plot_data(file, chartId) {
    // Set dimensions and margins for the charts
    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select(`#${chartId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const variable = "cognitive_empatica_eda";

    // Load the CSV data
    d3.csv(file).then(data => {
        //removes any values that are empty in our csvs
        data = data.filter(d => d.time_stamp.trim() !== "" && d.cognitive_empatica_bvp.trim() !== "");
        // Parse the data
        data.forEach(d => {
            d.time_stamp = +d.time_stamp;
            d.cognitive_empatica_eda = +d.cognitive_empatica_bvp;
            d.date = new Date(d.time_stamp * 1000);
        });
    
    // There aren't any actual NaN values in the data, but just done to be safe
    const validData = data.filter(d => !isNaN(d.time_stamp) && !isNaN(d.cognitive_empatica_eda)); 

    validData.forEach(d => {
        d.second = Math.floor(d.time_stamp);
    });

    const groupedData = d3.group(validData, d => d.second);

    const aggregatedData = Array.from(groupedData, ([sec, value]) => {
        return {
            second: sec,
            survey_mean: d3.mean(value, d => d.cognitive_empatica_eda)
        };
    });

    aggregatedData.sort((a, b) => a.second - b.second);

    const x = d3.scaleLinear()
        .domain(d3.extent(aggregatedData, d => d.second))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([
            d3.min(aggregatedData, d => Math.min(d.survey_mean)),
            d3.max(aggregatedData, d => Math.max(d.survey_mean))
        ])
        .range([height, 0]);

    // Axes
    const xAxis = d3.axisBottom(x).ticks(5);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    // Lines
    const lineSurvey = d3.line()
        .x(d => x(d.second))
        .y(d => y(d.survey_mean));

    svg.append("path")
        .datum(aggregatedData)
        .attr("fill", "none")
        .attr("stroke", "tomato")
        .attr("stroke-width", 1.5)
        .attr("d", lineSurvey);
    console.log(aggregatedData[0]);
    });
}

// Create multiple plots
// post_files.forEach((file, index) => {
//     plot_data(file, `chart${index + 1}`);
// });
const numIterations = 11;
for (let i = 0; i < numIterations; i++) {
    plot_data(pre_files[i], `chart${i}`);
    plot_data(post_files[i], `chart${i}`);
}