/**
 * LiveAvatar — Sevimli 3D-tarzı karakter (Kız / Kedi / Tavşan / Köpek)
 * Konuşunca ağzı açılır, dinlerken kulakları kıpırdıyor, göz kırpıyor.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, {
  Ellipse, Circle, Path, Rect, G, Defs,
  RadialGradient, LinearGradient, Stop, ClipPath,
} from 'react-native-svg';
import type {
  AvatarSpecies, EyeColor, HairStyle, HairColor,
  OutfitId, OutfitColor, AccessoryId, SkinTone
} from '../store/avatarStore';

const HUMANS = ['girl', 'boy', 'mother', 'father', 'grandma', 'grandpa'];

// ─── Renk Haritaları ──────────────────────────────────────────────────────────
const SKIN_MAP: Record<SkinTone, { hi: string; base: string; shadow: string }> = {
  light: { hi: '#fde8c8', base: '#f5c8a0', shadow: '#d4956a' },
  medium: { hi: '#e0ab80', base: '#c8895c', shadow: '#9a5c30' },
  dark: { hi: '#a06535', base: '#7a4828', shadow: '#4e2810' },
  cosmic: { hi: '#90c0f0', base: '#5a8ec8', shadow: '#3060a0' },
};

const EYE_C: Record<EyeColor, { iris: string; glow: string }> = {
  purple: { iris: '#9333ea', glow: '#e9d5ff' },
  cyan:   { iris: '#0891b2', glow: '#cffafe' },
  amber:  { iris: '#d97706', glow: '#fef3c7' },
  green:  { iris: '#16a34a', glow: '#bbf7d0' },
  blue:   { iris: '#2563eb', glow: '#bfdbfe' },
};

const HAIR_C: Record<HairColor, { base: string; hi: string; dark: string }> = {
  black:  { base: '#1a1a2e', hi: '#3a3a5e', dark: '#0a0a18' },
  brown:  { base: '#7c4a1e', hi: '#b06c30', dark: '#4a2a0a' },
  blonde: { base: '#d4a520', hi: '#f0c84a', dark: '#9a7010' },
  pink:   { base: '#e879a0', hi: '#f8b8d0', dark: '#c04870' },
  white:  { base: '#d0c8e8', hi: '#f0ecff', dark: '#9890b8' },
  blue:   { base: '#3b5bdb', hi: '#748ffc', dark: '#1e3a8a' },
};

const OUTFIT_C: Record<OutfitColor, { main: string; light: string; dark: string }> = {
  purple: { main: '#6d28d9', light: '#a78bfa', dark: '#4c1d95' },
  navy:   { main: '#1e3a8a', light: '#3b82f6', dark: '#0f172a' },
  teal:   { main: '#0f766e', light: '#2dd4bf', dark: '#064e3b' },
  rose:   { main: '#be185d', light: '#f472b6', dark: '#831843' },
  mint:   { main: '#059669', light: '#6ee7b7', dark: '#064e3b' },
  orange: { main: '#c2410c', light: '#fb923c', dark: '#7c2d12' },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  size?: number;
  species?: AvatarSpecies;
  eyeColor?: EyeColor;
  hairStyle?: HairStyle;
  hairColor?: HairColor;
  outfitId?: OutfitId;
  outfitColor?: OutfitColor;
  accessory?: AccessoryId;
  skinTone?: SkinTone;
  isSpeaking?: boolean;
  isListening?: boolean;
  showGlow?: boolean;
}

export default function LiveAvatar({
  size = 220,
  species = 'girl',
  eyeColor = 'purple',
  hairStyle = 'long',
  hairColor = 'brown',
  outfitId = 'casual',
  outfitColor = 'purple',
  accessory = 'none',
  skinTone = 'medium',
  isSpeaking = false,
  isListening = false,
  showGlow = true,
}: Props) {
  const eye    = EYE_C[eyeColor];
  const hair   = HAIR_C[hairColor];
  const outfit = OUTFIT_C[outfitColor];
  const skin   = SKIN_MAP[skinTone];

  // ── Animasyonlar ──────────────────────────────────────────────────────────
  const breath    = useRef(new Animated.Value(0)).current;
  const blink     = useRef(new Animated.Value(1)).current;
  const mouthAnim = useRef(new Animated.Value(0)).current;
  const glowAnim  = useRef(new Animated.Value(0.5)).current;
  const earAnim   = useRef(new Animated.Value(0)).current;   // hayvan kulak animasyonu
  const tailAnim  = useRef(new Animated.Value(0)).current;   // kuyruk sallanma

  // Nefes alma
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: 2600, useNativeDriver: true }),
      Animated.timing(breath, { toValue: 0, duration: 2600, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, []);

  // Göz kırpma
  useEffect(() => {
    const blinker = () => {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(blink, { toValue: 0.06, duration: 65, useNativeDriver: true }),
          Animated.timing(blink, { toValue: 1, duration: 65, useNativeDriver: true }),
        ]).start(blinker);
      }, 2200 + Math.random() * 3000);
    };
    blinker();
  }, []);

  // Glow pulse
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.3, duration: 1800, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, []);

  // Konuşma ağzı
  useEffect(() => {
    if (isSpeaking) {
      const a = Animated.loop(Animated.sequence([
        Animated.timing(mouthAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(mouthAnim, { toValue: 0.2, duration: 120, useNativeDriver: false }),
        Animated.timing(mouthAnim, { toValue: 0.8, duration: 140, useNativeDriver: false }),
        Animated.timing(mouthAnim, { toValue: 0, duration: 160, useNativeDriver: false }),
      ]));
      a.start(); return () => a.stop();
    } else {
      Animated.timing(mouthAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
    }
  }, [isSpeaking]);

  // Hayvan kulak kıpırdama (dinlerken)
  useEffect(() => {
    if (isListening && species !== 'girl') {
      const a = Animated.loop(Animated.sequence([
        Animated.timing(earAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(earAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]));
      a.start(); return () => a.stop();
    }
  }, [isListening, species]);

  // Kuyruk sallanma (idle)
  useEffect(() => {
    if (species !== 'girl') {
      const a = Animated.loop(Animated.sequence([
        Animated.timing(tailAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(tailAnim, { toValue: -1, duration: 900, useNativeDriver: true }),
        Animated.timing(tailAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]));
      a.start(); return () => a.stop();
    }
  }, [species]);

  const breathY = breath.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const earRot  = earAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-8deg'] });
  const tailRot = tailAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] });

  return (
    <Animated.View style={[styles.wrap, { width: size, height: size * 1.3 }, { transform: [{ translateY: breathY }] }]}>
      {/* Glow halkası */}
      {showGlow && (
        <Animated.View style={[styles.glow, {
          width: size * 0.88, height: size * 0.88,
          borderRadius: size * 0.44,
          top: size * 0.03, left: size * 0.06,
          opacity: glowAnim,
          shadowColor: eye.glow,
          shadowRadius: 28, shadowOpacity: 0.8,
        }]} />
      )}

      <Svg width={size} height={size * 1.3} viewBox="0 0 220 286">
        <Defs>
          {/* Cilt radyal gradyan (3D küre) */}
          <RadialGradient id="sk" cx="38%" cy="28%" rx="62%" ry="62%">
            <Stop offset="0%"   stopColor={skin.hi} />
            <Stop offset="45%"  stopColor={skin.base} />
            <Stop offset="100%" stopColor={skin.shadow} />
          </RadialGradient>
          {/* Göz gradyanı */}
          <RadialGradient id="ey" cx="30%" cy="25%" rx="70%" ry="70%">
            <Stop offset="0%"   stopColor={eye.glow} />
            <Stop offset="50%"  stopColor={eye.iris} />
            <Stop offset="100%" stopColor="#000a" />
          </RadialGradient>
          {/* Saç gradyanı */}
          <LinearGradient id="hg" x1="0%" y1="0%" x2="40%" y2="100%">
            <Stop offset="0%"   stopColor={hair.hi} />
            <Stop offset="100%" stopColor={hair.dark} />
          </LinearGradient>
          {/* Saç yan gradyan */}
          <RadialGradient id="hs" cx="25%" cy="20%" rx="60%" ry="60%">
            <Stop offset="0%"   stopColor={hair.hi} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={hair.hi} stopOpacity="0" />
          </RadialGradient>
          {/* Kıyafet */}
          <LinearGradient id="og" x1="0%" y1="0%" x2="40%" y2="100%">
            <Stop offset="0%"   stopColor={outfit.light} />
            <Stop offset="60%"  stopColor={outfit.main} />
            <Stop offset="100%" stopColor={outfit.dark} />
          </LinearGradient>
          {/* Yüz parlaklığı */}
          <RadialGradient id="fs" cx="28%" cy="22%" rx="50%" ry="45%">
            <Stop offset="0%"   stopColor="#fff" stopOpacity="0.28" />
            <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </RadialGradient>
          {/* Hayvan kulak iç */}
          <RadialGradient id="ei" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%"   stopColor="#ffb8cc" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#ff80a0" stopOpacity="0.6" />
          </RadialGradient>
          {/* Clip head */}
          <ClipPath id="hc">
            <Ellipse cx="110" cy="118" rx="68" ry="74" />
          </ClipPath>
        </Defs>

        {/* ════════════════════════════════════════
            HAYVAN KULAK (arka — kedi/tavşan/köpek)
        ════════════════════════════════════════ */}
        {species === 'cat' && <CatEarsBack hair={hair} earRot={earRot} />}
        {species === 'bunny' && <BunnyEarsBack hair={hair} earRot={earRot} />}
        {species === 'dog' && <DogEarsBack hair={hair} />}

        {/* ════════════════════════════════════════
            SAÇ (arka katman)
        ════════════════════════════════════════ */}
        <HairBack hairStyle={hairStyle} hair={hair} species={species} />

        {/* ════════════════════════════════════════
            KIYAFET / VÜCUT
        ════════════════════════════════════════ */}
        <Body outfitId={outfitId} outfit={outfit} species={species} skin={skin} />

        {/* ════════════════════════════════════════
            KULAKLAR (insan)
        ════════════════════════════════════════ */}
        {HUMANS.includes(species) && (
          <G>
            <Ellipse cx="42" cy="122" rx="11" ry="15" fill="url(#sk)" />
            <Ellipse cx="42" cy="122" rx="5" ry="8" fill={skin.shadow} opacity="0.25" />
            <Ellipse cx="178" cy="122" rx="11" ry="15" fill="url(#sk)" />
            <Ellipse cx="178" cy="122" rx="5" ry="8" fill={skin.shadow} opacity="0.25" />
          </G>
        )}

        {/* ════════════════════════════════════════
            YÜZ ANA ŞEKLİ
        ════════════════════════════════════════ */}
        <FaceShape species={species} />

        {/* ════════════════════════════════════════
            SAÇ (ön katman)
        ════════════════════════════════════════ */}
        <HairFront hairStyle={hairStyle} hair={hair} species={species} />

        {/* ════════════════════════════════════════
            KAŞLAR
        ════════════════════════════════════════ */}
        <Eyebrows hair={hair} species={species} />

        {/* ════════════════════════════════════════
            GÖZLER (büyük, parlak, anime tarzı)
        ════════════════════════════════════════ */}
        <Eyes eye={eye} blink={blink} species={species} />

        {/* ════════════════════════════════════════
            BURUN
        ════════════════════════════════════════ */}
        <Nose species={species} skin={skin} />

        {/* ════════════════════════════════════════
            AĞIZ (isSpeaking'e göre değişir)
        ════════════════════════════════════════ */}
        <Mouth isSpeaking={isSpeaking} species={species} />

        {/* ════════════════════════════════════════
            YANAK PEMBESI + YÜZ PARLAKLIĞI
        ════════════════════════════════════════ */}
        <Ellipse cx="72" cy="140" rx="18" ry="10" fill="#ffaacc" opacity="0.22" />
        <Ellipse cx="148" cy="140" rx="18" ry="10" fill="#ffaacc" opacity="0.22" />
        <Ellipse cx="90" cy="95" rx="42" ry="30" fill="url(#fs)" />

        {/* ════════════════════════════════════════
            AKSESUAR
        ════════════════════════════════════════ */}
        <AccessoryLayer accessory={accessory} outfit={outfit} />

        {/* ════════════════════════════════════════
            HAYVAN KULAK (ön — kedi/tavşan/köpek)
        ════════════════════════════════════════ */}
        {species === 'cat' && <CatEarsFront hair={hair} />}
        {species === 'bunny' && <BunnyEarsFront hair={hair} />}
        {species === 'dog' && <DogEarsFront hair={hair} />}

        {/* ════════════════════════════════════════
            KEDİ / KÖPEK BIYIKlar
        ════════════════════════════════════════ */}
        {(species === 'cat' || species === 'dog') && <Whiskers species={species} />}

      </Svg>
    </Animated.View>
  );
}

