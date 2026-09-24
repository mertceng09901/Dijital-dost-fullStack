const User = require('../models/User');
const CoreMemory = require('../models/CoreMemory');

// Premium olmadan erişilemeyen karakter türleri
const PREMIUM_SPECIES = ['mother', 'father', 'grandma', 'grandpa'];

// ── Hesabı sil ────────────────────────────────────────────────────────────────
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    await CoreMemory.deleteMany({ userId });
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.status(200).json({ success: true, message: 'Hesabınız ve tüm anılarınız kalıcı olarak silindi.' });
  } catch (error) {
    console.error('Silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// ── Avatar güncelle ───────────────────────────────────────────────────────────
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { avatarUrl, sceneConfig, species, role } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    // Premium karakter koruma kontrolü
    if (species && PREMIUM_SPECIES.includes(species) && !user.isPremium) {
      return res.status(403).json({
        error: 'PremiumRequired',
        message: `"${species}" karakteri sadece Premium üyelere özeldir. Teramer Plus'a geçerek tüm karakterlere erişebilirsin.`
      });
    }

    const updateFields = {};
    if (avatarUrl   !== undefined) updateFields['avatarUrl']   = avatarUrl;
    if (sceneConfig !== undefined) updateFields['sceneConfig'] = sceneConfig;
    if (species     !== undefined) updateFields['species']     = species;
    if (role        !== undefined) updateFields['role']        = role;

    const updated = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

    res.status(200).json({
      success: true,
      avatarUrl:   updated.avatarUrl,
      sceneConfig: updated.sceneConfig,
    });
  } catch (error) {
    console.error('Avatar güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// ── Profil bilgisi getir ──────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// ── Coin satın al (simüle) ────────────────────────────────────────────────────
exports.purchaseCoins = async (req, res) => {
  try {
    const userId  = req.user.userId;
    const { amount } = req.body; // Gerçek uygulamada App Store receipt doğrulaması yapılır
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Geçersiz miktar.' });

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { coins: amount } },
      { new: true }
    );
    res.status(200).json({ success: true, coins: user.coins });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// ── Reklam izleyerek dakika kazan ─────────────────────────────────────────────
exports.earnVoiceMinutes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { minutesEarned = 10 } = req.body; // Gerçek uygulamada AdMob callback doğrulaması yapılır

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { voiceMinutesLeft: minutesEarned } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      voiceMinutesLeft: user.voiceMinutesLeft,
      message: `${minutesEarned} dakika sesli konuşma hakkı kazandın!`
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// ── Premium aktifleştir (simüle) ──────────────────────────────────────────────
exports.activatePremium = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Gerçek uygulamada: App Store/Google Play abonelik receipt doğrulaması
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const user = await User.findByIdAndUpdate(
      userId,
      { isPremium: true, premiumExpiresAt: expiresAt },
      { new: true }
    );
    res.status(200).json({
      success: true,
      isPremium:        user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      message:          'Teramer Plus aktifleştirildi! Tüm premium özellikler açıldı.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};