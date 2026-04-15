const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for receipts
const receiptStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'expensepro/receipts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }],
  },
});

// Storage for profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'expensepro/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = { cloudinary, uploadReceipt, uploadProfile };
