/**
 * ChatScreen — Otomatik dinleme modu (Talking Tom gibi)
 * Konuşmaya başlayınca avatar otomatik duyar, cevap verir.
 * Yazma modu da var (üst sağ simge ile geçiş).
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
  Animated, StatusBar, Dimensions, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { useChatStore, Message } from '../store/chatStore';
import { useAvatarStore } from '../store/avatarStore';
import LiveAvatar from '../components/LiveAvatar';
import { colors, spacing, typography, radius } from '../theme/tokens';

const { width: W } = Dimensions.get('window');

const THEME = {
  bg: colors.background, bgCard: colors.surface,
  accent: colors.primary, accentGlow: 'rgba(107, 91, 149, 0.15)',
  text: colors.textPrimary, muted: colors.textSecondary, dim: '#A09CA3',
  user: colors.primary, aiBg: colors.surface,
  aiBorder: colors.border, border: colors.border,
  green: colors.success, red: colors.error,
};

const VOICE_THRESHOLD = -35;
const SILENCE_TIMEOUT = 1600;

// --- Typing Dots ---
function TypingIndicator() {
  const dots = [0, 1, 2].map(() => useRef(new Animated.Value(0)).current);
  useEffect(() => {
    dots.forEach((d, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 140),
        Animated.timing(d, { toValue: -7, duration: 260, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.delay(520),
      ])).start()
    );
  }, []);
  return (
    <View style={s.typingRow}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={[s.typingDot, { transform: [{ translateY: d }] }]} />
      ))}
    </View>
  );
}

// --- Ses Dalgası ---
function SoundWave({ active, color = THEME.accent }: { active: boolean; color?: string }) {
  const bars = [0, 1, 2, 3, 4].map(() => useRef(new Animated.Value(0.25)).current);
  useEffect(() => {
    if (active) {
      bars.forEach((b, i) =>
        Animated.loop(Animated.sequence([
          Animated.delay(i * 75),
          Animated.timing(b, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.15, duration: 320, useNativeDriver: true }),
        ])).start()
      );
    } else {
      bars.forEach(b => Animated.timing(b, { toValue: 0.25, duration: 200, useNativeDriver: true }).start());
    }
  }, [active]);
  return (
    <View style={s.wave}>
      {bars.map((b, i) => (
        <Animated.View key={i} style={[s.waveBar, { transform: [{ scaleY: b }], backgroundColor: color }]} />
      ))}
    </View>
  );
}

// --- Mesaj Balonu ---
function Bubble({ item }: { item: Message }) {
  const isUser = item.sender === 'user';
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(isUser ? 16 : -16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 110, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[s.bubbleRow, isUser ? s.rowUser : s.rowAi, { opacity: fade, transform: [{ translateX: slide }] }]}>
      <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAi, item.isError && s.bubbleErr]}>
        {item.isVoice && <Text style={s.voiceTag}>🎤 </Text>}
        <Text style={[s.bubbleTxt, isUser && s.bubbleTxtUser]}>{item.text}</Text>
      </View>
    </Animated.View>
  );
}

// --- ANA EKRAN ---
export default function ChatScreen({ navigation }: { navigation: any }) {
  const [inputText, setInputText] = useState('');
  const [textMode, setTextMode]   = useState(false);
  const [listenState, setListenState] = useState<'idle' | 'listening' | 'recording' | 'processing'>('idle');
  const flatRef = useRef<FlatList>(null);
  const recorder = useAudioRecorder({ isMeteringEnabled: true } as any);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const monitorInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  const { messages, loading, isSpeaking, isTTSSpeaking, voiceEnabled, sendMessage, sendVoiceMessage, toggleVoice, stopSpeaking, fetchHistory } = useChatStore();
  const { friendName } = useAvatarStore();

  useEffect(() => { fetchHistory(); }, []);

  // Glow animasyonu
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.3, duration: 1800, useNativeDriver: true }),
    ])).start();
  }, []);

  // Mesaj gelince scroll
  useEffect(() => {
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 150);
  }, [messages.length, loading]);

  // Otomatik dinleme
  useEffect(() => {
    if (!textMode) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [textMode]);

  // Cevap gelince dinlemeyi tekrar başlat
  useEffect(() => {
    if (!loading && !isSpeaking && !isTTSSpeaking && !textMode && listenState === 'idle') {
      const t = setTimeout(startListening, 500);
      return () => clearTimeout(t);
    }
  }, [loading, isSpeaking, isTTSSpeaking, textMode]);

  const startListening = useCallback(async () => {
    if (loading || isSpeaking || isTTSSpeaking) return;
    if (listenState !== 'idle') return;
    try {
      const { status } = await requestRecordingPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Mikrofon İzni Gerekli', 'Sesli sohbet için mikrofon izni vermelisin. Aksi halde yazılı moda geçilecektir.');
        setTextMode(true);
        return;
      }
      try {
        await setAudioModeAsync({ allowsRecording: true, playsInSilentModeIOS: true } as any);
      } catch(e) {}

      await recorder.prepareToRecordAsync();
      recorder.record();
      setListenState('listening');

      monitorInterval.current = setInterval(() => {
        const st = recorder.getStatus();
        if (!st.isRecording) return;
        const db = st.metering ?? -160;
        if (db > VOICE_THRESHOLD) {
          setListenState('recording');
          if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
        } else {
          if (!silenceTimer.current) {
            silenceTimer.current = setTimeout(() => finishRecording(), SILENCE_TIMEOUT);
          }
        }
      }, 120);

    } catch (e: any) {
      console.error('Dinleme başlatılamadı:', e);
      setTextMode(true);
      setListenState('idle');
    }
  }, [loading, isSpeaking, isTTSSpeaking, listenState, recorder]);

  const finishRecording = useCallback(async () => {
    if (monitorInterval.current) { clearInterval(monitorInterval.current); monitorInterval.current = null; }
    if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }

    try {
      setListenState('processing');
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) { setListenState('idle'); return; }

      const resp = await fetch(uri);
      const blob = await resp.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setListenState('idle');
        try {
          await sendVoiceMessage(base64, 'audio/m4a', 'girl', 'friend');
        } catch (err: any) {
          if (err.message === 'LimitReached') {
            Alert.alert('Sesli Konuşma Limiti', 'Günlük limitin doldu.', [
              { text: 'Ayarlara Git', onPress: () => navigation.navigate('Settings') },
              { text: 'Kapat', style: 'cancel' }
            ]);
            setTextMode(true);
          }
        }
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      setListenState('idle');
    }
  }, [sendVoiceMessage, navigation, recorder]);

  const stopListening = useCallback(() => {
    if (monitorInterval.current) { clearInterval(monitorInterval.current); monitorInterval.current = null; }
    if (silenceTimer.current) { clearTimeout(silenceTimer.current); silenceTimer.current = null; }
    recorder.stop().catch(() => {});
    setListenState('idle');
  }, [recorder]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    sendMessage(inputText.trim(), 'girl', 'friend');
    setInputText('');
  };

  const statusLabel = () => {
    if (loading || listenState === 'processing') return 'Düşünüyor...';
    if (isTTSSpeaking || isSpeaking) return 'Konuşuyor ✨';
    if (listenState === 'recording') return 'Duyuyorum! 🎤';
    if (listenState === 'listening') return 'Dinliyor...';
    return 'Hazır';
  };

  const isActivelyListening = listenState === 'listening' || listenState === 'recording';

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      {/* HEADER */}
      <View style={s.header}>
        <View style={s.hLeft}>
          <View style={[s.dot, (isTTSSpeaking || isSpeaking) && s.dotSpeak, isActivelyListening && s.dotListen]} />
          <Text style={s.hName}>{friendName}</Text>
        </View>
        <View style={s.hRight}>
          {/* Ses açma/kapama */}
          <TouchableOpacity style={[s.hBtn, voiceEnabled && s.hBtnOn]} onPress={toggleVoice}>
            <Text style={s.hBtnTxt}>{voiceEnabled ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
          {/* Yazı / Ses modu geçiş */}
          <TouchableOpacity style={[s.hBtn, textMode && s.hBtnOn]} onPress={() => setTextMode(!textMode)}>
            <Text style={s.hBtnTxt}>{textMode ? '🎙️' : '💬'}</Text>
          </TouchableOpacity>
          {/* Stüdyo */}
          <TouchableOpacity style={s.hBtn} onPress={() => navigation.navigate('AvatarCustomizer')}>
            <Text style={s.hBtnTxt}>✦</Text>
          </TouchableOpacity>
          {/* Ayarlar */}
          <TouchableOpacity style={s.hBtn} onPress={() => navigation.navigate('Settings')}>
            <Text style={s.hBtnTxt}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AVATAR */}
      <TouchableOpacity
        activeOpacity={0.92}
        style={s.avatarSection}
        onPress={isTTSSpeaking ? stopSpeaking : undefined}
      >
        <Animated.View style={[s.bgGlow, { opacity: glowAnim }]} />
        <LiveAvatar
          size={W * 0.55}
          isSpeaking={isSpeaking || isTTSSpeaking}
          isListening={isActivelyListening || loading}
        />
        <SoundWave
          active={isTTSSpeaking || isSpeaking || listenState === 'recording'}
          color={listenState === 'recording' ? THEME.red : THEME.accent}
        />
        <View style={s.chip}>
          <View style={[
            s.chipDot,
            (isTTSSpeaking || isSpeaking) && s.chipDotSpeak,
            listenState === 'recording' && s.chipDotRec,
          ]} />
          <Text style={s.chipTxt}>{statusLabel()}</Text>
          {isTTSSpeaking && (
            <TouchableOpacity onPress={stopSpeaking} style={s.stopBtn}>
              <Text style={s.stopTxt}>⏹ Durdur</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* SESLİ MOD */}
      {!textMode && (
        <View style={s.voiceInfo}>
          {messages.length > 1 && (
            <View style={s.lastMsg}>
              <Text style={s.lastMsgTxt} numberOfLines={3}>
                {messages[messages.length - 1].text}
              </Text>
            </View>
          )}
          <Text style={s.voiceHint}>
            {isActivelyListening
              ? '🎤 Konuşabilirsin, seni duyuyorum'
              : loading
              ? '⏳ Cevap hazırlanıyor...'
              : '🎙️ Konuşmaya başla — otomatik duyacağım'}
          </Text>
          <TouchableOpacity style={s.switchBtn} onPress={() => setTextMode(true)}>
            <Text style={s.switchTxt}>💬 Yazmayı tercih et</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* YAZIŞMA MODU */}
      {textMode && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.chatArea}>
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) => <Bubble item={item} />}
            contentContainerStyle={s.msgList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              loading ? (
                <View style={[s.bubbleRow, s.rowAi]}>
                  <View style={s.bubbleAi}><TypingIndicator /></View>
                </View>
              ) : null
            }
          />
          <View style={s.inputBar}>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                placeholder="Bir şeyler anlat..."
                placeholderTextColor={THEME.dim}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                onSubmitEditing={handleSend}
              />
            </View>
            <TouchableOpacity
              style={[s.sendBtn, (!inputText.trim() || loading) && s.sendBtnOff]}
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
            >
              <Text style={s.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

// --- STİLLER ---
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: THEME.border },
  hLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: THEME.dim },
  dotSpeak: { backgroundColor: THEME.green },
  dotListen: { backgroundColor: colors.accent },
  hName: { color: THEME.text, fontSize: 18, fontWeight: '800' },
  hBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.bgCard, borderWidth: 1, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center' },
  hBtnOn: { borderColor: THEME.accent, backgroundColor: THEME.accentGlow },
  hBtnTxt: { fontSize: 16 },

  avatarSection: { alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: THEME.border, position: 'relative' },
  bgGlow: { position: 'absolute', width: W * 0.75, height: W * 0.75, borderRadius: W * 0.375, backgroundColor: colors.primaryLight, top: -10 },

  wave: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 24, marginTop: 6 },
  waveBar: { width: 4, height: 20, borderRadius: 2 },

  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: THEME.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginTop: 6 },
  chipDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: THEME.dim },
  chipDotSpeak: { backgroundColor: THEME.green },
  chipDotRec: { backgroundColor: THEME.red },
  chipTxt: { color: THEME.muted, fontSize: 12, fontWeight: '600' },
  stopBtn: { marginLeft: 6 },
  stopTxt: { color: THEME.red, fontSize: 11, fontWeight: '800' },

  voiceInfo: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  lastMsg: { backgroundColor: THEME.aiBg, borderWidth: 1, borderColor: THEME.aiBorder, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 14, width: '100%' },
  lastMsgTxt: { color: THEME.text, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  voiceHint: { color: THEME.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  switchBtn: { paddingVertical: 8 },
  switchTxt: { color: THEME.dim, fontSize: 13, textDecorationLine: 'underline' },

  chatArea: { flex: 1 },
  msgList: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6, gap: 4 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2 },
  rowUser: { justifyContent: 'flex-end' },
  rowAi:   { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 11, flexDirection: 'row', flexWrap: 'wrap' },
  bubbleUser: { backgroundColor: THEME.user, borderBottomRightRadius: 4 },
  bubbleAi:   { backgroundColor: THEME.aiBg, borderWidth: 1, borderColor: THEME.aiBorder, borderBottomLeftRadius: 4 },
  bubbleErr:  { borderColor: 'rgba(239,68,68,0.3)' },
  bubbleTxt:  { color: THEME.text, fontSize: 15, lineHeight: 22 },
  bubbleTxtUser: { color: '#fff' },
  voiceTag:   { fontSize: 13 },

  typingRow: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 4, paddingHorizontal: 4 },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: THEME.accent },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 22 : 12, borderTopWidth: 1, borderTopColor: THEME.border, backgroundColor: THEME.bg },
  inputWrap: { flex: 1, backgroundColor: THEME.aiBg, borderRadius: 22, borderWidth: 1, borderColor: THEME.aiBorder, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 110 },
  input: { color: THEME.text, fontSize: 15, lineHeight: 20 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  sendBtnOff: { backgroundColor: colors.primaryLight, elevation: 0 },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: '900' },
});
