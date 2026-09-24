import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  StatusBar, Dimensions, Image,
  ImageBackground, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import LiveAvatar from '../components/LiveAvatar';
import { useAvatarStore, AccessoryType } from '../store/avatarStore';

const { width: W, height: H } = Dimensions.get('window');

const KIYAFET = [
  { id: 'k1',  label: 'Beyaz Tişört',   img: 'https://cdn-icons-png.flaticon.com/512/892/892458.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k2',  label: 'Siyah Tişört',   img: 'https://cdn-icons-png.flaticon.com/512/892/892462.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k3',  label: 'Gömlek',         img: 'https://cdn-icons-png.flaticon.com/512/1785/1785255.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k4',  label: 'Kot Ceket',      img: 'https://cdn-icons-png.flaticon.com/512/3212/3212668.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k5',  label: 'Kapüşonlu',      img: 'https://cdn-icons-png.flaticon.com/512/2584/2584606.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k6',  label: 'Spor Forma',     img: 'https://cdn-icons-png.flaticon.com/512/2548/2548536.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k7',  label: 'Takım Elbise',   img: 'https://cdn-icons-png.flaticon.com/512/2806/2806030.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k8',  label: 'Elbise',         img: 'https://cdn-icons-png.flaticon.com/512/3321/3321742.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k9',  label: 'Kazak',          img: 'https://cdn-icons-png.flaticon.com/512/862/862814.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k10', label: 'Pijama',         img: 'https://cdn-icons-png.flaticon.com/512/2770/2770454.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k11', label: 'Kaban',          img: 'https://cdn-icons-png.flaticon.com/512/3126/3126589.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'k12', label: 'Yağmurluk',      img: 'https://cdn-icons-png.flaticon.com/512/2548/2548621.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
];

const AKSESUAR: { id: string; label: string; img: string; acc?: AccessoryType }[] = [
  { id: 'a0',  label: 'Yok',           img: 'https://cdn-icons-png.flaticon.com/512/189/189189.png',   acc: 'none' },
  { id: 'a1',  label: 'Klasik Şapka',  img: 'https://cdn-icons-png.flaticon.com/512/3006/3006901.png', acc: 'hat' },
  { id: 'a2',  label: 'Gözlük',        img: 'https://cdn-icons-png.flaticon.com/512/811/811370.png',   acc: 'glasses' },
  { id: 'a3',  label: 'Güneş Gözlüğü',img: 'https://cdn-icons-png.flaticon.com/512/926/926341.png',   acc: 'glasses' },
  { id: 'a4',  label: 'Bere',          img: 'https://cdn-icons-png.flaticon.com/512/990/990946.png' },
  { id: 'a5',  label: 'Kulaklık',      img: 'https://cdn-icons-png.flaticon.com/512/2920/2920337.png' },
  { id: 'a6',  label: 'Taç',           img: 'https://cdn-icons-png.flaticon.com/512/1534/1534938.png' },
  { id: 'a7',  label: 'Atkı',          img: 'https://cdn-icons-png.flaticon.com/512/862/862809.png' },
  { id: 'a8',  label: 'Çanta',         img: 'https://cdn-icons-png.flaticon.com/512/2548/2548670.png' },
  { id: 'a9',  label: 'Eldiven',       img: 'https://cdn-icons-png.flaticon.com/512/2224/2224395.png' },
  { id: 'a10', label: 'Boyunbağı',     img: 'https://cdn-icons-png.flaticon.com/512/3099/3099893.png' },
  { id: 'a11', label: 'Büyü Asası',   img: 'https://cdn-icons-png.flaticon.com/512/2991/2991572.png' },
];

const SAC = [
  { id: 's1', label: 'Kısa Düz',    img: 'https://cdn-icons-png.flaticon.com/512/3667/3667325.png' },
  { id: 's2', label: 'Uzun Dalgalı',img: 'https://cdn-icons-png.flaticon.com/512/3667/3667228.png' },
  { id: 's3', label: 'Topuz',       img: 'https://cdn-icons-png.flaticon.com/512/3667/3667301.png' },
  { id: 's4', label: 'Kıvırcık',    img: 'https://cdn-icons-png.flaticon.com/512/3667/3667263.png' },
  { id: 's5', label: 'Afro',        img: 'https://cdn-icons-png.flaticon.com/512/3667/3667246.png' },
  { id: 's6', label: 'Bob Kesim',   img: 'https://cdn-icons-png.flaticon.com/512/3667/3667279.png' },
  { id: 's7', label: 'Sakal',       img: 'https://cdn-icons-png.flaticon.com/512/3667/3667341.png' },
  { id: 's8', label: 'Uzun Düz',    img: 'https://cdn-icons-png.flaticon.com/512/3667/3667218.png' },
];

const MODELLER = [
  { id: 'm1', label: 'Astronot', img: 'https://cdn-icons-png.flaticon.com/512/3063/3063073.png', url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' },
  { id: 'm2', label: 'Robot',   img: 'https://cdn-icons-png.flaticon.com/512/4712/4712139.png', url: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb' },
];

type TabType = 'model' | 'sac' | 'kiyafet' | 'aksesuar';

const TABS: { key: TabType; label: string; emoji: string }[] = [
  { key: 'model',    label: 'Karakter', emoji: '🧍' },
  { key: 'sac',      label: 'Saç',      emoji: '💇' },
  { key: 'kiyafet',  label: 'Kıyafet',  emoji: '👕' },
  { key: 'aksesuar', label: 'Aksesuar', emoji: '🎩' },
];

export default function Avatar3DStudioScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab]     = useState<TabType>('kiyafet');
  const [selectedSac, setSelectedSac]         = useState('s1');
  const [selectedAcc, setSelectedAcc]         = useState('a0');
  const { modelUrl, accessory, outfit, setModelUrl, setAccessory, setOutfit } = useAvatarStore();

  const bgImage = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1080';
  const HEADER_H  = 52 + (insets.top || 0);
  const PANEL_H   = H * 0.46 + (insets.bottom || 0);
  const AVATAR_H  = H - HEADER_H - PANEL_H;
  const CARD_SIZE = (W - 40 - 24) / 4;

  const getCurrentItems = () => {
    if (activeTab === 'kiyafet')  return KIYAFET;
    if (activeTab === 'aksesuar') return AKSESUAR;
    if (activeTab === 'sac')      return SAC;
    return MODELLER;
  };

  const isSelected = (id: string) => {
    if (activeTab === 'model')    return modelUrl === MODELLER.find(m => m.id === id)?.url;
    if (activeTab === 'aksesuar') return selectedAcc === id;
    if (activeTab === 'kiyafet')  return outfit === id;
    if (activeTab === 'sac')      return selectedSac === id;
    return false;
  };

  const handleSelect = (id: string) => {
    if (activeTab === 'model') {
      const m = MODELLER.find(x => x.id === id);
      if (m) setModelUrl(m.url);
    } else if (activeTab === 'aksesuar') {
      setSelectedAcc(id);
      const item = AKSESUAR.find(x => x.id === id);
      setAccessory(item?.acc ?? 'none');
    } else if (activeTab === 'kiyafet') {
      setOutfit(id);
      const k = KIYAFET.find(x => x.id === id);
      if (k) setModelUrl(k.url);
    } else {
      setSelectedSac(id);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ImageBackground source={{ uri: bgImage }} style={StyleSheet.absoluteFill} resizeMode="cover">
        <View style={s.overlay} />

        {/* Üst Bar */}
        <View style={[s.header, { paddingTop: insets.top || 10, height: HEADER_H }]}>
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation?.goBack()}>
            <Text style={s.iconTxt}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Teramer Avatar Stüdyosu</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 3D Avatar — panel ile çakışmayan alan */}
        <View style={{ height: AVATAR_H, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <LiveAvatar
            size={Math.min(W, AVATAR_H + 30)}
            allowRotate
            hideScene={false}
          />
        </View>

        {/* Glassmorphism Alt Panel */}
        <View style={[s.sheet, { height: PANEL_H }]}>
          <BlurView intensity={92} tint="light" style={[s.glass, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            <View style={s.handle} />

            {/* Sekmeler */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
              {TABS.map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[s.tab, activeTab === tab.key && s.tabActive]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={s.tabEmoji}>{tab.emoji}</Text>
                  <Text style={[s.tabTxt, activeTab === tab.key && s.tabTxtActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Kıyafet / Aksesuar Izgarası */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.grid}>
              {getCurrentItems().map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.card, { width: CARD_SIZE, height: CARD_SIZE + 10 }, isSelected(item.id) && s.cardActive]}
                  onPress={() => handleSelect(item.id)}
                >
                  <Image source={{ uri: item.img }} style={s.cardImg} resizeMode="contain" />
                  <Text style={s.cardLabel} numberOfLines={2}>{item.label}</Text>
                  {isSelected(item.id) && (
                    <View style={s.checkDot}>
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={s.btnSave} onPress={() => navigation?.replace('Chat')}>
              <Text style={s.btnSaveTxt}>Kaydet ve Sohbete Başla 🎉</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.28)' },
  header: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10, backgroundColor: 'rgba(255,255,255,0.65)',
  },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  iconTxt: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: '#222' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', elevation: 20 },
  glass: { flex: 1, paddingTop: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.92)' },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.15)', alignSelf: 'center', marginBottom: 10 },
  tabRow: { height: 58, gap: 8, paddingBottom: 6 },
  tab: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#F0EBE3', minWidth: 68, gap: 2 },
  tabActive: { backgroundColor: '#8B5E3C' },
  tabEmoji: { fontSize: 14 },
  tabTxt: { fontSize: 9, fontWeight: '700', color: '#666' },
  tabTxtActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 6 },
  card: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 14, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', padding: 6, position: 'relative' },
  cardActive: { borderColor: '#8B5E3C', backgroundColor: '#FFF', elevation: 5, shadowColor: '#8B5E3C', shadowOpacity: 0.25, shadowRadius: 6 },
  cardImg: { width: '65%', height: '55%', marginBottom: 3 },
  cardLabel: { fontSize: 8, fontWeight: '700', color: '#444', textAlign: 'center', lineHeight: 11 },
  checkDot: { position: 'absolute', top: 3, right: 3, width: 16, height: 16, borderRadius: 8, backgroundColor: '#8B5E3C', alignItems: 'center', justifyContent: 'center' },
  btnSave: { backgroundColor: '#8B5E3C', paddingVertical: 14, borderRadius: 24, alignItems: 'center', marginTop: 8, elevation: 6 },
  btnSaveTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
