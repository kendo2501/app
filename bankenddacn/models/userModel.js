const db = require('../config/db');

const findUserByUsername = (username, callback) => {
  const query = 'SELECT * FROM information WHERE user = ?';
  db.query(query, [username], callback);
};

const findUserByCredentials = (user, pass, callback) => {
  const query = 'SELECT * FROM information WHERE user = ? AND pass = ?';
  db.query(query, [user, pass], callback);
};

const createUser = (user, pass, fullName, dd, mm, yyyy, callback) => {
  const query = 'INSERT INTO information (user, pass, fullName, dd, mm, yyyy) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [user, pass, fullName, dd, mm, yyyy], callback);
};

module.exports = {
  findUserByUsername,
  findUserByCredentials,
  createUser
};
