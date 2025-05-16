const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/system/info
// @desc    Get general system information
// @access  Private
router.get('/info', authMiddleware, systemController.getSystemInfo);

module.exports = router;