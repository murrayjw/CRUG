let data = [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
    { name: "C", value: 30 },
    { name: "D", value: 40 },
    { name: "E", value: 50 }
  ];

  // SVG dimensions
  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barPadding = 5;
  const barHeight = 20;


  // Create the SVG element
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create the chart container
  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create x and y scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([0, chartWidth]);

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([chartHeight, 0])
    .paddingInner(0.2)
    .paddingOuter(0.1);

  // Create x axes
  const xAxis = d3.axisBottom(xScale);

  // Append x
  chart.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${(5 * (barHeight + barPadding)) + (barHeight / 2)})`)
    .call(xAxis);


  // Function to randomize the bars' width
  const randomizeData = () => {
    data.forEach(d => {
      d.value = Math.floor(Math.random() * 50) + 1;
    });

    data.sort((a, b) => b.value - a.value);

    svg.selectAll(".bar")
      .data(data, d => d.name)
      .transition()
      .duration(1000)
      .attr("width", (d) => xScale(d.value) )
      .attr("y", (d, i) => i * (barHeight + barPadding));

    svg.selectAll(".bar-label")
    .data(data, d => d.name)
      .transition()
      .duration(1000)
      .attr("x", (d) => xScale(d.value) + 5)
      .attr("y", (d, i) => (i * (barHeight + barPadding)) + (barHeight / 2))
      .text((d) => d.name);
  };

  
  // Create initial bars
  const bars = chart.selectAll(".bar")
  .data(data, d => d.name)
  .join("rect")
  .attr("class", "bar")
  .attr("x", 0)
  .attr("y", (d, i) => i * (barHeight + barPadding))
  .attr("width", (d) => xScale(d.value))
  .attr("height", barHeight);

  // Create labels at the end of each bar
  const labels = chart.selectAll(".bar-label")
    .data(data, d => d.name)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", (d) => xScale(d.value) + 5)
    .attr("y", (d, i) => (i * (barHeight + barPadding)) + (barHeight / 2))
    .text((d) => d.name);

// Randomize the bars' width every 4 seconds
setInterval(randomizeData, 4000);