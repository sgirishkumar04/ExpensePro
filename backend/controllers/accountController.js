const Account = require('../models/Account');

// @desc  Get all accounts
// @route GET /api/accounts
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    res.json({ success: true, accounts, totalBalance });
  } catch (error) {
    next(error);
  }
};

// @desc  Create account
// @route POST /api/accounts
const createAccount = async (req, res, next) => {
  try {
    const account = await Account.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, account });
  } catch (error) {
    next(error);
  }
};

// @desc  Update account
// @route PUT /api/accounts/:id
const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    Object.assign(account, req.body);
    await account.save();
    res.json({ success: true, account });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete account
// @route DELETE /api/accounts/:id
const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc  Transfer between own accounts
// @route POST /api/accounts/transfer
const transferBetweenAccounts = async (req, res, next) => {
  try {
    const { fromAccountId, toAccountId, amount, notes } = req.body;

    const fromAccount = await Account.findOne({ _id: fromAccountId, userId: req.user._id });
    const toAccount = await Account.findOne({ _id: toAccountId, userId: req.user._id });

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    if (fromAccount.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;
    await fromAccount.save();
    await toAccount.save();

    res.json({ success: true, message: 'Transfer successful', fromAccount, toAccount });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAccounts, createAccount, updateAccount, deleteAccount, transferBetweenAccounts };
