// document.addEventListener('DOMContentLoaded', function() {
//     // Initialize visualizations for each section with default data type (BVP)
//     initVisualization('baseline', 'bvp');
//     initVisualization('cognitive', 'bvp');
//     initVisualization('survey', 'bvp');
    
//     // Set up data type toggle listeners for each section
//     setupToggleListeners('baseline');
//     setupToggleListeners('cognitive');
//     setupToggleListeners('survey');
    
//     // Set up scroll indicators
//     setupScrollIndicators();
// });

// function initVisualization(phase, dataType) {
//     // This function will create and render the D3 visualization 
//     // for the specified phase and data type
//     console.log(`Initializing ${dataType} visualization for ${phase} phase`);
    
//     // Get the visualization container
//     const container = document.getElementById(`${phase}-visualization`);
    
//     // Clear previous visualizations
//     container.innerHTML = '';
    
//     // Load and render data (placeholder - replace with actual D3 code)
//     fetchData(phase, dataType)
//         .then(data => {
//             renderVisualization(container, data, dataType);
//         })
//         .catch(error => {
//             console.error(`Error loading ${dataType} data for ${phase}:`, error);
//             container.innerHTML = `<p>Error loading visualization</p>`;
//         });
// }

// function fetchData(phase, dataType) {
//     // Fetch data for the specified phase and data type
//     // Replace with actual data fetching logic
//     return new Promise((resolve) => {
//         // Simulate data fetching with a timeout
//         setTimeout(() => {
//             // Sample data structure - replace with actual data
//             const data = {
//                 pre: generateSampleData(50),
//                 post: generateSampleData(50, 0.2)
//             };
//             resolve(data);
//         }, 300);
//     });
// }

// function generateSampleData(count, offset = 0) {
//     // Generate sample data for demonstration
//     return Array.from({ length: count }, (_, i) => ({
//         x: i,
//         y: Math.sin(i * 0.1) + Math.random() * 0.5 + offset
//     }));
// }

// function renderVisualization(container, data, dataType) {
//     // Create a D3 visualization with hover functionality
//     // This is a placeholder - replace with your actual D3 visualization code
    
//     const width = container.clientWidth;
//     const height = container.clientHeight;
//     const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    
//     const svg = d3.select(container)
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height);
    
//     // Create tooltip for hover
//     const tooltip = d3.select(container)
//         .append("div")
//         .attr("class", "tooltip")
//         .style("opacity", 0)
//         .style("position", "absolute")
//         .style("background", "white")
//         .style("padding", "5px")
//         .style("border", "1px solid #999")
//         .style("border-radius", "4px")
//         .style("pointer-events", "none");
    
//     // Set up scales, axes, and lines
//     // Example code - adjust based on your actual data structure
//     const x = d3.scaleLinear()// filepath: c:\Users\works\Desktop\Classes\DSC106\Final-Proj-Dsc106\writeup\scrolling_dashboard.js
// document.addEventListener('DOMContentLoaded', function() {
//     // Initialize visualizations for each section with default data type (BVP)
//     initVisualization('baseline', 'bvp');
//     initVisualization('cognitive', 'bvp');
//     initVisualization('survey', 'bvp');
    
//     // Set up data type toggle listeners for each section
//     setupToggleListeners('baseline');
//     setupToggleListeners('cognitive');
//     setupToggleListeners('survey');
    
//     // Set up scroll indicators
//     setupScrollIndicators();
// });

// function initVisualization(phase, dataType) {
//     // This function will create and render the D3 visualization 
//     // for the specified phase and data type
//     console.log(`Initializing ${dataType} visualization for ${phase} phase`);
    
//     // Get the visualization container
//     const container = document.getElementById(`${phase}-visualization`);
    
//     // Clear previous visualizations
//     container.innerHTML = '';
    
//     // Load and render data (placeholder - replace with actual D3 code)
//     fetchData(phase, dataType)
//         .then(data => {
//             renderVisualization(container, data, dataType);
//         })
//         .catch(error => {
//             console.error(`Error loading ${dataType} data for ${phase}:`, error);
//             container.innerHTML = `<p>Error loading visualization</p>`;
//         });
// }

// function fetchData(phase, dataType) {
//     // Fetch data for the specified phase and data type
//     // Replace with actual data fetching logic
//     return new Promise((resolve) => {
//         // Simulate data fetching with a timeout
//         setTimeout(() => {
//             // Sample data structure - replace with actual data
//             const data = {
//                 pre: generateSampleData(50),
//                 post: generateSampleData(50, 0.2)
//             };
//             resolve(data);
//         }, 300);
//     });
// }

// function generateSampleData(count, offset = 0) {
//     // Generate sample data for demonstration
//     return Array.from({ length: count }, (_, i) => ({
//         x: i,
//         y: Math.sin(i * 0.1) + Math.random() * 0.5 + offset
//     }));
// }

// function renderVisualization(container, data, dataType) {
//     // Create a D3 visualization with hover functionality
//     // This is a placeholder - replace with your actual D3 visualization code
    
//     const width = container.clientWidth;
//     const height = container.clientHeight;
//     const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    
//     const svg = d3.select(container)
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height);
    
//     // Create tooltip for hover
//     const tooltip = d3.select(container)
//         .append("div")
//         .attr("class", "tooltip")
//         .style("opacity", 0)
//         .style("position", "absolute")
//         .style("background", "white")
//         .style("padding", "5px")
//         .style("border", "1px solid #999")
//         .style("border-radius", "4px")
//         .style("pointer-events", "none");
    
