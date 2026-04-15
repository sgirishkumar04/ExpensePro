const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, uploadReceipt } = require('../controllers/expenseController');
const { uploadReceipt: uploadReceiptMiddleware } = require('../config/cloudinary');

router.get('/', protect, getExpenses);
router.get('/:id', protect, getExpense);
router.post('/', protect, createExpense);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);
router.post('/:id/receipt', protect, uploadReceiptMiddleware.single('receipt'), uploadReceipt);

module.exports = router;
