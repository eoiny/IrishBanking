//setup margin
var margin = {top: 20, right: 50, bottom: 20, left: 20},
    width = 900 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%d/%m/%Y").parse; 
    bisectDate = d3.bisector(function(d) { return d.date; }).left;

// Set the ranges
var x = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]);

// Define the x-axis & x-axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

/*var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);*/

// Define the Y-axis for Linechart
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickPadding(8)
    .tickValues([5,10])
    .tickSize(-width);

//Define the line
var valueline = d3.svg.line()
    .interpolate("monotone")  
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.rate); });

//define SVG canvas 
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var lineSvg = svg.append("g");                    

var focus = svg.append("g")                          
    .style("display", "none"); 

//tooltip
var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

//read in data
d3.csv("banks.csv", function(error, data) {
  data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.rate = +d.bondRate;
        
   });  

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.rate; })]);

   // Add the valueline path.
   lineSvg.append("path")                                
        .attr("class", "line")
        .attr("d", valueline(data));

   // Add the X-axis & Y-axis
  svg.append("g")   
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
 
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);


   //append the circle at the intersection               
    focus.append("circle")                                 
        .attr("class", "y")                               
        .style("fill", "red")                             
        .style("stroke", "blue")                           
        .attr("r", 4);                                     
    
    //append the rectangle to capture mouse              
    svg.append("rect")                                     
        .attr("width", width)                              
        .attr("height", height)                            
        .style("fill", "none")                             
        .style("pointer-events", "all")                    
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);                      

function mousemove() {                                 
        var x0 = x.invert(d3.mouse(this)[0]),              
            i = bisectDate(data, x0, 1),                   
            d0 = data[i - 1],                              
            d1 = data[i],                                  
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;     

        focus.select("circle.y")                           
            .attr("transform",                             
                  "translate(" + x(d.date) + "," +         
                                 y(d.rate) + ")");  

        div.transition()        
                .duration(200)      
                .style("opacity", .9); 

        div .html(formatTime(d.date) + "<br/>"  + d.rate)  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");                                  
    }

 function mouseout(){
 	focus.style("display", null);

 	div.transition()
      .duration(500)
      .style("opacity", 1e-6);

 }
                                                     

});

