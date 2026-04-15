const User = require('../models/User');

// @desc  Get user profile
// @route GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc  Update user profile
// @route PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, mobile, monthlySalary, currency, monthlyBudget, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    if (monthlySalary !== undefined) user.monthlySalary = monthlySalary;
    if (currency) user.currency = currency;
    if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc  Upload profile picture
// @route POST /api/users/profile-picture
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    user.profilePicture = req.file.path;
    await user.save();

    res.json({ success: true, message: 'Profile picture updated', profilePicture: user.profilePicture });
  } catch (error) {
    next(error);
  }
};

// @desc  Change password
// @route PUT /api/users/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePicture, changePassword };
