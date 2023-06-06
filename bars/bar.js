const data = [
    { name: "A", value: 50 },
    { name: "B", value: 100 },
    { name: "C", value: 150 },
    { name: "D", value: 200 },
    { name: "E", value: 250 }
  ];

  // SVG dimensions
  const width = 600;
  const height = 400;

  const margin = { top: 50, right: 20, bottom: 40, left: 100 };
  const barHeight = 20;
  const barPadding = 5;
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Create the SVG element
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

 const chart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

 const xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([0, chartWidth]);


  // Create initial bars
  const bars = chart.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d, i) => i * (barHeight + barPadding))
    .attr("width", (d) => xScale(d.value) )
    .attr("height", barHeight);

  // Create labels at the end of each bar
  const labels = chart.selectAll(".bar-label")
    .data(data, d => d.name)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", (d) => xScale(d.value)+ 10)
    .attr("y", (d, i) => (i * (barHeight + barPadding)) + (barHeight / 2))
    .text((d) => d.name);

 