console.log('Testing MongoDB connection specifically...');

try {
  console.log('1. Loading dotenv...');
  require('dotenv').config();
  
  console.log('2. Environment check:');
  console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
  
  console.log('3. Loading mongoose...');
  const mongoose = require('mongoose');
  
  console.log('4. Testing connection string...');
  const uri = process.env.MONGODB_URI;
  console.log('   URI format looks valid:', uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
  
  console.log('5. Attempting connection (with timeout)...');
  
  const connectWithTimeout = async () => {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });
      console.log('✅ MongoDB connected successfully!');
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected successfully!');
      process.exit(0);
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  };
  
  connectWithTimeout();
  
} catch (error) {
  console.error('❌ Error in MongoDB test:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}