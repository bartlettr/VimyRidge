// Our D3 code will go here.
// Width and Height of the whole visualization
var width = window.innerWidth,
height = window.innerHeight;

// Create SVG
var svg = d3.select( "#map" )
    .append( "svg" )
    .attr( "width", width )
    .attr( "height", height );

// Append empty placeholder g element to the SVG
// g will contain geometry elements
var g = svg.append( "g" );

// Width and Height of the whole visualization
// Set Projection Parameters
var projection = d3.geo.mercator()
  .scale(300000)
  // Center the map on Vimy Ridge battle area
  .center([2.8, 50.361])
  .translate([width / 2, height / 2]);

// Create GeoPath function that uses built-in D3 functionality to turn
// lat/lon coordinates into screen coordinates
var geoPath = d3.geo.path()
    .projection( projection );

// Classic D3... Select non-existent elements, bind the data, append the elements, and apply attributes
d3.json('GeoJSON/contours_wgs84_apr24.geojson', function(error, mapData) {
  g.selectAll( "path" )
      .data( mapData.features )
      .enter()
      .append( "path" )
      .attr( "fill", "none")
      .attr( "stroke", getStroke)
      .attr( "stroke-width", 2)
      .attr( "d", geoPath )
      .on("click", function(d) {
        d3.select("h2").html(d.properties.Quote + " (Source: <a href='" +  d.properties.TimeSour_1
          + "'target='_blank'>" + d.properties.TimeSource + "</a>)");
        d3.select(this).style("stroke", "cyan");
        d3.select(this).style("stroke-width", 3);
      })
      .on("mouseover", function(d){ //mouseover & mouseout code from http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/
        //if (data.properties.LineCode) {
          d3.select("h2").text(d.properties.BattalionR + " reached " + d.properties.ObjectiveL
            + " line at " + d.properties.TimeArrive);
          d3.select(this).style("stroke", "cyan");
          d3.select(this).style("stroke-width", 3);
        //}
        //else d3.select("h2").text("")
      })
      .on("mouseout", function(d){
        //d3.select("h2").text("");
        d3.select(this).style("stroke", getStroke);
        d3.select(this).style("stroke-width", 2);
      })
});

function getStroke(data) {
  if (data.properties.ObjectiveL === "Jumping off trench") {
      return 'orange';
  } else if(data.properties.ObjectiveL) {
    return data.properties.ObjectiveL.toLowerCase();
  } //code from http://www.d3noob.org/2013/01/select-items-with-if-statement-in-d3js.html
  return 'gray';
}


d3.select("#slider") // (1)
.call(
  chroniton()  // (2)
    .domain([0, 37])  // (3)
    //.labelFormat(d3.time.format('%H:%M')) //Hour and Minute in 24-hour clock
    .width(500)  // 500 pixels wide
);
