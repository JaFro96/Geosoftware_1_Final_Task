'use strict';

/**
* @desc used for displaying specific institutes with its attributes
* @author Jannis Fröhlking
*/

// create a logger
var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL("mylogger").setOptions({"appenders": [consoleAppender]});

// create empty layer group of canteens
var myCanteens = L.layerGroup();

// create random map with leaflet and OSM
var drawnItems = new L.FeatureGroup();
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib }),
map = new L.Map('map', { center: new L.LatLng(51.9606649, 7.6261347), zoom: 13, layers: osm }),
drawnItems = L.featureGroup().addTo(map);

// basemaps existing of OpenStreetMap
var baseMaps = {
    "OSM": osm
};

// overlays displaying canteens
var overlays = {
    "Canteens": myCanteens,
};
// get control of the layers
L.control.layers(null, overlays).addTo(map);

// add draw toolbar
map.addControl(new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
    poly: {
      allowIntersection: true
    }
  },
  draw: {
    polygon: {
      allowIntersection: true,
      showArea: true
    }
  }
}));

map.on(L.Draw.Event.CREATED, function (event) {
  var layer = event.layer;
  drawnItems.addLayer(layer);
});

map.on('draw:created', function(e) {
  drawnItems.addLayer(e.layer);
});


$( document ).ready(function(){
  // attribute which saves the geojson representation of the institute
  var geojson;
  // attribute, in which the Leaflet routing control will be stored
  var route;

  // call function
  loadGeomitriesOfObject();

  /**
  * @desc: function takes the geojson of the particular object and projects it on the map
  */
  function loadGeomitriesOfObject() {
    // get geojson of object
    var json = $('#geometry').val();
    JL("mylogger").info("Status: "+json);
    geojson = JSON.parse(json);
    var layer = L.geoJSON(geojson).addTo(map);
    map.fitBounds(layer.getBounds());
    JL("mylogger").info("Successfull loaded!");
  }

  /**
  * @desc: function for updating the geometry of the institute
  */
  $("#change").click(function() {
    // creating new object with the drawn features
    var myItems=drawnItems.toGeoJSON();
    // updating name and picURL
    myItems.features[0].properties.name=$("#name").val();
    myItems.features[0].properties.img=$("#picurl").val();
    JL("mylogger").info("Name: "+$("#name").val());
    JL("mylogger").info("Picture: "+$("#picurl").val());
    $("#geometry").val(JSON.stringify(myItems));
    JL("mylogger").info("Successfull change of the geometry!"+JSON.stringify(myItems));
  });

  // updating values of name and pic url in the geojson object on change of input fields
  $(".target").change(function() {
    // parsing input field of the geojson to a string
    var myGeojson = JSON.parse(($("#geometry")).val());
    // parse string to geojson
    myGeojson = JSON.parse(myGeojson);
    myGeojson.features[0].properties.name=$("#name").val();
    myGeojson.features[0].properties.img=$("#picurl").val();
    JL("mylogger").info("updated name: "+$("#name").val());
    JL("mylogger").info("updated picture url: "+$("#picurl").val());
    // update the input field with the new geojson object
    $("#geometry").val(JSON.stringify(myGeojson));
    JL("mylogger").info("Successfull change of the geoJSON object!"+JSON.stringify(myGeojson));
  });

  /**
  * @desc: allow the user to compute an optimized route to the nearest canteen
  */
  $("#routing").click(function() {
    var dist=[];
    // Use the first coordinate of the geometry of the institute as a starting point for computing the route
    var firstCoords=geojson.features[0].geometry.coordinates[0][0];
    var myPoint=L.latLng(firstCoords[1],firstCoords[0]);
    var nearestCanteen;
    // search for the nearest canteen and save it in the variable nearestCanteen
    for(var i in myCanteens._layers)
    {
      var myCoords=myCanteens._layers[i]._latlng;
      var mydist=myPoint.distanceTo(myCoords);
      dist.push(mydist);
      if(mydist==Math.min(...dist)){
        nearestCanteen=myCoords;
      }
    }
    JL("mylogger").info("Starting Point: "+myPoint);
    JL("mylogger").info("Distance: "+Math.min(...dist).toFixed(0)+"m");
    JL("mylogger").info("Canteen: "+nearestCanteen);

    // Add the routing control with starting point and nearest canteen to the map!
   route= L.Routing.control({
      waypoints: [
        myPoint,
        nearestCanteen
      ],
      geocoder: L.Control.Geocoder.nominatim(),
      router: L.Routing.mapbox('pk.eyJ1IjoiamZyb2UwOSIsImEiOiJjajk2cHBkbTEwN2FrMnFwN3hsMGN0NGFkIn0.xeed9p8D_EDmkAWeQqhQ1w')
    }).addTo(map);

    $(".routing").show();
  })


  /**
  * @desc: Send the waypoint information to the hidden input fields, when the user wants to save the route to the nearest canteen
  */
  $("#send").click(function(){
      var wp=route.getWaypoints();
      console.log(wp);
      $("#start").val(wp[0].name);
      $("#end").val(wp[wp.length-1].name);
  });
});
