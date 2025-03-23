const mongoose = require('mongoose');

// Định nghĩa Schema cho collection 'number'
const NumberSchema = new mongoose.Schema(
  {
    n: { type: String, required: true }, // Trường 'n' (số) phải có giá trị
    text: { type: String, required: true } // Trường 'text' (giải thích) cũng bắt buộc
  },
  { collection: process.env.COLLECTION_NAME || 'number' } // Lấy tên collection từ .env hoặc mặc định là 'number'
);

// Xuất model để sử dụng trong routes
module.exports = mongoose.model('Number', NumberSchema);
