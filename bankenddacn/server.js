const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); 

const numberRoutes = require('./routes/numberRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(morgan('dev')); 

// Routes
app.use('/', numberRoutes);     
app.use('/api', authRoutes);   

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
