var width = window.innerWidth,
    height = window.innerHeight;

var svg = d3.select( "#map" )
    .append( "svg" )
    .attr( "width", width )
    .attr( "height", height );
var g = svg.append( "g" );

var projection = d3.geo.mercator()
  .scale(400000)
  .center([2.8, 50.361]) // Center the map on Vimy Ridge battle area
  .translate([width / 2, height / 2]);

var geoPath = d3.geo.path()
    .projection(projection);

var paths = [];
d3.json('GeoJSON/contours_wgs84_apr25.geojson', function(error, mapData) {
    paths = mapData.features;
    displayPath(0);
});

function displayPath(timeCode) {
    var pathsAtTimeCode = paths.filter(function(path) {
        return path.properties.TimeCode === timeCode;
    });

    g.selectAll("path").remove();

    g.selectAll("path")
        .data(pathsAtTimeCode)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .attr("fill", "none")
        .attr("stroke", getStroke)
        .attr("stroke-width", 2);

    g.selectAll("path")
        .on("click", onClick)
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut);
}

function getStroke(data) {
    if (data.properties.ObjectiveL === "Jumping off trench") {
        return 'orange';
    } else if(data.properties.ObjectiveL) {
        return data.properties.ObjectiveL.toLowerCase();
    }
    return 'gray';
}

function onClick(data) {
    if (data.properties.LineCode) {
        d3.select("h2").html(data.properties.Quote + " (Source: <a href='" +  data.properties.TimeSour_1
            + "'target='_blank'>" + data.properties.TimeSource + "</a>)");
        d3.select(this).style("stroke", "cyan");
        d3.select(this).style("stroke-width", 3);
    }
}

function mouseOver(d) {
    d3.select(this).style("stroke", "cyan");
    d3.select(this).style("stroke-width", 3);
    if (d.properties.ObjectiveL === "Jumping off trench") {
        d3.select("h2").text(d.properties.BattalionR + " left the " + d.properties.ObjectiveL
        + " at " + d.properties.TimeArrive);
      } else if(d.properties.ObjectiveL) {
          d3.select("h2").text(d.properties.BattalionR + " reached " + d.properties.ObjectiveL
          + " line at " + d.properties.TimeArrive);
      }
      else d3.select("h2").text("Estimated front line at " + d.properties.TimeAMPM);
    }

function mouseOut(d) {
    d3.select(this).style("stroke", getStroke);
    d3.select(this).style("stroke-width", 2);
}

d3.select("#timeslide").on("input", function() {
    update(+this.value);
});

function update(value) {
  document.getElementById("range").innerHTML=timeArray[value];
  inputValue = timeArray[value];
  d3.selectAll(".incident")
    .attr("fill", timeMatch);
}

var startDate = new Date('1917-04-09T05:30Z');
var endDate = new Date("1917-04-09T15:00Z");

function onChronitronChange(chronitronDate) {
    var seconds = (chronitronDate.getTime() - startDate.getTime()) / 1000;
    var minutes = seconds / 60;
    var timeCode = Math.floor(minutes / 15);
    displayPath(timeCode);
}

d3.select("#slider")
    .call(chroniton()
        .domain([startDate, endDate])
        .labelFormat(d3.time.format("%B %dth, %I:%M %p %Z"))
        .width(500)
        .playButton(true)
        .playbackRate(0.5)
        .loop(false)
        .on('change', onChronitronChange));
