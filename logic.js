// Student: Rafael Santos
// Homework 17
// Data Analytics and Visualization - Cohort 3

// Store the API endpoint inside queryUrl
// last 30 days
var queryEarthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var queryBoundariesUrl = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json";


// using JS library from https://github.com/google/palette.js defined in separate JS file.
var ColorPalette = palette('tol-sq',10);
console.log(ColorPalette) //checking the list
console.log(ColorPalette[(9)]) //checking syntax to read data in the array

// Allocate one color for each range of earthquake magnitude
function getColor(d) {
  return d < 1 ?  "#" + ColorPalette[(1)]: 
        d < 2  ? "#" + ColorPalette[(2)]:
        d < 3  ?  "#" + ColorPalette[(3)]:
        d < 4  ? "#" + ColorPalette[(4)]:
        d < 5  ? "#" + ColorPalette[(5)]:
        d < 6  ? "#" + ColorPalette[(6)]:
        d < 7  ? "#" + ColorPalette[(7)]:
        d < 8  ? "#" + ColorPalette[(8)]:
        d < 9  ? "#" + ColorPalette[(9)]:
                 "#" + ColorPalette[(9)];
}



var BorderLine = {
  "color": "darkblue",
  "weight": 4,
  "opacity": 0.5
};

var TectonicPlaqueLayer = new L.LayerGroup();

var xhr = new XMLHttpRequest();
xhr.open("GET", queryBoundariesUrl, true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    // innerText does not let the attacker inject HTML elements.
    document.getElementById("resp").innerText = xhr.responseText;
  }
}
xhr.send();


d3.json(queryBoundariesUrl, function(data) {
  
    L.geoJSON(createFeatures.features, {
          style: BorderLine
  
      }).addTo(TectonicPlaqueLayer);
});



// Perform a GET request to the query URL
d3.json(queryEarthquakeUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});



// function to run once for each feature in the features array
function createFeatures(earthquakeJsonData) { 

  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" 
                    + new Date(feature.properties.time) + "</p>"
                    + "</h3><p>Magnitude: " + feature.properties.mag + "</p>")
  }

  // Create a GeoJSON layer containing the features array on the earthquakeJsonData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeJsonData, {  
    onEachFeature: onEachFeature,

    //create each marker with color and size equivalent to the magnitude level.
    pointToLayer: function (feature, latlng) {
      var color;
      color = getColor(feature.properties.mag)

      var geojsonMarkerOptions = {
        radius: 2*feature.properties.mag,
        fillColor: color,
        weight: 1,
        opacity: 0.5,
        fillOpacity: 0.6
      };
    
      return L.circleMarker(latlng,geojsonMarkerOptions);
    }
    
  });

  // Sending earthquakes layer to the createMap function
  createMap(earthquakes);

}  //end of function createFeatures


function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    zoom: 2.5,
    id: "mapbox.streets-basic",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    zoom: 2.5,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Standard Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlaques: TectonicPlaqueLayer
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      //37.09, -95.71 //(Centralized in the US)
      25, 0     // Centralized in the globe view
    ],
    zoom: 2.3,
    //layers: [streetmap, earthquakes]
    layers: [streetmap, earthquakes,TectonicPlaqueLayer]
  });


    // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);



  // Create a legend (https://www.igismap.com/legend-in-leafletjs-map-with-topojson/)
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
      labels = [];

      div.innerHTML+= 'Magnitude<br><hr>'

      // loop 
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style= "background: ' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
    
      return div;
  };

  legend.addTo(myMap);

}
