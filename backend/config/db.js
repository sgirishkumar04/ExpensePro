const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB with URI starting with:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'UNDEFINED');
    
    // Set a timeout for the connection attempt
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MONGODB CONNECTION ERROR DETECTED');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.message.includes('IP not whitelisted') || error.message.includes('Could not connect to any servers')) {
      console.error('👉 ACTION REQUIRED: Your IP address is likely not whitelisted in MongoDB Atlas.');
    }

    // Wait 1 second before exiting to ensure logs are flushed to Render console
    console.log('Exiting process in 1s...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(1);
  }
};

module.exports = connectDB;
