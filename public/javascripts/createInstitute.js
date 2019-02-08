'use strict';

/**
* @desc used for creating an institute. Offers differents option for including the geometry of an institute.
* @author Jannis Fröhlking
*/

// create a logger
var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL("mylogger").setOptions({"appenders": [consoleAppender]});


// create the basic function of the map and a layer (OSM) centered on the position of Muenster
var drawnItems = new L.FeatureGroup();
var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib }),
map = new L.Map('map', { center: new L.LatLng(51.9606649, 7.6261347), zoom: 13 }),
drawnItems = L.featureGroup().addTo(map);
L.control.layers({ "OSM": osm.addTo(map)}).addTo(map);

// add draw toolbar for the geometry of institutes
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


/**
* source: https://bl.ocks.org/danswick/d30c44b081be31aea483
* handles click of delete element
* all drawn layers get cleared
*/
document.getElementById('delete').onclick = function(e) {
  drawnItems.clearLayers();
}

/*
* class represents an institute in the database
*/
class institute {
  /**
  * @param{string:name} - name of the institute
  * @param{string:url} - url of the picture
  * @param{string:json} - boundaries of the institute
  * @param{string:fac} - faculty of the institue
  */
  constructor(name, url, json, fac) {
    this.name = name;
    this.url = url;
    this.json = json;
    this.fac = fac;
  }
}
var neu = new institute();

/**
* @desc: hide the different option at first and then display it, when the user clicks on the button
*/
$(document).ready(function() {
  $(".geodraw").hide();
  $(".georaw").hide();
  $(".geourl").hide();

  $("#draw").click(function(){
    $(".geodraw").show();
    $(".georaw").hide();
    $(".geourl").hide();

  });
  $("#url").click(function(){
    $(".geourl").show();
    $(".georaw").hide();
    $(".geodraw").hide();

  });
  $("#raw").click(function(){
    $(".georaw").show();
    $(".geodraw").hide();
    $(".geourl").hide();
  });
  $("#geoJSONta").change(function(){
    validateGeoJSON($("#geoJSONta").val());
  });
});

function checkInput(){
  // get value of the textfield that should contain the name of the figures
  var myName = document.getElementById("nameInput").value;
  // get value of the textfield that should contain the url of an optional picture
  var pic = document.getElementById("picInput").value;
  // get value of the datalist that should contain the faculty of the institute
  var fac = $('#facList').val();
  // test, if textfields are filled out properly
  if(myName.length==0) {
    JL("mylogger").error("Data was not sent to database, because a name is missing");
    alert("Error: Please fill in a name of the institute!");
    return false;
  }
  else if(pic.length==0) {
    JL("mylogger").error("Data was not sent to database, because there is no picture URL");
    alert("Error: Please fill in a URL including a picture of the institute!");
    return false;
  }
  else if(fac.length==0) {
    JL("mylogger").error("Data was not sent to database, because a faculty is missing");
    alert("Error: Please select one of our faculties!");
    return false;
  }
  else
  {
    // create an institute objects
    neu.name=myName;
    neu.url=pic;
    neu.fac=fac;
    return true;
  }
}

function sendData(){
  JL("mylogger").info("Data was sent to database"+"\n"+ "name="+neu.name+ ", picURL=" +neu.url+ ", faculty=" +neu.fac);
  alert('Object successfull saved!');
  $.ajax({
    type: 'POST',
    data: neu,
    url: "./createInstitute",

  });
}
/**
* function is called with the 'save to database'-Button and makes an AJAX
* post request with the data to later store it in the database
*
*/
function saveDrawnInstituteToDatabase() {
  // test, if textfields are filled out properly
  if(checkInput()){
    // retrieve the geometry out of the drawnItems
    var institutgeoJSON = drawnItems.toGeoJSON();
    // add properties
    institutgeoJSON.features[0].properties.name=neu.myName;
    institutgeoJSON.features[0].properties.img=neu.url;
    // create new databaseobject-object and later will the param json
    neu.json = JSON.stringify(institutgeoJSON);
    sendData();
  }
}
/**
* @desc: function is called with the 'save this to database'-Button and makes an AJAX
* post request with the data to later store it in the database
*
*/
function savegeoJSONtextToDatabase()
{
  if(checkInput()&&validateGeoJSON(geoJSONta.value)){
    var institutgeoJSON= JSON.parse(geoJSONta.value);
    institutgeoJSON.features[0].properties.name=neu.name;
    institutgeoJSON.features[0].properties.img=neu.url;
    // var neu = new institute(obj.features[0].properties.name, obj.features[0].properties.img, "");
    neu.json = JSON.stringify(institutgeoJSON);
    sendData();
  }
}

/**
*  @desc: function which retrieves the geojson data from a URL and saves it into the database
*/
function loadDoc()
{
  if(checkInput()){
    // save the url
    var upload = document.getElementById("urlinput").value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var institutgeoJSON = this.responseText;
        validateGeoJSON(institutgeoJSON);
        institutgeoJSON = JSON.parse(institutgeoJSON);
        L.geoJSON(institutgeoJSON).addTo(map);
        // add properties
        institutgeoJSON.features[0].properties.name=neu.name;
        institutgeoJSON.features[0].properties.img=neu.url;
        neu.json = JSON.stringify(institutgeoJSON);
        // send object to the database
        sendData();
      }
    };
    xhttp.open("GET", upload, true);
    xhttp.send();
  }
}
// function for validating geoJSON
function validateGeoJSON(myGeoJSON){
  if (myGeoJSON.length==0)
  {
    JL("mylogger").fatal("Empty GeoJSON!");
    return false;
  }
  try {
        var myObj=JSON.parse(myGeoJSON);
        if(propertiesCheck(myObj.features[0].properties)&&geometryCheck(myObj.features[0].geometry)){
          JL("mylogger").info("Valid!");
          return true;
        }
        else{
          return false;
        }
    } catch (e) {
        JL("mylogger").fatal("Invalid GeoJSON!");
        return false;
    }
}

function propertiesCheck(props){
  for (var i in props)
  {
    if(i!="img"&&i!="name"){
      JL("mylogger").fatal("Property '"+i+"' is not allowed!");
      return false;
    }
  }
  JL("mylogger").info("Properties are correct!");
  return true;
}

function geometryCheck(geometry){
  if(geometry.type=="LineString"){
    if(geometry.coordinates[0][0]==geometry.coordinates[0][geometry.coordinates[0].length-1])
    {
      console.log(geometry.coordinates[0][0]+" | "+geometry.coordinates[0][geometry.coordinates.length-1])
      JL("mylogger").fatal("Wrong geometry type. If the last coordinate equals the first coordinate, the type is a Polygon!");
      return false;
    }
    JL("mylogger").info("Type of the geometry is correct!");
    return true;
  }
  JL("mylogger").info("Type of the geometry is correct!");
  return true;
}
