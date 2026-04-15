const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  personName: {
    type: String,
    required: [true, 'Person name is required'],
    trim: true,
    maxlength: [100, 'Person name cannot exceed 100 characters'],
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
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters'],
  },
  paymentType: {
    type: String,
    enum: ['UPI', 'Bank Transfer', 'Cash', 'Cheque', 'EMI', 'Loan', 'Other'],
    default: 'UPI',
  },
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Completed',
  },
}, { timestamps: true });

transferSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Transfer', transferSchema);
