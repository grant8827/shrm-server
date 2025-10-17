// Debug wrapper for server.js to catch the exact error
console.log('🐛 DEBUG MODE: Starting SHRM server with full error capture...');

// Capture all uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n❌ UNCAUGHT EXCEPTION:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

// Capture all unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ UNHANDLED PROMISE REJECTION:');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// Add detailed logging
console.log('Loading modules...');

try {
  console.log('1. Loading express...');
  const express = require('express');
  
  console.log('2. Loading mongoose...');
  const mongoose = require('mongoose');
  
  console.log('3. Loading cors...');
  const cors = require('cors');
  
  console.log('4. Loading helmet...');
  const helmet = require('helmet');
  
  console.log('5. Loading rate-limit...');
  const rateLimit = require('express-rate-limit');
  
  console.log('6. Loading dotenv...');
  require('dotenv').config();
  
  console.log('7. Creating app...');
  const app = express();
  const PORT = process.env.PORT || 5000;
  
  console.log('8. Setting up security middleware...');
  app.use(helmet());
  
  console.log('9. Setting up rate limiting...');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use(limiter);
  
  console.log('10. Setting up CORS...');
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
  
  console.log('11. Setting up body parsing...');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  console.log('12. Connecting to MongoDB...');
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shrm_counseling')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    // Don't exit, continue without DB for debugging
  });
  
  console.log('13. Loading route: auth...');
  app.use('/api/auth', require('./routes/auth'));
  
  console.log('14. Loading route: appointments...');
  app.use('/api/appointments', require('./routes/appointments'));
  
  console.log('15. Loading route: users...');
  app.use('/api/users', require('./routes/users'));
  
  console.log('16. Loading route: services...');
  app.use('/api/services', require('./routes/services'));
  
  console.log('17. Loading route: contact...');
  app.use('/api/contact', require('./routes/contact'));
  
  console.log('18. Setting up health check...');
  app.get('/api/health', (req, res) => {
    res.json({ 
      message: 'SHRM Counseling API is running',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    });
  });
  
  console.log('19. Setting up error handling...');
  app.use((err, req, res, next) => {
    console.error('Express error handler caught:', err);
    res.status(500).json({ 
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
  });
  
  console.log('20. Setting up 404 handler...');
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  console.log('21. Starting server...');
  app.listen(PORT, () => {
    console.log(`✅ SHRM Counseling Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎉 Server started successfully - no crashes detected!`);
  });
  
} catch (error) {
  console.error('\n❌ STARTUP ERROR:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}