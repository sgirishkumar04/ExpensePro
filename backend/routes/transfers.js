const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTransfers, getTransfer, createTransfer, updateTransfer, deleteTransfer } = require('../controllers/transferController');

router.get('/', protect, getTransfers);
router.get('/:id', protect, getTransfer);
router.post('/', protect, createTransfer);
router.put('/:id', protect, updateTransfer);
router.delete('/:id', protect, deleteTransfer);

module.exports = router;
