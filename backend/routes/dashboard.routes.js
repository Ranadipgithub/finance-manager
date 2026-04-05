const express = require('express');
const router = express.Router();
const { getDashboardSummary, getCategoryBreakdown, getTransactionTrends } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(apiLimiter);

router.get('/summary', getDashboardSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/trends', getTransactionTrends);

module.exports = router;
