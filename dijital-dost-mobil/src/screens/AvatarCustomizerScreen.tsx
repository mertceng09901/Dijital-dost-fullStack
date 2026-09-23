/**
 * AvatarCustomizerScreen — Teramer Avatar Stüdyosu
 * Görseldeki gibi kategorili (Karakter / Saç / Kıyafet / Aksesuar / Arka Plan)
 */
import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, FlatList, Animated, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LiveAvatar from '../components/LiveAvatar';
import {
  useAvatarStore,
  AvatarSpecies, EyeColor, HairStyle, HairColor,
  OutfitId, OutfitColor, AccessoryId, BackgroundId, SkinTone,
} from '../store/avatarStore';

const { width: W } = Dimensions.get('window');

const THEME = {
  bg: '#070a16', card: 'rgba(255,255,255,0.04)',
  accent: '#8b7cf8', glow: 'rgba(139,124,248,0.12)',
  text: '#e8e0ff', muted: '#9d94c4', dim: '#4b5280',
  border: 'rgba(255,255,255,0.07)', aborder: 'rgba(139,124,248,0.22)',
};

// ─── Kategori Tanımları ───────────────────────────────────────────────────────
const CATEGORIES = ['Karakter', 'Saç', 'Kıyafet', 'Aksesuar', 'Arka Plan'] as const;
type Category = typeof CATEGORIES[number];

const CHARACTER_OPTIONS: { val: AvatarSpecies; label: string; emoji: string; desc: string }[] = [
  { val: 'girl',   label: 'Kız',    emoji: '👧', desc: 'Sevimli kız karakter' },
  { val: 'boy',    label: 'Erkek',  emoji: '👦', desc: 'Sevimli erkek karakter' },
  { val: 'cat',    label: 'Kedi',   emoji: '🐱', desc: 'Kedi kulaklı karakter' },
  { val: 'bunny',  label: 'Tavşan', emoji: '🐰', desc: 'Tavşan kulaklı karakter' },
  { val: 'dog',    label: 'Köpek',  emoji: '🐶', desc: 'Köpek kulaklı karakter' },
];

const SKIN_TONE_OPTIONS: { val: SkinTone; label: string; color: string }[] = [
  { val: 'light',  label: 'Açık',   color: '#f5c8a0' },
  { val: 'medium', label: 'Buğday', color: '#c8895c' },
  { val: 'dark',   label: 'Esmer',  color: '#7a4828' },
  { val: 'cosmic', label: 'Kozmik', color: '#5a8ec8' },
];

const EYE_OPTIONS: { val: EyeColor; label: string; color: string }[] = [
  { val: 'purple', label: 'Mor',    color: '#9333ea' },
  { val: 'cyan',   label: 'Mavi',   color: '#0891b2' },
  { val: 'amber',  label: 'Kehribar', color: '#d97706' },
  { val: 'green',  label: 'Yeşil',  color: '#16a34a' },
  { val: 'blue',   label: 'Gök',    color: '#2563eb' },
];

const HAIR_STYLE_OPTIONS: { val: HairStyle; label: string; emoji: string }[] = [
  { val: 'long',   label: 'Uzun',    emoji: '〰️' },
  { val: 'short',  label: 'Kısa',    emoji: '✂️' },
  { val: 'curly',  label: 'Kıvırcık',emoji: '🌀' },
  { val: 'bun',    label: 'Topuz',   emoji: '🎀' },
  { val: 'twin',   label: 'Örgü',    emoji: '🎵' },
];

const HAIR_COLOR_OPTIONS: { val: HairColor; label: string; color: string }[] = [
  { val: 'black',  label: 'Siyah',  color: '#1a1a2e' },
  { val: 'brown',  label: 'Kahve',  color: '#7c4a1e' },
  { val: 'blonde', label: 'Sarı',   color: '#d4a520' },
  { val: 'pink',   label: 'Pembe',  color: '#e879a0' },
  { val: 'white',  label: 'Beyaz',  color: '#d0c8e8' },
  { val: 'blue',   label: 'Mavi',   color: '#3b5bdb' },
];

const OUTFIT_OPTIONS: { val: OutfitId; label: string; emoji: string }[] = [
  { val: 'casual',  label: 'Günlük', emoji: '👕' },
  { val: 'sport',   label: 'Spor',   emoji: '🏃' },
  { val: 'formal',  label: 'Resmi',  emoji: '👔' },
  { val: 'cute',    label: 'Sevimli',emoji: '🌸' },
  { val: 'hoodie',  label: 'Hoodie', emoji: '🧥' },
];