// ════════════════════════════════════════════════════════════════════════
// Alt bileşenler
// ════════════════════════════════════════════════════════════════════════

function FaceShape({ species }: { species: AvatarSpecies }) {
  if (species === 'cat')   return <Ellipse cx="110" cy="120" rx="65" ry="70" fill="url(#sk)" />;
  if (species === 'bunny') return <Ellipse cx="110" cy="122" rx="68" ry="72" fill="url(#sk)" />;
  if (species === 'dog')   return <Ellipse cx="110" cy="120" rx="66" ry="70" fill="url(#sk)" />;
  if (['boy', 'father', 'grandpa'].includes(species)) return (
    <G>
      <Ellipse cx="110" cy="116" rx="67" ry="71" fill="url(#sk)" />
      {(species === 'grandpa') && (
        <G>
          {/* Wrinkles */}
          <Path d="M75 140 Q85 146 95 140" stroke="#000" strokeWidth="1" opacity="0.1" fill="none" />
          <Path d="M125 140 Q135 146 145 140" stroke="#000" strokeWidth="1" opacity="0.1" fill="none" />
          <Path d="M95 95 Q110 98 125 95" stroke="#000" strokeWidth="1" opacity="0.1" fill="none" />
        </G>
      )}
    </G>
  );
  return (
    <G>
      <Ellipse cx="110" cy="118" rx="67" ry="73" fill="url(#sk)" />
      {(species === 'grandma') && (
        <G>
          {/* Wrinkles */}
          <Path d="M75 140 Q85 146 95 140" stroke="#000" strokeWidth="1" opacity="0.1" fill="none" />
          <Path d="M125 140 Q135 146 145 140" stroke="#000" strokeWidth="1" opacity="0.1" fill="none" />
        </G>
      )}
    </G>
  );
}

