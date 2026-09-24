import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, StatusBar, Dimensions,
  ImageBackground, ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import LiveAvatar from '../components/LiveAvatar';
import { useAvatarStore, AccessoryType } from '../store/avatarStore';

const { width: W, height: H } = Dimensions.get('window');

// Aksesuar seçenekleri
const ACCESSORY_OPTIONS: { id: AccessoryType; label: string; emoji: string }[] = [
  { id: 'none',    label: 'Yok',    emoji: '🚫' },
  { id: 'hat',     label: 'Şapka',  emoji: '🎩' },
  { id: 'glasses', label: 'Gözlük', emoji: '🕶️' },
];

// Farklı GLB model alternatifleri
const MODEL_OPTIONS = [
  {
    id: 'astronaut',
    label: 'Astronot',
    emoji: '👨‍🚀',
    url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  },
  {
    id: 'robot',
    label: 'Robot',
    emoji: '🤖',
    url: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
  },
];

type Tab = 'model' | 'aksesuar';

export default function Avatar3DStudioScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('model');
  const { modelUrl, accessory, setModelUrl, setAccessory } = useAvatarStore();

  const bgImage =
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1080';

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={{ uri: bgImage }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={s.overlay} />

        {/* Tam Ekran 3D Avatar — her yöne dönebilir */}
        <View style={[StyleSheet.absoluteFill, { bottom: H * 0.40 }]}>
          <LiveAvatar
            size={W}
            allowRotate
            hideScene={false}
          />
        </View>

        <SafeAreaView style={s.safe} pointerEvents="box-none">
          {/* Üst Bar */}
          <View style={s.header} pointerEvents="box-none">
            <TouchableOpacity style={s.iconBtn} onPress={() => navigation?.goBack()}>
              <Text style={s.iconTxt}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle}>Teramer Avatar Stüdyosu</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Glassmorphism Alt Panel */}
          <View style={s.sheet}>
            <BlurView intensity={90} tint="light" style={s.glass}>
              <View style={s.handle} />

              {/* Sekmeler */}
              <View style={s.tabRow}>
                {(['model', 'aksesuar'] as Tab[]).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[s.tab, activeTab === tab && s.tabActive]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>
                      {tab === 'model' ? '👤 Model' : '🎨 Aksesuar'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* İçerik */}
              <ScrollView
                contentContainerStyle={s.grid}
                showsVerticalScrollIndicator={false}
              >
                {activeTab === 'model' &&
                  MODEL_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[s.card, modelUrl === opt.url && s.cardActive]}
                      onPress={() => setModelUrl(opt.url)}
                    >
                      <Text style={s.cardEmoji}>{opt.emoji}</Text>
                      <Text style={s.cardLabel}>{opt.label}</Text>
                      {modelUrl === opt.url && (
                        <View style={s.checkDot}>
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}

                {activeTab === 'aksesuar' &&
                  ACCESSORY_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[s.card, accessory === opt.id && s.cardActive]}
                      onPress={() => setAccessory(opt.id)}
                    >
                      <Text style={s.cardEmoji}>{opt.emoji}</Text>
                      <Text style={s.cardLabel}>{opt.label}</Text>
                      {accessory === opt.id && (
                        <View style={s.checkDot}>
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              {/* Aksiyon Butonları */}
              <View style={s.actionRow}>
                <TouchableOpacity
                  style={s.btnSave}
                  onPress={() => navigation?.replace('Chat')}
                >
                  <Text style={s.btnSaveTxt}>Kaydet ve Başla 🎉</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const SHEET_H = H * 0.42;

const s = StyleSheet.create({
  root: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.35)' },
  safe: { flex: 1, justifyContent: 'space-between' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  iconTxt: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#222' },

  sheet: {
    height: SHEET_H,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden', elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12, shadowRadius: 20,
  },
  glass: { flex: 1, paddingTop: 10, paddingHorizontal: 18, paddingBottom: 28, backgroundColor: 'rgba(255,255,255,0.88)' },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.15)', alignSelf: 'center', marginBottom: 14 },

  tabRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F0EBE3', alignItems: 'center' },
  tabActive: { backgroundColor: '#8B5E3C', elevation: 3 },
  tabTxt: { fontSize: 13, fontWeight: '700', color: '#666' },
  tabTxtActive: { color: '#fff' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 10 },
  card: {
    width: (W - 36 - 24) / 3,
    height: (W - 36 - 24) / 3,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 18, borderWidth: 2, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center', padding: 8,
    position: 'relative',
  },
  cardActive: {
    borderColor: '#8B5E3C',
    backgroundColor: 'rgba(255,255,255,0.96)',
    elevation: 5, shadowColor: '#8B5E3C', shadowOpacity: 0.2, shadowRadius: 8,
  },
  cardEmoji: { fontSize: 32, marginBottom: 6 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#555', textAlign: 'center' },
  checkDot: {
    position: 'absolute', top: 6, right: 6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center',
  },

  actionRow: { marginTop: 14 },
  btnSave: {
    backgroundColor: '#8B5E3C', paddingVertical: 16,
    borderRadius: 26, alignItems: 'center',
    shadowColor: '#8B5E3C', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  btnSaveTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
