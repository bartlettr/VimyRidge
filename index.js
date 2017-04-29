var map =  L.map('map', {zoomControl: false, center: [50.36, 2.79], zoom: 13});
L.control.zoom({position: 'bottomleft'}).addTo(map);

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
        '&copy; <a href="https://carto.com/attribution">CARTO</a>'
}).addTo(map);

var paths = [];
var currentTimeCode = 0;

var overlay = L.d3SvgOverlay(function(sel, proj) {
	var pathsAtTimeCode = paths.filter(function(path) {
        return path.properties.TimeCode === currentTimeCode;
    });

	var upd = sel.selectAll('path')
		.data(pathsAtTimeCode)
		.enter()
	    .append('path')
	    .attr('d', proj.pathFromGeojson)
	    .attr('stroke', getStroke)
	    .attr('fill', 'none');

    upd.attr('stroke-width', 3 / proj.scale);
	upd.on("click", onClick);
});

function getStroke(data) {
    if (data.properties.ObjectiveL === "Jumping off trench") {
        return 'orange';
    } else if(data.properties.ObjectiveL) {
        return data.properties.ObjectiveL.toLowerCase();
    }
    return 'gray';
}

d3.json("GeoJSON/contours_wgs84_apr25.geojson", function(data) {
    paths = data.features;
	map.removeLayer(overlay)
	overlay.addTo(map);
});

function onClick(data) {
	d3.selectAll('path').attr('stroke', getStroke);
    d3.select(this).style("stroke", "cyan");

    if (data.properties.LineCode) {
      d3.select("#info-description").text(data.properties.BattalionR + " reached " + data.properties.ObjectiveL
        + " line at " + data.properties.TimeArrive);

		d3.select("#info-source").html(data.properties.Quote + " (Source: <a href='" +  data.properties.TimeSour_1
            + "'target='_blank'>" + data.properties.TimeSource + "</a>)");
    } else {
        d3.select("#info-description").text("Estimated front line at " + data.properties.TimeAMPM);
		d3.select("#info-source").html('');
    }
}

var startDate = new Date('1917-04-09T05:30Z');
var endDate = new Date("1917-04-09T15:00Z");

function onChronitronChange(chronitronDate) {
    var seconds = (chronitronDate.getTime() - startDate.getTime()) / 1000;
    var minutes = seconds / 60;
    currentTimeCode = Math.floor(minutes / 15);

	map.removeLayer(overlay)
	overlay.addTo(map);
}

d3.select("#slider")
    .call(chroniton()
        .domain([startDate, endDate])
        .labelFormat(d3.time.format("%B %dth, %I:%M %p %Z"))
        .width(460)
        .playButton(true)
        .playbackRate(0.5)
        .loop(false)
        .on('change', onChronitronChange));
