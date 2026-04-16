require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');

const syncCategories = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to DB: ${conn.connection.host}`);

    const users = await User.find({});
    console.log(`Found ${users.length} users. Syncing categories...`);

    const { DEFAULT_CATEGORIES } = require('../models/Category');
    const loanCategory = DEFAULT_CATEGORIES.find(c => c.name === 'Loans & Refunds');

    if (!loanCategory) {
      console.error('❌ Loans & Refunds category not found in DEFAULT_CATEGORIES!');
      process.exit(1);
    }

    for (const user of users) {
      const existing = await Category.findOne({ userId: user._id, name: 'Loans & Refunds' });
      
      if (!existing) {
        console.log(`+ Adding Loans & Refunds to user: ${user.name} (${user.email})`);
        await Category.create({
          ...loanCategory,
          userId: user._id,
          isDefault: true
        });
      } else {
        console.log(`- User ${user.name} already has Loans & Refunds category.`);
      }
    }

    console.log('✅ Category sync complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
};

syncCategories();
