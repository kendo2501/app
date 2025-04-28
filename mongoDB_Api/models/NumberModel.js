const mongoose = require('mongoose');

// Định nghĩa Schema cho collection 'number'
const NumberSchema = new mongoose.Schema(
  {
    n: { type: String, required: true }, 
    text: { type: String, required: true }
  },
  { collection: process.env.COLLECTION_NAME || 'number' } 
);

// Xuất model để sử dụng trong routes
module.exports = mongoose.model('Number', NumberSchema);
