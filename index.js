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

    // Load the CSV data
    d3.csv(file).then(data => {
        // Parse the data
        data.forEach(d => {
            d.time_stamp = +d.time_stamp;
            d.survey_empatica_bvp = +d.survey_empatica_bvp;
        });

        const validData = data.filter(d => !isNaN(d.time_stamp) && !isNaN(d.survey_empatica_bvp));

        validData.forEach(d => {
            d.second = Math.floor(d.time_stamp);
        });

        const groupedData = d3.group(validData, d => d.second);

        const aggregatedData = Array.from(groupedData, ([sec, value]) => {
            return {
                second: sec,
                survey_mean: d3.mean(value, d => d.survey_empatica_bvp)
            };
        });

        aggregatedData.sort((a, b) => d3.ascending(a.second - b.second));

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
    });
}

// Create multiple plots
pre_files.forEach((file, index) => {
    plot_data(file, `chart${index + 1}`);
});