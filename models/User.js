// models/User.js
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
    type: String, // Store as ISO string format
    required: true
  }
}, {
  timestamps: false // Disable automatic timestamps since we're using our custom timestamp
});

module.exports = mongoose.model('User', userSchema);
