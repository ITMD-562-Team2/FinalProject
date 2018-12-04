var mongoose = require('mongoose');
var orderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  showDate: {type: Date, required: false},
  showTime: {type: String, required: true},
  numberTickets: {type: Number, required: true}
});

var Order = mongoose.model('Order', orderSchema);
module.exports = Order;
