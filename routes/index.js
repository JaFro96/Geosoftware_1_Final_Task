const express = require('express');
const router = express.Router();

/* GET Start page at home of host*/
router.get('/', function(req, res) {
  res.render('start', { title: 'Starting page!' });
});

router.get('/imprint', function(req, res) {
  res.render('imprint', { title: 'Imprint!' });
});

/* GET createInstitute page that contains faculties for the faculty input field.*/
router.get('/createInstitute', function(req, res) {
  //console.log("Let's create an institute!");
  var db = req.db;
  var collection = db.get('faculties');
  collection.find({},{},function(error,docs){
    if (error) res.json(error)
    else {
      res.render('createInstitute', {
        "faculties" : docs, title: 'Create an institute'
      });
    }
  });
});

/* GET create faculty page */
router.get('/createfaculty', function(req, res) {
  res.render('createfaculty', { title: 'Create a faculty' });
});

/* GET show object of institute page */
router.get('/showInstitute', function(req, res) {
  res.render('showInstitute', { title: 'Show institute' });
});

/* GET Faculties page that contains all faculties of our database. */
router.get('/faculties', function(req, res) {
  console.log("Now retrieving all faculties in the database....");
  var db = req.db;
  var collection = db.get('faculties');
  collection.find({},{},function(error,docs){
    if (error) {
      res.json(error);
    }
    res.render('faculties', {
      "faculties" : docs, title: 'Faculties'
    });
  });
});

/* GET Routes page that contains all routes in our database. */
router.get('/routes', function(req, res) {
  var db = req.db;
  var collection = db.get('routes');
  collection.find({},{},function(error,docs){
    if (error) {
      res.json(error);
    }
    res.render('routes', {
      "routes" : docs, title: 'Routes'
    });
  });
});


/* GET institutes page that contains all institutes of our database. */
router.get('/institutes', function(req, res) {
  var db = req.db;
  var collection = db.get('geojsons');
  collection.find({},{},function(error,docs){
    if (error) {
      res.json(error);
    }
    else{
      res.render('institutes', {
        "institutes" : docs, title: 'These are our institutes'
      });
    }
  });
});

/* GET map page */
router.get('/map', function(req, res) {
  var db = req.db;
  var collection = db.get('geojsons');
  collection.find({},{},function(error,docs){
    if (error) {
      res.json(error);
    }
    else {
      res.render('map', { geojsonsInsitutes: JSON.stringify(docs), title: "Map with routing option and layers existing of institutes and canteens!"});
    }
  });
});

/**
* @desc: get values for the page showing the institutes
* need of two collections, because we need the institute database and the database of the faculties
* render all of the url-request that could be matched to others
* (those with the id in it when selecting object of database)
* Render it with showInstitute.jade and pass the variables title, text, picURL, faculties, id, fac and name
*/
router.get('/:id', function(req, res) {
  var db = req.db;
  var institutes = db.get('geojsons');
  var facultycol = db.get('faculties');
  var json;
  var allFaculties={};
  facultycol.find({},{},function(error,facs) {
    if (error) {
      console.log(error);
    } else {
      allFaculties=facs;
    }
  });
  institutes.find({"_id": req.params.id},{},function(error,docs){
    if(docs.length>0)
    {
      // text is the json-string
      if (error) {
        console.log(error);
      }
      else {
        res.render('showInstitute', { title: docs[0].name, id: req.params.id, fac: docs[0].fac,
          text: docs[0].json, picurl: docs[0].url, name: docs[0].name, faculties: allFaculties});
        }
    }
    else {
      res.render('wrongPermalink', { title: "An institute with this permalink does not exist!" } );
    }
    });
  });

/**
* @see: http://technotip.com/3842/update-edit-data-in-mongodb-node-js/
* @desc: editing institutes
*/

router.post('/:id/edit', function(req, res){
  var db = req.db;
  var body = req.body;

  // Delete institute in its old faculty
  var querydelete = {"institutes": body.name};
  var valuesAfterDelete = { $pull: {"institutes": body.name}};
  db.get("faculties").update(querydelete, valuesAfterDelete,
    function(error, facs){
      if(error) res.json(error);
    });

  // save institute in its faculty
  var myqueryfaculty = {"shortcut": body.facultylist};
  var newvaluesfaculty = { $push: {"institutes": body.name}};
  db.get("faculties").update(myqueryfaculty, newvaluesfaculty,
    function(error, facs){
      if(error) res.json(error);
    });

  // Update institute data
  var myquery = {_id: req.params.id};
  var newvalues = { $set: {"name":body.name,
  "url":body.picurl, "json":body.geojson, "fac":body.facultylist}}
  db.get('geojsons').update(myquery, newvalues,
      function(error, docs){
        if(error) res.json(error);
        else    res.redirect('/institutes');
      });
    });

/**
* @desc: handling the delete institute request
*/
router.post('/:id/delete', function(req, res){
  var db = req.db;
  // retrieve collections of database
  var collectionOfInstitutes = db.get('geojsons');
  var collectionOfFaculties = db.get('faculties');
  // remove institute from the faculty
  var querydelete = {"institutes": req.body.name};
  var valuesAfterDelete = { $pull: {"institutes": req.body.name}};
  collectionOfFaculties.update(querydelete, valuesAfterDelete,
    function(error, facs){
      if(error) res.json(error);
    });

    // remove institute itself
    collectionOfInstitutes.remove({_id: req.params.id},
      function(error){
        if(error) res.send(error);
        else{
          res.redirect('/institutes');
        }
      });
    });

