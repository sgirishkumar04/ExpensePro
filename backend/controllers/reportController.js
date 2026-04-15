const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Transfer = require('../models/Transfer');

// @desc  Get monthly report
// @route GET /api/reports/monthly?year=2024&month=4
const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [expenses, income, transfers, categoryBreakdown] = await Promise.all([
      Expense.find({ userId, date: { $gte: start, $lte: end } }).populate('category', 'name icon color').sort({ date: -1 }),
      Income.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      Transfer.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: -1 }),
      Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $project: { name: '$category.name', icon: '$category.icon', color: '$category.color', total: 1, count: 1 } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalTransfers = transfers.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      report: {
        year, month, totalExpenses, totalIncome, totalTransfers,
        savings: totalIncome - totalExpenses - totalTransfers,
        expenses, income, transfers, categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get yearly report
// @route GET /api/reports/yearly?year=2024
const getYearlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const monthlyData = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const mStart = new Date(year, i, 1);
        const mEnd = new Date(year, i + 1, 0, 23, 59, 59, 999);
        const [exp, inc, trans] = await Promise.all([
          Expense.aggregate([{ $match: { userId, date: { $gte: mStart, $lte: mEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
          Income.aggregate([{ $match: { userId, date: { $gte: mStart, $lte: mEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
          Transfer.aggregate([{ $match: { userId, date: { $gte: mStart, $lte: mEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        ]);
        return {
          month: i + 1,
          monthName: new Date(year, i).toLocaleString('default', { month: 'short' }),
          expenses: exp[0]?.total || 0,
          income: inc[0]?.total || 0,
          transfers: trans[0]?.total || 0,
          savings: (inc[0]?.total || 0) - (exp[0]?.total || 0) - (trans[0]?.total || 0),
        };
      })
    );

    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', icon: '$category.icon', color: '$category.color', total: 1 } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    const totals = monthlyData.reduce((acc, m) => ({
      expenses: acc.expenses + m.expenses,
      income: acc.income + m.income,
      transfers: acc.transfers + m.transfers,
    }), { expenses: 0, income: 0, transfers: 0 });

    const nonZeroMonths = monthlyData.filter(m => m.expenses > 0);
    const highestExpenseMonth = [...monthlyData].sort((a, b) => b.expenses - a.expenses)[0];
    const lowestExpenseMonth = nonZeroMonths.sort((a, b) => a.expenses - b.expenses)[0];
    const avgMonthlyExpense = nonZeroMonths.length ? totals.expenses / nonZeroMonths.length : 0;

    res.json({
      success: true,
      report: {
        year,
        monthlyData,
        categoryBreakdown,
        totals: { ...totals, savings: totals.income - totals.expenses - totals.transfers },
        highestExpenseMonth,
        lowestExpenseMonth,
        avgMonthlyExpense,
        avgMonthlySavings: nonZeroMonths.length ? (totals.income - totals.expenses - totals.transfers) / 12 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get top categories
// @route GET /api/reports/top-categories?year=2024&month=4
const getTopCategories = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : null;

    let start, end;
    if (month) {
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    const topCategories = await Expense.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', icon: '$category.icon', color: '$category.color', total: 1, count: 1 } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    res.json({ success: true, topCategories });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMonthlyReport, getYearlyReport, getTopCategories };
