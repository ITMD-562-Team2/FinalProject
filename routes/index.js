var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mongoose = require('mongoose');

// GET /profile
router.get('/profile', function(req, res, next) {
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
router.get('/register', function(req, res, next){
  return res.render('register', { title: 'Sign Up'});
});

// POST /register
router.post('/register', function(req, res, next) {
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
router.get('/', function(req, res, next){
  return res.render('index', { title: 'Home'});
});

// GET /about
router.get('/about', function(req, res, next){
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// GET /login
router.get('/login', function(req, res, next) {
  return res.render('login', { title: 'Log In'});
});

// GET /logout
router.get('/logout', function(req, res, next) {
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
router.post('/login', function(req, res, next) {
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

    router.get('/', (req, res) => {
      Movie.find({}, function(err, movies) {
        if (err) {
          console.log(err)
          res.render('error', {})
        } else {
                  res.render('index', { movies: movies })
        }
      });
    });

    router.get('/movies/new', (req, res, next) => {
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
              return res.render('movie-form', { title: "Fill details of the new movie", movie: {} });
            }
          });
        });

    router.get('/movies/:id/update', (req, res) => {
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

    router.post('/movies/new', function(req, res, next) {
      let newMovie = new Movie(req.body);
      newMovie.save(function(err, savedMovie){
        if (err) {
          console.log(err)
          res.render('movie-form', { movie: newMovie, error: err })
        } else {
          res.redirect('/Movies/' + savedMovie.id);
        }
      });
    });

    router.get('/movies/:id', (req, res) => {
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

    router.post('/movies/:id/update', function(req, res, next) {
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

    router.post('/movies/:id/delete', function (req, res) {
      let id = ObjectID.createFromHexString(req.params.id)
      Movie.deleteOne({_id: id}, function(err, product) {
        res.redirect("/");
      });
    });

    router.post('/api/movies', (req, res) => {
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

    router.get('/api/movies', (req, res) => {
      Movie.find({}, function(err, movies) {
        if (err) {
          console.log(err)
          res.status(500).send("Internal server error")
        } else {
          res.send(movies)
        }
      });
    });

    router.get('/api/movies/:id', (req, res) => {
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

    router.put('/api/movies/:id', (req, res) => {
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

    router.delete('/api/movies/:id', (req, res) => {
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

module.exports = router;
