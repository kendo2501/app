const mongoose = require('mongoose');

const ArrowsSchema = new mongoose.Schema({
    arrow: String,
    advantage: String,
    defect: String
  });
  module.exports = mongoose.model('Arrows', ArrowsSchema, 'Arrows');
  