var margin = {top: 30, right: 10, bottom: 30, left: 40},
    width = 700 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;


//var data = [];
 
// Parse the date / time
var parseDate = d3.time.format("%d-%b-%y").parse;
 
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

var tempcolor;





d3.csv("data.csv", function(error, data) {

  data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.close = +d.rate;
    });  
 
  var max = d3.max(data, function(d) { return +d.value});
  var min = d3.min(data, function(d) { return +d.value});
  var y0 = Math.max(Math.abs(min), Math.abs(max));

  var y = d3.scale.linear()
    .domain([-y0, y0])
    .range([height,0])
    .nice();

  
  var x = d3.scale.ordinal()
    .domain(d3.range(data.length))
    .rangeRoundBands([0, width], .1);
  
  //var x = d3.time.scale().range([0, width],.1)
     // x.domain(d3.extent(data, function(d) { return d.date; }));
  //var x = d3.time.scale().range([0, width]);

   // Set the ranges
  var xl = d3.time.scale()
  .domain(d3.range(data.length))
  .range([0, width],.1);

  var yl = d3.scale.linear().range([height, 0]).nice();   

  // Define the line
  var valueline = d3.svg.line()
    .x(function(d) { return xl(d.date); })
    .y(function(d) { return yl(d.rate); });

  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(0)
    .orient("top");
 
  var yAxis = d3.svg.axis()
    .scale(y)
     .ticks(0)
    .orient("left");

  svg.append("line")   
    .style("stroke", "lightgrey")  
    .style("stroke-width", .7) 
    .attr("x1", 20)     
    .attr("y1", y(max))      
    .attr("x2", width-20)     
    .attr("y2", y(max));

svg.append("text") 
    .attr("transform", "translate(" + (width-18) + "," + y(max) + ")")
    //.attr("dy", ".4em")
    .attr("text-anchor", "start")
    .style("fill", "lightgrey")
    .style("font-size","10px")
    .text("4k");


svg.append("line")   
    .style("stroke", "lightgrey") 
    .style("stroke-width", .7) 
    .attr("x1", 20)     
    .attr("y1", y(-1*max))      
    .attr("x2", width-20)     
    .attr("y2", y(-1*max));  

svg.append("text") 
    .attr("transform", "translate(" + (width-18) + "," + y(-1*max) + ")")
    //.attr("dy", ".4em")
    .attr("text-anchor", "start")
    .style("fill", "lightgrey")
    .style("font-size","10px")
    .text("4k");  


 
  svg.selectAll(".bar")
    .data(data)
  .enter().append("rect")
    .attr("class", function(d) { return d.value < 0 ? "bar negative" : "bar positive"; })
    .on("mouseover", function() {
            d3.select(this)
              .attr("fill", "orange");
         })
    .attr("y", function(d) { return y(Math.max(0, d.value)); })
    .attr("x", function(d, i) { return x(i); })
    .attr("height", function(d) { return Math.abs(y(d.value) - y(0)); })
    .attr("width", x.rangeBand())
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

svg.append("g")            // Add the X Axis
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        //.call(xAxis)
        ;

/*svg.append("g")         
        .attr("class", "line")
        .attr("x1", 5)
        .attr("y1", 0)
        .attr("x2", 50)
        .attr("y2", 0)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
       .attr("transform", "translate(0," + height + ")");*/


// Scale the range of the data
    xl.domain(d3.extent(data, function(d) { return d.date; }));
    yl.domain([0, d3.max(data, function(d) { return d.rate; })]);

// Add the valueline path.
    svg2.append("path")
        .attr("class", "line2")
        .attr("d", valueline(data));




});


 