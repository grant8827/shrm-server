const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Function to find available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    
    server.listen(startPort, (err) => {
      if (err) {
        server.close();
        resolve(findAvailablePort(startPort + 1));
      } else {
        const port = server.address().port;
        server.close();
        resolve(port);
      }
    });
    
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
};

const startServer = async () => {
  try {
    console.log('🚀 Starting SHRM Counseling Server...');
    
    // Find available port starting from preferred port
    const preferredPort = process.env.PORT || 5001;
    const availablePort = await findAvailablePort(parseInt(preferredPort));
    
    if (availablePort !== parseInt(preferredPort)) {
      console.log(`⚠️  Port ${preferredPort} is busy, using port ${availablePort} instead`);
    }
    
    // Security middleware
    app.use(helmet());
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100
    });
    app.use(limiter);
    
    // CORS
    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }));
    
    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // MongoDB connection
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Routes
    console.log('🛣️  Setting up routes...');
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/appointments', require('./routes/appointments'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/services', require('./routes/services'));
    app.use('/api/contact', require('./routes/contact'));
    
    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ 
        message: 'SHRM Counseling API is running',
        timestamp: new Date().toISOString(),
        status: 'healthy',
        port: availablePort,
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      });
    });
    
    // Error handling
    app.use((err, req, res, next) => {
      console.error('Server error:', err.message);
      res.status(500).json({ 
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
      });
    });
    
    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ 
        success: false,
        message: 'Route not found' 
      });
    });
    
    // Start server
    app.listen(availablePort, () => {
      console.log(`✅ SHRM Counseling Server running on port ${availablePort}`);
      console.log(`🌐 Health check: http://localhost:${availablePort}/api/health`);
      console.log(`📋 API base URL: http://localhost:${availablePort}/api`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      if (availablePort !== parseInt(preferredPort)) {
        console.log(`\n⚠️  IMPORTANT: Update your frontend API URL to: http://localhost:${availablePort}/api`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Received SIGTERM, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Received SIGINT, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});

startServer();