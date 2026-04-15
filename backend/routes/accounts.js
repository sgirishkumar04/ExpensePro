const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAccounts, createAccount, updateAccount, deleteAccount, transferBetweenAccounts } = require('../controllers/accountController');

router.get('/', protect, getAccounts);
router.post('/', protect, createAccount);
router.post('/transfer', protect, transferBetweenAccounts);
router.put('/:id', protect, updateAccount);
router.delete('/:id', protect, deleteAccount);

module.exports = router;
