console.log('🔍 COMPREHENSIVE SERVER TEST - Step by step like server.js');

try {
  console.log('Step 1: Loading express...');
  const express = require('express');
  
  console.log('Step 2: Loading mongoose...');
  const mongoose = require('mongoose');
  
  console.log('Step 3: Loading cors...');
  const cors = require('cors');
  
  console.log('Step 4: Loading helmet...');
  const helmet = require('helmet');
  
  console.log('Step 5: Loading rate-limit...');
  const rateLimit = require('express-rate-limit');
  
  console.log('Step 6: Loading dotenv...');
  require('dotenv').config();
  
  console.log('Step 7: Creating express app...');
  const app = express();
  const PORT = process.env.PORT || 5000;
  
  console.log('Step 8: Setting up helmet...');
  app.use(helmet());
  
  console.log('Step 9: Setting up rate limiting...');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use(limiter);
  
  console.log('Step 10: Setting up CORS...');
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
  
  console.log('Step 11: Setting up JSON middleware...');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  console.log('Step 12: Testing MongoDB connection...');
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shrm_counseling')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));
  
  console.log('Step 13: Setting up routes...');
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/appointments', require('./routes/appointments'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/services', require('./routes/services'));
  app.use('/api/contact', require('./routes/contact'));
  
  console.log('Step 14: Setting up health check...');
  app.get('/api/health', (req, res) => {
    res.json({ 
      message: 'SHRM Counseling API is running',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    });
  });
  
  console.log('Step 15: Setting up error handling...');
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
  });
  
  console.log('Step 16: Setting up 404 handler...');
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  console.log('Step 17: Starting server listener...');
  const server = app.listen(PORT, () => {
    console.log(`✅ SUCCESS: SHRM Counseling Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Close after 2 seconds to complete the test
    setTimeout(() => {
      console.log('🎉 Test completed successfully - closing server');
      server.close();
      process.exit(0);
    }, 2000);
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Error at step:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}