const Income = require('../models/Income');
const Account = require('../models/Account');

// @desc  Get all income entries (with filter + pagination)
// @route GET /api/income
const getIncomeEntries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate, search } = req.query;
    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    if (search) {
      query.$or = [
        { source: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [incomes, total] = await Promise.all([
      Income.find(query).populate('account', 'name type').sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Income.countDocuments(query),
    ]);

    res.json({
      success: true,
      incomes,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single income entry
// @route GET /api/income/:id
const getIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id }).populate('account', 'name type');
    if (!income) return res.status(404).json({ success: false, message: 'Income record not found' });
    res.json({ success: true, income });
  } catch (error) {
    next(error);
  }
};

// @desc  Create income entry
// @route POST /api/income
const createIncome = async (req, res, next) => {
  try {
    const income = await Income.create({ ...req.body, userId: req.user._id });
    
    if (income.account) {
      await Account.findByIdAndUpdate(income.account, { $inc: { balance: income.amount } });
    }

    res.status(201).json({ success: true, income });
  } catch (error) {
    next(error);
  }
};

// @desc  Update income entry
// @route PUT /api/income/:id
const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ success: false, message: 'Income record not found' });
    
    const oldAmount = income.amount;
    const oldAccount = income.account ? income.account.toString() : null;

    Object.assign(income, req.body);
    await income.save();

    const newAmount = income.amount;
    const newAccount = income.account ? income.account.toString() : null;

    if (oldAccount === newAccount) {
      if (oldAccount && oldAmount !== newAmount) {
        const diff = newAmount - oldAmount;
        await Account.findByIdAndUpdate(oldAccount, { $inc: { balance: diff } });
      }
    } else {
      if (oldAccount) {
        await Account.findByIdAndUpdate(oldAccount, { $inc: { balance: -oldAmount } });
      }
      if (newAccount) {
        await Account.findByIdAndUpdate(newAccount, { $inc: { balance: newAmount } });
      }
    }

    res.json({ success: true, income });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete income entry
// @route DELETE /api/income/:id
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ success: false, message: 'Income record not found' });
    
    if (income.account) {
      await Account.findByIdAndUpdate(income.account, { $inc: { balance: -income.amount } });
    }

    res.json({ success: true, message: 'Income record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getIncomeEntries, getIncome, createIncome, updateIncome, deleteIncome };
