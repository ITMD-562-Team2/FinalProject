const express = require('express');
const app = express();
const port = 3000;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var path = require('path')

//use sessions for tracking logins
app.use(session({
  secret: 'Parth Vaghasiya',
  resave: true,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));

// make user ID available in templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  next();
});

//mongodb connection
mongoose.connect('mongodb://localhost/movies');
var db = mongoose.connection;
//mongo error
db.on('error', console.error.bind(console, 'connection error:'));

//parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//serve static files from /public
app.use(express.static(__dirname + 'public'));

//view engine setup
app.engine('pug', require('pug').__express)
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

//include routes
var routes = require('./routes/index');
app.use('/', routes);

//catch 404 and forward to error handler
app.use(function(req, res, next){
  var err = new Error('File not found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(port, () => console.log(`Movienta app listening on port ${port}!`))
