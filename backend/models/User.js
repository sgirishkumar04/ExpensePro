const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  mobile: {
    type: String,
    trim: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  monthlySalary: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  monthlyBudget: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationOTP: {
    code: String,
    expiresAt: Date,
  },
  resetPasswordOTP: {
    code: String,
    expiresAt: Date,
  },
  preferences: {
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
  },
}, { timestamps: true });

// Hash password before saving (Mongoose 9: async hooks do not use next callback)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate 6-digit OTP
userSchema.methods.generateOTP = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { code, expiresAt };
};

module.exports = mongoose.model('User', userSchema);