/*
* handling database delete request when clicking button in map
* deleting date of the collection 'geojsons'
*/
router.delete('/institutes', function (req, res) {
  var db = req.db;
  var collection = db.get('geojsons');
  backURL=req.header('Referer') || '/';
  collection.remove({}, function(error){
    if(error) res.json(error);
    else{
      res.redirect('/institutes');
    }
  });
});

/*
* handling database insert post request when clicking button in map
* sending the data of the request to the database collection 'geojsons'
*/
router.post('/createInstitute', function(req, res) {
  var db = req.db;
  var document = req.body;
  // Update faculties in adding the created institute in its faculty
  // query for retrieving the right faculty
  var myquery = {"shortcut": document.fac};
  // push name of the institute to the array of institute
  var newvalues = { $push: {"institutes": document.name} };
  // uptdating collection of faculties
  db.collection('faculties').update(myquery, newvalues,
    function(error, facs){
      if(error) res.json(error);
    });
    // updating collection of institutes
    db.collection('geojsons').find({"name":document.name},{},function(error, docs){
      if(docs.length > 0 ) {
        res.status(500).send('An institute with this name does already exist!');
      }
      else {
        db.collection('geojsons').insert(document, function(error, result) {
          if(error) {
            res.send("We got an error: "+error);
          } else {
            res.redirect('/institutes');
          }
        });
      }
    });
  });
/**
* @desc: POST Create Faculty request. Insert new faculty in its collection with adding an empty institutes array
*/
router.post('/createfaculty', function(req, res) {
  var db = req.db;
  var document = req.body;
  // Create an empty array for institutes
  document.institutes = [];
  // Check if this faculty does already exist.
  db.collection('faculties').find({"shortcut":document.shortcut},{},function(error, docs){
    if(docs.length > 0 ) {
      res.status(500).send('A faculty with this shortcut does already exist.');
    }
    else {
      db.collection('faculties').insert(document, function(error, result) {
        if(error) {
          //gerade aktualisiert:
          res.send("We got an error: "+error);
        } else {
          res.redirect('/faculties');
        }
      });
    }
  })
});

/**
* @desc: POST Save Route request. Insert new route in its collection
*/
router.post('/createRoute', function(req, res) {
  var db = req.db;
  var document = req.body;
  db.collection('routes').find({"name":document.name},{},function(error, docs){
    if(docs.length > 0 ) {
      res.status(500).send('A route with this name does already exist.');
    }
    else{
      db.collection('routes').insert(document, function(error, result) {
        if(error) {
          res.send("We got an error: "+error);
        } else {
          res.redirect('/routes');
        }
      });
    }
  });
});

/**
* @desc: render all of the url-request that could be matched to others
* (those with the id in it when selecting object of database)
* Render it with showFaculty.jade and pass the variables title, id, name, shortcut, website and institutes
*/
router.get('/faculty/:id', function(req, res) {
  var db = req.db;
  var collection = db.get('faculties');
  var json;
  collection.find({"_id": req.params.id},{},function(error,docs){
    if(docs.length>0)
    {
      res.render('showFaculty', { title: docs[0].name, id: req.params.id,
        name: docs[0].name, shortcut: docs[0].shortcut, website: docs[0].website, institutes: docs[0].institutes
      });
    }
    else {
      res.render('wrongPermalink', { title: "A faculty with this Permalink does not exist!"})
    }
  });

});

/**
* @desc: update the edited values of the faculty
* (those with the id in it when selecting object of database)
*/
router.post('/faculty/:id/edit', function(req, res){
  var db = req.db;
  var body = req.body;
  var myquery = {_id: req.params.id};
  var newvalues = { $set: {"name":body.name,
  "shortcut":body.shortcut, "website":body.website}}
  db.get('faculties').update(myquery, newvalues,
    function(error, docs){
      if(error) res.json(error);
      else    res.redirect('/faculties');
    });
  });

/**
* @desc: delete the faculty with the selected id
*/
router.get('/faculty/:id/delete', function(req, res){
  var db = req.db;
  var body = req.body;
  var collectionOfFaculties = db.get('faculties');
  var collectionOfInstitutes = db.get('geojsons');
  collectionOfFaculties.remove({_id: req.params.id},
    function(error){
      if(error) res.json(error);
      else{
        res.redirect('/faculties');
      }
    });
  });

/**
* @desc: render all of the url-request that could be matched to others
* (those with the id in it when selecting object of database)
* Render it with showFaculty.jade and pass the variables title, id, name, shortcut, website and institutes
*/
router.get('/route/:id', function(req, res) {
  var db = req.db;
  var collection = db.get('routes');
  var json;
  collection.find({"_id": req.params.id},{},function(error,docs){
    if(docs.length>0)
    {
      res.render('showRoute', { title: docs[0].name, id: req.params.id,
        name: docs[0].name, start: docs[0].start, end: docs[0].end
      });
    }
    else {
      res.render('wrongPermalink', {title: "A route with this permalink does not exist!"});
    }
  });
});

/**
* @desc: update the edited values of the faculty
* (those with the id in it when selecting object of database)
*/
router.post('/route/:id/edit', function(req, res){
  var db = req.db;
  var body = req.body;
  var myquery = {_id: req.params.id};
  var newvalues = { $set: {"name":body.name,
  "start":body.start, "end":body.end}}
  db.get('routes').update(myquery, newvalues,
    function(error, docs){
      if(error) res.json(error);
      else    res.redirect('/routes');
    });
  });

/**
* @desc: delete the faculty with the selected id
*/
router.get('/route/:id/delete', function(req, res){
  var db = req.db;
  var body = req.body;
  db.get('routes').remove({_id: req.params.id},
    function(error){
      if(error) res.json(error);
      else{
        res.redirect('/routes');
      }
    });
  });

module.exports = router;
