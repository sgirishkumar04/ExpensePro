const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, uploadProfilePicture, changePassword } = require('../controllers/userController');
const { uploadProfile } = require('../config/cloudinary');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile-picture', protect, uploadProfile.single('profilePicture'), uploadProfilePicture);
router.put('/change-password', protect, changePassword);

module.exports = router;
