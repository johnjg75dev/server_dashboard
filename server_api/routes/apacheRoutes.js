const express = require('express');
const router = express.Router();
const apacheController = require('../controllers/apacheController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all apache routes

router.get('/status', apacheController.getStatus);
router.post('/start', apacheController.start);
router.post('/stop', apacheController.stop);
router.post('/restart', apacheController.restart);
router.get('/logs/error', apacheController.getErrorLog);
router.get('/logs/access', apacheController.getAccessLog);

module.exports = router;