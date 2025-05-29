const PersonalYear = require('../models/PersonalYearModel');

/**

  @param {string} dd -
  @param {string} mm 
  @param {string} yyyy 
  @returns {number} 
 */
function calculatePersonalYear(dd, mm, yyyy) {
  const currentYear = new Date().getFullYear().toString();
  const combined = dd + mm + currentYear;
  let total = combined.split('').map(Number).reduce((a, b) => a + b, 0);

  while (total > 9 && total !== 11 && total !== 22) {
    total = total.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }

  return total;
}

exports.getPersonalYearInfo = async (req, res) => {
  const { dd, mm, yyyy } = req.body;

  if (!dd || !mm || !yyyy) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin ngày sinh (dd, mm, yyyy).' });
  }

  const personalYearNumber = calculatePersonalYear(dd, mm, yyyy);

  try {
    const result = await PersonalYear.findOne({ number: personalYearNumber.toString() });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin năm cá nhân.' });
    }

    res.json({ success: true, number: personalYearNumber, information: result.information });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};
