import mongoose from 'mongoose';

const tesdaEnrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  firstName: {
    type: String,
    required: true,
    trim: true
  },

  middleName: {
    type: String,
    trim: true
  },

  lastName: {
    type: String,
    required: true,
    trim: true
  },

  birthdate: {
    type: Date,
    required: true
  },

  birthCertImage: {
    type: String,
    required: true // Cloudinary or file path
  },

  validIdImage: {
    type: String,
    required: true
  },

  secondValidIdImage: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'eligible', 'reserved', 'enrolled', 'graduated', 'cancelled'],
    default: 'pending'
  }

}, { timestamps: true });

const TesdaEnrollment = mongoose.model('TesdaEnrollment', tesdaEnrollmentSchema);
export default TesdaEnrollment;