// Store API endpoint as queryUrl2. Selected one week of data because it shows
//  nice distribution of earthquakes data worldwide and does not take too long to load -- 
let queryUr2 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// center the map on the US, however there is usually lots of USA earthquake activity in Alaska --
let centerCoords = [37.09, -95.71];
let mapZoomLevel = 5;

var map = L.map('map').setView(centerCoords, mapZoomLevel);

// create the tile layer -- 
tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// create layer mapping earthquake data, starting with API call --
d3.json(queryUr2).then(jsondata => {
  // all needed data is in 'features' list
  // ref: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
  const earthquakeArray = jsondata.features
  // setup function sizing circles based on magnitude
  // since some JSON values are negative, convert these to zero to avoid math error
  function markerSize(magnitude) {
    if (magnitude > 0) {
      // return Math.sqrt(magnitude) * 20000  ...this matches map displayed in Challenge assignment, see Readme.md
      return (Math.exp(magnitude))*2000;   // use instead, see ref next line
      // https://gis.stackexchange.com/questions/221931/calculate-radius-from-magnitude-of-earthquake-on-leaflet-map
    }
    else {
      magnitude = 0;
      return magnitude
    }  
  };

  // setup function that colors circles based on depth; create 6 different categories --
  function markerColor(depth){ 
    if (depth < 10) {
      return "lightgreen";
    } 
    else if (depth < 30) {
      return "yellow";
    }
    else if (depth < 50) {
      return "orange";
    }
    else if (depth < 70) {
      return "red";
    }
    else if (depth < 90) {
      return "darkred";
    }
    else {
     return "purple";
    } 
  };

  const markerArray = earthquakeArray.map(earthquake => {
    return L.circle([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]],
      {
        color: "black",
        weight : 1,
        fillColor: markerColor(earthquake.geometry.coordinates[2]),
        fillOpacity: 0.5,
        radius: markerSize(earthquake.properties.mag)
      }    
    )
    // Give each feature a popup that describes the earthquake --
      .bindPopup(`<center><b>${earthquake.properties.title}</b>
      <br>${earthquake.geometry.coordinates[1]} latitude, ${earthquake.geometry.coordinates[0]} longitude
      <br>magnitude of ${earthquake.properties.mag}
      <br>depth of ${earthquake.geometry.coordinates[2]} km</center>`)
  });

var earthquakeMarkerLayer = L.layerGroup(markerArray);
earthquakeMarkerLayer.addTo(map)

// Create a baseMaps object --
var basemaps = {
  "OpenStreetMap" : tileLayer
};

// Create an overlay object to hold the overlay -- 
var overlaymaps = {
  "earthquakes" : earthquakeMarkerLayer
};

var layerControl = L.control.layers(basemaps, overlaymaps)
layerControl.addTo(map)

// Setup the legend -- 
// need to add code in style.CSS --
let legend = L.control({ position: "bottomright" });
legend.onAdd = function(map) {
  let div = L.DomUtil.create("div", "info legend");
  let categories = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+']
  let colors = ['lightgreen', 'yellow', 'orange', 'red', 'darkred', 'purple'];

  let labels = [];
  let legendInfo = "<h3>depth (km)</h3>" 

  div.innerHTML = legendInfo;

  categories.forEach(function(category, index) {
    labels.push( "<li style=\"background-color: " + colors[index] + "\">" + "<li>"  + categories[index] + "</div>" + "</li>" )
  });

  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
};

// Adding the legend to the map
legend.addTo(map);

})