function HairBack({ hairStyle, hair, species }: any) {
  if (!HUMANS.includes(species)) return null;
  if (hairStyle === 'long') return (
    <G>
      <Path d="M45 115 Q30 175 40 215 Q58 240 82 248" stroke={hair.base} strokeWidth="30" fill="none" strokeLinecap="round" opacity="0.95" />
      <Path d="M175 115 Q190 175 180 215 Q162 240 138 248" stroke={hair.base} strokeWidth="30" fill="none" strokeLinecap="round" opacity="0.95" />
      <Path d="M43 125 Q28 180 40 215" stroke={hair.hi} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.35" />
    </G>
  );
  if (hairStyle === 'twin') return (
    <G>
      {/* İki örgü */}
      <Path d="M45 115 Q20 180 30 240" stroke={hair.base} strokeWidth="22" fill="none" strokeLinecap="round" />
      <Path d="M175 115 Q200 180 190 240" stroke={hair.base} strokeWidth="22" fill="none" strokeLinecap="round" />
    </G>
  );
  if (hairStyle === 'curly') return (
    <G>
      <Ellipse cx="44" cy="108" rx="26" ry="32" fill={hair.base} />
      <Ellipse cx="176" cy="108" rx="26" ry="32" fill={hair.base} />
      <Ellipse cx="110" cy="52" rx="46" ry="24" fill={hair.base} />
    </G>
  );
  if (hairStyle === 'bun') return <Circle cx="110" cy="48" r="34" fill={hair.base} />;
  return null;
}

