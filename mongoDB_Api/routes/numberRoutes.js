const express = require('express');
const router = express.Router();
const { connectMongoDB, pool } = require('../config/db');
const AdvantageArrow = require('../models/advantageArrow');
const Chart = require('../models/_chart');
const DefectArrow = require('../models/defectArrow');
const HighPeaks = require('../models/highPeaks');
const MainNumber = require('../models/mainNumber');
const PersonalYear = require('../models/personalYear');

router.get('/data', async (req, res) => {
  try {
    await connectMongoDB();

    const advantageArrows = await AdvantageArrow.find({});
    const charts = await Chart.find({});
    const defectArrows = await DefectArrow.find({});
    const highPeaksData = await HighPeaks.find({});
    const mainNumbers = await MainNumber.find({});
    const personalYears = await PersonalYear.find({});

    const [mysqlData] = await pool.execute('SELECT * FROM mandala_infor');

    res.json({
      mongo: {
        advantageArrow: advantageArrows,
        chart: charts,
        defectArrow: defectArrows,
        highPeaks: highPeaksData,
        mainNumber: mainNumbers,
        personalYear: personalYears,
      },
      mysql: mysqlData,
    });
  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({ error: 'Failed to fetch all data' });
  }
});

// Search routes for MongoDB
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

// Search routes for MongoDB
router.get('/mongo/chart/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    const results = await Chart.find({ number: number }); // Assuming 'number' is a field in your Chart model
    res.json(results);
  } catch (error) {
    console.error('Error searching charts:', error);
    res.status(500).json({ error: 'Failed to search charts' });
  }
});

router.get('/mongo/defectArrow/search', async (req, res) => {
  const { arrow } = req.query;
  if (!arrow) {
    return res.status(400).json({ error: 'Missing search parameter: arrow' });
  }
  try {
    await connectMongoDB();
    const results = await DefectArrow.find({ arrow: arrow }); // Assuming 'arrow' is a field in your DefectArrow model
    res.json(results);
  } catch (error) {
    console.error('Error searching defect arrows:', error);
    res.status(500).json({ error: 'Failed to search defect arrows' });
  }
});

router.get('/mongo/advantageArrow/search', async (req, res) => {
  const { arrow } = req.query;
  if (!arrow) {
    return res.status(400).json({ error: 'Missing search parameter: arrow' });
  }
  try {
    await connectMongoDB();
    const results = await AdvantageArrow.find({ arrow: arrow }); // Assuming 'arrow' is a field in your AdvantageArrow model
    res.json(results);
  } catch (error) {
    console.error('Error searching advantage arrows:', error);
    res.status(500).json({ error: 'Failed to search advantage arrows' });
  }
});

router.get('/mongo/highPeaks/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    const results = await HighPeaks.find({ $or: [{ peak1: number }, { peak2: number }, { peak3: number }, { peak4: number }] }); // Searching across peak fields
    res.json(results);
  } catch (error) {
    console.error('Error searching high peaks:', error);
    res.status(500).json({ error: 'Failed to search high peaks' });
  }
});

router.get('/mongo/mainNumber/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    const results = await MainNumber.find({ number: parseInt(number) }); // Assuming 'number' is a number
    res.json(results);
  } catch (error) {
    console.error('Error searching main numbers:', error);
    res.status(500).json({ error: 'Failed to search main numbers' });
  }
});

router.get('/mongo/personalYear/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    await connectMongoDB();
    const results = await PersonalYear.find({ year: parseInt(number) }); // Assuming 'year' is a number
    res.json(results);
  } catch (error) {
    console.error('Error searching personal years:', error);
    res.status(500).json({ error: 'Failed to search personal years' });
  }
});

// Search route for MySQL
router.get('/mysql/search', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).json({ error: 'Missing search parameter: number' });
  }
  try {
    const [results] = await pool.execute(
      'SELECT * FROM mandala_infor WHERE number = ?', // Assuming 'number' is a column in your MySQL table
      [number]
    );
    res.json(results);
  } catch (error) {
    console.error('Error searching MySQL:', error);
    res.status(500).json({ error: 'Failed to search MySQL data' });
  }
});

module.exports = router;