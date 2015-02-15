var margin = {top: 30, right: 50, bottom: 30, left: 40},
    width = 900 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

var events = {};
var formatNumber = d3.format(",.0f");


var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Parse the date / time
var parseDate = d3.time.format("%d-%b-%y").parse;
var bisectDate = d3.bisector(function(d) { return d.date; }).left; 

var parseDateEvents = d3.time.format("%d/%m/%Y").parse; 
 
var svg = d3.select("#chart1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    
var svg2 = d3.select("#chart2").append("svg2")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //*******************************
    var lineSvg = svg.append("g"); 

    var focus = svg2.append("g")                                
    .style("display", "none");  

  svg2.append("text")
      .attr("x", width + 25)
      .attr("y", height - 186)
      .style("font-size","11px")
      .style("text-anchor", "end")
      .text("%");

//read in the events & store in events object
d3.csv("events.csv", function(error1, data1) {
  data1.forEach(function(d) {
    d.date = parseDateEvents(d.date);
  }); 

  events = data1;

//read economic data
d3.csv("data.csv", function(error, data) {
 
  data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.rate = +d.rate;
   });  

 
  var max = d3.max(data, function(d) { return +d.value});
  var min = d3.min(data, function(d) { return +d.value});
  var y0 = Math.max(Math.abs(min), Math.abs(max));

  console.log(min);

  ////set y range for debt barchart
  var y = d3.scale.linear()
    .domain([-y0/1.5, y0/1.5])
    .range([height,0])
    .nice();

  //set x range for debt barchart
  var x = d3.time.scale()
       .range([0, width],.1)
       .domain(d3.extent(data, function(d) { return d.date; }));

  // Set the x range for unemployment rate linechart
  var xl = d3.time.scale()
       .range([0, width],.1)
       .domain(d3.extent(data, function(d) { return d.date; }));
  
  //set y range for unemplyment rate linechart
  var yl = d3.scale.linear().range([height, 0]);  

  // Define the line
  var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return yl(d.rate); });

  // Define the x-axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(15)
    .orient("bottom");
 
  
  // Define the Y-axis for Linechart
    var yAxis = d3.svg.axis()
      .scale(yl)
      .orient("right")
      //.ticks(5)
      .tickValues([5,10,15])
      //.outerTickSize(0)
      //.tickSubdivide(1)
      .tickSize(width);

// Define the Y-axis for Barchart
var yAxis2 = d3.svg.axis()
      .scale(y)
      .orient("right")
      //.ticks(3)
      .tickValues([-10000,5000])
      .tickFormat(formatCurrency)
      //.outerTickSize(0)
      //.tickSubdivide(1)
      .tickSize(width);

svg.append("g")   
    .attr("class", "y axis")
    .call(yAxis2)
    ;
  
 
  svg.selectAll(".bar")
    .data(data)
  .enter().append("rect")
    .attr("class", function(d) { return d.value < 0 ? "bar negative" : "bar positive"; })
    .on("mouseover", function() {
            d3.select(this)
              .attr("fill", "orange");
         })
    .attr("y", function(d) { return y(Math.max(0, d.value)); })

    //.attr("x", function(d, i) { return x(i); })
    .attr("x", function(d) { return x(d.date); })
    .attr("height", function(d) { return Math.abs(y(d.value) - y(0)); })
    .attr("width", width / data.length-1)
    .on('mouseover',function(d){
  
      tempcolor = this.style.fill
  
  d3.select(this)
    .style('fill','orange')
    .style('opacity',.5)
  })
  
  //To reset the color, hence opacity = 1
  .on('mouseout',function(d){
    d3.select(this)
      .style('opacity',1)
      .style('fill',tempcolor)
  });

  



// Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    yl.domain([0, d3.max(data, function(d) { return d.rate; })]);

// Add the Y Axis
 svg2.append("g")   
    .attr("class", "y axis")
    .call(yAxis);

// Add the valueline path.
    svg2.append("path")
        .attr("class", "line2")
        .attr("d", valueline(data));

// Add the X Axis
  svg2.append("g")   
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
 
  

// Add the events along x-axis
  svg2.append("g")   
   .selectAll("circle")
   .data(events)
   .enter()
   .append("circle")
   .attr("transform", "translate(0," + height + ")")
   .attr("class", "dot")
   .attr("r", 3.5)
   .attr("cx", function(d) { return xl(d.date); })
      .attr("cy", 0)
    .style("fill","steelblue")
    .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d.headline)
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      })
    ;

    // append the circle at the intersection               // **********
    focus.append("circle")                                 // **********
        .attr("class", "y")                                // **********
        .style("fill", "none")                             // **********
        .style("stroke", "red")                           // **********
        .attr("r", 4);                                     // **********
    
    // append the rectangle to capture mouse               // **********
    svg2.append("rect")                                     // **********
        .attr("width", width)                              // **********
        .attr("height", height)                            // **********
        .style("fill", "none")                             // **********
        .style("pointer-events", "all")                    // **********
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);                       // **********

    function mousemove() {                                 // **********
        var x0 = xl.invert(d3.mouse(this)[0]),              // **********
            i = bisectDate(data, x0, 1),                   // **********
            d0 = data[i - 1],                              // **********
            d1 = data[i],                                  // **********
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;     // **********

        focus.select("circle.y")                           // **********
            .attr("transform",                             // **********
                  "translate(" + xl(d.date) + "," +         // **********
                                 yl(d.rate) + ")");        // **********
    } 








function formatCurrency(d) {
  var s = formatNumber(d / 1000);
  return d === y.domain()[0]
      ? "$" + s + " billion"
      : s;
}
 });
});


 