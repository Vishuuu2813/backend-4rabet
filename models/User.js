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
    type: String, 
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);
