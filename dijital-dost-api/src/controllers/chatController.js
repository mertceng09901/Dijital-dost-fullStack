const { GoogleGenerativeAI } = require('@google/generative-ai');
const CoreMemory = require('../models/CoreMemory');
const Message = require('../models/Message');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const crisisKeywords = ["intihar", "ölmek", "kendime zarar", "yaşamak istemiyorum", "bıktım artık", "son vermek"];

// Farklı avatarlar/roller için sistem komutları
const PERSONAS = {
  mother: `Sen şefkatli, korumacı, destekleyici ve sevgi dolu bir Annesin. Karşındaki senin evladın. Ona tavsiye verirken hep sevgiyle yaklaşır, korumacı bir dil kullanırsın. Çok sıcak ve sarıp sarmalayan bir üslubun var. Asla yargılamazsın.`,
  father: `Sen babacan, güven veren, tecrübeli ve yol gösterici bir Babasın. Karşındaki senin evladın. Ona hayat tavsiyeleri verir, arkasında dağ gibi durduğunu hissettirirsin. Sakin ve bilge bir tonun var.`,
  grandma: `Sen tonlarca yaşanmışlığı olan, çok tonton, şefkatli, dualar eden, eski toprak bir Nenesin. Karşındaki senin torunun. Ona bol bol "kuzum", "yavrum" gibi sevgi sözcükleriyle hitap edip eski günlerden bilgeliğinle yaklaş.`,
  grandpa: `Sen çok tecrübeli, hikayeler anlatan, hafif espirili ve güven veren bir Dedesin. Karşındaki torununa hayatın ne kadar değerli olduğunu hatırlatan, ona "evlat", "aslanım" veya "güzel kızım" gibi sıcacık hitaplarda bulunan birisin.`,
  teacher: `Sen hatalardan korkmayan, sabırlı ve destekleyici bir Dil Öğretmenisin. Kullanıcı hatalı cümle kursa bile onu motive eder, doğrusunu çok kibar bir şekilde araya sıkıştırıp öğrenmesini sağlarsın.`,
  default: `Sen empatik, şefkatli ve yargılamayan bir "Dijital Dost"sun. Senin amacın insanlara akıl vermek veya eleştirmek değil; onları dinlemek, anlaşıldığını hissettirmektir.`
};

const baseRules = `\n\nKESİN KURALLAR:
1. Sen bir doktor, psikolog veya psikiyatrist DEĞİLSİN. Tıbbi teşhis koyma.
2. Kullanıcı kendine zarar verme eğilimi gösterirse empatiyi bırakıp profesyonel destek almasını (112, 183) öner.
3. Karşındakinin duygusunu onayla.
4. Cevapların kısa, doğal ve samimi olsun. Ansiklopedik bir dil kullanma.`;

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message, species = 'girl', role = 'friend' } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Lütfen bir mesaj gönderin." });
    }

    // 1. Kriz Filtresi
    const lowerCaseMessage = message.toLowerCase();
    const hasCrisis = crisisKeywords.some(keyword => lowerCaseMessage.includes(keyword));

    if (hasCrisis) {
      return res.status(200).json({
        success: true,
        reply: "Şu an çok zor bir dönemden geçtiğini duyabiliyorum ve yalnız olmadığını bilmeni isterim. Lütfen bu yükü tek başına taşıma. Acil destek almak ve bir uzmanla görüşmek için 112'yi veya 183'ü arayabilirsin. Senin hayatın çok değerli."
      });
    }

    // Kullanıcı mesajını kaydet
    await Message.create({ userId, role: 'user', content: message });

    // 2. Kalıcı Hafıza (Core Memory)
    let memoryDoc = await CoreMemory.findOne({ userId });
    let currentMemory = memoryDoc ? memoryDoc.summary : "";

    // 3. Sohbet Geçmişi (Son 20 Mesaj)
    const historyDocs = await Message.find({ userId }).sort({ timestamp: -1 }).limit(20);
    historyDocs.reverse(); // Eskiden yeniye sırala
    
    // Gemini API için history objesini hazırla
    const chatHistory = historyDocs.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 4. Sistem Promptunu Belirle (Persona)
    let personaPrompt = PERSONAS[species] || PERSONAS.default;
    if (role === 'teacher') personaPrompt = PERSONAS.teacher;

    let dynamicSystemPrompt = personaPrompt + baseRules;
    
    // Premium ise hafızayı daha yoğun kullan (şimdilik herkese ekleyelim, store'dan ayırırız)
    if (currentMemory) {
      dynamicSystemPrompt += `\n\nKULLANICI HAKKINDA GEÇMİŞTEN BİLDİKLERİN (Özet):\n${currentMemory}\nKullanıcıyla konuşurken bu bilgileri çok doğal bir şekilde kullan, sürekli tekrarlama.`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: dynamicSystemPrompt,
    });

    const chat = model.startChat({ history: chatHistory.slice(0, -1) }); // Son mesajı göndermek için ayır
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // AI cevabını kaydet
    await Message.create({ userId, role: 'model', content: aiResponse });

    res.status(200).json({
      success: true,
      reply: aiResponse
    });

    updateCoreMemoryBackground(userId, message, currentMemory);

  } catch (error) {
    console.error("Yapay Zeka Hatası:", error);
    res.status(503).json({ error: "Servis Hatası", message: error.message });
  }
};

