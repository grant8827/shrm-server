console.log('Testing individual route imports...');

try {
  console.log('1. Loading basic dependencies...');
  require('dotenv').config();
  const express = require('express');
  const app = express();
  
  console.log('2. Testing auth route import...');
  const authRoute = require('./routes/auth');
  app.use('/api/auth', authRoute);
  console.log('✅ Auth route imported successfully');
  
  console.log('3. Testing appointments route import...');
  const appointmentsRoute = require('./routes/appointments');
  app.use('/api/appointments', appointmentsRoute);
  console.log('✅ Appointments route imported successfully');
  
  console.log('4. Testing users route import...');
  const usersRoute = require('./routes/users');
  app.use('/api/users', usersRoute);
  console.log('✅ Users route imported successfully');
  
  console.log('5. Testing services route import...');
  const servicesRoute = require('./routes/services');
  app.use('/api/services', servicesRoute);
  console.log('✅ Services route imported successfully');
  
  console.log('6. Testing contact route import...');
  const contactRoute = require('./routes/contact');
  app.use('/api/contact', contactRoute);
  console.log('✅ Contact route imported successfully');
  
  console.log('7. Testing middleware import...');
  const auth = require('./middleware/auth');
  console.log('✅ Auth middleware imported successfully');
  
  console.log('8. Testing models import...');
  const User = require('./models/User');
  const Appointment = require('./models/Appointment');
  console.log('✅ Models imported successfully');
  
  console.log('🎉 ALL IMPORTS SUCCESSFUL! Issue might be in server startup...');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Import failed at step:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}