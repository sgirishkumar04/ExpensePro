const express = require('express');
const router = express.Router();
const { register, verifyEmail, resendOTP, login, forgotPassword, resetPassword } = require('../controllers/authController');
const { body } = require('express-validator');

const validate = (validations) => async (req, res, next) => {
  for (const validation of validations) await validation.run(req);
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

router.post('/register', validate([
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]), register);

router.post('/verify-email', validate([
  body('userId').notEmpty().withMessage('User ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
]), verifyEmail);

router.post('/resend-otp', resendOTP);

router.post('/login', validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]), login);

router.post('/forgot-password', validate([
  body('email').isEmail().withMessage('Valid email is required'),
]), forgotPassword);

router.post('/reset-password', validate([
  body('userId').notEmpty().withMessage('User ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]), resetPassword);

module.exports = router;
