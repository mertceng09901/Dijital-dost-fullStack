const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// En son mesajları çekmek için indeks
messageSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);