function HairFront({ hairStyle, hair, species }: any) {
  if (!HUMANS.includes(species)) return null;

  const shortPath = "M44 112 Q42 60 110 44 Q178 60 176 112 Q158 72 110 68 Q62 72 44 112Z";
  const longPath  = "M44 116 Q42 62 110 46 Q178 62 176 116 Q158 74 110 70 Q62 74 44 116Z";
  const curlyPath = "M46 114 Q44 64 110 46 Q176 64 174 114";

  if (hairStyle === 'short') return (
    <G>
      <Path d={shortPath} fill="url(#hg)" />
      <Path d={shortPath} fill="url(#hs)" />
    </G>
  );
  if (hairStyle === 'long' || hairStyle === 'twin') return (
    <G>
      <Path d={longPath} fill="url(#hg)" />
      <Path d={longPath} fill="url(#hs)" />
      {/* Saç yüz kenarı */}
      <Path d="M44 116 Q44 155 50 185" stroke={hair.dark} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.5" />
      <Path d="M176 116 Q176 155 170 185" stroke={hair.dark} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.5" />
    </G>
  );
  if (hairStyle === 'curly') return (
    <G>
      <Path d={curlyPath} fill={hair.base} />
      <Ellipse cx="72" cy="72" rx="22" ry="26" fill={hair.base} />
      <Ellipse cx="110" cy="58" rx="24" ry="20" fill={hair.base} />
      <Ellipse cx="148" cy="72" rx="22" ry="26" fill={hair.base} />
      {/* Kıvırcık parlama */}
      <Circle cx="70" cy="66" r="9" fill={hair.hi} opacity="0.45" />
      <Circle cx="110" cy="54" r="10" fill={hair.hi} opacity="0.45" />
      <Circle cx="150" cy="66" r="9" fill={hair.hi} opacity="0.45" />
    </G>
  );
  if (hairStyle === 'bun') return (
    <G>
      <Path d="M44 114 Q42 62 110 46 Q178 62 176 114 Q160 74 110 70 Q60 74 44 114Z" fill="url(#hg)" />
      <Circle cx="110" cy="48" r="30" fill="url(#hg)" />
      <Circle cx="110" cy="48" r="18" fill={hair.hi} opacity="0.3" />
      <Circle cx="110" cy="48" r="8" fill={hair.base} opacity="0.5" />
    </G>
  );
  return null;
}

