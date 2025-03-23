require('dotenv').config(); // Load biến môi trường từ file .env
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import kết nối MongoDB
const numberRoutes = require('./routes/numberRoutes'); // Import routes

const app = express(); // Khởi tạo ứng dụng Express
const PORT = process.env.PORT || 2501; // Lấy PORT từ biến môi trường hoặc mặc định là 3000

// Kết nối database
connectDB();

// Middleware
app.use(express.json()); // Cho phép xử lý dữ liệu JSON từ request
app.use(cors()); // Cho phép Cross-Origin Resource Sharing (CORS)

// Routes
app.use('/api/numbers', numberRoutes); // Gắn routes cho API

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
