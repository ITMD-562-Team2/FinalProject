var chai = require('chai');
let chaiHttp = require('chai-http');
var app = require('../server.js');
let should = chai.should();

global.app = app;
global.expect = chai.expect;

chai.use(chaiHttp);

describe('/GET movie', () => {
    it('should GET all the movies which are present in the database', (done) => {
      chai.request('http://localhost:3000')
          .get('/movies/5c036553bb45ea39846cb314') //change movie id based on your database
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('title');
                res.body.should.have.property('director');
                res.body.should.have.property('cast');
            done();
          });
    });
});

describe('/POST movie', () => {
    it('should  POST a movie', (done) => {
        let movie = {
            title: "Avengers",
            director: "Anthony Russo",
            cast : "Robert Downey, Jr., Scarlett Johansson"
        }
      chai.request('http://localhost:3000')
          .post('/movies')
          .send(movie)
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.not.have.property('errors');
            done();
          });
    });
});

describe('/PUT/:id movie', () => {
    it('should update the movie details for given movie id', (done) => {
        let movie = {title: "Avengers 2", director: "Joss Whedon", cast: "Mark Ruffalo"}
              chai.request('http://localhost:3000')
              .put('/movies/5c06fae6b7f11e3548859a6b') //change movie id based on your database
              .send(movie)
              .end((err, res) => {
                    res.should.have.status(204);
                    res.body.should.be.a('object');
                done();
              });
        });
    });

    describe('/DELETE movie', () => {
        it('it should Delete the movie for the given id', (done) => {
          chai.request('http://localhost:3000')
              .delete('/movies/5c06fae6b7f11e3548859a6b') //change movie id based on your database
              .end((err, res) => {
                res.should.have.status(204);
                done();
              });
        });
    });
