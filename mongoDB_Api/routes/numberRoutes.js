const express = require('express');
const NumberModel = require('../models/NumberModel');
const router = express.Router();

// API: Lấy toàn bộ dữ liệu trong collection
router.get('/all', async (req, res) => {
  try {
    const data = await NumberModel.find();
    res.json(data);
  } catch (err) {
    console.error('❌ Lỗi server:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API: Tìm kiếm theo giá trị `n`
router.get('/search', async (req, res) => {
  try {
    const { n } = req.query;
    if (!n) {
      return res.status(400).json({ error: 'Thiếu tham số n' });
    }

    const result = await NumberModel.findOne({ n }); 
    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy kết quả' }); 
    }

    res.json(result); 
  } catch (err) {
    console.error('❌ Lỗi server:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router; // Xuất router để sử dụng trong server.js
