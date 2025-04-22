const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  withdrawalAmount: {
    type: Number,
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  timestamp: {
    type: String, // Store as string to preserve formatted date
    required: true
  }
}, {
  timestamps: false // Disable automatic timestamps
});
module.exports = mongoose.model('User', userSchema);
