const mongoose = require('mongoose');
require('dotenv').config();

// Import your models
const User = require('./models/User');
const Appointment = require('./models/Appointment');

// MongoDB Migration Script for SHRM Counseling Website
console.log('🚀 Starting MongoDB Migration for SHRM...');

const connectDB = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Database name:', db.databaseName);
    console.log('📋 Existing collections:', collections.map(c => c.name));
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    console.log('🔍 Creating database indexes...');
    
    // User model indexes
    await User.createIndexes();
    console.log('✅ User indexes created');
    
    // Appointment model indexes  
    await Appointment.createIndexes();
    console.log('✅ Appointment indexes created');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

const seedInitialData = async () => {
  try {
    console.log('🌱 Checking for initial data...');
    
    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('👤 Creating default admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        firstName: 'SHRM',
        lastName: 'Administrator',
        email: 'admin@safehavenrestorationministries.com',
        password: hashedPassword,
        role: 'admin',
        phone: '(555) 123-4567',
        isActive: true,
        isEmailVerified: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@safehavenrestorationministries.com');
      console.log('🔐 Password: admin123 (Change immediately!)');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Check if counselor user exists
    const counselorExists = await User.findOne({ role: 'counselor' });
    if (!counselorExists) {
      console.log('👩‍⚕️ Creating default counselor user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('counselor123', 12);
      
      const counselorUser = new User({
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        email: 'counselor@safehavenrestorationministries.com',
        password: hashedPassword,
        role: 'counselor',
        phone: '(555) 123-4568',
        isActive: true,
        isEmailVerified: true,
        profile: {
          specializations: ['Individual Counseling', 'Family Therapy', 'Trauma Recovery'],
          bio: 'Licensed professional counselor with 10+ years of experience in faith-based counseling.',
          education: ['M.A. in Clinical Psychology', 'Licensed Professional Counselor (LPC)'],
          availability: {
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '15:00' }
          }
        }
      });
      
      await counselorUser.save();
      console.log('✅ Counselor user created successfully');
      console.log('📧 Email: counselor@safehavenrestorationministries.com');
      console.log('🔐 Password: counselor123 (Change immediately!)');
    } else {
      console.log('✅ Counselor user already exists');
    }
    
  } catch (error) {
    console.error('❌ Error seeding initial data:', error.message);
  }
};

const verifyMigration = async () => {
  try {
    console.log('🔍 Verifying migration...');
    
    const userCount = await User.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    
    console.log(`👥 Total users: ${userCount}`);
    console.log(`📅 Total appointments: ${appointmentCount}`);
    
    // Test data operations
    console.log('🧪 Testing data operations...');
    
    // Test user creation
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'hashedpassword',
      role: 'client'
    });
    
    await testUser.save();
    console.log('✅ User creation test passed');
    
    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ User deletion test passed');
    
    console.log('🎉 Migration verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration verification failed:', error.message);
  }
};

const runMigration = async () => {
  try {
    const db = await connectDB();
    await createIndexes();
    await seedInitialData();
    await verifyMigration();
    
    console.log('🎉 MongoDB migration completed successfully!');
    console.log('🔗 Database URL:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    console.log('📊 Database ready for SHRM Counseling Website');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration
runMigration();