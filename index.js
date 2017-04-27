// Our D3 code will go here.
// Width and Height of the whole visualization
var width = window.innerWidth - 100,
height = window.innerHeight - 100;

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

function loadPaths(timeCode) {
  d3.json('GeoJSON/contours_wgs84_apr25.geojson', function(error, mapData) {
    var paths = mapData.features;
    g.selectAll("path").remove();
    g.selectAll("path")
        .data(paths.filter(function(path) {
           return path.properties.TimeCode === timeCode;
         }))
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", getStroke)
        .attr("stroke-width", 2)
        .attr("d", geoPath )
        .on("click", onClick)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut);
  });

  function getStroke(data) {
    if (data.properties.ObjectiveL === "Jumping off trench") {
        return 'orange';
    } else if(data.properties.ObjectiveL) {
      return data.properties.ObjectiveL.toLowerCase();
    } //code from http://www.d3noob.org/2013/01/select-items-with-if-statement-in-d3js.html
    return 'gray';
  }

  function onClick(d) {
    if (d.properties.LineCode) {
      d3.select("h2").html(d.properties.Quote + " (Source: <a href='" +  d.properties.TimeSour_1
        + "'target='_blank'>" + d.properties.TimeSource + "</a>)");
      d3.select(this).style("stroke", "cyan");
      d3.select(this).style("stroke-width", 3);
    }
  }

  function mouseOver(d) { //mouseover & mouseout code from http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/
    d3.select(this).style("stroke", "cyan");
    d3.select(this).style("stroke-width", 3);
    if (d.properties.LineCode) {
      d3.select("h2").text(d.properties.BattalionR + " reached " + d.properties.ObjectiveL
        + " line at " + d.properties.TimeArrive);
    }
    else d3.select("h2").text("Estimated front line at " + d.properties.TimeAMPM)
  }

  function mouseOut(d) {
    //d3.select("h2").text("");
    d3.select(this).style("stroke", getStroke);
    d3.select(this).style("stroke-width", 2);
  }

  // when the input range changes update the value
  d3.select("#timeslide").on("input", function() {
      update(+this.value);
  });



  // update the fill of each SVG of class "incident" with value
  function update(value) {
      document.getElementById("range").innerHTML=timeArray[value];
      inputValue = timeArray[value];
      d3.selectAll(".incident")
          .attr("fill", timeMatch);
  }
}

function findSeconds(nowHour) {
  var zeroHour = new Date('1917-04-09T05:30Z');
  var seconds = (nowHour.getTime() - zeroHour.getTime()) / 1000;
  var minutes = seconds / 60;
  var timeCode = Math.floor(minutes / 15);
  loadPaths(timeCode);
}

d3.select("#slider")
.call(
  chroniton()
    .domain([new Date("1917-04-09T05:30Z"), new Date("1917-04-09T16:00Z")])
    .labelFormat(d3.time.format("%B %dth, %I:%M %p %Z"))
    .width(500)
    .playButton(true)
    .playbackRate(0.5)
    .loop(false)
    .on('change', findSeconds)
);
