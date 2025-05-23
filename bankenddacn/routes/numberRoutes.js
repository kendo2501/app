const express = require('express');
const router = express.Router();
const { connectMongoDB, pool } = require('../config/db1');

// Import các model từ tệp models/Arrows.js đã được sửa đổi
// Giả sử models/Arrows.js export: { AdvantageArrow, DefectArrow, Arrow }
// Trong đó Arrow là model cho collection 'Arrows' (nếu có và được sử dụng riêng)
const { AdvantageArrow, DefectArrow } = require('../models/Arrows');

const Chart = require('../models/_chart');
const HighPeaks = require('../models/highPeaks');
const MainNumber = require('../models/mainNumber');
const PersonalYear = require('../models/personalYear');

// Route lấy tất cả dữ liệu tổng hợp
router.get('/data', async (req, res) => {
  try {
    await connectMongoDB();

    // Lấy dữ liệu từ các collection MongoDB chuyên biệt
    const advantageArrowsData = await AdvantageArrow.find({});
    const defectArrowsData = await DefectArrow.find({});
    const chartsData = await Chart.find({});
    const highPeaksData = await HighPeaks.find({});
    const mainNumbersData = await MainNumber.find({});
    const personalYearsData = await PersonalYear.find({});

    // Lấy dữ liệu từ MySQL
    // Sử dụng .promise() để làm việc tốt hơn với async/await
    const [mysqlData] = await pool.promise().execute('SELECT * FROM mandala_infor');

    res.json({
      mongo: {
        advantageArrow: advantageArrowsData, // Dữ liệu từ collection advantageArrow
        defectArrow: defectArrowsData,     // Dữ liệu từ collection defectArrow
        chart: chartsData,
        highPeaks: highPeaksData,
        mainNumber: mainNumbersData,
        personalYear: personalYearsData,
      },
      mysql: mysqlData,
    });
  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({ error: 'Failed to fetch all data' });
  }
});

// Route API: Lấy dữ liệu mũi tên đã được kết hợp từ advantageArrow và defectArrow
router.get('/mongo/api/arrows', async (req, res) => {
    try {
        await connectMongoDB(); // Đảm bảo kết nối MongoDB

        const advantagesList = await AdvantageArrow.find({}).lean();
        const defectsList = await DefectArrow.find({}).lean();

        const combinedArrowsMap = new Map();

        advantagesList.forEach(adv => {
            combinedArrowsMap.set(adv.arrow, {
                arrow: adv.arrow,
                advantage: adv.advantage,
                defect: null
            });
        });

        defectsList.forEach(def => {
            if (combinedArrowsMap.has(def.arrow)) {
                combinedArrowsMap.get(def.arrow).defect = def.defect;
            } else {
                combinedArrowsMap.set(def.arrow, {
                    arrow: def.arrow,
                    advantage: null,
                    defect: def.defect
                });
            }
        });

        const finalCombinedArrows = Array.from(combinedArrowsMap.values());
        res.json(finalCombinedArrows);

    } catch (err) {
        console.error('Error combining arrow data for /mongo/api/arrows:', err);
        res.status(500).json({ error: 'Lỗi khi kết hợp dữ liệu mũi tên' });
    }
});


// --- CÁC ROUTE TÌM KIẾM CHO MONGODB ---

// Tìm kiếm trong 'chart'
router.get('/mongo/chart/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    const results = await Chart.find({ number: number });
    res.json(results);
  } catch (error) {
    console.error('Error searching charts:', error);
    res.status(500).json({ error: 'Failed to search charts' });
  }
});

// Các route tìm kiếm cho advantageArrow và defectArrow (hiện đang được comment)
// Nếu bạn muốn kích hoạt, hãy đảm bảo chúng sử dụng đúng model AdvantageArrow và DefectArrow
/*
router.get('/mongo/advantageArrow/search', async (req, res) => {
  const { arrow } = req.query;
  if (!arrow) {
    return res.status(400).json({ error: 'Missing search parameter: arrow' });
  }
  try {
    await connectMongoDB();
    const results = await AdvantageArrow.find({ arrow: arrow });
    res.json(results);
  } catch (error) {
    console.error('Error searching advantage arrows:', error);
    res.status(500).json({ error: 'Failed to search advantage arrows' });
  }
});

router.get('/mongo/defectArrow/search', async (req, res) => {
  const { arrow } = req.query;
  if (!arrow) {
    return res.status(400).json({ error: 'Missing search parameter: arrow' });
  }
  try {
    await connectMongoDB();
    const results = await DefectArrow.find({ arrow: arrow });
    res.json(results);
  } catch (error) {
    console.error('Error searching defect arrows:', error);
    res.status(500).json({ error: 'Failed to search defect arrows' });
  }
});
*/

// Tìm kiếm trong 'highPeaks'
// Lưu ý: Schema highPeaks có trường 'number' và 'information'.
// Query gốc của bạn tìm theo peak1, peak2,... Hãy đảm bảo dữ liệu MongoDB của bạn có các trường này.
router.get('/mongo/highPeaks/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    // Query gốc của bạn:
    const results = await HighPeaks.find({ $or: [{ peak1: number }, { peak2: number }, { peak3: number }, { peak4: number }] });
    // Nếu muốn tìm theo trường 'number' trong schema:
    // const results = await HighPeaks.find({ number: number });
    res.json(results);
  } catch (error) {
    console.error('Error searching high peaks:', error);
    res.status(500).json({ error: 'Failed to search high peaks' });
  }
});

// Tìm kiếm trong 'mainNumber'
// Schema mainNumber có trường 'number' là String.
// Query gốc của bạn dùng parseInt. Nếu 'number' trong DB là số dạng chuỗi và bạn muốn so sánh số, điều này có thể đúng.
// Nếu 'number' là chuỗi định danh, có thể bạn muốn so sánh chuỗi trực tiếp: { number: number }
router.get('/mongo/mainNumber/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    const results = await MainNumber.find({ number: parseInt(number) }); // Query gốc của bạn
    // Hoặc nếu number là string: const results = await MainNumber.find({ number: number });
    res.json(results);
  } catch (error) {
    console.error('Error searching main numbers:', error);
    res.status(500).json({ error: 'Failed to search main numbers' });
  }
});

// Tìm kiếm trong 'personalYear'
// Schema personalYear có trường 'number' là String. Query gốc của bạn tìm theo trường 'year'.
// Đã sửa để tìm theo trường 'number' có trong schema.
router.get('/mongo/personalYear/search', async (req, res) => {
  const { number } // Giả sử query param là 'number' đại diện cho năm cá nhân
    = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    // Schema có trường 'number' (String). Nếu query param 'number' là giá trị cần tìm:
    const results = await PersonalYear.find({ number: number });
    // Nếu bạn muốn tìm theo giá trị số và trường 'number' trong DB lưu số dạng chuỗi:
    // const results = await PersonalYear.find({ number: String(parseInt(number)) }); // Hoặc chỉ parseInt nếu DB lưu số
    res.json(results);
  } catch (error) {
    console.error('Error searching personal years:', error);
    res.status(500).json({ error: 'Failed to search personal years' });
  }
});

// --- ROUTE TÌM KIẾM CHO MYSQL ---
router.get('/mysql/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    // Sử dụng .promise() để làm việc tốt hơn với async/await
    const [results] = await pool.promise().execute(
      'SELECT * FROM mandala_infor WHERE number = ?',
      [number]
    );
    res.json(results);
  } catch (error) {
    console.error('Error searching MySQL:', error);
    res.status(500).json({ error: 'Failed to search MySQL data' });
  }
});

module.exports = router;