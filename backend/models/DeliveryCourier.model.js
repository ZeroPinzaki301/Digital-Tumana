import mongoose from "mongoose";

const deliveryCourierSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 18
  },
  birthdate: {
    type: Date,
    required: true
  },
  houseNo: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  barangay: {
    type: String,
    required: true
  },
  municipality: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  facebookLink: {
    type: String
  },
  profilePicture: {
    type: String,
    default: "default-profile.png"
  },
  loginCode: {
    type: String,
    required: true,
    unique: true,
    default: () => generateLoginCode()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Simple synchronous code generator
function generateLoginCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let code = '';
  
  // Generate 4 random letters
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Generate 4 random digits
  for (let i = 0; i < 4; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  
  return code;
}

// Async pre-save hook for uniqueness validation
deliveryCourierSchema.pre('save', async function(next) {
  if (!this.isNew || this.loginCode) return next();
  
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (!isUnique && attempts < maxAttempts) {
    attempts++;
    this.loginCode = generateLoginCode();
    
    try {
      const existing = await mongoose.model('DeliveryCourier').findOne({ 
        loginCode: this.loginCode 
      });
      if (!existing) {
        isUnique = true;
      }
    } catch (err) {
      return next(err);
    }
  }

  if (!isUnique) {
    return next(new Error('Failed to generate unique login code'));
  }

  next();
});

const DeliveryCourier = mongoose.model("DeliveryCourier", deliveryCourierSchema);
export default DeliveryCourier