const OUTFIT_COLOR_OPTIONS: { val: OutfitColor; label: string; color: string }[] = [
  { val: 'purple', label: 'Mor',     color: '#6d28d9' },
  { val: 'navy',   label: 'Lacivert',color: '#1e3a8a' },
  { val: 'teal',   label: 'Petrol',  color: '#0f766e' },
  { val: 'rose',   label: 'Gül',     color: '#be185d' },
  { val: 'mint',   label: 'Nane',    color: '#059669' },
  { val: 'orange', label: 'Turuncu', color: '#c2410c' },
];

const ACCESSORY_OPTIONS: { val: AccessoryId; label: string; emoji: string }[] = [
  { val: 'none',        label: 'Yok',       emoji: '🚫' },
  { val: 'glasses',     label: 'Gözlük',    emoji: '👓' },
  { val: 'sunglasses',  label: 'Güneş Gözlüğü', emoji: '🕶️' },
  { val: 'headphones',  label: 'Kulaklık',  emoji: '🎧' },
  { val: 'crown',       label: 'Taç',       emoji: '👑' },
  { val: 'bow',         label: 'Kurdele',   emoji: '🎀' },
  { val: 'hat',         label: 'Şapka',     emoji: '🎩' },
];

const BACKGROUND_OPTIONS: { val: BackgroundId; label: string; emoji: string; desc: string; gradient: string[] }[] = [
  { val: 'room',   label: 'Oda',    emoji: '🏠', desc: 'Sıcak bir oda',    gradient: ['#4a3f2f', '#2d2318'] },
  { val: 'park',   label: 'Park',   emoji: '🌳', desc: 'Huzurlu bir park', gradient: ['#1a3d1a', '#0d2010'] },
  { val: 'beach',  label: 'Sahil',  emoji: '🏖️', desc: 'Deniz kenarı',    gradient: ['#1a4a6a', '#0d2535'] },
  { val: 'cafe',   label: 'Kafe',   emoji: '☕', desc: 'Sıcak bir kafe',   gradient: ['#3d2a1a', '#221508'] },
  { val: 'space',  label: 'Uzay',   emoji: '🌌', desc: 'Yıldızlar arası',  gradient: ['#0a0a2e', '#050515'] },
  { val: 'forest', label: 'Orman',  emoji: '🌲', desc: 'Büyülü orman',     gradient: ['#0d2d0d', '#081508'] },
  { val: 'city',   label: 'Şehir',  emoji: '🏙️', desc: 'Şehir manzarası', gradient: ['#1a1a2e', '#0a0a18'] },
];

