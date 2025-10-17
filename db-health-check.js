const mongoose = require('mongoose');
require('dotenv').config();

const checkDatabase = async () => {
  try {
    console.log('🔍 SHRM MongoDB Health Check');
    console.log('================================');
    
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connection successful');
    
    const db = mongoose.connection.db;
    console.log(`📊 Database: ${db.databaseName}`);
    
    // Check server status
    const serverStatus = await db.admin().serverStatus();
    console.log(`🖥️  Server version: ${serverStatus.version}`);
    console.log(`⏰ Server uptime: ${Math.floor(serverStatus.uptime / 3600)} hours`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections:');
    if (collections.length === 0) {
      console.log('   No collections found (database is empty)');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} documents`);
      }
    }
    
    // Check indexes
    console.log('\n🔍 Indexes:');
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      console.log(`   ${collection.name}:`);
      indexes.forEach(index => {
        console.log(`     - ${JSON.stringify(index.key)}`);
      });
    }
    
    // Test CRUD operations
    console.log('\n🧪 Testing CRUD operations...');
    const testCollection = db.collection('healthcheck');
    
    // Create
    const insertResult = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'SHRM health check'
    });
    console.log('✅ Create operation successful');
    
    // Read
    const document = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Read operation successful');
    
    // Update
    await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { updated: true } }
    );
    console.log('✅ Update operation successful');
    
    // Delete
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Delete operation successful');
    
    // Clean up test collection
    await testCollection.drop().catch(() => {}); // Ignore error if collection doesn't exist
    
    console.log('\n🎉 Database health check completed successfully!');
    console.log('💚 MongoDB is ready for SHRM Counseling Website');
    
  } catch (error) {
    console.error('\n❌ Database health check failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 Network issue: Cannot reach MongoDB server');
    } else if (error.message.includes('authentication')) {
      console.error('🔐 Authentication issue: Check username/password');
    } else if (error.message.includes('timeout')) {
      console.error('⏱️  Timeout issue: MongoDB server not responding');
    }
    
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

checkDatabase();