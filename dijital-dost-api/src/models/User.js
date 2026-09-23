const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  deviceId: { type: String, unique: true, sparse: true }, // Optional for backward compat
  username: { type: String }, // Optional
  isPremium: { type: Boolean, default: false },
  coins: { type: Number, default: 0 },
  voiceMinutesLeft: { type: Number, default: 10 },
  lastVoiceResetDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);