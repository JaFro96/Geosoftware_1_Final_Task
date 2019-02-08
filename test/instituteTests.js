// important modules
const assert = require('assert');
const app = require('../app.js');
const request = require('supertest');
const monk = require('monk');
const db = monk('localhost:27017/nodetest1');

/**
* @desc: Test the database insert functionality for the geojsons collection
*/
describe('Insert institute', function() {
    it('Should be able to insert an institute', function(done) {
      var collection = db.get('geojsons');
      collection.find({},{},function(e,result){
        var countgeojsons = result.length;
        var myInstitute = {"name":"TestInstitute", "url": "www.testInstitute.de", "json" : "", "fac": "FB01"};
        request(app)
        .post('/createinstitute')
        .send(myInstitute)
        .end(function(err, res) {
          if (err) done(err);
          collection.find({},{},function(e,result2){
            var countPostInsert = result2.length;
            assert.equal(countPostInsert,countgeojsons + 1);
            done();
          });
        });
      });
    });

    it('Should not be able to add this institute, because name does already exists', function(done) {
      var collection = db.get('geojsons');
      collection.find({},{},function(e,result){
        var countgeojsons = result.length;
        var myInstitute = {"name":"TestInstitute", "url": "www.testInstitute.de", "json" : "", "fac": "FB01"}
        request(app)
        .post('/createinstitute')
        .send(myInstitute)
        .expect(500)
        .end(function(err, res) {
          if (err) done(err);
          collection.find({},{},function(e,result2){
            var countPostInsert = result2.length;
            assert.equal(countPostInsert,countgeojsons);
            // reconstruct the setting
            collection.remove({"name":"TestInstitute"});
            done();
          });
        });
      });
    });
});
