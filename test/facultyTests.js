// important modules
const assert = require('assert');
const app = require('../app.js');
const request = require('supertest');
const monk = require('monk');
const db = monk('localhost:27017/nodetest1');

/**
* @desc: Test the database insert functionality for the faculties collection
*/
describe('Insert faculty', function() {
    it('Should be able to insert a faculty', function(done) {
      var collection = db.get('faculties');
      collection.find({},{},function(e,result){
        var countFaculties = result.length;
        var myFac = {"name":"TestFac", "shortcut" : "FB4242", "website" : "test.de", "institutes": []};
        request(app)
        .post('/createfaculty')
        .send(myFac)
        .end(function(err, res) {
          if (err) done(err);
          collection.find({},{},function(e,result2){
            var countPostInsert = result2.length;
            assert.equal(countPostInsert,countFaculties + 1);
            done();
          });
        });
      });
    });

    it('Should not be able to add this faculty, because shortcut already exists', function(done) {
      var collection = db.get('faculties');
      collection.find({},{},function(e,result){
        var countFaculties = result.length;
        var myFac = {"name":"TestFac", "shortcut" : "FB4242", "website" : "test.de", "institutes": []}
        request(app)
        .post('/createfaculty')
        .send(myFac)
        .expect(500)
        .end(function(err, res) {
          if (err) done(err);
          collection.find({},{},function(e,result2){
            var countPostInsert = result2.length;
            assert.equal(countPostInsert,countFaculties);
            // reconstruct the setting
            collection.remove({"name":"TestFac"});
            done();
          });
        });
      });
    });
});
