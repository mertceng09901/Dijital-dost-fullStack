import { create } from 'zustand';
import * as Speech from 'expo-speech';
import { sendMessageToBackend, sendVoiceToBackend } from '../services/api';
import { useAuthStore } from './authStore';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isError?: boolean;
  isVoice?: boolean; // ses ile gönderildi mi
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  isSpeaking: boolean;        // avatar animasyonu için
  isTTSSpeaking: boolean;     // TTS sesi çıkıyor mu
  voiceEnabled: boolean;      // TTS açık/kapalı
  sendMessage: (text: string) => Promise<void>;
  sendVoiceMessage: (audioBase64: string, mimeType: string) => Promise<void>;
  toggleVoice: () => void;
  stopSpeaking: () => void;
  clearMessages: () => void;
}

// TTS ile sesli oku
const speak = (text: string, onDone?: () => void) => {
  Speech.stop();
  Speech.speak(text, {
    language: 'tr-TR',
    pitch: 1.0,
    rate: 0.92,
    onDone,
    onStopped: onDone,
  });
};

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: '1',
      text: 'Merhaba 👋 Ben Teramer. Bugün nasıl hissediyorsun? Yüksek sesle konuşabilir ya da yazabilirsin.',
      sender: 'ai',
    },
  ],
  loading: false,
  isSpeaking: false,
  isTTSSpeaking: false,
  voiceEnabled: true,

  // ─── Yazılı Mesaj ──────────────────────────────────────────────────────────
  sendMessage: async (text: string) => {
    if (!text.trim() || get().loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
    };

    set((s) => ({ messages: [...s.messages, userMsg], loading: true, isSpeaking: false }));

    try {
      const token = useAuthStore.getState().token;
      const reply = await sendMessageToBackend(text, token);

      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: reply, sender: 'ai' };

      set((s) => ({
        messages: [...s.messages, aiMsg],
        loading: false,
        isSpeaking: true,
        isTTSSpeaking: get().voiceEnabled,
      }));

      if (get().voiceEnabled) {
        speak(reply, () => set({ isSpeaking: false, isTTSSpeaking: false }));
      } else {
        const d = Math.min(reply.length * 55, 5000);
        setTimeout(() => set({ isSpeaking: false }), d);
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Şu an yanıt veremiyorum, biraz sonra tekrar dene. 💜',
        sender: 'ai',
        isError: true,
      };
      set((s) => ({ messages: [...s.messages, errorMsg], loading: false, isSpeaking: false }));
    }
  },

  // ─── Sesli Mesaj ───────────────────────────────────────────────────────────
  sendVoiceMessage: async (audioBase64: string, mimeType: string) => {
    if (get().loading) return;

    set({ loading: true, isSpeaking: false });

    try {
      const token = useAuthStore.getState().token;
      const { transcript, reply } = await sendVoiceToBackend(audioBase64, mimeType, token);

      const userMsg: Message = {
        id: Date.now().toString(),
        text: transcript,
        sender: 'user',
        isVoice: true,
      };

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: 'ai',
      };

      set((s) => ({
        messages: [...s.messages, userMsg, aiMsg],
        loading: false,
        isSpeaking: true,
        isTTSSpeaking: get().voiceEnabled,
      }));

      if (get().voiceEnabled) {
        speak(reply, () => set({ isSpeaking: false, isTTSSpeaking: false }));
      } else {
        const d = Math.min(reply.length * 55, 5000);
        setTimeout(() => set({ isSpeaking: false }), d);
      }
    } catch {
      set({ loading: false, isSpeaking: false });
    }
  },

  toggleVoice: () => {
    const next = !get().voiceEnabled;
    if (!next) Speech.stop();
    set({ voiceEnabled: next });
  },

  stopSpeaking: () => {
    Speech.stop();
    set({ isSpeaking: false, isTTSSpeaking: false });
  },

  clearMessages: () => {
    Speech.stop();
    set({
      messages: [
        {
          id: '1',
          text: 'Merhaba 👋 Ben Teramer. Nasıl hissediyorsun?',
          sender: 'ai',
        },
      ],
      isSpeaking: false,
      isTTSSpeaking: false,
    });
  },
}));