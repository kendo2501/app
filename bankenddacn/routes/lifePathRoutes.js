const express = require('express');
const router = express.Router();
const lifePathController = require('../controllers/lifePathController');

router.get('/life-path/:userId', lifePathController.getLifePathNumber);

module.exports = router;
