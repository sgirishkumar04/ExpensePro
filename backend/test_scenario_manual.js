require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Account = require('./models/Account');
const Expense = require('./models/Expense');
const Income = require('./models/Income');

async function testScenario() {
  try {
    await connectDB();
    
    // 1. Find or Create a Test Account
    let account = await Account.findOne({ name: 'Lending Test Account' });
    if (!account) {
      account = await Account.create({
        userId: '661d4b6b6b6b6b6b6b6b6b6b', // Dummy valid ID
        name: 'Lending Test Account',
        type: 'Cash Wallet',
        balance: 10000,
        color: '#ff0000'
      });
    } else {
      account.balance = 10000;
      await account.save();
    }
    
    console.log('--- Initial State ---');
    console.log(`Account: ${account.name}`);
    console.log(`Balance: ₹${account.balance}`);

    // 2. Simulate Lending (Expense)
    console.log('\n--- Step 1: Lending ₹2,000 to a friend ---');
    const expense = await Expense.create({
      userId: account.userId,
      account: account._id,
      amount: 2000,
      title: 'Lent to John',
      category: '661d4b6b6b6b6b6b6b6b6b6b', // Dummy Category ID
      date: new Date()
    });

    // Manually trigger the balance update logic that the controller uses
    await Account.findByIdAndUpdate(expense.account, { $inc: { balance: -expense.amount } });
    
    let updatedAccount = await Account.findById(account._id);
    console.log(`New Balance: ₹${updatedAccount.balance} (Expected: 8000)`);

    // 3. Simulate Receiving Back (Income)
    console.log('\n--- Step 2: Friend returns ₹2,000 after 1 month ---');
    const income = await Income.create({
      userId: account.userId,
      account: account._id,
      amount: 2000,
      source: 'John returned money',
      date: new Date()
    });

    // Manually trigger the balance update logic
    await Account.findByIdAndUpdate(income.account, { $inc: { balance: income.amount } });

    updatedAccount = await Account.findById(account._id);
    console.log(`final Balance: ₹${updatedAccount.balance} (Expected: 10000)`);

    // Cleanup
    await Expense.deleteOne({ _id: expense._id });
    await Income.deleteOne({ _id: income._id });
    await Account.deleteOne({ _id: account._id });
    console.log('\n--- Cleanup Complete ---');

    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
}

testScenario();
