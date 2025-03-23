require('dotenv').config(); // Load biến môi trường từ file .env
const mongoose = require('mongoose');

// Hàm kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'numerology', // Lấy tên database từ biến môi trường hoặc mặc định là 'numerology'
      useNewUrlParser: true, 
      useUnifiedTopology: true,
    });
    console.log('✅ Kết nối MongoDB Atlas thành công');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err);
    process.exit(1); // Dừng chương trình nếu kết nối thất bại
  }
};

module.exports = connectDB; // Xuất hàm để sử dụng trong server.js