function Body({ outfitId, outfit, species, skin }: any) {
  const neckColor = skin.base;
  return (
    <G>
      <Ellipse cx="110" cy="202" rx="16" ry="14" fill={neckColor} />
      {/* Kıyafet omuzlar */}
      {outfitId === 'hoodie' ? (
        <>
          <Ellipse cx="55" cy="238" rx="52" ry="34" fill={outfit.main} />
          <Ellipse cx="165" cy="238" rx="52" ry="34" fill={outfit.main} />
          <Ellipse cx="110" cy="250" rx="60" ry="32" fill={outfit.main} />
          {/* Hoodie çizgisi */}
          <Path d="M90 212 Q110 230 130 212" stroke={outfit.dark} strokeWidth="2" fill="none" />
        </>
      ) : outfitId === 'cute' ? (
        <>
          <Ellipse cx="55" cy="238" rx="52" ry="34" fill={outfit.light} />
          <Ellipse cx="165" cy="238" rx="52" ry="34" fill={outfit.light} />
          <Ellipse cx="110" cy="250" rx="60" ry="32" fill={outfit.light} />
          {/* Yaka fırfır */}
          <Path d="M80 210 Q95 220 110 215 Q125 220 140 210" stroke={outfit.main} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : outfitId === 'formal' ? (
        <>
          <Ellipse cx="55" cy="238" rx="52" ry="34" fill={outfit.dark} />
          <Ellipse cx="165" cy="238" rx="52" ry="34" fill={outfit.dark} />
          <Ellipse cx="110" cy="250" rx="60" ry="32" fill={outfit.dark} />
          <Path d="M96 212 L110 230 L124 212" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" />
        </>
      ) : (
        <>
          <Ellipse cx="55" cy="238" rx="52" ry="34" fill="url(#og)" />
          <Ellipse cx="165" cy="238" rx="52" ry="34" fill="url(#og)" />
          <Ellipse cx="110" cy="250" rx="60" ry="32" fill="url(#og)" />
        </>
      )}
      {/* Omuz parlaklığı */}
      <Ellipse cx="55" cy="230" rx="28" ry="12" fill="#fff" opacity="0.1" />
      <Ellipse cx="165" cy="230" rx="28" ry="12" fill="#fff" opacity="0.1" />
    </G>
  );
}

function Eyebrows({ hair, species }: any) {
  const yOff = species === 'bunny' ? 4 : 0;
  return (
    <G>
      <Path d={`M68 ${94 + yOff} Q82 ${88 + yOff} 96 ${92 + yOff}`} stroke={hair.dark} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <Path d={`M124 ${92 + yOff} Q138 ${88 + yOff} 152 ${94 + yOff}`} stroke={hair.dark} strokeWidth="4.5" strokeLinecap="round" fill="none" />
    </G>
  );
}

function Eyes({ eye, blink, species }: { eye: any; blink: Animated.Value; species: AvatarSpecies }) {
  const yOff = species === 'bunny' ? 4 : 0;
  // Göz beyazı + iris büyük anime tarzı
  return (
    <G>
      {/* SOL GÖZ */}
      <Ellipse cx="82" cy={112 + yOff} rx="20" ry="17" fill="#f5f0ff" />
      <Circle  cx="82" cy={113 + yOff} r="13" fill="url(#ey)" />
      <Circle  cx="82" cy={113 + yOff} r="6.5" fill="#06040e" />
      <Circle  cx="76" cy={107 + yOff} r="4" fill="white" opacity="0.95" />
      <Circle  cx="86" cy={116 + yOff} r="2" fill="white" opacity="0.55" />
      <Circle  cx="82" cy={113 + yOff} r="13" fill={eye.glow} opacity="0.18" />
      {/* Kirpik sol */}
      <Path d={`M62 ${108 + yOff} Q82 ${100 + yOff} 102 ${108 + yOff}`} stroke={HAIR_C.black.base} strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* SAĞ GÖZ */}
      <Ellipse cx="138" cy={112 + yOff} rx="20" ry="17" fill="#f5f0ff" />
      <Circle  cx="138" cy={113 + yOff} r="13" fill="url(#ey)" />
      <Circle  cx="138" cy={113 + yOff} r="6.5" fill="#06040e" />
      <Circle  cx="132" cy={107 + yOff} r="4" fill="white" opacity="0.95" />
      <Circle  cx="142" cy={116 + yOff} r="2" fill="white" opacity="0.55" />
      <Circle  cx="138" cy={113 + yOff} r="13" fill={eye.glow} opacity="0.18" />
      {/* Kirpik sağ */}
      <Path d={`M118 ${108 + yOff} Q138 ${100 + yOff} 158 ${108 + yOff}`} stroke={HAIR_C.black.base} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </G>
  );
}

