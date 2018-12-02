const express = require('express')
const app = express()
const port = 3000

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/movies');
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.engine('pug', require('pug').__express)
app.set('view engine', 'pug')
app.set('views', __dirname + '/views');

var movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String, required: true },
  cast: {type: String, required: true }
});

var Movie = mongoose.model('Movie', movieSchema);

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

    app.get('/movies/new', (req, res) => {
      res.render('movie-form', { title: "Fill details of the new movie", movie: {} })
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
          res.redirect('/Movies/' + savedMovie.id);
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

app.listen(port, () => console.log(`Movie ticket app listening on port ${port}!`))
