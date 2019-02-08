'use strict';
/**
* @desc used primarily for displaying a map centered on Münster. Additionally it serves with
* layers of the institutes and canteens.
* @author Jannis Fröhlking
*/

// create a logger
var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL("mylogger").setOptions({"appenders": [consoleAppender]});

// create empty layer group of canteens
var myInstitutes = L.geoJSON();
var myCanteens = L.layerGroup();

// invoke function;
displayInstitutes();

// create random map with leaflet and OSM
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
var osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib });
var map = new L.Map('map', { center: new L.LatLng(51.9606649, 7.6261347), zoom: 13, layers: [osm, myCanteens] });

// basemaps existing of OpenStreetMap
var baseMaps = {
    "OSM": osm
};

// overlays displaying canteens and institutes
var overlays = {
    "Canteens": myCanteens,
    "Institutes" : myInstitutes
};

// get control of the layers
L.control.layers(null, overlays).addTo(map);

$(document).ready(function(){
  /**
  * @desc: adding the Leaflet Routing Machine to the map!
  * If the input field for the starting point is empty, use default coordinates for the displayed route at the beginning
  */
  var route;
  if($("#routeStart").val().length){
    route= L.Routing.control({
      waypoints: [
        L.Routing.waypoint(null, $("#routeStart").val()), //button1
        L.Routing.waypoint(null, $("#routeEnd").val())  //button2
        ],
      geocoder: L.Control.Geocoder.nominatim(),
      router: L.Routing.mapbox('pk.eyJ1IjoiamZyb2UwOSIsImEiOiJjajk2cHBkbTEwN2FrMnFwN3hsMGN0NGFkIn0.xeed9p8D_EDmkAWeQqhQ1w')
    }).addTo(map);
  }
  else{
    // Leaflet routing machine
    route= L.Routing.control({
      geocoder: L.Control.Geocoder.nominatim(),
      router: L.Routing.mapbox('pk.eyJ1IjoiamZyb2UwOSIsImEiOiJjajk2cHBkbTEwN2FrMnFwN3hsMGN0NGFkIn0.xeed9p8D_EDmkAWeQqhQ1w')
    }).addTo(map);
  }

  // If the document is ready, hide the button for computing routes
  $("#computeRoutes").hide();

  // onclick of the compute routes button hide it and show the dontcompute button and display the LRM (Leaflet Routing Machine)
  $("#computeRoutes").click(function(){
    $("#computeRoutes").hide();
    $("#dontcompute").show();
    route.addTo(map);
  });

  // dont display routing machine
  $("#dontcompute").click(function(){
      $("#computeRoutes").show();
      $("#dontcompute").hide();
      route.remove();
  });

  $("#send").click(function(){
    var wp = route.getWaypoints();
    $("#routeStart").val(wp[0].name);
    $("#routeEnd").val(wp[wp.length-1].name);
  })

  /**
  * @desc: Buttons to create start and end points of the rout
  * @see: Code Review Aufgabe 7
  */
  function createButton(label, container) {
      var btn = L.DomUtil.create('button', '', container);
      btn.setAttribute('type', 'button');
      btn.innerHTML = label;
      return btn;
  }
    map.on('click', function(e) {
      var container = L.DomUtil.create('div'),
       startBtn = createButton('Start from this location', container),
       destBtn = createButton('Go to this location', container);

      L.popup()
          .setContent(container)
          .setLatLng(e.latlng)
          .openOn(map);


    L.DomEvent.on(startBtn, 'click', function() {
         route.spliceWaypoints(0, 1, e.latlng);
         map.closePopup();
     });

     L.DomEvent.on(destBtn, 'click', function() {
       route.spliceWaypoints(route.getWaypoints().length - 1, 1, e.latlng);
       map.closePopup();
   });
  });
});

/**
* @desc: function for displaying institutes
*/
function displayInstitutes(){
  if($("#geoIns").length){
    var myInst= JSON.parse($("#geoIns").val());
    for(var i in myInst)
    {
      myInstitutes.addData(JSON.parse(myInst[i].json));
    }
    JL("mylogger").info("Here you can see the institutes!");
  }
  else{
    JL("mylogger").fatal("We cannot connect to the institutes!");
  }
}
