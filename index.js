import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

d3.csv("https://api.vitaldb.net/cases").then(function(data) {
  console.log(data);
});