function Nose({ species, skin }: { species: AvatarSpecies, skin: any }) {
  if (species === 'cat') return (
    <G>
      <Path d="M106 135 L110 142 L114 135" fill="#ffaacc" opacity="0.8" />
      <Ellipse cx="110" cy="142" rx="4" ry="3" fill="#ffaacc" opacity="0.8" />
    </G>
  );
  if (species === 'dog') return (
    <G>
      <Ellipse cx="110" cy="140" rx="12" ry="9" fill="#2d1b0e" opacity="0.85" />
      <Ellipse cx="106" cy="137" rx="4" ry="2.5" fill="white" opacity="0.35" />
    </G>
  );
  return (
    <G>
      <Path d="M104 133 Q110 140 116 133" stroke={skin.shadow} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.5" />
      <Ellipse cx="106" cy="136" rx="4" ry="2.5" fill={skin.shadow} opacity="0.18" />
      <Ellipse cx="114" cy="136" rx="4" ry="2.5" fill={skin.shadow} opacity="0.18" />
    </G>
  );
}

function Mouth({ isSpeaking, species }: { isSpeaking: boolean; species: AvatarSpecies }) {
  const lipColor = species === 'cat' ? '#ff80a0' : '#e06080';
  if (!isSpeaking) {
    return (
      <G>
        <Path d="M88 155 Q110 170 132 155" fill={lipColor} opacity="0.85" />
        <Path d="M88 155 Q98 152 110 153 Q122 152 132 155" fill={lipColor} opacity="0.7" />
        <Circle cx="87" cy="155" r="3" fill={lipColor} opacity="0.45" />
        <Circle cx="133" cy="155" r="3" fill={lipColor} opacity="0.45" />
        <Path d="M96 162 Q110 168 124 162" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
      </G>
    );
  }
  return (
    <G>
      <Ellipse cx="110" cy="160" rx="22" ry="14" fill="#3a1520" />
      <Path d="M88 154 Q98 151 110 152 Q122 151 132 154 Q124 170 110 172 Q96 170 88 154Z" fill={lipColor} opacity="0.9" />
      <Rect x="96" y="154" width="28" height="7" rx="3.5" fill="white" opacity="0.88" />
      <Path d="M96 166 Q110 172 124 166" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
    </G>
  );
}

