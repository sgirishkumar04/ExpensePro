const User = require('../models/User');
const Category = require('../models/Category');
const { generateToken } = require('../middleware/auth');
const { sendWelcomeEmail, sendVerificationOTP, sendPasswordResetOTP } = require('../services/emailService');

// @desc  Register user
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, mobile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = new User({ name, email, password, mobile });
    const otp = user.generateOTP();
    user.verificationOTP = otp;
    await user.save();

    // Seed default categories for new user
    const { DEFAULT_CATEGORIES } = require('../models/Category');
    const defaultCats = DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId: user._id, isDefault: true }));
    await Category.insertMany(defaultCats);

    // Send emails (don't block registration on email failure)
    try {
      await sendVerificationOTP(name, email, otp.code);
    } catch (emailErr) {
      console.error('Verification email failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Verify email with OTP
// @route POST /api/auth/verify-email
const verifyEmail = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    if (!user.verificationOTP || user.verificationOTP.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (new Date() > user.verificationOTP.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.name, user.email);
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Email verified successfully.',
      token,
      user: { _id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture, currency: user.currency },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Resend OTP
// @route POST /api/auth/resend-otp
const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const otp = user.generateOTP();
    user.verificationOTP = otp;
    await user.save();

    await sendVerificationOTP(user.name, user.email, otp.code);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first.',
        userId: user._id,
        requireVerification: true,
      });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        currency: user.currency,
        monthlySalary: user.monthlySalary,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No user found with this email' });

    const otp = user.generateOTP();
    user.resetPasswordOTP = otp;
    await user.save();

    await sendPasswordResetOTP(user.name, user.email, otp.code);
    res.json({ success: true, message: 'Password reset OTP sent to your email', userId: user._id });
  } catch (error) {
    next(error);
  }
};

// @desc  Reset password with OTP
// @route POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.resetPasswordOTP || user.resetPasswordOTP.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (new Date() > user.resetPasswordOTP.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. Please login.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyEmail, resendOTP, login, forgotPassword, resetPassword };
