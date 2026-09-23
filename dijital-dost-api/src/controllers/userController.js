const User = require('../models/User');
const CoreMemory = require('../models/CoreMemory');

// Hesabı ve bağlı tüm hafıza verilerini kalıcı olarak silen fonksiyon
exports.deleteAccount = async (req, res) => {
  try {
    // ID'yi artık URL'den değil, authMiddleware tarafından doğrulanan token'dan alıyoruz
    const userId = req.user.userId;

    // 1. Dijital dostun oluşturduğu tüm anı özetlerini sil
    await CoreMemory.deleteMany({ userId: userId });

    // 2. Kullanıcı hesabını veritabanından kalıcı olarak sil
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    res.status(200).json({ 
      success: true, 
      message: "Hesabınız ve dijital dostunuzla olan tüm anılarınız kalıcı olarak silindi." 
    });

  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ error: "İşlem sırasında sunucu hatası oluştu." });
  }
};