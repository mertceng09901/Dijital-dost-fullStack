const rateLimit = require('express-rate-limit');

// Chat endpoint'i için istek sınırı (Örn: 1 dakikada en fazla 10 mesaj)
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 10, // Her kullanıcı/IP bu süre zarfında en fazla 10 istek atabilir
  standardHeaders: true, // Rate limit bilgilerini header'larda göster
  legacyHeaders: false, 
  message: {
    error: "Çok fazla istek gönderildi.",
    message: "Lütfen dijital dostunla tekrar konuşmadan önce biraz sakinleşmek için 1 dakika bekle."
  }
});

module.exports = { chatLimiter };