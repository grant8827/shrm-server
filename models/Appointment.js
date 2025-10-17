const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required']
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Counselor is required']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'individual-counseling',
      'couples-counseling',
      'family-counseling',
      'group-therapy',
      'crisis-intervention',
      'addiction-counseling',
      'grief-counseling',
      'youth-counseling'
    ]
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  duration: {
    type: Number,
    default: 60, // minutes
    min: [30, 'Minimum session duration is 30 minutes'],
    max: [180, 'Maximum session duration is 180 minutes']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  sessionType: {
    type: String,
    enum: ['in-person', 'video-call', 'phone-call'],
    default: 'in-person'
  },
  location: {
    type: String,
    default: 'SHRM Office'
  },
  notes: {
    client: {
      type: String,
      maxlength: [500, 'Client notes cannot exceed 500 characters']
    },
    counselor: {
      type: String,
      maxlength: [1000, 'Counselor notes cannot exceed 1000 characters']
    },
    admin: {
      type: String,
      maxlength: [500, 'Admin notes cannot exceed 500 characters']
    }
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  cancelReason: {
    type: String,
    maxlength: [200, 'Cancel reason cannot exceed 200 characters']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly']
    },
    endDate: Date,
    occurrences: Number
  },
  fee: {
    amount: {
      type: Number,
      min: [0, 'Fee amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived', 'partial'],
      default: 'pending'
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
appointmentSchema.index({ client: 1, appointmentDate: 1 });
appointmentSchema.index({ counselor: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ status: 1 });

// Validate appointment time logic
appointmentSchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    return next(new Error('End time must be after start time'));
  }
  
  // Calculate duration
  this.duration = endMinutes - startMinutes;
  next();
});

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.appointmentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted time range
appointmentSchema.virtual('timeRange').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

module.exports = mongoose.model('Appointment', appointmentSchema);