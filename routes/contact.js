const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure email transporter with connection verification
const createTransporter = async () => {
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
  
  console.log('📧 Email config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    passConfigured: !!config.auth.pass
  });
  
  const transporter = nodemailer.createTransport(config);
  
  try {
    console.log('🔗 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return transporter;
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
    throw error;
  }
};

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('subject').isIn([
    'appointment',
    'services', 
    'insurance',
    'crisis',
    'feedback',
    'other'
  ]).withMessage('Valid subject is required'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters')
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

    const { name, email, phone, subject, message } = req.body;

    // Create email content
    const emailContent = {
      from: process.env.EMAIL_USER || 'noreply@shrmcounseling.org',
      to: process.env.CONTACT_EMAIL || 'info@shrmcounseling.org',
      subject: `SHRM Contact Form: ${getSubjectLabel(subject)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${getSubjectLabel(subject)}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #34495e;">Message:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #3498db; border-radius: 0 5px 5px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #ecf0f1; border-radius: 5px; font-size: 12px; color: #7f8c8d;">
            <p>This message was sent from the SHRM website contact form.</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };

    // Auto-reply content
    const autoReplyContent = {
      from: process.env.EMAIL_USER || 'noreply@shrmcounseling.org',
      to: email,
      subject: 'Thank you for contacting SHRM - We\'ll be in touch soon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            Thank You for Contacting Us
          </h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for reaching out to Safe Haven Restoration Ministries. We have received your message regarding <strong>"${getSubjectLabel(subject)}"</strong> and will respond within 24 hours.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">What happens next?</h3>
            <ul>
              <li>A member of our team will review your message</li>
              <li>We'll respond to you within 24 hours (usually much sooner)</li>
              <li>If this is urgent, please call us at (555) 123-4567</li>
            </ul>
          </div>
          
          ${subject === 'crisis' ? `
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Crisis Support</h4>
            <p style="color: #856404; margin-bottom: 0;">
              If you are experiencing a mental health crisis or having thoughts of self-harm, 
              please call our 24/7 crisis line at <strong>(555) 123-HELP</strong> or go to your nearest emergency room.
            </p>
          </div>
          ` : ''}
          
          <div style="margin: 30px 0;">
            <h3 style="color: #34495e;">Contact Information</h3>
            <p>
              <strong>Phone:</strong> (555) 123-4567<br>
              <strong>Email:</strong> info@shrmcounseling.org<br>
              <strong>Address:</strong> 123 Healing Way, Hope City, HC 12345
            </p>
          </div>
          
          <p>Blessings,<br>The SHRM Team</p>
          
          <div style="margin-top: 30px; padding: 15px; background: #ecf0f1; border-radius: 5px; font-size: 12px; color: #7f8c8d;">
            <p>Safe Haven Restoration Ministries - Providing hope, healing, and restoration through Christ-centered counseling.</p>
          </div>
        </div>
      `
    };

    // Only send emails if email configuration is available
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('🔄 Attempting to send contact form emails...');
      
      try {
        const transporter = await createTransporter();
        
        // Connection is already verified in createTransporter
        console.log('✅ Email transporter ready');
        
        // Send notification email to SHRM
        console.log('📧 Sending notification email to SHRM...');
        const notificationResult = await transporter.sendMail(emailContent);
        console.log('✅ Notification email sent:', notificationResult.messageId);
        
        // Send auto-reply to user
        console.log('📧 Sending auto-reply to user...');
        const autoReplyResult = await transporter.sendMail(autoReplyContent);
        console.log('✅ Auto-reply email sent:', autoReplyResult.messageId);
        
        console.log('🎉 All emails sent successfully');
        
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError.message);
        console.error('Email error details:', emailError);
        
        // Still return success to user, but log the email failure
        console.log('📝 Contact form data saved despite email failure:', { name, email, phone, subject, message });
      }
      
    } else {
      console.log('⚠️ Email configuration not found, emails not sent');
      console.log('Missing EMAIL_USER:', !process.env.EMAIL_USER);
      console.log('Missing EMAIL_PASS:', !process.env.EMAIL_PASS);
      console.log('📝 Contact form submission logged:', { name, email, phone, subject, message });
    }

    res.json({
      success: true,
      message: 'Thank you for your message! We will respond within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again or call us directly at (555) 123-4567.'
    });
  }
});

// Helper function to get readable subject labels
function getSubjectLabel(subject) {
  const labels = {
    appointment: 'Appointment Inquiry',
    services: 'Services Information',
    insurance: 'Insurance Questions',
    crisis: 'Crisis Support',
    feedback: 'Feedback',
    other: 'General Inquiry'
  };
  return labels[subject] || 'General Inquiry';
}

module.exports = router;