const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting SHRM server...');
console.log('Environment variables loaded:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Basic middleware
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error caught by middleware:', err);
  res.status(500).json({ error: err.message });
});

console.log('Setting up server listener...');

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/test`);
});

console.log('Server setup complete');