import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  Animated, Dimensions, KeyboardAvoidingView, Platform,
  ScrollView, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAvatarStore, AvatarSpecies } from '../store/avatarStore';
import LiveAvatar from '../components/LiveAvatar';
import { colors, spacing, typography, radius } from '../theme/tokens';

const { width: W } = Dimensions.get('window');

// Her karakterin kendi modelUrl ve renk bilgisi burada — LiveAvatar store'u okur
const CHARACTERS: {
  type: AvatarSpecies;
  name: string;
  desc: string;
  modelUrl: string;
  bodyColor: string;
  helmetColor: string;
}[] = [
  {
    type: 'girl',
    name: 'Kız Arkadaş',
    desc: 'Sıcak, anlayışlı, dinleyen',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    bodyColor: '#FFB6C1',
    helmetColor: '#FFFFFF',
  },
  {
    type: 'boy',
    name: 'Erkek Arkadaş',
    desc: 'Samimi, dürüst, destekleyici',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    bodyColor: '#4A90D9',
    helmetColor: '#1A1A2E',
  },
  {
    type: 'cat',
    name: 'Robot Kedi',
    desc: 'Meraklı, akıllı, sevimli',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
    bodyColor: '#FF8C00',
    helmetColor: '#FF8C00',
  },
  {
    type: 'bunny',
    name: 'Robot Tavşan',
    desc: 'Yumuşak, sakin, güven veren',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
    bodyColor: '#E91E63',
    helmetColor: '#FCE4EC',
  },
  {
    type: 'dog',
    name: 'Robot Köpek',
    desc: 'Sadık, neşeli, hep yanında',
    modelUrl: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
    bodyColor: '#795548',
    helmetColor: '#D7CCC8',
  },
];

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const [step, setStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [name, setName] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { setAvatarConfig, setSceneItem } = useAvatarStore();

  const selectedChar = CHARACTERS[selectedIndex];

  const applyCharacter = (char: typeof CHARACTERS[0]) => {
    setSceneItem('modelUrl', char.modelUrl);
    setSceneItem('accessory', 'none');
  };


  // Adım 1 açılınca ilk karakteri uygula
  useEffect(() => {
    if (step === 1) applyCharacter(CHARACTERS[0]);
  }, [step]);

  const handleCharSelect = (index: number) => {
    setSelectedIndex(index);
    applyCharacter(CHARACTERS[index]);
  };

  const fadeTransition = (cb: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const goNext = () => fadeTransition(() => setStep(s => s + 1));

  const handleFinish = () => {
    const finalName = name.trim() || 'Dostum';
    setAvatarConfig({
      species: selectedChar.type,
      friendName: finalName,
      onboardingCompleted: true,
    });
    // Doğru navigator ismi: 'AvatarCustomizer'
    navigation.replace('AvatarCustomizer');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

          {/* ── ADIM 0: Karşılama ── */}
          {step === 0 && (
            <View style={styles.center}>
              <View style={styles.glowCircle}>
                <Text style={styles.welcomeEmoji}>👋</Text>
              </View>
              <Text style={styles.title}>Dijital Dost</Text>
              <Text style={styles.subtitle}>
                Dertlerini, düşüncelerini, her şeyini{'\n'}
                <Text style={styles.accent}>yargılamadan</Text> dinleyecek biri var.
              </Text>
              <TouchableOpacity style={styles.btn} onPress={goNext}>
                <Text style={styles.btnTxt}>Başlayalım →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── ADIM 1: Karakter Seç ── */}
          {step === 1 && (
            <View style={{ flex: 1 }}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNum}>1 / 2</Text>
                <Text style={styles.title}>Dostunu seç</Text>
                <Text style={styles.subtitle}>Karaktere tıklayınca 3D önizleme değişir!</Text>
              </View>

              {/* 3D CANLI ÖNİZLEME — Seçilen karakteri yansıtır */}
              <View style={styles.previewBox}>
                <LiveAvatar size={180} rounded />
                <Text style={styles.selectedLabel}>{selectedChar.name}</Text>
              </View>

              {/* Karakter Listesi — Yatay kaydırmalı */}
              <FlatList
                horizontal
                data={CHARACTERS}
                keyExtractor={item => item.type}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.charRow}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.charChip, selectedIndex === index && styles.charChipOn]}
                    onPress={() => handleCharSelect(index)}
                  >
                    <Text style={[styles.charChipTxt, selectedIndex === index && styles.charChipTxtOn]}>
                      {item.name}
                    </Text>
                    <Text style={styles.charChipDesc} numberOfLines={1}>{item.desc}</Text>
                  </TouchableOpacity>
                )}
              />

              <View style={styles.bottomArea}>
                <TouchableOpacity style={styles.btn} onPress={goNext}>
                  <Text style={styles.btnTxt}>Bu Karakteri Seç →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── ADIM 2: İsim Ver ── */}
          {step === 2 && (
            <View style={styles.center}>
              <Text style={styles.stepNum}>2 / 2</Text>

              <View style={styles.previewWrap}>
                <LiveAvatar size={150} rounded />
              </View>

              <Text style={styles.title}>Bir isim ver</Text>
              <Text style={styles.subtitle}>
                Dostuna özel bir isim ver.{'\n'}(Boş bırakırsan "Dostum" olur.)
              </Text>

              <TextInput
                style={styles.nameInput}
                placeholder="Nasıl hitap edeceksin?"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                maxLength={20}
                textAlign="center"
              />

              <TouchableOpacity style={styles.btn} onPress={handleFinish}>
                <Text style={styles.btnTxt}>Stüdyoya Git ve Giyin! 🎉</Text>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  stepHeader: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, gap: 4 },

  glowCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(139, 94, 60, 0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(139, 94, 60, 0.3)',
  },
  welcomeEmoji: { fontSize: 44 },
  stepNum: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  title: { ...typography.heading, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  accent: { color: '#8B5E3C', fontWeight: '700' },

  // 3D Önizleme kutusu
  previewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 94, 60, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 94, 60, 0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  selectedLabel: {
    position: 'absolute',
    bottom: 10,
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5E3C',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Yatay kaydırmalı karakter şeridi
  charRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  charChip: {
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: colors.border,
    minWidth: 130,
    alignItems: 'center',
  },
  charChipOn: {
    borderColor: '#8B5E3C',
    backgroundColor: 'rgba(139, 94, 60, 0.06)',
  },
  charChipTxt: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  charChipTxtOn: { color: '#8B5E3C' },
  charChipDesc: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },

  bottomArea: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },

  previewWrap: {
    alignItems: 'center', justifyContent: 'center',
    width: 164, height: 164, borderRadius: 82,
    overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(139, 94, 60, 0.25)',
  },

  nameInput: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 20, paddingVertical: 14,
    color: colors.textPrimary, fontSize: 18, fontWeight: '600',
  },

  btn: {
    width: '100%',
    backgroundColor: '#8B5E3C',
    paddingVertical: 16, borderRadius: radius.pill,
    alignItems: 'center',
    shadowColor: '#8B5E3C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
