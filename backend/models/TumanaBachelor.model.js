import mongoose from 'mongoose';

const tumanaBachelorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // ensures one bachelor record per user
  },

  firstName: {
    type: String,
    required: true,
    trim: true
  },

  lastName: {
    type: String,
    required: true,
    trim: true
  },

  profilePicture: {
    type: String,
    default: 'default-profile.png' // fallback image if none is uploaded
  }

}, { timestamps: true });

const TumanaBachelor = mongoose.model('TumanaBachelor', tumanaBachelorSchema);
export default TumanaBachelor;