// ─── Hayvan Kulaklar ──────────────────────────────────────────────────────────
function CatEarsBack({ hair, earRot }: any) {
  return (
    <G>
      <Path d="M55 75 L32 28 L80 62 Z" fill={hair.base} />
      <Path d="M165 75 L188 28 L140 62 Z" fill={hair.base} />
    </G>
  );
}
function CatEarsFront({ hair }: any) {
  return (
    <G>
      <Path d="M57 76 L38 36 L78 64 Z" fill={hair.hi} opacity="0.7" />
      <Path d="M163 76 L182 36 L142 64 Z" fill={hair.hi} opacity="0.7" />
      {/* Kulak iç pembe */}
      <Path d="M57 74 L44 44 L74 66 Z" fill="url(#ei)" opacity="0.8" />
      <Path d="M163 74 L176 44 L146 66 Z" fill="url(#ei)" opacity="0.8" />
    </G>
  );
}

function BunnyEarsBack({ hair, earRot }: any) {
  return (
    <G>
      <Animated.View style={{ position: 'absolute', transform: [{ rotate: earRot }] }}>
        <Ellipse cx="78" cy="30" rx="18" ry="45" fill={hair.base} transform="rotate(-8, 78, 80)" />
      </Animated.View>
      <Ellipse cx="142" cy="30" rx="18" ry="45" fill={hair.base} transform="rotate(8, 142, 80)" />
    </G>
  );
}
function BunnyEarsFront({ hair }: any) {
  return (
    <G>
      <Ellipse cx="78" cy="30" rx="11" ry="36" fill="url(#ei)" opacity="0.7" transform="rotate(-8, 78, 80)" />
      <Ellipse cx="142" cy="30" rx="11" ry="36" fill="url(#ei)" opacity="0.7" transform="rotate(8, 142, 80)" />
    </G>
  );
}

function DogEarsBack({ hair }: any) {
  return (
    <G>
      <Ellipse cx="52" cy="85" rx="30" ry="42" fill={hair.base} transform="rotate(-20, 52, 85)" />
      <Ellipse cx="168" cy="85" rx="30" ry="42" fill={hair.base} transform="rotate(20, 168, 85)" />
    </G>
  );
}
function DogEarsFront({ hair }: any) {
  return (
    <G>
      <Ellipse cx="52" cy="88" rx="20" ry="28" fill={hair.hi} opacity="0.4" transform="rotate(-20, 52, 85)" />
      <Ellipse cx="168" cy="88" rx="20" ry="28" fill={hair.hi} opacity="0.4" transform="rotate(20, 168, 85)" />
    </G>
  );
}

