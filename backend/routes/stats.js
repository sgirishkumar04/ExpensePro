const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Expense = require('../models/Expense');

router.get('/', async (req, res, next) => {
  try {
    const users = await User.countDocuments();
    const expensesAgg = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const stats = expensesAgg.length > 0 ? expensesAgg[0] : { totalCount: 0, totalAmount: 0 };
    
    res.json({
      success: true,
      users,
      expensesCount: stats.totalCount,
      expensesAmount: stats.totalAmount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
