const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT token
const auth = require('../middleware/auth');

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