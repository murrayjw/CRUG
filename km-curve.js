// !preview r2d3 data=prep_kmd3_data(survfit(Surv(time, status) ~ trt, data = veteran %>% mutate(trt = ifelse(trt == 1, "Standard Tx", "Test Tx")))), css="styles.css", d3_version = "6", dependencies = 'utils.js'
//
// r2d3: https://rstudio.github.io/r2d3
//

// overide r2d3 console for better debugging
console = d3.window(svg.node()).console;

//variables to control the censor dropping speed and line animation speed
let line_animation_speed = 2000;
let censor_drop_speed = 1500;

// set margins to rely on reactive r2d3 height and width
const margin = { top: 0.05*width, right: 0.025*height,
                 bottom: 0.05*height, left: 0.1*width};

const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

const lineWidth = 0.002*plotWidth;
const axisTextSize = 0.03*plotWidth;

// add the height and width to the svg
svg.attr("width", width).attr("height", height);
// create the main inner plot object
   let plotArea = svg.append("g")
     .attr('class', 'graph')
     .attr("transform", 
       `translate(${margin.left}, ${margin.right})`);
// main on render function
r2d3.onRender(function(data, svg, width, height, options) {
   // initiate tooltip selection
   d3.selectAll("div.tooltip").remove();
   plotArea.selectAll('.legend').remove();
   plotArea.selectAll('.legend_labels').remove();
   // add axis labels
   // X-axis
   svg.append("text")             
        .attr("transform",
              "translate(" + (width/2) + " ," + 
                             (plotHeight + margin.top + 15) + ")")
        .style("text-anchor", "middle")
        .attr("font-size", axisTextSize)
        .text("Time in Months");
        
  // Y-axis      
  svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left/8)
        .attr('x', - plotHeight/2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("font-size", axisTextSize)
        .text("Survival");  

  // grouped data     
  var grouped_data = d3.group(data, d => d.group);
  
  var censored_data =data.filter(d => d.n_censor === 1);
  var group_censored_data = d3.group(censored_data, d  => d.group);

  // create axes
  
  // X-axis
  let xAxis = d3.scaleLinear()
    .domain([0, d3.max(data, d=> d.time)])
    .range([0, plotWidth]);

  // Y-axis
  let yAxis = d3.scaleLinear()
    .domain([0,1])
    .range([plotHeight, 0]);

function drawAxis() {
  
  plotArea.selectAll(".axis").remove();
  
  var axis_defX = plotArea.append("g")
  .attr('class', 'axis x')
  .attr("transform", `translate(0, ${plotHeight})`)
  .call(d3.axisBottom(xAxis).ticks(10).tickSizeOuter(0))
  .attr("stroke-width", lineWidth)
  .attr("font-size", axisTextSize);

// Y-axis on the left  
  var axis_defY =plotArea.append("g")
    .attr('class', 'axis y')
    .call(d3.axisLeft(yAxis))
    .attr("stroke-width", lineWidth)
    .attr("font-size", axisTextSize);
}

// create the color scales
let group_names = Array.from(grouped_data.keys());

let color = d3.scaleOrdinal()
  .domain(group_names)
  .range(d3.schemeCategory10);


// function to draw the confidence intervals
function drawConfInt() {

conf_int = plotArea
  .selectAll('.conf-int')
  .data(grouped_data)
  .enter()
  .append("path")
  .attr("fill", d => color(d[0]))
  .attr("stroke", "none")
  .attr("class", "conf-int")
  .attr("d", (d) => confidenceIntervalStart(d[1]))
  .attr("opacity", 0);
  
conf_int
  .transition()
  .duration(3500)
  .ease(d3.easeBounce)
  .attr("d", (d) => confidenceIntervalEnd(d[1]))
  .attr("opacity", 0.3);

}


function addLegend() {
  let size = 20;
   
  let legend = plotArea.selectAll(".legend")
    .data(group_names)
    .enter()
    .append("rect")
      .attr('class', 'legend')
      .attr("x", plotWidth - 10)
      .attr("y", function(d,i){ return 0 + i*(size+5)}) // 
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d){ return color(d)});
      
 let legend_labels = plotArea.selectAll(".legend_labels")
    .data(group_names)
    .enter()
    .append("text")
      .attr('class', 'legend_labels')
      .attr('text-anchor', 'end')
      .attr("x", plotWidth - 20 )
      .attr("y", function(d,i){ return 0 + i*(size+5) + (size/2)}) // 
      .style("fill", function(d){ return color(d)})
      .text(function(d){ return d})
      .style("alignment-baseline", "middle");
      
}



