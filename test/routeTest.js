// important modules
const assert = require('assert');
const app = require('../app.js');
const request = require('supertest');
const monk = require('monk');
const db = monk('localhost:27017/nodetest1');

/**
* @desc: Test the database insert functionality for the routes collection
*/
describe('Insert route', function() {
    it('Should be able to insert a route', function(done) {
      var collection = db.get('routes');
      collection.find({},{},function(e,result){
        var countRoutes = result.length;
        var myRoute = {"name":"TestRoute", "start":"212, Gartenstraße, Rumphorst, Mitte-Nordost, Münster-Mitte, Münster, Regierungsbezirk Münster, Nordrhein-Westfalen, 48147, Deutschland", "end":"22a, Wienburgstraße, Kreuzviertel, Innenstadtring, Münster-Mitte, Münster, Regierungsbezirk Münster, Nordrhein-Westfalen, 48147, Deutschland"};
        request(app)
        .post('/createRoute')
        .send(myRoute)
        .end(function(err, res) {
          if (err) done(err);
          collection.find({},{},function(e,result2){
            var countPostInsert = result2.length;
            assert.equal(countPostInsert,countRoutes + 1);
            done();
          });
        });
      });
    });

    it('Should not be able to add this route, because name already exists', function(done) {
      var collection = db.get('routes');
      collection.find({},{},function(e,result){
        var countRoutes = result.length;
        var myRoute = {"name":"TestRoute", "start":"212, Gartenstraße, Rumphorst, Mitte-Nordost, Münster-Mitte, Münster, Regierungsbezirk Münster, Nordrhein-Westfalen, 48147, Deutschland", "end":"22a, Wienburgstraße, Kreuzviertel, Innenstadtring, Münster-Mitte, Münster, Regierungsbezirk Münster, Nordrhein-Westfalen, 48147, Deutschland"}
        request(app)
        .post('/createRoute')
        .send(myRoute)
        .expect(500)
        .end(function(err, res) {
          if (err) done(err);
          collection.find({},{},function(e,result2){
            var countPostInsert = result2.length;
            assert.equal(countPostInsert,countRoutes);
            // reconstruct the setting
            collection.remove({"name":"TestRoute"});
            done();
          });
        });
      });
    });
});
