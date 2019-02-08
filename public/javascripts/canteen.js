'use strict';

/**
* @desc: used for displaying canteens on the map and extracting the information about a canteen with a
* synchronous HTTP request.
*/

// create a logger
var consoleAppender = JL.createConsoleAppender('consoleAppender');
JL("mylogger").setOptions({"appenders": [consoleAppender]});

/**
* @desc: class representing a canteen
*/
class canteen {
/**
* @param{string:name} - name of the mensa
* @param{string:id} - id
* @param{string:coords} - coordinates of the mensa
*/
constructor(name, id, coords) {
  this.name = name;
  this.id = id;
  this.coords = coords;
  }
}

// icon for canteens
var canteenIcon = L.icon({
  iconUrl: '../images/dinnerBlack.png',
  iconSize:  [22, 22]
});

displayMScanteens();

/**
* @desc: synchronous HTTP request to retrieve coordinates and names of canteens in Münster
* @see: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests
*/
function synchronousMethode(){
  var request = new XMLHttpRequest();

  /**@see: https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/push*/
  var obj = {
    length: 0,
    addElem: function addElem (elem) {
        // obj.length increments automatically, if an object is added
        [].push.call(this, elem);
      }
    };

  for(var i=1; i<7; i++){
    request.open('GET', "https://openmensa.org/api/v2/canteens/?limit=100&page="+i, false);  // `false` makes the request synchronous
    request.send(null);
    if (request.status === 200) {
      var myRequest=request.responseText;
      // parse all the canteens of the openmensa API
      var tmpJSON=JSON.parse(myRequest);
      for(var j=0; j<tmpJSON.length; j++){
        // Check the city of the canteen
        if(tmpJSON[j].city=="Münster"){
          // create new canteen object
          var mensa=new canteen(tmpJSON[j].name,tmpJSON[j].id, tmpJSON[j].coordinates);
          obj.addElem(mensa);
          }
      }
    }
  }
  return obj;
}
/**
* @desc: function for displaying the canteens
*/
function displayMScanteens(){
  var tmp = synchronousMethode();
  for (var i in tmp)
  {
      // skip superfluous last object in tmp
      if(i=="length")
      {
        break;
      }
      // create a marker, bind a pop up with its name and add it to the overlay
      L.marker(tmp[i].coords, {icon: canteenIcon}).bindPopup(displayMeals(tmp[i].id,tmp[i].name)).addTo(myCanteens);

  }
}

/**
* @desc: function for displaying the meals of the canteens
* @param: id represents the id of the canteens
* @param: name is the name of the canteen
*/
function displayMeals(id, name){
  var request = new XMLHttpRequest();
  var result="<h2>"+name+"</h2>";
  /*@see: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript*/
  let today = new Date().toISOString().slice(0, 10);
  var myURL="https://openmensa.org/api/v2/canteens/"+id+"/days/"+today+"/meals";
  //console.log('UNSENT: '+request.status);
  request.open('GET', myURL, false);  // `false` makes the request synchronous
  //console.log('OPENED: '+request.status);

  request.send(null);
  if (request.status === 404) {
    result+="<h5 style='color:red;'>This canteen is CLOSED today!</h5>";
      console.log("The page '"+myURL+"' you are trying to reach is not available.");
  }
  //console.log('SEND: '+request.status);
  if (request.status === 200) {
    var myRequest=request.responseText;
    // parse all the canteens of the openmensa API
    var tmp=JSON.parse(myRequest);
    for(var i in tmp)
    {
      result+="<h5>"+tmp[i].name+"</h5>";
      result+="Students: "+JSON.stringify(tmp[i].prices.students);
      result+="€ Employees: "+JSON.stringify(tmp[i].prices.employees);
      result+="€ Others: "+JSON.stringify(tmp[i].prices.others);
      result+="€<hr>";
    }
  }
  return result;
}
