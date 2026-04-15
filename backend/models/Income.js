const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  source: {
    type: String,
    required: [true, 'Income source is required'],
    trim: true,
    maxlength: [200, 'Source cannot exceed 200 characters'],
  },
  type: {
    type: String,
    enum: ['Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Gift', 'Rental', 'Side Income', 'Other'],
    default: 'Salary',
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be at least 0.01'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
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

incomeSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
