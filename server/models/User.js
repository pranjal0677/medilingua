// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const historySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['term', 'report']
  },
  original: {
    type: String,
    required: true
  },
  simplified: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: false
  },
  history: [historySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;