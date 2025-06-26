const mongoose = require('mongoose');

const pyramidSchema = new mongoose.Schema({
  number: {
    type: String, // Hoặc Number tùy dữ liệu
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  collection: 'highPeaks'
});

const Pyramid = mongoose.model('PyramidModel', pyramidSchema);

module.exports = Pyramid;