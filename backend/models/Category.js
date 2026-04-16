const mongoose = require('mongoose');

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍕', color: '#f97316' },
  { name: 'Travel', icon: '✈️', color: '#3b82f6' },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { name: 'Bills & Utilities', icon: '💡', color: '#eab308' },
  { name: 'Rent', icon: '🏠', color: '#8b5cf6' },
  { name: 'Entertainment', icon: '🎬', color: '#06b6d4' },
  { name: 'Medical', icon: '🏥', color: '#ef4444' },
  { name: 'Education', icon: '📚', color: '#10b981' },
  { name: 'Investments', icon: '📈', color: '#14b8a6' },
  { name: 'Loans & Refunds', icon: '🫂', color: '#8b5cf6' },
  { name: 'Others', icon: '📦', color: '#6b7280' },
];

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters'],
  },
  icon: {
    type: String,
    default: '📦',
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
module.exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
