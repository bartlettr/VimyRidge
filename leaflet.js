// https://github.com/teralytics/Leaflet.D3SvgOverlay

var map = L.map("map-canvas", {center: [50.36, 2.79], zoom: 13});
var tiles = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});
tiles.addTo(map);

var countries = [];
var countriesOverlay = L.d3SvgOverlay(function(sel, proj) {
  var upd = sel.selectAll('path').data(countries);
  upd.enter()
    .append('path')
    .attr('d', proj.pathFromGeojson)
    .attr('stroke', getStroke)
    .attr('fill', 'none');

  upd.attr('stroke-width', 2 / proj.scale);
});

function getStroke(data) {
    if (data.properties.ObjectiveL === "Jumping off trench") {
        return 'orange';
    } else if(data.properties.ObjectiveL) {
        return data.properties.ObjectiveL.toLowerCase();
    }
    return 'gray';
}

L.control.layers({"Geo Tiles": tiles}, {"Countries": countriesOverlay}).addTo(map);

d3.json("GeoJSON/contours_wgs84_apr25.geojson", function(data) {
    countries = data.features;
    countriesOverlay.addTo(map)
});
