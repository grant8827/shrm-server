const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const router = express.Router();

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// Configure email transporter
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST || 'webhosting2023.is.cc',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false, // Use STARTTLS for port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Accept self-signed certificates
    }
  };
  
  return nodemailer.createTransport(config);
};

// Helper function to send appointment emails
const sendAppointmentEmails = async (appointment, client, counselor) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Email configuration not found for appointment emails');
    return;
  }
  
  try {
    console.log('📧 Sending appointment confirmation emails...');
    const transporter = createTransporter();
    
    // Email to client
    const clientEmailContent = {
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'SHRM - Appointment Request Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3c4535; border-bottom: 2px solid #fac800; padding-bottom: 10px;">
            Appointment Request Received
          </h2>
          
          <p>Dear ${client.firstName} ${client.lastName},</p>
          
          <p>Thank you for scheduling an appointment with Safe Haven Restoration Ministries. We have received your request and will contact you within 24 hours to confirm your appointment details.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #3c4535; margin-top: 0;">Appointment Details</h3>
            <p><strong>Service:</strong> ${getServiceName(appointment.serviceType)}</p>
            <p><strong>Preferred Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <p><strong>Preferred Time:</strong> ${appointment.startTime}</p>
            <p><strong>Session Type:</strong> ${appointment.sessionType.replace('-', ' ')}</p>
            <p><strong>Counselor:</strong> ${counselor.firstName} ${counselor.lastName}</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #2d5a2d; margin-top: 0;">What's Next?</h4>
            <ul style="color: #2d5a2d;">
              <li>Our team will review your appointment request</li>
              <li>We'll call you within 24 hours to confirm the time and details</li>
              <li>You'll receive a final confirmation email with all the details</li>
            </ul>
          </div>
          
          <div style="margin: 30px 0;">
            <h3 style="color: #3c4535;">Contact Information</h3>
            <p>
              <strong>Phone:</strong> (555) 123-4567<br>
              <strong>Email:</strong> info@safehavenrestorationministries.com
            </p>
          </div>
          
          <p>Blessings,<br>The SHRM Team</p>
          
          <div style="margin-top: 30px; padding: 15px; background: #f5f5f5; border-radius: 5px; font-size: 12px; color: #666;">
            <p>Safe Haven Restoration Ministries - Providing hope, healing, and restoration through Christ-centered counseling.</p>
          </div>
        </div>
      `
    };
    
    // Email to admin/counselor
    const adminEmailContent = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: 'SHRM - New Appointment Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3c4535; border-bottom: 2px solid #fac800; padding-bottom: 10px;">
            New Appointment Request
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #3c4535; margin-top: 0;">Client Information</h3>
            <p><strong>Name:</strong> ${client.firstName} ${client.lastName}</p>
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Phone:</strong> ${client.phone}</p>
            ${client.dateOfBirth ? `<p><strong>Date of Birth:</strong> ${new Date(client.dateOfBirth).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Appointment Details</h3>
            <p><strong>Service Type:</strong> ${getServiceName(appointment.serviceType)}</p>
            <p><strong>Preferred Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <p><strong>Preferred Time:</strong> ${appointment.startTime}</p>
            <p><strong>Session Type:</strong> ${appointment.sessionType.replace('-', ' ')}</p>
            <p><strong>Assigned Counselor:</strong> ${counselor.firstName} ${counselor.lastName}</p>
            ${appointment.isEmergency ? '<p style="color: #dc3545;"><strong>⚠️ EMERGENCY REQUEST</strong></p>' : ''}
          </div>
          
          ${appointment.notes.client ? `
          <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #1565c0; margin-top: 0;">Client Notes</h3>
            <p>${appointment.notes.client}</p>
          </div>
          ` : ''}
          
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Action Required</h4>
            <p>Please contact the client within 24 hours to confirm the appointment details.</p>
            <p><strong>Appointment ID:</strong> ${appointment._id}</p>
          </div>
        </div>
      `
    };
    
    // Send both emails
    await transporter.sendMail(clientEmailContent);
    console.log('✅ Client confirmation email sent');
    
    await transporter.sendMail(adminEmailContent);
    console.log('✅ Admin notification email sent');
    
  } catch (emailError) {
    console.error('❌ Failed to send appointment emails:', emailError.message);
  }
};

// Helper function to get service name
const getServiceName = (serviceType) => {
  const serviceNames = {
    'individual-counseling': 'Individual Counseling',
    'couples-counseling': 'Couples Counseling',
    'family-counseling': 'Family Counseling',
    'group-therapy': 'Group Therapy',
    'crisis-intervention': 'Crisis Intervention',
    'addiction-counseling': 'Addiction Counseling',
    'grief-counseling': 'Grief Counseling',
    'youth-counseling': 'Youth Counseling'
  };
  return serviceNames[serviceType] || serviceType;
};

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Public (for appointment requests) / Private (for confirmed appointments)
router.post('/', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('serviceType').isIn([
    'individual-counseling',
    'couples-counseling', 
    'family-counseling',
    'group-therapy',
    'crisis-intervention'
  ]).withMessage('Valid service type is required'),
  body('preferredDate').isISO8601().withMessage('Valid date is required'),
  body('preferredTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required'),
  body('sessionType').isIn(['in-person', 'video-call', 'phone-call']).withMessage('Valid session type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors',
        errors: errors.array() 
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      serviceType,
      preferredDate,
      preferredTime,
      sessionType,
      message
    } = req.body;

    // Check if user exists, create if not
    let client = await User.findOne({ email });
    if (!client) {
      client = new User({
        firstName,
        lastName,
        email,
        phone,
        password: Math.random().toString(36).slice(-8), // Temporary password
        role: 'client'
      });
      await client.save();
    }

    // Find an available counselor (for now, just get the first counselor)
    const counselor = await User.findOne({ role: 'counselor', isActive: true });
    if (!counselor) {
      return res.status(400).json({
        success: false,
        message: 'No counselors available at this time. Please call us directly.'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      client: client._id,
      counselor: counselor._id,
      serviceType,
      appointmentDate: new Date(preferredDate),
      startTime: preferredTime,
      endTime: addHourToTime(preferredTime), // Default 1 hour session
      sessionType,
      status: 'scheduled',
      notes: {
        client: message || ''
      }
    });

    await appointment.save();

    // Populate the appointment with user details
    await appointment.populate(['client', 'counselor']);

    // Send appointment confirmation emails
    console.log('📧 Sending appointment confirmation emails...');
    await sendAppointmentEmails(appointment, appointment.client, appointment.counselor);

    res.json({
      success: true,
      message: 'Appointment request submitted successfully. We will contact you within 24 hours to confirm.',
      appointment: appointment
    });

  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing appointment request'
    });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments (filtered by user role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = {};

    // Filter appointments based on user role
    if (role === 'client') {
      query.client = id;
    } else if (role === 'counselor') {
      query.counselor = id;
    }
    // Admin can see all appointments (no filter)

    const appointments = await Appointment.find(query)
      .populate('client', 'firstName lastName email phone')
      .populate('counselor', 'firstName lastName email specializations')
      .sort({ appointmentDate: 1, startTime: 1 });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments'
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'firstName lastName email phone')
      .populate('counselor', 'firstName lastName email specializations');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to view this appointment
    const { role, id } = req.user;
    if (role === 'client' && appointment.client._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    if (role === 'counselor' && appointment.counselor._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment'
    });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private (counselor/admin only)
router.put('/:id/status', [auth, 
  body('status').isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'])
    .withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors',
        errors: errors.array() 
      });
    }

    const { role } = req.user;
    if (role === 'client') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { status, cancelReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    if (status === 'cancelled' && cancelReason) {
      appointment.cancelReason = cancelReason;
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment status'
    });
  }
});

// Helper function to add an hour to time string
function addHourToTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newHours = (hours + 1) % 24;
  return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

module.exports = router;