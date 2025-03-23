const express = require('express');
const NumberModel = require('../models/NumberModel'); // Import model
const router = express.Router(); // Khởi tạo Router của Express

// API: Lấy toàn bộ dữ liệu trong collection
router.get('/all', async (req, res) => {
  try {
    const data = await NumberModel.find(); // Lấy toàn bộ dữ liệu từ MongoDB
    res.json(data); // Trả về kết quả dạng JSON
  } catch (err) {
    console.error('❌ Lỗi server:', err);
    res.status(500).json({ error: 'Lỗi server' }); // Trả về lỗi nếu có vấn đề
  }
});

// API: Tìm kiếm theo giá trị `n`
router.get('/search', async (req, res) => {
  try {
    const { n } = req.query; // Lấy giá trị `n` từ query parameters
    if (!n) {
      return res.status(400).json({ error: 'Thiếu tham số n' }); // Kiểm tra nếu thiếu tham số
    }

    const result = await NumberModel.findOne({ n }); // Tìm trong MongoDB với giá trị `n`
    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy kết quả' }); // Nếu không có, trả về lỗi 404
    }

    res.json(result); // Trả về kết quả tìm thấy
  } catch (err) {
    console.error('❌ Lỗi server:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router; // Xuất router để sử dụng trong server.js
