const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
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
    required: true,
    trim: true
  }
}, { 
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('User', userSchema);
