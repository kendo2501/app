require('dotenv').config()
const mysql = require('mysql2');
const mongoose = require('mongoose');

async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || 'numerology',
      // useNewUrlParser and useUnifiedTopology are removed
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    throw error;
  }
}

const pool = mysql.createPool({
  host: process.env.MYSQL1_HOST,
  user: process.env.MYSQL1_USER,
  password: process.env.MYSQL1_PASSWORD,
  database: process.env.MYSQL1_DATABASE,
});

module.exports = { connectMongoDB, pool };