//setup margin
var margin = {top: 20, right: 50, bottom: 20, left: 20},
    width = 900 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%d/%m/%Y").parse; 
    bisectDate = d3.bisector(function(d) { return d.date; }).left;
    parseDateEvents = d3.time.format("%d/%m/%Y").parse; 
    compareDate = d3.time.format("%Y-%m");

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

var tooltip = d3.select("#tooltip")
    .style("opacity", 0);


var lineSvg = svg.append("g");                    

var focus = svg.append("g")                          
    .style("display", "none"); 

//tooltip
/*var div = d3.select("chart").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);*/
d3.csv("news.csv", function(error, events) {
    events.forEach(function(d) {
        d.date = parseDateEvents(d.date);
   });  

/*var events = d3.nest()
  .key(function(d){ return d3.time.month(parseDateEvents(d.date)); })
  .entries(events);*/

  //var test = d3.values(events[3])
  //var test = d3.values(events)
//console.log(test[0].key);

/*events = d3.entries(events);
console.log(events);

*/
//calculate the qtr + year for each date and map to a events object
events = events.map(function(g){
  return {
    //quarter: (Math.floor(new Date((g.date).getMonth()+1)/3+1)),
    quarter: "Q"+Math.floor((g.date.getMonth() +3) / 3)+"-"+(g.date).getFullYear(),
    headline: g.news,
    stamp: g.stamp
  };
});
//rollup events per qtr
events = d3.nest()
.key(function(d) { return d.quarter; })
.entries(events);

console.log(events);

 

  //console.log(d.eventDate);  
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

         //calculate what quarter d.date is in   
         //var selQuarter = Math.floor(((d.date).getMonth()+1)/3+1);
         var selQuarter = "Q"+Math.floor((d.date.getMonth() +3) / 3)+"-"+(d.date).getFullYear();

         //console.log(selQuarter)

       /*  var filteredNews = events.filter(function (el) {
          return el.key = selQuarter;
         });*/

         var filteredNews = events.filter(function(obj) {
          //return (obj.key == "Q1-2009");
          //console.log(selQuarter)
          return (obj.key == selQuarter);
        });

         console.log(filteredNews) 
         //quarter: "Q1-2007"



        
         //console.log(selQuarter)  
        /* events.filter(function(d) {
            return (d.key === selQuarter)
            });*/

         //console.log(events) 



        focus.select("circle.y")                           
            .attr("transform",                             
                  "translate(" + x(d.date) + "," +         
                                 y(d.rate) + ")");  

        tooltip.transition()        
                .duration(200)      
                .style("opacity", .9); 
        
        tooltip.style("left", "55px")
               .style("top", "55px");



        tooltip.select(".news").html("Date: " +d.date + "<br/> unemp rate: "  + d.rate);  
        tooltip.select(".events").html("Headline:"+filteredNews.key);  
               // .style("left", (d3.event.pageX) + "px")     
               // .style("top", (d3.event.pageY - 28) + "px");                                  
    }

 function mouseout(){
 	focus.style("display", null);

 	tooltip.transition()
      .duration(500)
      .style("opacity", 1e-6);

 }

 

                                                     

})
});


