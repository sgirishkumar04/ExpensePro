require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Auth-specific rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ExpensePro API is running 🚀', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/income', require('./routes/income'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// Connect to Database and then start server
const startServer = async () => {
  console.log('--- Starting Server Startup Sequence ---');
  console.log('Checking Environment Variables:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- PORT: ${process.env.PORT || 'Not set (will use 5001)'}`);
  console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? 'Present (Hidden)' : 'MISSING ❌'}`);
  console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'Present' : 'MISSING ❌'}`);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('MongoDB Connected successfully!');
    
    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 ExpensePro API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log('--- Startup Sequence Complete ---');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection at startup:', err.message);
      if (server) server.close(() => process.exit(1));
      else process.exit(1);
    });
  } catch (err) {
    console.error('❌ CRITICAL ERROR during server startup:');
    console.error(err.stack || err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
