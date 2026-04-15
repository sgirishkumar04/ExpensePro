const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getIncomeEntries, getIncome, createIncome, updateIncome, deleteIncome } = require('../controllers/incomeController');

router.get('/', protect, getIncomeEntries);
router.get('/:id', protect, getIncome);
router.post('/', protect, createIncome);
router.put('/:id', protect, updateIncome);
router.delete('/:id', protect, deleteIncome);

module.exports = router;
