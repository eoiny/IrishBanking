//set up margin, variables,scales, tooltips
var margin = {top: 20, right: 50, bottom: 20, left: 40},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//var events = [];
var formatNumber = d3.format(",.0f");

//the tooltip is actually a circle that follows the linechart path
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Parse the date / time
var parseDate = d3.time.format("%d-%b-%y").parse;
var bisectDate = d3.bisector(function(d) { return d.date; }).left; 
var parseDateEvents = d3.time.format("%d/%m/%Y").parse; 

//define CHART area 
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

/*var svgNews = d3.select("#news").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

 var news =  svgNews.append("g")     
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
*/

//define barCHART area 
var barChart = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//define LineCHART area 
var lineChart= svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + (height/2) + ")");

//define barCHART area 
/*var newsText = svgNews.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
*/
//var lineSvg = svg.append("g"); 



var divBar = d3.select("#chart").select("g")
    .append("text")
    .attr("x", 0)             
    .attr("y", 0 + (margin.top / 2))
    .attr("text-anchor", "left")  
    .attr("class", "info")
    .style("opacity", 0);

 var divLine = d3.select("#chart").select("g")
    .append("text")
    .attr("x", 0)             
    .attr("y", 0 + (height/2))
    .attr("text-anchor", "left")  
    .attr("class", "info")
    .style("opacity", 0);

var newsText = d3.select("#news").select("g")
    .append("text")
    .attr("x", 0)             
    .attr("y", 0 + (margin.top / 2))
    .attr("dy", ".71em")
    .style("font-size","13px")
    //.attr("text-anchor", "left")  
    //.attr("class", "info")
    .style("color", "red")

    .text("eoin");


d3.csv("events.csv", function(error1, data1) {
  
  

//need to load an array of relevant events here i.e. within a given date range
newsText.selectAll("p")
  .data(data1)
.enter()
  .append("p")
  .text(function(d) { return d.date;});

  });

//.text("hello");

//.key(function(d) { return d.date; })
//.sortKeys(d3.ascending)
//.entries(data1);

//

//read economic data
d3.csv("data.csv", function(error, data) {
  data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.rate = +d.rate;
        
   });  
//console.log(events);

  var max = d3.max(data, function(d) { return +d.value});
  var min = d3.min(data, function(d) { return +d.value});
  var y0 = Math.max(Math.abs(min), Math.abs(max));

  var range = d3.extent(data, function(d) { return d.date; });

  

//console.log(events)



 
 // console.log(range);

  //set the common x range for both charts
  var x = d3.time.scale()
       .range([0, width])
       //.domain(d3.extent(data, function(d) { return d.date; }));
       .domain(d3.extent(data, function(d) { return d.date; }));

  var xbar = d3.time.scale()
       .domain(d3.extent(data, function(d) { return d.date; }))
       .range([width/data.length/2, width-width/data.length/2]);

  var focus = lineChart.append("g") 
    .attr("transform", "translate("+(-4)+")")                               
    .style("display", "none");

  //set y range for debt barchart
  var yBar = d3.scale.linear()
    .domain([-y0, y0])
    .range([height/2,0])
    .nice();

  //set y range for unemplyment rate linechart
  var yLine = d3.scale.linear()
    .range([height/2, 0]);  

  // Define the line
  var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return yLine(d.rate); });



  // Define the x-axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(15)
    .orient("bottom");


 
  // Define the Y-axis for Linechart
  var yAxisLine = d3.svg.axis()
      .scale(yLine)
      .orient("right")
      .tickValues([5,10,15])
      .tickSize(width);

  // Define the Y-axis for Barchart
  var yAxisBar = d3.svg.axis()
      .scale(yBar)
      .orient("right")
      .tickValues([-5000,5000])
      .tickFormat(formatCurrency)
      .tickSize(width);

barChart.append("g")   
    .attr("class", "y axis")
    .call(yAxisBar);
  
 
