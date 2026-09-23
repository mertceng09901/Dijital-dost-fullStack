import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAvatarStore, AvatarSpecies } from '../store/avatarStore';
import LiveAvatar from '../components/LiveAvatar';

const { width: W } = Dimensions.get('window');

const CHARACTERS: {
  type: AvatarSpecies; name: string; desc: string; emoji: string;
  hairColor: any; hairStyle: any; eyeColor: any; outfitColor: any;
}[] = [
  { type: 'girl',  name: 'Kız Arkadaş',  desc: 'Sıcak, anlayışlı, dinleyen', emoji: '👧',
    hairColor: 'brown', hairStyle: 'long',  eyeColor: 'purple', outfitColor: 'rose' },
  { type: 'boy',   name: 'Erkek Arkadaş', desc: 'Samimi, dürüst, destekleyici', emoji: '👦',
    hairColor: 'black', hairStyle: 'short', eyeColor: 'cyan', outfitColor: 'navy' },
  { type: 'cat',   name: 'Kedi',          desc: 'Meraklı, bağımsız, sevimli', emoji: '🐱',
    hairColor: 'blonde', hairStyle: 'short', eyeColor: 'amber',  outfitColor: 'teal' },
  { type: 'bunny', name: 'Tavşan',        desc: 'Yumuşak, sakin, güven veren', emoji: '🐰',
    hairColor: 'white', hairStyle: 'bun',  eyeColor: 'blue',   outfitColor: 'mint' },
  { type: 'dog',   name: 'Köpek',         desc: 'Sadık, neşeli, hep yanında', emoji: '🐶',
    hairColor: 'brown', hairStyle: 'curly', eyeColor: 'green',  outfitColor: 'orange' },
];

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  const [step, setStep] = useState(0);
  const [selectedChar, setSelectedChar] = useState<AvatarSpecies | null>(null);
  const [name, setName] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { setAvatarConfig } = useAvatarStore();

  const fadeTransition = (cb: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const goNext = () => fadeTransition(() => setStep(s => s + 1));

  const handleFinish = () => {
    const charData = CHARACTERS.find(c => c.type === selectedChar);
    const defaultNames: Record<AvatarSpecies, string> = { girl: 'Ablacık', boy: 'Abi', cat: 'Minnoş', bunny: 'Pamuk', dog: 'Dost' };
    const finalName = name.trim() || defaultNames[selectedChar ?? 'girl'];
    setAvatarConfig({
      species: selectedChar ?? 'girl',
      friendName: finalName,
      onboardingCompleted: true,
      gender: 'kadin',
      hairColor: charData?.hairColor ?? 'brown',
      hairStyle: charData?.hairStyle ?? 'long',
      eyeColor:  charData?.eyeColor  ?? 'purple',
      outfitColor: charData?.outfitColor ?? 'purple',
    });
    navigation.replace('Chat');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

          {/* ── ADIM 0: Karşılama ── */}
          {step === 0 && (
            <View style={styles.center}>
              <View style={styles.glowCircle}>
                <Text style={styles.welcomeEmoji}>🌙</Text>
              </View>
              <Text style={styles.title}>Dijital Dost</Text>
              <Text style={styles.subtitle}>
                Dertlerini, düşüncelerini, her şeyini{'\n'}
                <Text style={styles.accent}>yargılamadan</Text> dinleyecek biri var.
              </Text>
              <Text style={styles.body}>
                Seninle konuşacak bir dost seç.{'\n'}
                Tamamen gizli, tamamen senin.
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
                <Text style={styles.subtitle}>Bu sana eşlik edecek karakter.</Text>
              </View>
              <ScrollView contentContainerStyle={styles.charGrid} showsVerticalScrollIndicator={false}>
                {CHARACTERS.map(char => (
                  <TouchableOpacity
                    key={char.type}
                    style={[styles.charCard, selectedChar === char.type && styles.charCardOn]}
                    onPress={() => setSelectedChar(char.type)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.charAvatarWrap}>
                      <LiveAvatar
                        size={80}
                        species={char.type}
                        eyeColor={char.eyeColor}
                        hairStyle={char.hairStyle}
                        hairColor={char.hairColor}
                        outfitColor={char.outfitColor}
                        outfitId="casual"
                        accessory="none"
                        showGlow={selectedChar === char.type}
                      />
                    </View>
                    <View style={styles.charInfo}>
                      <Text style={styles.charEmoji}>{char.emoji}</Text>
                      <Text style={[styles.charName, selectedChar === char.type && styles.charNameOn]}>
                        {char.name}
                      </Text>
                      <Text style={styles.charDesc}>{char.desc}</Text>
                    </View>
                    {selectedChar === char.type && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkTxt}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.bottomArea}>
                <TouchableOpacity
                  style={[styles.btn, !selectedChar && styles.btnOff]}
                  onPress={selectedChar ? goNext : undefined}
                >
                  <Text style={styles.btnTxt}>Devam Et →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── ADIM 2: İsim Ver ── */}
          {step === 2 && (
            <View style={styles.center}>
              <Text style={styles.stepNum}>2 / 2</Text>

              {/* Seçilen Karakter */}
              <View style={styles.previewWrap}>
                {(() => {
                  const c = CHARACTERS.find(ch => ch.type === selectedChar);
                  return c ? (
                    <LiveAvatar
                      size={120}
                      species={c.type}
                      eyeColor={c.eyeColor}
                      hairStyle={c.hairStyle}
                      hairColor={c.hairColor}
                      outfitColor={c.outfitColor}
                      outfitId="casual"
                      accessory="none"
                      isSpeaking={false}
                      showGlow
                    />
                  ) : null;
                })()}
                <View style={styles.pulseOuter} />
                <View style={styles.pulseInner} />
              </View>

              <Text style={styles.title}>Bir isim ver</Text>
              <Text style={styles.subtitle}>
                İstersen ona özel bir isim ver.{'\n'}(Boş bırakırsan otomatik isim gelir.)
              </Text>

              <TextInput
                style={styles.nameInput}
                placeholder={
                  selectedChar === 'cat' ? 'Minnoş...' :
                  selectedChar === 'bunny' ? 'Pamuk...' :
                  selectedChar === 'dog' ? 'Dost...' :
                  selectedChar === 'boy' ? 'Abi...' : 'Ablacık...'
                }
                placeholderTextColor="#4b5280"
                value={name}
                onChangeText={setName}
                maxLength={20}
                textAlign="center"
              />

              <TouchableOpacity style={styles.btn} onPress={handleFinish}>
                <Text style={styles.btnTxt}>Tanışalım! 🎉</Text>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070a16' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 14 },
  stepHeader: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10, gap: 6 },

  glowCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(139,124,248,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(139,124,248,0.3)' },
  welcomeEmoji: { fontSize: 40 },
  stepNum: { color: '#4b5280', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  title: { color: '#e8e0ff', fontSize: 28, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { color: '#9d94c4', fontSize: 15, textAlign: 'center', lineHeight: 23 },
  accent: { color: '#8b7cf8', fontWeight: '700' },
  body: { color: '#4b5280', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  charGrid: { paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
  charCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 14, gap: 12, position: 'relative' },
  charCardOn: { backgroundColor: 'rgba(139,124,248,0.12)', borderColor: '#8b7cf8', shadowColor: '#8b7cf8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  charAvatarWrap: { width: 86, height: 100, alignItems: 'center', justifyContent: 'center' },
  charInfo: { flex: 1, gap: 2 },
  charEmoji: { fontSize: 20 },
  charName: { color: '#9d94c4', fontSize: 16, fontWeight: '700' },
  charNameOn: { color: '#e8e0ff' },
  charDesc: { color: '#4b5280', fontSize: 12, lineHeight: 18 },
  checkBadge: { position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: 11, backgroundColor: '#8b7cf8', alignItems: 'center', justifyContent: 'center' },
  checkTxt: { color: '#fff', fontSize: 13, fontWeight: '900' },

  bottomArea: { paddingHorizontal: 24, paddingBottom: 20, paddingTop: 10 },

  previewWrap: { alignItems: 'center', justifyContent: 'center', width: 160, height: 190, position: 'relative' },
  pulseOuter: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(139,124,248,0.2)' },
  pulseInner: { position: 'absolute', width: 185, height: 185, borderRadius: 93, borderWidth: 1, borderColor: 'rgba(139,124,248,0.1)' },

  nameInput: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(139,124,248,0.3)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, color: '#e8e0ff', fontSize: 18, fontWeight: '600' },

  btn: { width: '100%', backgroundColor: '#8b7cf8', paddingVertical: 16, borderRadius: 20, alignItems: 'center', shadowColor: '#8b7cf8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  btnOff: { backgroundColor: 'rgba(139,124,248,0.25)', shadowOpacity: 0, elevation: 0 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
