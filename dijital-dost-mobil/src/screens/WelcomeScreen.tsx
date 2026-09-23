import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

const QUOTES = [
  { text: "Her yeni gün, yeni bir başlangıçtır.", author: "T.S. Eliot" },
  { text: "İçindeki ışığı bulduğunda, karanlık seni korkutamaz.", author: "Mevlana" },
  { text: "Bazen en büyük cesaret, sadece dinlemeyi bilmektir.", author: "Teramer" },
  { text: "Gelecek, bugünden ona hazırlananlara aittir.", author: "Malcolm X" },
  { text: "En uzun yolculuklar, tek bir adımla başlar.", author: "Lao Tzu" },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const { isLoggedIn } = useAuthStore();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Oturum açıksa doğrudan ana ekrana yönlendir
    if (isLoggedIn) {
      navigation.replace('Chat');
      return;
    }

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start(() => {
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoggedIn, navigation, fadeAnim]);

  return (
    <SafeAreaView style={st.container}>
      <View style={st.content}>
        <View style={st.logoBox}>
          <Text style={st.logoIcon}>✨</Text>
          <Text style={st.logoText}>Teramer</Text>
        </View>

        <Animated.View style={[st.quoteContainer, { opacity: fadeAnim }]}>
          <Text style={st.quoteText}>"{QUOTES[quoteIndex].text}"</Text>
          <Text style={st.quoteAuthor}>— {QUOTES[quoteIndex].author}</Text>
        </Animated.View>

        <View style={st.bottom}>
          <Text style={st.subtitle}>Dijital dostun seni bekliyor.</Text>
          <TouchableOpacity style={st.btn} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
            <Text style={st.btnTxt}>Hemen Başla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const THEME = {
  bg: '#070a16',
  accent: '#8b7cf8',
  text: '#e8e0ff',
  muted: '#9d94c4',
};

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  content: { flex: 1, padding: 24, justifyContent: 'space-between', alignItems: 'center' },
  
  logoBox: { alignItems: 'center', marginTop: 40 },
  logoIcon: { fontSize: 48, marginBottom: 12 },
  logoText: { fontSize: 32, fontWeight: '900', color: THEME.text, letterSpacing: 2 },
  
  quoteContainer: { alignItems: 'center', paddingHorizontal: 20 },
  quoteText: { fontSize: 24, color: THEME.text, textAlign: 'center', fontWeight: '500', fontStyle: 'italic', lineHeight: 34 },
  quoteAuthor: { fontSize: 16, color: THEME.accent, marginTop: 16, fontWeight: '600', letterSpacing: 1 },
  
  bottom: { width: '100%', alignItems: 'center', marginBottom: 20 },
  subtitle: { fontSize: 16, color: THEME.muted, marginBottom: 24 },
  btn: { width: '100%', backgroundColor: THEME.accent, paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: THEME.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  btnTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
