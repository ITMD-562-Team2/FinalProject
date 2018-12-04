var express = require('express');
//var router = express.Router();
const app = express();
var User = require('../models/user');
var Movie = require('../models/movie');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;

//const showDate = datepicker('.showDate', {
//  id:1,
//  onSelect: (instance, selectedDate) => {
//    instance.setDate(selectedDate);
//  }
//});

// GET /profile
app.get('/profile', function(req, res, next) {
  if (! req.session.userId ) {
    var err = new Error("You are not authorized to view this page.");
    err.status = 403;
    return next(err);
  }
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('profile', { title: 'Profile', name: user.name });
        }
      });
});

// GET /register
app.get('/register', function(req, res, next){
  if (! req.session.userId ) {
    var err = new Error("You are not authorized to view this page.");
    err.status = 403;
    return next(err);
  }
  User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render('register', { title: 'Add User'});
        }
        });
});

// POST /register
app.post('/register', function(req, res, next) {
  if (req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword) {

      // confirm that user typed same password twice
      if (req.body.password !== req.body.confirmPassword) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }

      // create object with form input
      var userData = {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
      };

      // use schema's `create` method to insert document into Mongo
      User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/profile');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
})

// GET /
//router.get('/', function(req, res, next){
//  return res.render('index', { title: 'Home'});
//});

// GET /about
app.get('/about', function(req, res, next){
  return res.render('about', { title: 'About' });
});

// GET /contact
app.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// GET /login
app.get('/login', function(req, res, next) {
  return res.render('login', { title: 'Log In'});
});

// GET /book-movies
app.get('/book-movie', function(req, res, next) {
  return res.render('book-movie', { title: 'Book Movie'});
});

// GET /logout
app.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// POST /login
app.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      }  else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

    app.get('/', (req, res) => {
      Movie.find({}, function(err, movies) {
        if (err) {
          console.log(err)
          res.render('error', {})
        } else {
                  res.render('index', { movies: movies })
        }
      });
    });

    app.get('/update', (req, res, next) => {
      if (! req.session.userId ) {
        var err = new Error("You are not authorized to view this page.");
        err.status = 403;
        return next(err);
      }
      User.findById(req.session.userId)
          .exec(function (error, user) {
            if (error) {
              return next(error);
            } else {
                    Movie.find({}, function(err, movies) {
                      if (err) {
                        console.log(err)
                        res.render('error', {})
                      } else {
                                res.render('update1', { movies: movies })
                      }
                    });
              }
      });
    });

    app.get('/movies/new', (req, res) => {
      if (! req.session.userId) {
        var err = new Error("You are not authorised to view this page.");
        err.status = 403;
        return next(err);
      }
      User.findById(req.session.userId)
          .exec(function (error, user)  {
            if (error)  {
              return next(error);
            } else {
              res.render('movie-form', { title: "Fill details of the new movie", movie: {} });
            }
          });
        });

    app.get('/movies/:id/update', (req, res) => {
      let id = ObjectID.createFromHexString(req.params.id)

      Movie.findById(id, function(err, movie) {
        if (err) {
          console.log(err)
          res.render('error', {})
        } else {
          if (movie === null) {
            res.render('error', { message: "Not found" })
          } else {
            res.render('update-movie-form', { title: "Update details", movie: movie })
          }
        }
      });
    });



    app.post('/movies/new', function(req, res, next) {
      let newMovie = new Movie(req.body);
      newMovie.save(function(err, savedMovie){
        if (err) {
          console.log(err)
          res.render('movie-form', { movie: newMovie, error: err })
        } else {
          res.redirect('/movies/' + savedMovie.id);
        }
      });
    });

    app.get('/movies/:id', (req, res) => {
      let id = ObjectID.createFromHexString(req.params.id)

      Movie.findById(id, function(err, movie) {
        if (err) {
          console.log(err)
          res.render('error', {})
        } else {
          if (movie === null) {
            res.render('error', { message: "Not found" })
          } else {
            res.render('movie-details-dummy', { movie: movie})
          }
        }
      });
    });

    // admin edit movie
    app.get('/movies1/:id', (req, res) => {
      let id = ObjectID.createFromHexString(req.params.id)

      Movie.findById(id, function(err, movie) {
        if (err) {
          console.log(err)
          res.render('error', {})
        } else {
          if (movie === null) {
            res.render('error', { message: "Not found" })
          } else {
            res.render('movie-detail', { movie: movie})
          }
        }
      });
    });


    app.post('/movies/:id/update', function(req, res, next) {
      let id = ObjectID.createFromHexString(req.params.id)

      Movie.updateOne({"_id": id}, { $set: req.body }, function(err, details) {
        if (err) {
          console.log(err)
          res.render('error', {})
        } else {
          res.redirect('/movies/' + id);
        }
      });
    });

    app.post('/movies/:id/delete', function (req, res) {
      let id = ObjectID.createFromHexString(req.params.id)
      Movie.deleteOne({_id: id}, function(err, product) {
        res.redirect("/");
      });
    });

    app.post('/api/movies', (req, res) => {
      console.log(req.body)
      let newMovie = new Movie(req.body)

      newMovie.save(function (err, savedMovie) {
        if (err) {
          console.log(err)
          res.status(500).send("There was an internal error")
        } else {
          res.send(savedMovie)
        }
      });
    });

    app.get('/api/movies', (req, res) => {
      Movie.find({}, function(err, movies) {
        if (err) {
          console.log(err)
          res.status(500).send("Internal server error")
        } else {
          res.send(movies)
        }
      });
    });

    //get movie details
    app.get('/api/movies/:id', (req, res) => {
      let id = ObjectID.createFromHexString(req.params.id)

      Movie.findById(id, function(err, movie) {
        if (err) {
          console.log(err)
          res.status(500).send("Internal server error")
        } else {
          if (movie === null) {
            res.status(404).send("Not found")
          } else {
            res.send(movie)
          }
        }
      });
    });

    //update movie
    app.put('/api/movies/:id', (req, res) => {
      let id = ObjectID.createFromHexString(req.params.id)

      Movie.updateOne({"_id": id}, { $set: req.body }, function(err, details) {
        if (err) {
          console.log(err)
          res.status(500).send("Internal server error")
        } else {
          res.status(204).send()
        }
      });
    });

    //delete movie
    app.delete('/api/movies/:id', (req, res) => {
      let id = ObjectID.createFromHexString(req.params.id)

      Movie.deleteOne({"_id": id}, function(err) {
        if (err) {
          console.log(err)
          res.status(500).send("Internal server error")
        } else {
          res.status(204).send()
        }
      });
    });

  });

//module.exports = router;
module.exports = app;
