const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMonthlyReport, getYearlyReport, getTopCategories } = require('../controllers/reportController');

router.get('/monthly', protect, getMonthlyReport);
router.get('/yearly', protect, getYearlyReport);
router.get('/top-categories', protect, getTopCategories);

module.exports = router;
