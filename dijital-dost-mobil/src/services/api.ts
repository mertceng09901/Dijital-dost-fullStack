import axios from 'axios';

// ─── Ağ Adresi ─────────────────────────────────────────────────────────────────
// Android emülatör: 10.0.2.2  |  Fiziksel cihaz: bilgisayarın yerel IP'si
const API_URL = 'http://10.0.2.2:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Mock AI Yanıtları (backend kapalıyken) ────────────────────────────────────
const MOCK_RESPONSES = [
  'Seni duyuyorum... Bu gerçekten zor olmalı. Biraz daha anlatmak ister misin?',
  'Ne hissettirdiğini anlıyorum. Bu tür şeyler insanı çok yoruyor.',
  'Seninle paylaştığın için teşekkür ederim. Peki bu duygu ne zaman başladı?',
  'Yalnız değilsin, buradayım. Ne söylemek istersen dinliyorum.',
  'Bu çok önemli. Bunu nasıl atlatmaya çalışıyorsun şu sıralar?',
  'Anlıyorum seni. Böyle hissettiren şeylerden geçmek hiç kolay değil.',
  'Seninle olmaktan mutluyum. Devam et, dinliyorum... 💜',
];
let mockIndex = 0;
const getMockResponse = (): string => {
  mockIndex = (mockIndex + 1) % MOCK_RESPONSES.length;
  return MOCK_RESPONSES[mockIndex];
};

// ─── Auth Fonksiyonları ────────────────────────────────────────────────────────
export const loginToBackend = async (email: string, password: string) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.error || 'Giriş yapılamadı. Tekrar dene.';
    throw new Error(msg);
  }
};

export const registerToBackend = async (email: string, password: string, name: string) => {
  try {
    const res = await api.post('/auth/register', { email, password, name });
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.error || 'Kayıt oluşturulamadı.';
    throw new Error(msg);
  }
};

// ─── Yazılı Mesaj ─────────────────────────────────────────────────────────────
export const sendMessageToBackend = async (
  message: string,
  token?: string | null
): Promise<string> => {
  if (!token) {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    return getMockResponse();
  }
  try {
    const res = await api.post(
      '/chat/send',
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.reply;
  } catch (error: any) {
    console.warn('Backend erişilemedi, mock mod:', error.message);
    await new Promise((r) => setTimeout(r, 800));
    return getMockResponse();
  }
};

// ─── Sesli Mesaj (STT + Cevap) ────────────────────────────────────────────────
export const sendVoiceToBackend = async (
  audioBase64: string,
  mimeType: string,
  token?: string | null
): Promise<{ transcript: string; reply: string }> => {
  if (!token) {
    await new Promise((r) => setTimeout(r, 1200));
    return { transcript: '(Misafir mod — ses tanıma devre dışı)', reply: getMockResponse() };
  }
  try {
    const res = await api.post(
      '/chat/voice',
      { audioBase64, mimeType },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { transcript: res.data.transcript, reply: res.data.reply };
  } catch (error: any) {
    console.warn('Ses gönderilemedi, mock mod:', error.message);
    return { transcript: 'Sesi anlayamadım', reply: getMockResponse() };
  }
};