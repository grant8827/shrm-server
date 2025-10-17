console.log('Step 1: Starting basic test...');

try {
  console.log('Step 2: Testing dotenv...');
  require('dotenv').config();
  console.log('Step 3: dotenv loaded successfully');
  
  console.log('Step 4: Testing express...');
  const express = require('express');
  console.log('Step 5: express loaded successfully');
  
  console.log('Step 6: Creating app...');
  const app = express();
  console.log('Step 7: app created successfully');
  
  console.log('Step 8: Setting up basic route...');
  app.get('/test', (req, res) => {
    res.json({ message: 'test' });
  });
  console.log('Step 9: route set up successfully');
  
  console.log('Step 10: Starting server...');
  const server = app.listen(5001, () => {
    console.log('✅ SUCCESS: Basic server running on port 5001');
    server.close();
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ ERROR at step:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}