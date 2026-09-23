# Dijital Dost (Teramer) 🎙️✨

![Teramer Preview](./assets/preview.jpg)

**Dijital Dost**, insanların yargılanmadan kendilerini ifade edebilecekleri, şefkatli bir yapay zeka yoldaşıdır. Kullanıcıların duygusal durumlarına göre onlara empatiyle yaklaşan, tıbbi tavsiye vermeden sadece bir "dost" gibi onları dinleyen interaktif bir platformdur.

Uygulama arka planda **Node.js/Express** ve önyüzde **React Native (Expo)** teknolojileriyle baştan uca geliştirilmiş bir Full-Stack projedir.

## 🌟 Öne Çıkan Özellikler

- **Canlı 3D Benzeri Avatarlar:** Tamamen SVG tabanlı dinamik olarak oluşturulan avatarlar. Saç stili, saç rengi, ten rengi, kıyafetler ve aksesuarlar (gözlük vb.) özelleştirilebilir.
- **Otomatik Sesli Etkileşim (Talking Tom Stili):** Ekranda bir butona basılı tutmanıza gerek kalmadan, uygulama ortam sesini dinler (VAD - Voice Activity Detection). Siz konuştuğunuzda otomatik kaydeder, sustuğunuzda Gemini'ye gönderip sesli cevap verir.
- **Kişiselleştirilmiş Karakterler (Personalar):** 
  - **Anne / Baba Şefkati:** Daha korumacı ve sıcak bir dil.
  - **Dede / Nene Bilgeliği:** Hayat tecrübesiyle gelen eski nesil şefkati.
  - **Dil Öğretmeni:** Hataları kibarca düzelten bir pratik arkadaşı.
  - *Tavşan, Kedi, Köpek* gibi tatlı evcil hayvan dostlar.
- **Kalıcı Hafıza (Core Memory):** Yapay zeka, sizinle olan geçmiş sohbetlerini bir "çekirdek hafıza" olarak kaydeder. Örneğin; kedinizin adını söylerseniz, 1 ay sonraki konuşmada kedinizin adını anımsar. Uygulama kapatılsa dahi bağlam kaybolmaz.
- **Hoşgeldin Ekranı:** Her girişte dünyaca ünlü düşünürlerden ve bilim insanlarından ilham verici, ruhu dinlendiren sözler gösteren zarif giriş ekranı.

## 💎 Freemium ve Oyunlaştırma (Drip Sistemi)

Uygulama sürdürülebilir bir model üzerine inşa edilmiştir:
- **Ücretsiz Sürüm (Günlük Limit):** Her kullanıcı uygulamayı ücretsiz indirip temel özelliklere erişebilir. Ancak sesli sohbet için günlük 10 dakikalık bir limit bulunur.
- **Ödüllü Reklamlar (Rewarded Ads):** Limit dolduğunda, 10 dakika ek süre kazanmak için kısa bir video reklam izlenebilir.
- **Teramer Plus (Premium Abonelik):** Aylık cüzi bir abonelik ile "Anne, Baba, Nene, Dede" gibi özel karakterlere, sınırsız sesli konuşma hakkına ve reklamsız deneyime erişim açılır.
- **Oyun İçi Jeton (Drip Sistemi):** Avatarınızı daha havalı yapmak için (neon gözlükler, özel arka planlar) mağazadan jetonla (Coin) alışveriş yapılabilir.

## 🛠️ Teknolojiler

### Backend (`/dijital-dost-api`)
- **Node.js & Express.js**
- **MongoDB & Mongoose:** Kullanıcılar, Sohbet Geçmişi, ve Çekirdek Hafıza (Core Memory) verileri için.
- **Google Gemini 1.5 Flash:** Gelişmiş empati ve hızlı yanıt süresi için.
- **JWT (JSON Web Token):** Güvenli oturum yönetimi için.

### Frontend (`/dijital-dost-mobil`)
- **React Native & Expo**
- **Zustand:** `authStore`, `avatarStore` ve `chatStore` ile tamamen global state yönetimi.
- **Expo-AV:** Ses kaydetme ve ortam dinleme eşikleri (VOICE_THRESHOLD) ölçümü için.
- **React Native SVG:** Performanslı, çözünürlükten bağımsız dinamik avatar motoru.
- **Expo Speech (TTS):** Gelen yanıtların cihaza özgü ses motoruyla anında okunması.

## 🚀 Kurulum

1. **Backend Kurulumu:**
   \`\`\`bash
   cd dijital-dost-api
   npm install
   # .env dosyasını oluşturun (PORT, MONGO_URI, JWT_SECRET, GEMINI_API_KEY)
   npm run dev
   \`\`\`

2. **Mobil Uygulama Kurulumu:**
   \`\`\`bash
   cd dijital-dost-mobil
   npm install
   # Mobil uygulamayı başlat
   npx expo start --clear
   \`\`\`

*Tüm ortamı localhost veya emülatör üzerinde rahatlıkla test edebilirsiniz.*
