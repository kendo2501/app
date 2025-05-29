const mongoose = require('mongoose');

const LifePathSchema = new mongoose.Schema({
  number: String,
  information: String
}, { collection: 'mainNumber' });

module.exports = mongoose.model('Cluster0', LifePathSchema);