function Whiskers({ species }: { species: AvatarSpecies }) {
  const col = species === 'cat' ? '#aaa8c0' : '#8a7050';
  return (
    <G>
      <Path d="M58 146 L88 150" stroke={col} strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <Path d="M54 152 L86 152" stroke={col} strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <Path d="M58 158 L88 154" stroke={col} strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <Path d="M132 150 L162 146" stroke={col} strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <Path d="M134 152 L166 152" stroke={col} strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
      <Path d="M132 154 L162 158" stroke={col} strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
    </G>
  );
}

function AccessoryLayer({ accessory, outfit }: { accessory: AccessoryId; outfit: any }) {
  if (accessory === 'glasses') return (
    <G>
      <Rect x="60" y="103" width="38" height="26" rx="11" fill="none" stroke="#c4b5fd" strokeWidth="2.8" />
      <Rect x="122" y="103" width="38" height="26" rx="11" fill="none" stroke="#c4b5fd" strokeWidth="2.8" />
      <Path d="M98 116 L122 116" stroke="#c4b5fd" strokeWidth="2.8" />
      <Path d="M60 116 L50 112" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M160 116 L170 112" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M64 107 L74 105" stroke="white" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
    </G>
  );
  if (accessory === 'sunglasses') return (
    <G>
      <Rect x="58" y="103" width="40" height="25" rx="10" fill="#1a1a2e" opacity="0.9" />
      <Rect x="122" y="103" width="40" height="25" rx="10" fill="#1a1a2e" opacity="0.9" />
      <Path d="M98 115 L122 115" stroke="#555" strokeWidth="3" />
      <Path d="M58 115 L48 111" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M162 115 L172 111" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
      {/* Lens yansıması */}
      <Path d="M63 107 L76 105" stroke="white" strokeWidth="2" opacity="0.25" strokeLinecap="round" />
      <Path d="M127 107 L140 105" stroke="white" strokeWidth="2" opacity="0.25" strokeLinecap="round" />
    </G>
  );
  if (accessory === 'headphones') return (
    <G>
      <Path d="M42 116 Q42 62 110 52 Q178 62 178 116" stroke={outfit.main} strokeWidth="8" fill="none" strokeLinecap="round" />
      <Ellipse cx="42" cy="122" rx="18" ry="22" fill={outfit.main} />
      <Ellipse cx="42" cy="122" rx="11" ry="14" fill={outfit.light} />
      <Ellipse cx="178" cy="122" rx="18" ry="22" fill={outfit.main} />
      <Ellipse cx="178" cy="122" rx="11" ry="14" fill={outfit.light} />
    </G>
  );
  if (accessory === 'crown') return (
    <G>
      <Path d="M60 75 L74 48 L94 66 L110 36 L126 66 L146 48 L160 75 Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1.5" />
      <Circle cx="110" cy="40" r="8" fill="#ef4444" />
      <Circle cx="74" cy="52" r="6" fill="#8b5cf6" />
      <Circle cx="146" cy="52" r="6" fill="#8b5cf6" />
    </G>
  );
  if (accessory === 'bow') return (
    <G>
      {/* Kurdele sol */}
      <Path d="M148 62 Q162 52 172 62 Q162 72 148 62 Z" fill="#f472b6" />
      {/* Kurdele sağ */}
      <Path d="M172 62 Q182 52 196 62 Q182 72 172 62 Z" fill="#f472b6" />
      {/* Düğme */}
      <Circle cx="172" cy="62" r="7" fill="#ec4899" />
      <Circle cx="172" cy="62" r="3.5" fill="#fce7f3" />
    </G>
  );
  if (accessory === 'hat') return (
    <G>
      <Ellipse cx="110" cy="50" rx="75" ry="14" fill={outfit.dark} />
      <Rect x="55" y="10" width="110" height="44" rx="16" fill={outfit.main} />
      <Ellipse cx="110" cy="10" rx="55" ry="10" fill={outfit.light} opacity="0.3" />
    </G>
  );
  return null;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(180,130,255,0.3)',
    backgroundColor: 'rgba(140,100,255,0.06)',
  },
});
