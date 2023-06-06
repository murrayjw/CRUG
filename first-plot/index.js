// Select the container element
const container = d3.select("#chart");

// Create the SVG element
console.log(d3)
const svg = container.append("svg")
  .attr("width", 500)
  .attr("height", 300);

// Define the data
const data = [10, 20, 30, 40, 50];

// Bind data to circles
const circles = svg.selectAll("circle")
  .data(data);

// Enter selection: Create circles for each data point
circles.join("circle")
  .attr("cx", (d, i) => d + i * 100)
  .attr("cy", 150)
  .attr("r", (d) => d)
  .attr("fill", "red")
  .attr("stroke", "black");

  svg.append("text")
	.text("Plot title")
	.attr("x", (data[0] + data[data.length-1] + data.length*100)/2 )
	.attr("y", 20)
    .attr('text-anchor', 'end');

