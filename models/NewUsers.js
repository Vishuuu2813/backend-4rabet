// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false // Optional as per existing form
  },
  mobileNumber: {
    type: String,
    required: true
  },
  withdrawalAmount: {
    type: Number,
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NewUsers', UserSchema);