// function to add and animate censored observations
function drawCensor() {
  
  // remove censor objects if they already exist         
  plotArea.selectAll('.censor').remove();
  
  var sym = d3.symbol()
            .type(d3.symbolDiamond).size(10);
             
  plotArea.append('g').attr('class', 'censor');
  
   var censors = plotArea.select('g.censor')
    .selectAll('path.line')
    .data(censored_data)
    .enter()
    .append("path")
    .attr("class", "censor")
    .attr('fill', 'black')
    .attr("transform", d => `translate(${xAxis(d.time)},0)`)
    .attr("d", sym);
    
  censors
  .transition()
  .duration(censor_drop_speed)
  .ease(d3.easeCircle)
  .attr("transform", d => `translate(${xAxis(d.time)}, ${yAxis(d.survival)})`);

}

// Function to draw the km curves 
let kmCurve = d3.line()  
  .x(function(d) {return xAxis(d.time);})
  .y(function(d) {return yAxis(d.survival);})
  .curve(d3.curveStepAfter);

// Functions to draw the confidence confidence intervals

// confidence interval start (on the KM curve)
let confidenceIntervalStart = d3.area()
  .x(function(d) {return xAxis(d.time);})
  .y0(function(d) {return yAxis(d.survival);})
  .y1(function(d) {return yAxis(d.survival);});
// confidence interval end (at the upper and lower conf interval)  
let confidenceIntervalEnd = d3.area()
  .x(function(d) {return xAxis(d.time);})
  .y0(function(d) {return yAxis(d.lower);})
  .y1(function(d) {return yAxis(d.upper);});  
  


// main function to draw the KM curves
function drawKMCurves() {
  // remove previously drawn lines when re-drawing
  plotArea.selectAll(".drawn_km_lines").remove();
  // remove labels e.g. "Daphne" when re-drawing
  plotArea.selectAll(".conf-int").remove();
  
  plotArea.append('g').attr('class', 'drawn_km_lines');
  
  var lines = plotArea.select('g.drawn_km_lines')
    .selectAll('path.line')
    .data(grouped_data)
    .enter()
    .append("path")
    //.attr("clip-path", "url(#clip)")
    .attr("class", "drawn_km_line")
    .attr("fill", "none")
    .attr('stroke', d => {
      return color(d[0]);
      })
    .attr("stroke-width", lineWidth)
    .attr("d", (d) => kmCurve(d[1]));
    
    lines
     .call(lineTransition);
    
 
}



function addToolTip() {


  let Tooltip = d3.select('#htmlwidget_container');

  Tooltip = Tooltip  
  .append('div')
  .attr("class", "tooltip")
  .attr('id', "tooltip")
  .style('position', 'absolute')
  .style('border-radius', '5px')
  .style('padding', '5px')
  .style('display', 'none')
  .style("font-family", "Tahoma, Geneva, sans-serif")
  .style("font-size", '12px');
  
  plotArea.selectAll(".hover-line").remove();
  plotArea.selectAll("rect").remove();
  
  
  var hoverLineGroup = plotArea.append('g')
        .attr('class', 'hover-line');
    
  var hoverLine = hoverLineGroup.append('line')
        .attr('id', 'hover-line')
        .attr('x1', 0).attr('x2', 0)
        .attr('y1', 0).attr('y2', plotHeight)
        .style('stroke-opacity', 0);

  var rect = plotArea.selectAll("rect")
      .data(grouped_data)
      .enter()
      .append('rect')
      .attr('class', 'tip-rectangle')
      .attr('width', plotWidth)
      .attr('height', plotHeight)
      .attr('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousenter', mouseMove)
      .on('mousemove', mouseMove)
      .on('mouseout', mouseOut);
  
 
  function mouseOut() {
     hoverLine.style('stroke-opacity', 0);
     Tooltip.style('display', 'none');
  } 

  function mouseMove(event, d) {
       let mouse = d3.pointer(event),
                   mouseX = mouse[0],
                   mouseY = mouse[1];
      
       let time = xAxis.invert(mouseX);
       
       hoverLine  
        .attr('x1', mouseX)
        .attr('x2', mouseX)
        .style('stroke-opacity', 1)
        .style('stroke-width', 1)
        .style('stroke', 'black');
         
        var html_text = build_hover_html(grouped_data,
                                          color,
                                          time, 
                                          bisectSurvival);  
         Tooltip
          .style('opacity', 1)
          .style('position', 'absolute')
          .style('box-shadow', '5px 5px 5px rgba(0,0,0,0.2)')
          .style("left", (mouseX + 150) + "px")
          .style("top", (mouseY) + "px")
          .style('display', 'block')
          .html(html_text);
          //.html(d[1].survival);
      
  }
}

// function to animate the km curves and then
// add the confidence intervals and tooltips
function lineTransition(path) {
  let line_trans = path.transition()
        .duration(line_animation_speed)
        .attrTween("stroke-dasharray", lineInterpolate)
        .on("end", () => { 
          drawConfInt();
          addToolTip();
          addLegend();
        });
        
  return line_trans;      
} 

function renderGraph() {
  drawAxis();
  drawKMCurves();
  drawCensor();
}

  renderGraph();

});


