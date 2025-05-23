const User = require('../models/userModel');

exports.login = (req, res) => {
  const { user, pass } = req.body;

  User.findUserByCredentials(user, pass, (err, results) => {
    if (err) {
      res.json({ success: false, message: 'Lỗi truy vấn đăng nhập' });
      return;
    }

    if (results.length > 0) {
      res.json({ success: true, message: 'Đăng nhập thành công', data: results[0] });
    } else {
      res.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' });
    }
  });
};

exports.register = (req, res) => {
  const { user, pass, fullName, dd, mm, yyyy } = req.body;

  User.findUserByUsername(user, (err, results) => {
    if (err) {
      res.json({ success: false, message: 'Lỗi khi kiểm tra tài khoản' });
      return;
    }

    if (results.length > 0) {
      res.json({ success: false, message: 'Tài khoản đã tồn tại' });
      return;
    }

    User.createUser(user, pass, fullName, dd, mm, yyyy, (err, result) => {
      if (err) {
        res.json({ success: false, message: 'Lỗi khi tạo tài khoản' });
      } else {
        res.json({ success: true, message: 'Đăng ký thành công', userId: result.insertId });
      }
    });
  });
};

exports.get = (req, res) => {
  User.getAllUsers((err, results) => {
    if (err) {
      res.json({ success: false, message: 'Lỗi khi lấy danh sách người dùng' });
      return;
    }

    res.json({ success: true, data: results });
  });
};