// ─── Küçük Seçenek Butonu ─────────────────────────────────────────────────────
function Chip({ label, emoji, color, selected, onPress }: {
  label: string; emoji?: string; color?: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[st.chip, selected && st.chipOn]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {color && <View style={[st.colorDot, { backgroundColor: color }, selected && st.colorDotOn]} />}
      {emoji && !color && <Text style={st.chipEmoji}>{emoji}</Text>}
      <Text style={[st.chipTxt, selected && st.chipTxtOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Büyük Karakter Kartı ─────────────────────────────────────────────────────
function CharCard({ val, label, emoji, desc, selected, onPress }: any) {
  return (
    <TouchableOpacity style={[st.charCard, selected && st.charCardOn]} onPress={onPress} activeOpacity={0.8}>
      <Text style={st.charEmoji}>{emoji}</Text>
      <Text style={[st.charLabel, selected && st.charLabelOn]}>{label}</Text>
      <Text style={st.charDesc}>{desc}</Text>
      {selected && <View style={st.checkBadge}><Text style={st.checkTxt}>✓</Text></View>}
    </TouchableOpacity>
  );
}

// ─── Arka Plan Kartı ──────────────────────────────────────────────────────────
function BgCard({ item, selected, onPress }: { item: typeof BACKGROUND_OPTIONS[0]; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[st.bgCard, selected && st.bgCardOn]} onPress={onPress} activeOpacity={0.8}>
      <View style={[st.bgPreview, { backgroundColor: item.gradient[1] }]}>
        <Text style={st.bgEmoji}>{item.emoji}</Text>
      </View>
      <Text style={[st.bgLabel, selected && st.bgLabelOn]}>{item.label}</Text>
      {selected && <View style={st.bgCheck}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>✓</Text></View>}
    </TouchableOpacity>
  );
}

// ─── ANA EKRAN ─────────────────────────────────────────────────────────────────
export default function AvatarCustomizerScreen({ navigation }: { navigation: any }) {
  const [category, setCategory] = useState<Category>('Karakter');
  const scale = useRef(new Animated.Value(1)).current;
  const {
    species, eyeColor, hairStyle, hairColor,
    outfitId, outfitColor, accessory, background, friendName,
    skinTone,
    setAvatarConfig,
  } = useAvatarStore();

  const pulse = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.06, tension: 180, friction: 6, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 180, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const update = (cfg: any) => { setAvatarConfig(cfg); pulse(); };

  const bg = BACKGROUND_OPTIONS.find(b => b.val === background) ?? BACKGROUND_OPTIONS[0];

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />

      {/* ── HEADER ── */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={st.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={st.headerTitle}>Avatar Stüdyosu ✦</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── AVATAR ÖNİZLEME ── */}
      <View style={[st.preview, { backgroundColor: bg.gradient[1] }]}>
        {/* Sahne arka planı renk geçişi */}
        <View style={[st.previewBg, { backgroundColor: bg.gradient[0] }]} />
        <Text style={st.bgScene}>{bg.emoji}</Text>

        <Animated.View style={{ transform: [{ scale }] }}>
          <LiveAvatar
            size={W * 0.48}
            species={species ?? 'girl'}
            eyeColor={eyeColor}
            hairStyle={hairStyle}
            hairColor={hairColor}
            outfitId={outfitId ?? 'casual'}
            outfitColor={outfitColor}
            accessory={accessory ?? 'none'}
            skinTone={skinTone ?? 'medium'}
            isSpeaking={false}
            showGlow
          />
        </Animated.View>

        {/* Konuşma balonu */}
        <View style={st.speechBubble}>
          <Text style={st.speechTxt}>Harika görünüyor! 😄{'\n'}Ne söylemek istersin?</Text>
          <View style={st.speechArrow} />
        </View>

        <Text style={st.previewName}>{friendName}</Text>
      </View>

      {/* ── KATEGORİ TABS ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.tabs} contentContainerStyle={st.tabsContent}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c} style={[st.tab, category === c && st.tabOn]} onPress={() => setCategory(c)}>
            <Text style={[st.tabTxt, category === c && st.tabTxtOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── SEÇENEKler ── */}
      <ScrollView style={st.options} contentContainerStyle={st.optionsContent} showsVerticalScrollIndicator={false}>

        {/* KARAKTER */}
        {category === 'Karakter' && (
          <>
            <Text style={st.sectionTitle}>Karakter Tipi</Text>
            <View style={st.charGrid}>
              {CHARACTER_OPTIONS.map(o => (
                <CharCard key={o.val} {...o} selected={species === o.val} onPress={() => update({ species: o.val })} />
              ))}
            </View>
            <Text style={st.sectionTitle}>Ten Rengi</Text>
            <View style={st.chipRow}>
              {SKIN_TONE_OPTIONS.map(o => (
                <Chip key={o.val} label={o.label} color={o.color} selected={skinTone === o.val} onPress={() => update({ skinTone: o.val })} />
              ))}
            </View>
            <Text style={st.sectionTitle}>Göz Rengi</Text>
            <View style={st.chipRow}>
              {EYE_OPTIONS.map(o => (
                <Chip key={o.val} label={o.label} color={o.color} selected={eyeColor === o.val} onPress={() => update({ eyeColor: o.val })} />
              ))}
            </View>
          </>
        )}

        {/* SAÇ */}
        {category === 'Saç' && (
          <>
            <Text style={st.sectionTitle}>Saç Modeli</Text>
            <View style={st.chipRow}>
              {HAIR_STYLE_OPTIONS.map(o => (
                <Chip key={o.val} label={o.label} emoji={o.emoji} selected={hairStyle === o.val} onPress={() => update({ hairStyle: o.val })} />
              ))}
            </View>
            <Text style={st.sectionTitle}>Saç Rengi</Text>
            <View style={st.chipRow}>
              {HAIR_COLOR_OPTIONS.map(o => (
                <Chip key={o.val} label={o.label} color={o.color} selected={hairColor === o.val} onPress={() => update({ hairColor: o.val })} />
              ))}
            </View>
          </>
        )}

        {/* KIYAFETi */}
        {category === 'Kıyafet' && (
          <>
            <Text style={st.sectionTitle}>Kıyafet Stili</Text>
            <View style={st.chipRow}>
              {OUTFIT_OPTIONS.map(o => (
                <Chip key={o.val} label={o.label} emoji={o.emoji} selected={outfitId === o.val} onPress={() => update({ outfitId: o.val, outfitStyle: o.val })} />
              ))}
            </View>
            <Text style={st.sectionTitle}>Renk</Text>
            <View style={st.chipRow}>
              {OUTFIT_COLOR_OPTIONS.map(o => (
                <Chip key={o.val} label={o.label} color={o.color} selected={outfitColor === o.val} onPress={() => update({ outfitColor: o.val })} />
              ))}
            </View>
          </>
        )}

        {/* AKSESUAR */}
        {category === 'Aksesuar' && (
          <>
            <Text style={st.sectionTitle}>Aksesuar Seç</Text>
            <View style={st.chipRow}>
              {ACCESSORY_OPTIONS.map(o => (
                <Chip key={o.val} label={o.label} emoji={o.emoji} selected={accessory === o.val} onPress={() => update({ accessory: o.val })} />
              ))}
            </View>
          </>
        )}

        {/* ARKA PLAN */}
        {category === 'Arka Plan' && (
          <>
            <Text style={st.sectionTitle}>Ortamını Seç</Text>
            <View style={st.bgGrid}>
              {BACKGROUND_OPTIONS.map(o => (
                <BgCard key={o.val} item={o} selected={background === o.val} onPress={() => update({ background: o.val })} />
              ))}
            </View>
          </>
        )}

        {/* KAYDET */}
        <TouchableOpacity style={st.saveBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={st.saveTxt}>Kaydet ✓</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── STILLER ─────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: THEME.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: THEME.muted, fontSize: 18, fontWeight: '600' },
  headerTitle: { color: THEME.text, fontSize: 17, fontWeight: '800' },

  preview: { alignItems: 'center', paddingTop: 12, paddingBottom: 10, position: 'relative', overflow: 'hidden', minHeight: W * 0.7 },
  previewBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 },
  bgScene: { position: 'absolute', right: 16, bottom: 30, fontSize: 48, opacity: 0.25 },
  previewName: { color: THEME.text, fontSize: 16, fontWeight: '800', marginTop: 4 },

  speechBubble: { position: 'absolute', top: 14, right: 16, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, maxWidth: 140, elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  speechTxt: { color: '#1a1a2e', fontSize: 12, fontWeight: '600', lineHeight: 17 },
  speechArrow: { position: 'absolute', bottom: -8, left: 16, width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'rgba(255,255,255,0.92)' },

  tabs: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: THEME.border },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignItems: 'center' },
  tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border },
  tabOn: { backgroundColor: THEME.glow, borderColor: THEME.accent },
  tabTxt: { color: THEME.muted, fontSize: 13, fontWeight: '600' },
  tabTxtOn: { color: THEME.text, fontWeight: '800' },

  options: { flex: 1 },
  optionsContent: { padding: 16, gap: 4 },

  sectionTitle: { color: THEME.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 14, marginBottom: 8 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 13, borderRadius: 14, backgroundColor: THEME.card, borderWidth: 1, borderColor: THEME.border },
  chipOn: { backgroundColor: 'rgba(139,124,248,0.15)', borderColor: THEME.accent, shadowColor: THEME.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  colorDotOn: { borderWidth: 2, borderColor: '#fff' },
  chipEmoji: { fontSize: 15 },
  chipTxt: { color: THEME.muted, fontSize: 13, fontWeight: '500' },
  chipTxtOn: { color: THEME.text, fontWeight: '700' },

  charGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  charCard: { width: (W - 52) / 2, backgroundColor: THEME.card, borderRadius: 20, borderWidth: 1, borderColor: THEME.border, padding: 16, alignItems: 'center', gap: 4, position: 'relative' },
  charCardOn: { backgroundColor: 'rgba(139,124,248,0.12)', borderColor: THEME.accent, shadowColor: THEME.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  charEmoji: { fontSize: 42 },
  charLabel: { color: THEME.muted, fontSize: 15, fontWeight: '700' },
  charLabelOn: { color: THEME.text },
  charDesc: { color: THEME.dim, fontSize: 11, textAlign: 'center' },
  checkBadge: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center' },
  checkTxt: { color: '#fff', fontSize: 13, fontWeight: '900' },

  bgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bgCard: { width: (W - 52) / 3, backgroundColor: THEME.card, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, overflow: 'hidden', position: 'relative' },
  bgCardOn: { borderColor: THEME.accent, shadowColor: THEME.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  bgPreview: { height: 70, alignItems: 'center', justifyContent: 'center' },
  bgEmoji: { fontSize: 32 },
  bgLabel: { color: THEME.muted, fontSize: 11, fontWeight: '600', textAlign: 'center', paddingVertical: 6 },
  bgLabelOn: { color: THEME.text, fontWeight: '800' },
  bgCheck: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center' },

  saveBtn: { backgroundColor: THEME.accent, borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 16, shadowColor: THEME.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});