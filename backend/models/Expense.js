const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be at least 0.01'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Bank Transfer', 'Other'],
    default: 'Cash',
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  receiptUrl: {
    type: String,
    default: '',
  },
  receiptPublicId: {
    type: String,
    default: '',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringDay: {
    type: Number,
    min: 1,
    max: 31,
  },
}, { timestamps: true });

// Index for fast queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
