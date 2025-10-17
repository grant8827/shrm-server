const express = require('express');
const router = express.Router();

// @route   GET /api/services
// @desc    Get all counseling services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = [
      {
        id: 'individual-counseling',
        name: 'Individual Counseling',
        description: 'One-on-one sessions addressing personal challenges including anxiety, depression, trauma, grief, addiction recovery, and personal growth.',
        duration: 60,
        price: {
          standard: 100,
          sliding: true,
          insurance: true
        },
        specialties: [
          'Anxiety and Depression Treatment',
          'Trauma and PTSD Recovery',
          'Grief and Loss Counseling',
          'Addiction Recovery Support',
          'Life Transitions and Changes',
          'Spiritual Counseling'
        ],
        availability: 'Monday-Saturday',
        sessionTypes: ['in-person', 'video-call', 'phone-call']
      },
      {
        id: 'couples-counseling',
        name: 'Couples Counseling',
        description: 'Strengthen your marriage or relationship through improved communication, conflict resolution, and deeper intimacy.',
        duration: 90,
        price: {
          standard: 150,
          sliding: true,
          insurance: true
        },
        specialties: [
          'Communication Skills Development',
          'Conflict Resolution',
          'Intimacy and Connection',
          'Pre-marital Counseling',
          'Infidelity Recovery',
          'Christian Marriage Counseling'
        ],
        availability: 'Monday-Saturday',
        sessionTypes: ['in-person', 'video-call']
      },
      {
        id: 'family-counseling',
        name: 'Family Therapy',
        description: 'Help your family heal and restore healthy dynamics. We work with families to improve communication, resolve conflicts, and strengthen bonds.',
        duration: 90,
        price: {
          standard: 160,
          sliding: true,
          insurance: true
        },
        specialties: [
          'Parent-Child Relationships',
          'Sibling Conflicts',
          'Blended Family Challenges',
          'Teen and Adolescent Issues',
          'Family Crisis Intervention',
          'Christian Family Values'
        ],
        availability: 'Monday-Saturday',
        sessionTypes: ['in-person', 'video-call']
      },
      {
        id: 'group-therapy',
        name: 'Group Therapy',
        description: 'Connect with others who share similar experiences in a supportive group environment.',
        duration: 90,
        price: {
          standard: 50,
          sliding: true,
          insurance: true
        },
        specialties: [
          'Support Groups for Specific Issues',
          'Skills-Based Therapy Groups',
          'Recovery and Addiction Groups',
          'Grief and Loss Support',
          'Women\'s and Men\'s Groups',
          'Faith-Based Support Groups'
        ],
        availability: 'Monday-Friday evenings',
        sessionTypes: ['in-person']
      },
      {
        id: 'crisis-intervention',
        name: 'Crisis Intervention',
        description: 'Immediate support for individuals and families experiencing acute mental health crises.',
        duration: 60,
        price: {
          standard: 120,
          sliding: true,
          insurance: true
        },
        specialties: [
          '24/7 Crisis Hotline',
          'Emergency Counseling Sessions',
          'Safety Planning and Assessment',
          'Referral and Resource Coordination',
          'Follow-up Crisis Support',
          'Spiritual Crisis Support'
        ],
        availability: '24/7',
        sessionTypes: ['in-person', 'video-call', 'phone-call']
      }
    ];

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services'
    });
  }
});

// @route   GET /api/services/:id
// @desc    Get specific service details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    
    // This would typically come from a database
    const services = {
      'individual-counseling': {
        id: 'individual-counseling',
        name: 'Individual Counseling',
        description: 'Our individual counseling services provide a safe, confidential space for personal healing and growth. We integrate Christian principles with evidence-based therapeutic approaches to address a wide range of mental health concerns.',
        fullDescription: `
          Individual counseling at SHRM offers personalized support for those facing life's challenges. 
          Our licensed Christian counselors work with you to develop coping strategies, process difficult 
          emotions, and find hope and healing through faith-based therapeutic interventions.
          
          We address various concerns including anxiety, depression, trauma, grief, addiction recovery, 
          life transitions, and spiritual struggles. Each session is tailored to your unique needs and 
          incorporates both psychological best practices and Christian principles.
        `,
        duration: 60,
        price: {
          standard: 100,
          sliding: 'Available based on financial need',
          insurance: 'Most major insurance plans accepted'
        },
        process: [
          'Initial intake assessment (90 minutes)',
          'Treatment planning and goal setting',
          'Regular therapy sessions (weekly or bi-weekly)',
          'Progress review and plan adjustments',
          'Completion planning and aftercare'
        ],
        whatToExpect: [
          'Confidential, judgment-free environment',
          'Christian perspective integrated with clinical expertise',
          'Personalized treatment approach',
          'Homework assignments and practical tools',
          'Prayer and spiritual guidance when appropriate'
        ],
        idealFor: [
          'Adults facing anxiety, depression, or trauma',
          'Individuals seeking spiritual and emotional healing',
          'Those experiencing life transitions',
          'People struggling with addiction or grief',
          'Anyone seeking personal growth and development'
        ]
      }
      // Add other services as needed
    };

    const service = services[serviceId];
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service details'
    });
  }
});

// @route   GET /api/services/availability/:date
// @desc    Get available time slots for a specific date
// @access  Public
router.get('/availability/:date', async (req, res) => {
  try {
    const date = req.params.date;
    
    // This would typically check actual counselor schedules and existing appointments
    const availableSlots = [
      '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    res.json({
      success: true,
      date,
      availableSlots
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching availability'
    });
  }
});

module.exports = router;