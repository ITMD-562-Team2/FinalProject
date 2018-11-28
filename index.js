const express = require('express')
const app = express()
const port = 3000

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/books');
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.set('view engine', 'pug')
app.set('views', __dirname + '/views');

var movieSchema = new mongoose.Schema({
  movieName: { type: String, required: true },
  movieTitle: { type: String, required: true }
});

var Movie = mongoose.model('Movie', movieSchema);
