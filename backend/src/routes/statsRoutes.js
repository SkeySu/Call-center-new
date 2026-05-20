const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, statsController.getDashboardStats);
router.get('/export', authMiddleware, statsController.getDetailedReport);

module.exports = router;
