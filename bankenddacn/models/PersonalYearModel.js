const mongoose = require('mongoose');

const PersonalYearSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  information: { type: String, required: true },
}, { collection: 'personalYear' });

module.exports = mongoose.model('PersonalYear', PersonalYearSchema);
