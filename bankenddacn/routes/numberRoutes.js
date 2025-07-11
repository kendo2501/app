const express = require('express');
const router = express.Router();
const { connectMongoDB } = require('../config/db');

// Import các model từ các tệp trong thư mục models
const { AdvantageArrow, DefectArrow } = require('../models/Arrows');
const birthDescription = require('../models/_birthDescription');
const HighPeaks = require('../models/highPeaks');
const MainNumber = require('../models/mainNumber');
const PersonalYear = require('../models/personalYear');
const Mandala = require('../models/mandala');

// Import controllers
const lifePathController = require('../controllers/lifePathController');
const personalYearController = require('../controllers/personalYearController');
const numberController = require('../controllers/pyramidController');

// Route lấy tất cả dữ liệu tổng hợp
router.get('/data', async (req, res) => {
  try {
    await connectMongoDB();

    // Lấy dữ liệu từ các collection MongoDB chuyên biệt
    const advantageArrowsData = await AdvantageArrow.find({});
    const defectArrowsData = await DefectArrow.find({});
    const birthDescriptionsData = await birthDescription.find({});
    const highPeaksData = await HighPeaks.find({});
    const mainNumbersData = await MainNumber.find({});
    const personalYearsData = await PersonalYear.find({});

    // Lấy dữ liệu từ MySQL
    const [mysqlData] = await pool.promise().execute('SELECT * FROM mandala_infor');

    res.json({
      mongo: {
        advantageArrow: advantageArrowsData,
        defectArrow: defectArrowsData,
        birthDescription: birthDescriptionsData,
        highPeaks: highPeaksData,
        mainNumber: mainNumbersData,
        personalYear: personalYearsData,
      },
      // mysql: mysqlData, // Bỏ nếu không còn dùng MySQL
    });
  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({ error: 'Failed to fetch all data' });
  }
});

// Route API: Lấy dữ liệu mũi tên đã được kết hợp
router.get('/mongo/api/arrows', async (req, res) => {
  try {
    await connectMongoDB();

    const advantagesList = await AdvantageArrow.find({}).lean();
    const defectsList = await DefectArrow.find({}).lean();

    const combinedArrowsMap = new Map();

    advantagesList.forEach(adv => {
      combinedArrowsMap.set(adv.arrow, {
        arrow: adv.arrow,
        advantage: adv.advantage,
        defect: null,
      });
    });

    defectsList.forEach(def => {
      if (combinedArrowsMap.has(def.arrow)) {
        combinedArrowsMap.get(def.arrow).defect = def.defect;
      } else {
        combinedArrowsMap.set(def.arrow, {
          arrow: def.arrow,
          advantage: null,
          defect: def.defect,
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

// Tìm kiếm trong 'birthDescription'
router.get('/mongo/birthDescription/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    const results = await birthDescription.find({ number: number });
    res.json(results);
  } catch (error) {
    console.error('Error searching birthDescriptions:', error);
    res.status(500).json({ error: 'Failed to search birthDescriptions' });
  }
});

// Tìm kiếm trong 'highPeaks'
router.get('/mongo/highPeaks/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    const results = await HighPeaks.find({
      $or: [{ peak1: number }, { peak2: number }, { peak3: number }, { peak4: number }],
    });
    res.json(results);
  } catch (error) {
    console.error('Error searching high peaks:', error);
    res.status(500).json({ error: 'Failed to search high peaks' });
  }
});

// <<< THAY ĐỔI: Route tìm kiếm trong collection 'mandala' (hoặc tên từ process.env.COLLECTION_NAME)
router.get('/mongo/mandala/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    
    const results = await Mandala.find({ number: number });
    res.json(results);
  } catch (error) {
    console.error('Error searching in mandala collection:', error);
    res.status(500).json({ error: 'Failed to search mandala data' });
  }
});

// Route cho Life Path (sử dụng controller)
router.post('/life-path', async (req, res, next) => {
  console.log('Hit /life-path route');
  try {
    await connectMongoDB();
   
    next();
  } catch (error) {
    console.error('Error connecting to databases:', error);
    res.status(500).json({ error: 'Không thể kết nối tới MongoDB hoặc MySQL' });
  }
}, lifePathController.getLifePathInfo);

// Route cho Personal Year (sử dụng controller)
router.post('/personal-year', async (req, res, next) => {
  console.log('Hit /personal-year route');
  try {
    await connectMongoDB();
    next();
  } catch (error) {
    console.error('Error connecting to MongoDB for /personal-year:', error);
    res.status(500).json({ error: 'Failed to connect to database for personal year info' });
  }
}, personalYearController.getPersonalYearInfo);

// Tìm kiếm trong MySQL
router.get('/mysql/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
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

// Route cho thông tin số phụ
router.post('/sub-numbers-info', async (req, res, next) => {
  try {
    await connectMongoDB();
    next();
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    res.status(500).json({ error: 'Không thể kết nối MongoDB' });
  }
}, numberController.getSubNumbersInfo);

module.exports = router;