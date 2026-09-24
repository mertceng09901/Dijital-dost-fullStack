const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name:     { type: String, required: true },
  deviceId: { type: String, unique: true, sparse: true },
  username: { type: String },

  // ── Abonelik & Ekonomi ──────────────────────────────────────────────────────
  isPremium:          { type: Boolean, default: false },
  premiumExpiresAt:   { type: Date, default: null },
  coins:              { type: Number, default: 0 },
  voiceMinutesLeft:   { type: Number, default: 10 },
  lastVoiceResetDate: { type: Date, default: Date.now },

  // ── Avatar Konfigürasyonu (Aktif 3D GLB URL) ─────────────────────────
  avatarUrl: { type: String, default: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },

  // ── Mekan + Eşya Sistemi ────────────────────────────────────────────────────
  // Mixed tipi: { scene: 'room', items: { sofa: { variant: 'sofa_01', color: '#4A6FA5' }, ... } }
  sceneConfig: {
    type:    mongoose.Schema.Types.Mixed,
    default: { scene: 'room', items: {} },
  },

  // ── Seçili Dijital Dost Karakteri ──────────────────────────────────────────
  // girl|boy: ücretsiz  —  mother|father|grandma|grandpa: premium
  species: { type: String, default: 'girl' },
  role:    { type: String, default: 'friend' },

  // ── Sistem ────────────────────────────────────────────────────────────────
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);