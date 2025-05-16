const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure admin/auth

router.use(authMiddleware); // Protect settings routes

// GET all settings for display
router.get('/', configController.getAllSettings);

// PUT to update settings (or POST)
router.put('/', configController.updateSettings);

module.exports = router;