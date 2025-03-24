require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); 
const numberRoutes = require('./routes/numberRoutes'); 

const app = express(); 
const PORT = process.env.PORT || 2501; 

// Kết nối database
connectDB();

// Middleware
app.use(express.json()); 
app.use(cors()); 

// Routes
app.use('/api/numbers', numberRoutes); 

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
