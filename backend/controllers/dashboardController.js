const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Transfer = require('../models/Transfer');
const Account = require('../models/Account');

// @desc  Get dashboard data
// @route GET /api/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Current month aggregations
    const [monthlyExpenses, monthlyIncome, monthlyTransfers, accounts, recentExpenses, recentIncome, categoryBreakdown] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Income.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Transfer.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Account.find({ userId }),
      Expense.find({ userId }).populate('category', 'name icon color').sort({ date: -1 }).limit(5),
      Income.find({ userId }).sort({ date: -1 }).limit(5),
      Expense.aggregate([
        { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { name: '$category.name', icon: '$category.icon', color: '$category.color', total: 1 } },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalExpenses = monthlyExpenses[0]?.total || 0;
    const totalIncome = monthlyIncome[0]?.total || 0;
    const totalTransfers = monthlyTransfers[0]?.total || 0;
    const savings = totalIncome - totalExpenses - totalTransfers;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const highestAccount = accounts.sort((a, b) => b.balance - a.balance)[0] || null;

    // Last 6 months trend
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const monthlyTrend = await Promise.all(
      last6Months.map(async ({ year, month }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);
        const [exp, inc, trans] = await Promise.all([
          Expense.aggregate([{ $match: { userId, date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
          Income.aggregate([{ $match: { userId, date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
          Transfer.aggregate([{ $match: { userId, date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        ]);
        return {
          label: new Date(year, month - 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
          expenses: exp[0]?.total || 0,
          income: inc[0]?.total || 0,
          transfers: trans[0]?.total || 0,
        };
      })
    );

    res.json({
      success: true,
      dashboard: {
        totalExpenses,
        totalIncome,
        totalTransfers,
        savings,
        totalBalance,
        highestAccount,
        accounts,
        categoryBreakdown,
        monthlyTrend,
        recentTransactions: [...recentExpenses, ...recentIncome].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
