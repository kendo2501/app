require('dotenv').config()
const mysql = require('mysql2');


const pool = mysql.createPool({
  host: process.env.MYSQL2_HOST,
  user: process.env.MYSQL2_USER,
  password: process.env.MYSQL2_PASSWORD,
  database: process.env.MYSQL2_DATABASE,
});




module.exports = { pool };