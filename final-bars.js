// !preview r2d3 data=gt::countrypops
//
// r2d3: https://rstudio.github.io/r2d3
//

// set the console logging function properly
console = d3.window(svg.node()).console;


// Filter function for updating the data with each year
function filterYear(data, year) {
  
  return data.filter(function(point) { return point.year === parseInt(year); });
 }
   
   
  
// SVG dimensions and other settings
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;
const barPadding = 5;
const barHeight = 20;
const iteration_speed = 300;


// Create the chart container
const chart = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create x and y scales
const xScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.population)])
  .range([0, chartWidth]);

const yScale = d3.scaleBand()
  .domain(data.map(d => d.country_name))
  .range([0, height])
  .padding(0.1);

// Create x axes
const xAxis = d3.axisBottom(xScale);

// Append x
chart.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${chartHeight })`)
  .call(xAxis);

// appear the year text in the chart
const yearText = chart.append("text")
  .attr("class", "year-text")
  .attr("x", 400)
  .attr("y", 400)
  .attr("text-anchor", "end")
  .attr("alignment-baseline", "middle")
  .style("font-size", "22px");
  

let year = d3.min(data, d => d.year);

// update chart function

function updateChart(data) {
  const bars = chart.selectAll(".bar")
    .data(data, (d) => d.country_name);

  const labels = chart.selectAll(".bar-label")
    .data(data, (d) => d.country_name);

bars.join(
  enter => enter.append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d, i) => (d.order - 1) * (barHeight + barPadding))
    .attr("width", 0)
    .attr("height", barHeight)
    .call(enter => enter.transition()
      .duration(iteration_speed)
      .attr("width", (d) => xScale(d.population))
      .attr("y", (d, i) => (d.order - 1) * (barHeight + barPadding))
    ),
  update => update.attr("class", "bar")
    .call(update => update.transition()
      .duration(iteration_speed)
      .attr("width", (d) => xScale(d.population))
      .attr("y", (d, i) => (d.order - 1) * (barHeight + barPadding))
    ),
  exit => exit.call(exit => exit.transition()
      .duration(iteration_speed)
      .attr("width", 0)
      .attr("y", 5000)
      .remove()
    )
);

  labels.join(
    enter => enter.append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => xScale(d.population) - barPadding + 2)
      .attr("y", (d, i) => (d.order - 1) * (barHeight + barPadding) + barHeight)
      .text((d) => d.country_name)
      .call(enter => enter.transition()
        .duration(iteration_speed)
        .attr("x", (d) => xScale(d.population) - barPadding + 20)
        .attr("y", (d, i) => (d.order - 1) * (barHeight + barPadding) + barHeight)
      ),
    update => update.call(update => update.transition()
      .duration(iteration_speed)
      .attr("x", (d) => xScale(d.population) - barPadding + 20)
      .attr("y", (d, i) => (d.order - 1) * (barHeight + barPadding) + barHeight)
    ),
    exit => exit.call(exit => exit.transition()
      .duration(iteration_speed)
      .attr("x", -barPadding)
      .attr("y", 5000)
      .remove()
    )
  );

  yearText.text(`Year: ${year}`);
}

function updateData(data, year, slice_end = 15) {
  let plot_data = filterYear(data, year);
  plot_data.sort((a, b) => b.population - a.population);
  plot_data.forEach((d, i) => {
    d.order = i + 1; // Assign the order value based on the index (+1 to start from 1)
  });
  return plot_data.slice(0, slice_end);
}
let year_data = updateData(data, 1960)
 updateChart(year_data)


setInterval(() => {
  year += 1;
  if (year > d3.max(data, d => d.year)) {
    year = d3.min(data, d => d.year); // Reset year to initial value
  }
  year_data = updateData(data, year);
//  console.log(year_data)
  updateChart(year_data);
}, iteration_speed);


  