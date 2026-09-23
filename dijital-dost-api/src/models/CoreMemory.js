const mongoose = require('mongoose');

const coreMemorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  summary: { 
    type: String, 
    required: true 
  },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CoreMemory', coreMemorySchema);
