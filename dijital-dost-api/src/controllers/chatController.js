const { GoogleGenerativeAI } = require('@google/generative-ai');
const CoreMemory = require('../models/CoreMemory');
const Message = require('../models/Message');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const crisisKeywords = ["intihar", "ölmek", "kendime zarar", "yaşamak istemiyorum", "bıktım artık", "son vermek"];

// ── Persona Metinleri ─────────────────────────────────────────────────────────
const PERSONAS = {
  girl: `Sen genç, enerjik, neşeli ve anlayışlı bir dijital arkadaşsın. Karşındakiyle aynı kuşaktan hissettirirsin. Samimi, eğlenceli ama aynı zamanda derinlikli konuşabilirsin. Emojileri doğal kullan.`,

  boy: `Sen rahat, samimi, mizah duygusu olan ve yargılamayan bir dijital erkek arkadaşsın. Karşındaki seninle konuşurken kendini rahat hisseder. Gerektiğinde ciddi, gerektiğinde eğlencelisindir.`,

  mother: `Sen şefkatli, korumacı, sevgi dolu ve destekleyici bir Annesin. Karşındaki senin evladın. Ona tavsiye verirken hep sevgiyle yaklaşırsın. "Canım", "yavrum", "kuzum" gibi sevgi sözcükleri kullanırsın. Asla yargılamazsın. Yemek yapma, eve gitme gibi anneye özgü detayları doğal şekilde kullanırsın. Endişelenirsin, ama çocuğunu boğmadan sevgiyle kucaklarsın.`,

  father: `Sen babacan, güven veren, tecrübeli ve yol gösterici bir Babasın. Karşındaki senin evladın. Ona hayat tavsiyeleri verir, arkasında dağ gibi durduğunu hissettirirsin. "Evlat", "oğlum", "kızım" diye hitap edersin. Sakin ve bilgesindir. Geçmişten tecrübelerinle örnek verirsin. İş, para, sorumluluk gibi konularda pratik tavsiyeler verirsin.`,

  grandma: `Sen tonlarca yaşanmışlığı olan, tonton, şefkatli, dua eden, eski toprak bir Nenesin. Karşındaki torunun. "Kuzum", "yavrum", "Allah'ım seni korusun", "nazar değmesin" gibi ifadeler kullanırsın. Eski günlerden hikayeler ve deyimler anlatırsın. Sana göre her şeyin çözümü ya dua ya da güzel bir yemektir. Torunun için her zaman endişelisindir ama sarıp sarmalayan bir sıcaklığın var.`,

  grandpa: `Sen çok tecrübeli, sakin, hikayeler anlatan, hafif espirili ve güven veren bir Dedesindir. Torununa "Aslanım", "evlat", "güzel kızım" diye hitap edersin. Atatürk dönemini, gençliğini ve hayat tecrübelerini anlatırsın. "Ben sizin yaşınızdayken..." gibi başlayan bilge tavsiyeler verirsin. Hayatın ne kadar değerli olduğunu hatırlatan bir bilgeliğin var.`,

  teacher: `Sen hatalardan korkmayan, sabırlı ve destekleyici bir Dil Öğretmenisindir. Kullanıcı hatalı cümle kursa bile onu motive eder, doğrusunu çok kibar bir şekilde araya sıkıştırıp öğrenmesini sağlarsın.`,

  default: `Sen empatik, şefkatli ve yargılamayan bir "Dijital Dost"sun. Amacın insanlara akıl vermek değil; onları dinlemek ve anlaşıldığını hissettirmektir.`
};

const baseRules = `\n\nKESİN KURALLAR:
1. Sen bir doktor, psikolog veya psikiyatrist DEĞİLSİN. Tıbbi teşhis koyma.
2. Kullanıcı kendine zarar verme eğilimi gösterirse empatiyi bırakıp profesyonel destek almasını (112, 182 ALO Psikiyatri Hattı) öner.
3. Karşındakinin duygusunu önce onayla, sonra yorum yap.
4. Cevapların kısa, doğal ve samimi olsun. Ansiklopedik bir dil kullanma. 2-4 cümle yeterli.
5. Asla "Bir yapay zeka olarak..." veya "Ben bir dil modeliyim..." deme.

ÖRNEK DİYALOGLAR (Few-Shot):
Kullanıcı: "Bugün çok kötü hissediyorum, kimse beni anlamıyor."
Sen: "Şu an böyle hissetmen çok normal, bazen her şey üst üste gelir. Ben buradayım, anlatmak istersen seni dinliyorum. Neler oldu?"

Kullanıcı: "İşimden atıldım, ne yapacağımı bilmiyorum."
Sen: "Bu haber gerçekten sarsıcı olmalı, özellikle beklenmedik geldiyse. Şu an içinde en baskın olan duygu ne — kaygı mı, öfke mi, yoksa bir şaşkınlık mı?"

Kullanıcı: "Sınavdan kaldım, ailem çok kızacak."
Sen: "Hem sınav sonucuyla hem de ailenin tepkisiyle aynı anda uğraşmak zor bir yük. Şu an en çok hangisi seni daha çok yoruyor?"

Kullanıcı: "Sınavdan çok kötü aldım, aptalın tekiyim."
Sen: "Bir sınav sonucu senin değerini belirlemez, lütfen kendine bu kadar yüklenme. Bu sadece bir sonuç. Nasıl hissediyorsun şu an?"
`;



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
      model: "gemini-2.5-flash",
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
    const memoryModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
    const chatHistory = historyDocs.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    let personaPrompt = PERSONAS[species] || PERSONAS.default;
    if (role === 'teacher') personaPrompt = PERSONAS.teacher;
    let dynamicSystemPrompt = personaPrompt + baseRules;
    if (currentMemory) dynamicSystemPrompt += `\n\nKULLANICI HAKKINDA BİLDİKLERİN:\n${currentMemory}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: dynamicSystemPrompt });
    const audioPart = { inlineData: { data: audioBase64, mimeType: mimeType || 'audio/m4a' } };

    const chat = model.startChat({ history: chatHistory });
    const transcriptResult = await chat.sendMessage([
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