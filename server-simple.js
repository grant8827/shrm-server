const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting SHRM server...');

// Basic middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Test MongoDB connection
console.log('📊 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  // Don't exit - let the server run without DB for testing
});

// Basic test routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'SHRM Server is running!',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Simple appointment test route (without full validation)
app.post('/api/appointments/test', (req, res) => {
  console.log('📝 Test appointment request received:', req.body);
  res.json({ 
    success: true,
    message: 'Test appointment endpoint working',
    received: req.body
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err.message);
  res.status(500).json({ 
    success: false,
    message: 'Server error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`✅ SHRM Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Test appointment: http://localhost:${PORT}/api/appointments/test`);
});