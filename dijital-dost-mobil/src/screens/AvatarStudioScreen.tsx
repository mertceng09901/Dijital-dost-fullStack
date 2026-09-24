/**
 * AvatarStudioScreen.tsx
 * - 3D Fotogercekci Fallback Sistemi (Alternatif 3)
 * - Aydinlik / Ferah Arka Plan
 * - Yari Saydam, yatay kaydirilabilir Alt Menu
 * - Speech Bubble
 */
import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar, Dimensions,
  ImageBackground, Image, Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useAvatarStore } from '../store/avatarStore';
import LiveAvatar from '../components/LiveAvatar';
import { SCENE_CATALOG } from '../data/sceneCatalog';
import { AVATAR_CATALOG } from '../data/3dAvatarCatalog';
import { colors, spacing, typography, radius } from '../theme/tokens';

const { width: W, height: H } = Dimensions.get('window');
const THUMB = (W - spacing.md * 2 - spacing.sm * 3) / 4;

type TabId = 'kıyafet' | 'arkaplan';

export default function AvatarStudioScreen({ navigation }: any) {
  const { friendName, sceneConfig, setScene, setAvatarUrl, avatarUrl, saveAvatarConfig } = useAvatarStore();
  const [activeTab, setActiveTab] = useState<TabId>('kıyafet');
  const [loading, setLoading] = useState(false);

  const currentScene = SCENE_CATALOG[sceneConfig.scene];
  const currentSceneImage = currentScene?.imageUrl ?? SCENE_CATALOG['room'].imageUrl;

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveAvatarConfig();
      Alert.alert('Kaydedildi!', 'Harika gorunuyor!');
      navigation.goBack();
    } catch {
      Alert.alert('Hata', 'Kayit sirasinda bir sorun olustu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Aydinlik Mekan Arka Plani */}
      <ImageBackground source={{ uri: currentSceneImage }} style={StyleSheet.absoluteFill} resizeMode="cover">
        <View style={s.topOverlay} />
        <SafeAreaView style={s.safeArea}>

          {/* HEADER */}
          <View style={s.header}>
            <TouchableOpacity style={s.iconBtn} onPress={() => navigation.goBack()}>
              <Text style={s.iconBtnTxt}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={s.headerTitle} numberOfLines={1}>{friendName} Avatar Stüdyosu</Text>
            <TouchableOpacity style={s.iconBtn}>
              <Text style={s.iconBtnTxt}>{"^"}</Text>
            </TouchableOpacity>
          </View>

          {/* DEVASA AVATAR VE KONUSMA BALONU */}
          <View style={s.previewArea}>
            <LiveAvatar size={W * 0.85} showGlow={false} rounded={false} />
            <View style={s.speechBubble}>
              <Text style={s.speechText}>{"Harika görünüyor!\nNe söylemek istersin?"}</Text>
              <View style={s.speechTail} />
            </View>
          </View>

          {/* GLASSMORPHISM ALT PANEL */}
          <View style={s.bottomSheet}>
            <BlurView intensity={85} tint="light" style={s.glassInner}>
              <View style={s.handle} />

              {/* SEKMELER */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
                <TouchableOpacity style={[s.tab, activeTab === 'kıyafet' && s.tabActive]} onPress={() => setActiveTab('kıyafet')}>
                  <Text style={[s.tabTxt, activeTab === 'kıyafet' && s.tabTxtActive]}>3D Modeller</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.tab, activeTab === 'arkaplan' && s.tabActive]} onPress={() => setActiveTab('arkaplan')}>
                  <Text style={[s.tabTxt, activeTab === 'arkaplan' && s.tabTxtActive]}>Arka Plan</Text>
                </TouchableOpacity>
              </ScrollView>

              {/* ICERIK */}
              <ScrollView style={s.gridScroll} contentContainerStyle={s.gridContent} showsVerticalScrollIndicator={false}>
                <View style={s.grid}>
                  
                  {activeTab === 'kıyafet' && AVATAR_CATALOG.bases.map(base => (
                    <TouchableOpacity
                      key={base.id}
                      style={[s.bgItem, avatarUrl === base.url && s.gridItemSelected]}
                      onPress={() => setAvatarUrl(base.url)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: base.thumb }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    </TouchableOpacity>
                  ))}

                  {activeTab === 'arkaplan' && Object.values(SCENE_CATALOG).map(scene => (
                    <TouchableOpacity
                      key={scene.id}
                      style={[s.bgItem, sceneConfig.scene === scene.id && s.gridItemSelected]}
                      onPress={() => setScene(scene.id)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: scene.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      <View style={s.bgLabel}>
                        <Text style={s.bgLabelTxt}>{scene.emoji} {scene.label}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                </View>
              </ScrollView>

              {/* KAYDET VE PAYLAS */}
              <View style={s.actionRow}>
                <TouchableOpacity style={[s.btnSave, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
                  <Text style={s.btnSaveTxt}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnShare}>
                  <Text style={s.btnShareTxt}>Paylaş</Text>
                </TouchableOpacity>
              </View>

            </BlurView>
          </View>

        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const BOTTOM_H = H * 0.40;

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  // Aydinlik ve ferah filtre
  topOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.25)' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  iconBtnTxt: { fontSize: 22, color: colors.textPrimary, fontWeight: '700' },
  headerTitle: { ...typography.heading, fontSize: 16, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },

  previewArea: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: spacing.sm, position: 'relative' },
  speechBubble: { position: 'absolute', top: 30, right: spacing.lg, backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.lg, maxWidth: 180, elevation: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 10 },
  speechTail: { position: 'absolute', bottom: -10, left: 24, width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'rgba(255, 255, 255, 0.95)' },
  speechText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, lineHeight: 18 },

  bottomSheet: { height: BOTTOM_H, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden', elevation: 15, shadowColor: '#000', shadowOffset: {width: 0, height: -10}, shadowOpacity: 0.1, shadowRadius: 20 },
  glassInner: { flex: 1, paddingTop: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.xl, backgroundColor: 'rgba(255, 255, 255, 0.75)' },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.15)', alignSelf: 'center', marginBottom: spacing.md },

  tabRow: { paddingBottom: spacing.sm, gap: spacing.xs, maxHeight: 45 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.pill, marginRight: spacing.xs, backgroundColor: 'rgba(255,255,255,0.6)' },
  tabActive: { backgroundColor: colors.primary, elevation: 4 },
  tabTxt: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  tabTxtActive: { color: '#fff' },

  gridScroll: { flex: 1 },
  gridContent: { paddingBottom: spacing.md, paddingTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  bgItem: { width: THUMB, height: THUMB * 1.2, borderRadius: radius.md, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  gridItemSelected: { borderColor: colors.primary, shadowColor: colors.primary, elevation: 5, backgroundColor: 'rgba(255,255,255,0.9)' },
  bgLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.50)', paddingVertical: 4, alignItems: 'center' },
  bgLabelTxt: { color: '#fff', fontSize: 9, fontWeight: '700' },

  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btnSave: { flex: 2, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.pill, alignItems: 'center', elevation: 6 },
  btnSaveTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  btnShare: { flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: colors.border, paddingVertical: 14, borderRadius: radius.pill, alignItems: 'center' },
  btnShareTxt: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
});
