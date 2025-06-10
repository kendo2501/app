const { pool } = require('../config/db');

// Kiểu callback
const findUserByUsername = (username, callback) => {
  const query = 'SELECT * FROM information WHERE user = ?';
  pool.query(query, [username], callback);
};
const findUserByCredentials = (user, pass, callback) => {
  const query = 'SELECT * FROM information WHERE user = ? AND pass = ?';
  pool.query(query, [user, pass], callback);
};

const createUser = (user, pass, fullName, dd, mm, yyyy, callback) => {
  const query = 'INSERT INTO information (user, pass, fullName, dd, mm, yyyy) VALUES (?, ?, ?, ?, ?, ?)';
  pool.query(query, [user, pass, fullName, dd, mm, yyyy], callback);
};


// callback-style getAllUsers
const getAllUsers = (callback) => {
  const query = 'SELECT * FROM information'; // <--- ĐÃ SỬA TÊN BẢNG
  pool.query(query, callback);
};

module.exports = {
  findUserByUsername,
  findUserByCredentials,
  createUser,
  getAllUsers,
};