// models/lifePathModel.js
const mongoose = require('mongoose');

const lifePathSchema = new mongoose.Schema({
  number: { type: String },
  information: { type: String }
});

module.exports = mongoose.model('LifePath', lifePathSchema);