barChart.selectAll("g.bar")
    .data(data)
  .enter().append("rect")
    .attr("class", function(d) { return d.value < 0 ? "bar negative" : "bar positive"; })
    .attr("id", function(d, i){return "bar-" + i;})
    .attr("y", function(d) { return yBar(Math.max(0, d.value)); })
    .attr("height", function(d) { return Math.abs(yBar(d.value) - yBar(0)); })
    .attr("x", function(d) { return xbar(d.date) - (width/data.length)/2;})
    .attr("width", width/data.length -1);

/*//temporary addition of text to check index of bar, matches mouseover/line
barChart.selectAll("g.bar")
    .data(data)
  .enter().append("text")
    .text(function(d,i) {return i;})
    .attr("text-anchor", "right")
    .attr("x", function(d) { return xbar(d.date) - (width/data.length)/2;})
    .attr("y", function(d) { return yBar(Math.max(0, d.value)); })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", "¸black");
*/
    


// Scale the range of the data
    //x.domain(d3.extent(data, function(d) { return d.date; }));
    yLine.domain([0, d3.max(data, function(d) { return d.rate; })]);

// Add the Y Axis
 lineChart.append("g")   
    .attr("class", "y axis")
    .call(yAxisLine);

// append the circle to the line               
    focus.append("circle")                                 
      .attr("class", "y")                                
      .style("fill", "red")                             
      .style("stroke", "red")                           
      .attr("r", 4);  

// Add the valueline path.
  lineChart.append("g")
    .attr("transform", "translate("+(-3)+")")
    .append("path")
    .attr("class", "line2")
    .attr("d", valueline(data));

// Add the X Axis
  svg.append("g")   
    .attr("class", "x axis")
    .attr("transform", "translate(" + margin.left + "," + height + ")")
    //.attr("transform", "translate(" + margin.left + "," + (height/2) + ")");
    .call(xAxis);
 

                                   
    
    // append the rectangle to capture mouse              
    svg.append("rect")                                    
        .attr("width", width)                             
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")                           
        .style("fill", "none")                             
        .style("pointer-events", "all")                    
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { 
          focus.style("display", "none"); 
          divBar.transition()
            .duration(500)
            .style("opacity", 0);
          divLine.transition()
            .duration(500)
            .style("opacity", 0);
            
            //reset class of "selected bar"
        d3.selectAll(".selected")
        .attr("class", function(d) { return d.value < 0 ? "bar negative" : "bar positive"; });
        })
        .on("mousemove", mousemove);    

        //console.log(events[0].date);  



    function mousemove() {                                 
        var x0 = x.invert(d3.mouse(this)[0]),              
            i = bisectDate(data, x0, 1),                   
            d0 = data[i - 1],                              
            d1 = data[i],                                  
            d = x0 - d0.date > d1.date - x0 ? d1 : d0,
            j = x0 - d0.date > d1.date - x0 ? i : i-1;     

        focus.select("circle.y")                           
            .attr("transform",                             
                  "translate(" + x(d.date)+ "," +         
                                 yLine(d.rate) + ")");

        //console.log(x(d.date))
        divLine.transition()
        .duration(200)
        .style("opacity", .9)
        .text(function(){return "Rate: "+ d.rate +"%"});

        divBar.transition()
        .duration(200)
        .style("opacity", .9)
        .text(function(){return "Debt: \u20AC"+ d3.round(d.value/1000,2) +" billion"});

        //reset class of "selected bar"
        d3.selectAll(".selected")
        .attr("class", function(d) { return d.value < 0 ? "bar negative" : "bar positive"; });

        //set current bar class to "selected"
        barChart.select("#bar-" + (j))
        .attr("class", "bar selected");

        //news.append("text")
        //.text("Shauna, I love you, you rock!, you deserve a brit. ");

        //d3.extent(data, function(d) { return d.date; })



      
      /*svgNews.append("g")
          .append("text")
          .attr("x", 5})
          .attr("y", 100)
          .attr("dy", ".35em")
            .text(i);  */

        

      
    } 




function formatCurrency(d) {
  var s = formatNumber(d / 1000);
  return d === yBar.domain()[0]
      ? "$" + s + " billion"
      : s;
}
 });
 //});





 