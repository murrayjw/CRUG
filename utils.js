
// bisector function for tooltip
const bisectSurvival = d3.bisector((d) => d.time).left;

// function to interpolate km curves
// the function uses the interpolation trick to animate the lines
function lineInterpolate() {
  console.log(this);
  let l = this.getTotalLength(),
      i = d3.interpolateString("0," + l, l + "," + l);
  return function(t) { return i(t) };
}

// Function to build the html that appears on hover
// data: the grouped data object
// color: the color scale object
// time: the time obtained from mouseover
// bisect_fun: the bisector function 
function build_hover_html(data, color, time, bisect_fun) {
  
      let html_text = [`<p text-align: center> Time (in months):
          ${time.toFixed(2)}`];
          
       let df, surv, n_risk;
         
          for( const key of data.keys()) {
           df = data.get(key);
           idx = bisect_fun(df, time);
          
           if(df[idx] === undefined) {
             surv = 0;
             n_risk = 0;
           } else {
             surv = df[idx].survival;
             n_risk = df[idx].n_risk;
           }
            
          html_text.push(`<p style = color:${color(key)}> 
                             group: ${key},
                             Surival: ${surv.toFixed(2)},
                             At Risk: ${n_risk}<\p>`);       
        } 
         return html_text.join("");
} 
