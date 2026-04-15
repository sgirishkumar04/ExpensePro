const Expense = require('../models/Expense');
const Account = require('../models/Account');

// @desc  Get all expenses (with filter + pagination)
// @route GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate, minAmount, maxAmount, paymentMethod, search } = req.query;
    const query = { userId: req.user._id };

    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(query).populate('category', 'name icon color').populate('account', 'name type').sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(query),
    ]);

    res.json({
      success: true,
      expenses,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single expense
// @route GET /api/expenses/:id
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('category', 'name icon color').populate('account', 'name type');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// @desc  Create expense
// @route POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, userId: req.user._id });
    
    if (expense.account) {
      await Account.findByIdAndUpdate(expense.account, { $inc: { balance: -expense.amount } });
    }

    const populated = await expense.populate('category', 'name icon color');
    res.status(201).json({ success: true, expense: populated });
  } catch (error) {
    next(error);
  }
};

// @desc  Update expense
// @route PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    const oldAmount = expense.amount;
    const oldAccount = expense.account ? expense.account.toString() : null;

    Object.assign(expense, req.body);
    await expense.save();

    const newAmount = expense.amount;
    const newAccount = expense.account ? expense.account.toString() : null;

    if (oldAccount === newAccount) {
      if (oldAccount && oldAmount !== newAmount) {
        const diff = newAmount - oldAmount;
        await Account.findByIdAndUpdate(oldAccount, { $inc: { balance: -diff } });
      }
    } else {
      if (oldAccount) {
        await Account.findByIdAndUpdate(oldAccount, { $inc: { balance: oldAmount } });
      }
      if (newAccount) {
        await Account.findByIdAndUpdate(newAccount, { $inc: { balance: -newAmount } });
      }
    }

    const populated = await expense.populate('category', 'name icon color');
    res.json({ success: true, expense: populated });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete expense
// @route DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    
    if (expense.account) {
      await Account.findByIdAndUpdate(expense.account, { $inc: { balance: expense.amount } });
    }

    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Upload receipt
// @route POST /api/expenses/:id/receipt
const uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    expense.receiptUrl = req.file.path;
    expense.receiptPublicId = req.file.filename;
    await expense.save();
    res.json({ success: true, receiptUrl: expense.receiptUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense, uploadReceipt };
