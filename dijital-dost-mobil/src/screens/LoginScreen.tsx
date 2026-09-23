import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import LiveAvatar from '../components/LiveAvatar';

const THEME = {
  bg: '#080b18',
  bgCard: 'rgba(255,255,255,0.05)',
  accent: '#8b7cf8',
  accentDark: '#5b3de8',
  accentGlow: 'rgba(139,124,248,0.15)',
  textPrimary: '#e8e0ff',
  textMuted: '#9d94c4',
  textDim: '#4b5280',
  border: 'rgba(139,124,248,0.2)',
  inputBg: 'rgba(255,255,255,0.06)',
  error: '#f87171',
};

type AuthMode = 'login' | 'register';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tabSlide = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start(() => {
      // Avatar karşılama animasyonu
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2500);
    });
  }, []);

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode) return;
    clearError();
    Animated.timing(tabSlide, {
      toValue: newMode === 'login' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setMode(newMode);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      triggerShake();
      return;
    }
    if (mode === 'register' && !name.trim()) {
      triggerShake();
      return;
    }

    let success = false;
    if (mode === 'login') {
      success = await login(email.trim(), password);
    } else {
      success = await register(email.trim(), password, name.trim());
    }

    if (success) {
      navigation.replace('Onboarding');
    } else {
      triggerShake();
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const tabIndicatorLeft = tabSlide.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '52%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── LOGO & AVATAR ── */}
          <Animated.View
            style={[
              styles.heroSection,
              { opacity: fadeAnim, transform: [{ scale: logoScale }] },
            ]}
          >
            {/* Arka plan halkaları */}
            <View style={styles.ringOuter} />
            <View style={styles.ringInner} />

            <LiveAvatar
              size={140}
              species="girl"
              eyeColor="purple"
              hairStyle="short"
              hairColor="blue"
              outfitColor="purple"
              outfitId="formal"
              accessory="none"
              isSpeaking={isSpeaking}
              showGlow={true}
            />
            <Text style={styles.appName}>Dijital Dost</Text>
            <Text style={styles.appTagline}>Seninle, her an.</Text>
          </Animated.View>

          {/* ── FORM KARTI ── */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            {/* ── SEKMELER ── */}
            <View style={styles.tabContainer}>
              <Animated.View
                style={[styles.tabIndicator, { left: tabIndicatorLeft }]}
              />
              <TouchableOpacity
                style={styles.tab}
                onPress={() => switchMode('login')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Giriş Yap
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => switchMode('register')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                  Kayıt Ol
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── GİRİŞ ALANLARI ── */}
            <View style={styles.fields}>
              {mode === 'register' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>İsmin</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Adın ne?"
                    placeholderTextColor={THEME.textDim}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ornek@mail.com"
                  placeholderTextColor={THEME.textDim}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Şifre</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="••••••••"
                    placeholderTextColor={THEME.textDim}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeBtnText}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ── HATA MESAJI ── */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {error}</Text>
              </View>
            ) : null}

            {/* ── GÖNDER BUTONU ── */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnLoading]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <Text style={styles.submitBtnText}>
                {isLoading
                  ? 'Bekle...'
                  : mode === 'login'
                  ? 'Giriş Yap →'
                  : 'Hesap Oluştur →'}
              </Text>
            </TouchableOpacity>

            {/* ── MISAFIR GİRİŞİ ── */}
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => navigation.replace('Onboarding')}
              activeOpacity={0.7}
            >
              <Text style={styles.guestBtnText}>Hesap olmadan devam et</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Alt boşluk */}
          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  ringOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(139,124,248,0.12)',
    top: -20,
  },
  ringInner: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(139,124,248,0.08)',
    top: 5,
  },
  appName: {
    color: THEME.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 8,
  },
  appTagline: {
    color: THEME.textMuted,
    fontSize: 14,
    marginTop: 4,
  },

  // Kart
  card: {
    width: '100%',
    backgroundColor: THEME.bgCard,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 24,
    shadowColor: '#8b7cf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },

  // Sekmeler
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    width: '46%',
    height: '85%',
    backgroundColor: THEME.accent,
    borderRadius: 12,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    color: THEME.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '800',
  },

  // Alanlar
  fields: {
    gap: 16,
    marginBottom: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    color: THEME.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  input: {
    backgroundColor: THEME.inputBg,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: THEME.textPrimary,
    fontSize: 15,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  eyeBtnText: {
    fontSize: 18,
  },

  // Hata
  errorBox: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: THEME.error,
    fontSize: 13,
    textAlign: 'center',
  },

  // Gönder
  submitBtn: {
    backgroundColor: THEME.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  submitBtnLoading: {
    backgroundColor: 'rgba(139,124,248,0.5)',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Misafir
  guestBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestBtnText: {
    color: THEME.textDim,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
