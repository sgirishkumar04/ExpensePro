const Transfer = require('../models/Transfer');
const Account = require('../models/Account');

// @desc  Get all transfers
// @route GET /api/transfers
const getTransfers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, paymentType, startDate, endDate, search } = req.query;
    const query = { userId: req.user._id };

    if (paymentType) query.paymentType = paymentType;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    if (search) {
      query.$or = [
        { personName: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [transfers, total] = await Promise.all([
      Transfer.find(query).populate('fromAccount', 'name type').sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Transfer.countDocuments(query),
    ]);

    res.json({
      success: true,
      transfers,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single transfer
// @route GET /api/transfers/:id
const getTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findOne({ _id: req.params.id, userId: req.user._id }).populate('fromAccount', 'name type');
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    res.json({ success: true, transfer });
  } catch (error) {
    next(error);
  }
};

// @desc  Create transfer
// @route POST /api/transfers
const createTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.create({ ...req.body, userId: req.user._id });
    
    if (transfer.fromAccount) {
      await Account.findByIdAndUpdate(transfer.fromAccount, { $inc: { balance: -transfer.amount } });
    }

    res.status(201).json({ success: true, transfer });
  } catch (error) {
    next(error);
  }
};

// @desc  Update transfer
// @route PUT /api/transfers/:id
const updateTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    
    const oldAmount = transfer.amount;
    const oldAccount = transfer.fromAccount ? transfer.fromAccount.toString() : null;

    Object.assign(transfer, req.body);
    await transfer.save();

    const newAmount = transfer.amount;
    const newAccount = transfer.fromAccount ? transfer.fromAccount.toString() : null;

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

    res.json({ success: true, transfer });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete transfer
// @route DELETE /api/transfers/:id
const deleteTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    
    if (transfer.fromAccount) {
      await Account.findByIdAndUpdate(transfer.fromAccount, { $inc: { balance: transfer.amount } });
    }

    res.json({ success: true, message: 'Transfer deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransfers, getTransfer, createTransfer, updateTransfer, deleteTransfer };
