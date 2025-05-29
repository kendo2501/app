const LifePath = require('../models/LifePathModel');

function calculateLifePathNumber(dd, mm, yyyy) {
  const digits = (dd + mm + yyyy).split('').map(Number);
  let total = digits.reduce((a, b) => a + b, 0);
  while (total > 9 && total !== 11 && total !== 22 && total !== 33) {
    total = total.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return total;
}

exports.getLifePathInfo = async (req, res) => {
  const { dd, mm, yyyy } = req.body;
  console.log('Request received at /api/life-path:', req.body);

  if (!dd || !mm || !yyyy) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin ngày sinh.' });
  }

  const lifePathNumber = calculateLifePathNumber(dd, mm, yyyy);
  console.log('Số chủ đạo đã tính:', lifePathNumber);

  try {
    const result = await LifePath.findOne({ number: lifePathNumber.toString() });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin số chủ đạo.' });
    }

    res.json({ success: true, number: lifePathNumber, information: result.information });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};
