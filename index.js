import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const data = d3.csv("https://api.vitaldb.net/cases").then(function(data) {
    console.log(data);
    const columns = data.columns;
    const rows = data.map(row => Object.values(row));

    console.log("Columns:", columns);
    console.log("Rows:", rows);
});

