import mongoose from 'mongoose';

const DefaultIdCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  idType: {
    type: String,
    enum: ["National ID", "Passport", "Driver's License"],
    required: true
  },
  idImage: {
    type: String,
    required: true
  },
  secondIdType: {
    type: String,
    enum: [
      "National ID", 
      "Passport", 
      "Driver's License", 
      "PhilHealth ID", 
      "UMID", 
      "SSS ID", 
      "Barangay ID", 
      "Postal ID", 
      "Voter's ID", 
      "Senior Citizen ID", 
      "PRC ID", 
      "Company ID", 
      "School ID", 
      "TIN ID"
    ]
  },
  secondIdImage: {
    type: String
  }
}, {
  timestamps: true
});

// Create a compound index to ensure one default ID card per user
DefaultIdCardSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('DefaultIdCard', DefaultIdCardSchema);
