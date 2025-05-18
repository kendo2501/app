const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'an123',
  database: 'account'
});

db.connect(err => {
  if (err) throw err;
  console.log('Kết nối MySQL thành công');
});

module.exports = db;
