const express = require('express');
const router = express.Router();
const userController = require('../controllers/authController');

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/users', userController.get); 

module.exports = router;
