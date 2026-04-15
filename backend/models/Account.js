const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Bank Account', 'Cash Wallet', 'Credit Card', 'Debit Card', 'UPI Wallet', 'Savings Account', 'Investment Account'],
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  icon: {
    type: String,
    default: 'account_balance',
  },
  bankName: {
    type: String,
    trim: true,
  },
  accountNumber: {
    type: String,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
