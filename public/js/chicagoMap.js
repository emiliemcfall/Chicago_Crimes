(function () {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2lqbmpqazdlMDBsdnRva284cWd3bm11byJ9.V6Hg2oYJwMAxeoR9GEzkAA";

  var map = new mapboxgl.Map({
    container: "mapbox",
    style: "mapbox://styles/mapbox/light-v9", // stylesheet location
    center: [-87.6298, 41.8781], // starting position [lng, lat]
    // center: [-74.0059, 40.7128],
    zoom: 11
  });

  var filterHour = ["==", ["number", ["get", "hour"]], 12];
  var filterSeason = ["!=", ["number", ["get", "season"]], 0];

  map.on("load", function () {
    map.addLayer(
      {
        id: "collisions",
        type: "circle",
        source: {
          type: "geojson",
          data: "/data/thefts2018.geojson" // replace this with the url of your own geojson
        },
        paint: {
          "circle-radius": 4,
          "circle-color": {
            property: "crime",
            type: "categorical",
            stops: [["RETAIL THEFT", "#2DC4B2"], ["OVER $500", "#A2719B"]]
          },
          // 'circle-radius': [
          //   'interpolate',
          //   ['linear'],
          //   ['number', ['get', 'Casualty']],
          //   0, 4,
          //   5, 24
          // ],
          // 'circle-color': [
          //   'interpolate',
          //   ['linear'],
          //   ['number', ['get', 'Casualty']],
          //   0, '#2DC4B2',
          //   1, '#3BB3C3',
          //   2, '#669EC4',
          //   3, '#8B88B6',
          //   4, '#A2719B',
          //   5, '#AA5E79'
          // ],
          "circle-opacity": 0.8
        },
        filter: ["all", filterHour, filterSeason]
      },
      "admin-2-boundaries-dispute"
    );

    // update hour filter when the slider is dragged
    document.getElementById("hours").addEventListener("input", function (e) {
      var hour = parseInt(e.target.value);
      // update the map
      filterHour = ["==", ["number", ["get", "hour"]], hour];
      map.setFilter("collisions", ["all", filterHour, filterSeason]);

      // converting 0-23 hour to AMPM format
      // var ampm = hour >= 12 ? 'PM' : 'AM';
      // var hour12 = hour % 12 ? hour % 12 : 12;

      // update text in the UI
      document.getElementById("active-hour").innerText = hour;
    });

    document.getElementById("filters").addEventListener("change", function (e) {
      var season = e.target.value;
      // update the map filter
      if (season === "all") {
        filterSeason = ["!=", ["number", ["get", "season"]], 0];
      } else if (season === "winter") {
        filterSeason = ["match", ["get", "season"], [1], true, false];
      } else if (season === "spring") {
        filterSeason = ["match", ["get", "season"], [2], true, false];
      } else if (season === "summer") {
        filterSeason = ["match", ["get", "season"], [3], true, false];
      } else if (season === "fall") {
        filterSeason = ["match", ["get", "season"], [4], true, false];
      } else {
        console.log("error");
      }
      map.setFilter("collisions", ["all", filterHour, filterSeason]);
    });
  });
})();