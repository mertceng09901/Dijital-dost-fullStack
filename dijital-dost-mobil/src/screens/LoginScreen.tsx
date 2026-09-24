import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
  StatusBar, SafeAreaView, Dimensions, ImageBackground
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { SCENE_CATALOG } from '../data/sceneCatalog';
import LiveAvatar from '../components/LiveAvatar';
import { colors, typography, spacing, radius } from '../theme/tokens';

const { width, height } = Dimensions.get('window');

type AuthMode = 'login' | 'register';

export default function LoginScreen({ navigation }: any) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const switchMode = () => {
    clearError();
    setMode(mode === 'login' ? 'register' : 'login');
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

  const themeColors = {
    cardBg: 'rgba(255, 252, 248, 0.95)',
    primary: '#8B5E3C',     
    secondary: '#5C8A5C',   
    accent: '#F5A623',      
    textDark: '#4A4A4A',
    textDim: '#8B8B8B',
    border: '#E8DFD8',
    inputBg: 'rgba(245, 241, 234, 0.8)'
  };

  return (
    <View style={s.container}>
      <ImageBackground 
        source={{ uri: SCENE_CATALOG.room.imageUrl }} 
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={8}
      >
        <View style={{ ...StyleSheet.absoluteFill, backgroundColor: 'rgba(139, 94, 60, 0.3)' }} />
      </ImageBackground>

      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <Animated.View style={[
              s.card,
              { backgroundColor: themeColors.cardBg },
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }
            ]}>
              
              <View style={s.headerArea}>
                <View style={s.avatarWrap}>
                  <LiveAvatar size={80} hideScene={true} rounded={true} />
                </View>
                <Text style={[s.title, { color: themeColors.textDark }]}>
                  {mode === 'login' ? 'Dostun seni bekliyor!' : 'Aramıza Katıl!'}
                </Text>
                <Text style={[s.subtitle, { color: themeColors.textDim }]}>
                  {mode === 'login' ? 'Kaldığımız yerden devam edelim.' : 'Kendi dijital dostunu yaratmak için ilk adımı at.'}
                </Text>
              </View>

              {error ? (
                <View style={s.errorBox}>
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={s.form}>
                {mode === 'register' && (
                  <View style={s.inputRow}>
                    <Text style={[s.label, { color: themeColors.primary }]}>İsim</Text>
                    <TextInput
                      style={[s.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.textDark }]}
                      placeholder="Nasıl hitap edelim?"
                      placeholderTextColor={themeColors.textDim}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                )}

                <View style={s.inputRow}>
                  <Text style={[s.label, { color: themeColors.primary }]}>E-Posta</Text>
                  <TextInput
                    style={[s.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.textDark }]}
                    placeholder="ornek@email.com"
                    placeholderTextColor={themeColors.textDim}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={s.inputRow}>
                  <Text style={[s.label, { color: themeColors.primary }]}>Şifre</Text>
                  <View style={s.pwdWrapper}>
                    <TextInput
                      style={[s.input, s.inputPwd, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.textDark }]}
                      placeholder="••••••••"
                      placeholderTextColor={themeColors.textDim}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                      <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[s.btn, { backgroundColor: themeColors.primary }]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <Text style={s.btnTxt}>{isLoading ? 'Bekle...' : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.linkBtn} onPress={switchMode}>
                  <Text style={[s.linkTxt, { color: themeColors.secondary }]}>
                    {mode === 'login' ? 'Hesabın yok mu? Kayıt ol.' : 'Zaten üyesin? Giriş yap.'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.guestBtn} onPress={() => navigation.replace('Welcome')}>
                  <Text style={[s.guestTxt, { color: themeColors.textDim }]}>Misafir olarak devam et</Text>
                </TouchableOpacity>
              </View>

            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  card: {
    borderRadius: radius.xl, padding: spacing.xl, paddingTop: spacing.xxl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    alignItems: 'center',
  },
  headerArea: { alignItems: 'center', marginBottom: spacing.xl },
  avatarWrap: { 
    width: 86, height: 86, borderRadius: 43, backgroundColor: '#fff', 
    alignItems: 'center', justifyContent: 'center', 
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    marginBottom: spacing.md, marginTop: -60,
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  errorBox: { width: '100%', backgroundColor: 'rgba(255, 100, 100, 0.1)', padding: 12, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(255, 100, 100, 0.3)' },
  errorText: { color: '#D32F2F', fontSize: 12, textAlign: 'center', fontWeight: '600' },
  form: { width: '100%' },
  inputRow: { marginBottom: spacing.md },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontWeight: '500' },
  pwdWrapper: { position: 'relative', justifyContent: 'center' },
  inputPwd: { paddingRight: 45 },
  eyeBtn: { position: 'absolute', right: 14, top: 12 },
  btn: { width: '100%', paddingVertical: 16, borderRadius: radius.lg, alignItems: 'center', marginTop: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  linkBtn: { marginTop: spacing.lg, alignItems: 'center' },
  linkTxt: { fontSize: 14, fontWeight: '700' },
  guestBtn: { marginTop: spacing.xl, alignItems: 'center' },
  guestTxt: { fontSize: 13, textDecorationLine: 'underline' }
});
