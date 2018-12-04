var mongoose = require('mongoose');
var movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String, required: true },
  cast: {type: String, required: true }
});
var Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