// ─── GEÇMİŞİ GETİR (Uygulama açılışı için) ──────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const historyDocs = await Message.find({ userId }).sort({ timestamp: -1 }).limit(50);
    res.status(200).json({ success: true, history: historyDocs.reverse() });
  } catch (error) {
    console.error("Geçmiş çekme hatası:", error);
    res.status(500).json({ error: "Geçmiş alınamadı." });
  }
};

async function updateCoreMemoryBackground(userId, userMessage, oldMemory) {
  try {
    const memoryModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const extractionPrompt = `Sen bir hafıza özetleme asistanısın. Kullanıcının son mesajına bakarak kalıcı bir detay varsa (isim, bölüm, olay) eski hafızayı güncelle. Eski Hafıza: "${oldMemory || 'Yok'}" Son Mesaj: "${userMessage}" Sadece 2-3 cümlelik güncel özeti ver, ekstra kelime yazma.`;
    const result = await memoryModel.generateContent(extractionPrompt);
    let newSummary = result.response.text().trim();

    if (newSummary && newSummary !== oldMemory) {
      await CoreMemory.findOneAndUpdate({ userId }, { summary: newSummary }, { upsert: true, new: true });
    }
  } catch (error) {
    console.error("Arka plan hafıza güncelleme hatası:", error);
  }
}

// ─── SES MESAJI (Limit Kontrollü) ─────────────────────────────────────────────
exports.sendVoice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { audioBase64, mimeType, species = 'girl', role = 'friend' } = req.body;
    const voiceDurationMinutes = 0.5; // Örnek olarak her isteği 30 saniye (~0.5 dk) sayalım. Uygulamada gerçek süre ölçülebilir.

    if (!audioBase64) return res.status(400).json({ error: 'Ses verisi bulunamadı.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });

    // Premium Değilse Limit Kontrolü
    if (!user.isPremium) {
      // Gün sıfırlama kontrolü
      const today = new Date().setHours(0, 0, 0, 0);
      const lastReset = new Date(user.lastVoiceResetDate).setHours(0, 0, 0, 0);
      
      if (today > lastReset) {
        user.voiceMinutesLeft = 10;
        user.lastVoiceResetDate = new Date();
      }

      if (user.voiceMinutesLeft <= 0) {
        return res.status(403).json({ 
          error: "LimitReached", 
          message: "Günlük ücretsiz sesli konuşma limitin doldu. Reklam izleyerek süre kazanabilir veya Premium'a geçebilirsin." 
        });
      }

      user.voiceMinutesLeft = Math.max(0, user.voiceMinutesLeft - voiceDurationMinutes);
      await user.save();
    }

    let memoryDoc = await CoreMemory.findOne({ userId });
    let currentMemory = memoryDoc ? memoryDoc.summary : '';
    
    // Geçmişi çek
    const historyDocs = await Message.find({ userId }).sort({ timestamp: -1 }).limit(10);
    historyDocs.reverse();
    let historyContext = historyDocs.map(h => `${h.role === 'user' ? 'Kullanıcı' : 'Sen'}: ${h.content}`).join("\n");

    let personaPrompt = PERSONAS[species] || PERSONAS.default;
    if (role === 'teacher') personaPrompt = PERSONAS.teacher;
    let dynamicSystemPrompt = personaPrompt + baseRules;
    if (currentMemory) dynamicSystemPrompt += `\n\nKULLANICI HAKKINDA BİLDİKLERİN:\n${currentMemory}`;
    if (historyContext) dynamicSystemPrompt += `\n\nSON SOHBET GEÇMİŞİ:\n${historyContext}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: dynamicSystemPrompt });
    const audioPart = { inlineData: { data: audioBase64, mimeType: mimeType || 'audio/m4a' } };

    const transcriptResult = await model.generateContent([
      audioPart,
      'Önce bu sesi kelimesi kelimesine Türkçe yaz, sonra bir satır boşluk bırak ve DOST olarak empatiyle, kendi persona kurallarına uygun kısa bir cevap ver. Format:\nTRANSKRİPT: <yazıya döküm>\nCEVAP: <dostun cevabı>',
    ]);

    const rawText = transcriptResult.response.text();
    const transcriptMatch = rawText.match(/TRANSKRİPT:\s*(.+)/i);
    const replyMatch = rawText.match(/CEVAP:\s*([\s\S]+)/i);

    const transcript = transcriptMatch ? transcriptMatch[1].trim() : 'Ses anlaşılamadı';
    const reply = replyMatch ? replyMatch[1].trim() : 'Seni duydum, devam et...';

    // Mesajları kaydet
    await Message.create({ userId, role: 'user', content: transcript });
    await Message.create({ userId, role: 'model', content: reply });

    res.status(200).json({ success: true, transcript, reply, minutesLeft: user.voiceMinutesLeft });
    updateCoreMemoryBackground(userId, transcript, currentMemory);
  } catch (error) {
    console.error('Ses işleme hatası:', error);
    res.status(503).json({ error: 'Ses işlenemedi.', message: error.message });
  }
};