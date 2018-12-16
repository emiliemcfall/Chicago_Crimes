// Default public access token
// Default public access token
mapboxgl.accessToken =
"pk.eyJ1IjoiZW1pbGllbWNmYWxsIiwiYSI6ImNqcDlwMDhiZDA5angzcHFqeTM1MDc5ZTkifQ.2CHynRh3rtgVuaxsa6_O8w";

// Initiate map
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/dark-v9", // stylesheet location
  center: [-87.6298, 41.8781], // starting position [lng, lat]
  zoom: 10 // starting zoom
});

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

// Zooming threshold
//var zoomThreshold = 100;

// When map has loaded
map.on('load', function () {

  // Median income
  map.addSource('police-borders', {
    'type': 'geojson',
    'data': './data/police-borders.geojson'
  });
  map.addLayer({
    'id': 'income',
    'type': 'fill',
    'source': 'police-borders',
    'paint': {
      'fill-color': {
        //'type': ,
        'property': 'income',
        stops: [
          [12558.66667, '#cc3300'],
          [50000, '#ffeb99'],
          [80110, '#0080ff'],
        ],
      },
      'fill-opacity': 0.5,
      'fill-outline-color': '#888'//'rgba(200, 100, 240, 10)',
    }
  });
  map.addLayer({
    'id': 'income-lines',
    'type': 'line',
    'source': 'police-borders',
    "layout": {
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "#888",
      "line-width": 2
    }
  });

  // Police stations
  map.addSource("police-stations", {
    "type": "geojson",
    "data": "./data/police-stations.geojson"
  });

  map.addLayer({
    "id": "police-stations",
    "type": "symbol",
    "source": "police-stations",
    'layout': {
      'icon-image': 'police-15',
      'icon-size': 1.25,
      'icon-allow-overlap': true,
    }
  });

  // When a click event occurs on a feature in the police stations layer, open a
  // popup at the location of the click, with description HTML from its properties.
  map.on('click', 'police-stations', function (e) {
    new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(e.features[0].properties.District)
    .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the states layer.
  map.on('mouseenter', 'police-stations', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'police-stations', function () {
    map.getCanvas().style.cursor = '';
  });

});

// Income legend
// var incomeLegendEl = document.getElementById('income-legend');
// map.on('zoom', function() {
//     if (map.getZoom() > zoomThreshold) {
//         incomeLegendEl.style.display = 'none';
//     } else {
//         incomeLegendEl.style.display = 'block';
//     }
// });

// Filter
var toggleableLayerIds = [ 'police-stations', 'income' ];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = 'active';
  link.textContent = id;

  link.onclick = function (e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

    if (visibility === 'visible') {
      map.setLayoutProperty(clickedLayer, 'visibility', 'none');
      this.className = '';
    } else {
      this.className = 'active';
      map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
    }
  };

  var layers = document.getElementById('menu');
  layers.appendChild(link);
}
