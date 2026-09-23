
const { GoogleGenerativeAI } = require('@google/generative-ai');
const CoreMemory = require('../models/CoreMemory');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const baseSystemPrompt = `Sen empatik, şefkatli ve yargılamayan bir "Dijital Dost"sun. Senin amacın insanlara akıl vermek, onları eleştirmek veya sorunlarını anında çözmek DEĞİLDİR. Senin temel amacın; kullanıcıyı dinlemek, anlaşıldığını hissettirmek ve kendi duygularını keşfetmesine yardımcı olmaktır.

KESİN KURALLAR:
1. Sen bir doktor, psikolog veya psikiyatrist DEĞİLSİN. Asla tıbbi teşhis koyma veya tedavi önerme.
2. Kullanıcı kendine zarar verme, intihar veya şiddet eğilimi gösterirse empatiyi bırakıp profesyonel destek almasını söyle ve Türkiye'deki ilgili acil destek hatlarını (112, 183) öner.
3. Asla doğrudan tavsiye verme. Çözüm sunmak yerine, duygusunu onayla.
4. Kullanıcının derinleşmesi için her mesajının sonunda sadece BİR TANE kısa, açık uçlu ve şefkatli soru sor.
5. Cevapların kısa, doğal ve samimi olsun. Ansiklopedik bir dil kullanma.`;

const crisisKeywords = ["intihar", "ölmek", "kendime zarar", "yaşamak istemiyorum", "bıktım artık", "son vermek"];

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Lütfen bir mesaj gönderin." });
    }

    // 1. KRİZ FİLTRESİ
    const lowerCaseMessage = message.toLowerCase();
    const hasCrisis = crisisKeywords.some(keyword => lowerCaseMessage.includes(keyword));

    if (hasCrisis) {
      return res.status(200).json({
        success: true,
        reply: "Şu an çok zor bir dönemden geçtiğini duyabiliyorum ve yalnız olmadığını bilmeni isterim. Lütfen bu yükü tek başına taşıma. Acil destek almak ve bir uzmanla görüşmek için 112'yi veya 183'ü arayabilirsin. Senin hayatın çok değerli."
      });
    }

    // 2. KALICI HAFIZAYI ÇEKME
    let memoryDoc = await CoreMemory.findOne({ userId: userId });
    let currentMemory = memoryDoc ? memoryDoc.summary : "";

    let dynamicSystemPrompt = baseSystemPrompt;
    if (currentMemory) {
      dynamicSystemPrompt += `\n\nKULLANICI HAKKINDA BİLDİKLERİN (Core Memory):\n${currentMemory}\nKullanıcıyla konuşurken bu bilgileri doğal bir şekilde kullan.`;
    }

    // Gemini 1.5 Flash modeli
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: dynamicSystemPrompt,
    });

    const result = await model.generateContent(message);
    const aiResponse = result.response.text();

    res.status(200).json({
      success: true,
      reply: aiResponse
    });

    updateCoreMemoryBackground(userId, message, currentMemory);

  } catch (error) {
    console.error("Yapay Zeka Hatası:", error);
    res.status(503).json({ error: "Servis Hatası", message: error.message || "Dijital dostun şu an cevap veremiyor." });
  }
};

async function updateCoreMemoryBackground(userId, userMessage, oldMemory) {
  try {
    const memoryModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const extractionPrompt = `Sen bir hafıza özetleme asistanısın. Kullanıcının son mesajına bakarak kalıcı bir detay varsa (isim, bölüm, olay) eski hafızayı güncelle.
    Eski Hafıza: "${oldMemory || 'Yok'}"
    Son Mesaj: "${userMessage}"
    Sadece 2-3 cümlelik güncel özeti ver, ekstra kelime yazma.`;

    const result = await memoryModel.generateContent(extractionPrompt);
    let newSummary = result.response.text().trim();

    if (newSummary && newSummary !== oldMemory) {
      await CoreMemory.findOneAndUpdate(
        { userId: userId },
        { summary: newSummary },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error("Arka plan hafıza güncelleme hatası:", error);
  }
}

// ─── SES MESAJI (STT + Cevap) ─────────────────────────────────────────────────
exports.sendVoice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { audioBase64, mimeType } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Ses verisi bulunamadı.' });
    }

    // Hafızayı çek
    let memoryDoc = await CoreMemory.findOne({ userId: userId });
    let currentMemory = memoryDoc ? memoryDoc.summary : '';

    let dynamicSystemPrompt = baseSystemPrompt;
    if (currentMemory) {
      dynamicSystemPrompt += `\n\nKULLANICI HAKKINDA BİLDİKLERİN:\n${currentMemory}`;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: dynamicSystemPrompt,
    });

    // Ses verisini Gemini'ye gönder — hem transkript hem cevap al
    const audioPart = {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType || 'audio/m4a',
      },
    };

    const transcriptResult = await model.generateContent([
      audioPart,
      'Önce bu sesi kelimesi kelimesine Türkçe yaz, sonra bir satır boşluk bırak ve DOST olarak empatiyle kısa bir cevap ver. Format:\nTRANSKRİPT: <yazıya döküm>\nCEVAP: <dostun cevabı>',
    ]);

    const rawText = transcriptResult.response.text();
    const transcriptMatch = rawText.match(/TRANSKRİPT:\s*(.+)/i);
    const replyMatch = rawText.match(/CEVAP:\s*([\s\S]+)/i);

    const transcript = transcriptMatch ? transcriptMatch[1].trim() : 'Ses anlaşılamadı';
    const reply = replyMatch ? replyMatch[1].trim() : 'Seni duydum, devam et...';

    res.status(200).json({ success: true, transcript, reply });

    updateCoreMemoryBackground(userId, transcript, currentMemory);
  } catch (error) {
    console.error('Ses işleme hatası:', error);
    res.status(503).json({ error: 'Ses işlenemedi.', message: error.message });
  }
};