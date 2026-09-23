import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { useAvatarStore } from '../store/avatarStore';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { 
    logout, userEmail, userName, isPremium, coins, voiceMinutesLeft, 
    updatePremiumState 
  } = useAuthStore();
  
  const { setAvatarConfig } = useAvatarStore();

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => {
        logout();
        navigation.replace('Welcome');
      }}
    ]);
  };

  const watchAd = () => {
    // Burada reklam SDK'sı tetiklenecek. Şimdilik mock yapıyoruz.
    Alert.alert('Reklam İzleniyor', 'Reklam başarıyla izlendi! +10 Dakika Sesli Sohbet kazandın.', [
      { text: 'Süper', onPress: () => updatePremiumState({ voiceMinutesLeft: voiceMinutesLeft + 10 }) }
    ]);
  };

  const buyPremium = () => {
    Alert.alert('Teramer Plus', 'Aylık sınırsız sohbet, yeni karakterler (Anne, Baba, vb.) ve reklamsız deneyim!', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Satın Al', onPress: () => updatePremiumState({ isPremium: true }) }
    ]);
  };

  const buyCoins = () => {
    Alert.alert('Jeton Satın Al', 'Avatarına özel kıyafetler (Drip) almak için 100 Jeton satın al!', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Satın Al', onPress: () => updatePremiumState({ coins: coins + 100 }) }
    ]);
  };

  return (
    <SafeAreaView style={st.container}>
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
          <Text style={st.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={st.title}>Hesap Ayarları</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={st.content}>
        <View style={st.profileCard}>
          <Text style={st.name}>{userName || 'Kullanıcı'}</Text>
          <Text style={st.email}>{userEmail}</Text>
          {isPremium ? (
            <View style={st.premiumBadge}><Text style={st.premiumTxt}>✨ Teramer Plus Aktif</Text></View>
          ) : (
            <View style={st.freeBadge}><Text style={st.freeTxt}>Ücretsiz Sürüm</Text></View>
          )}
        </View>

        <View style={st.statsGrid}>
          <View style={st.statBox}>
            <Text style={st.statEmoji}>🎙️</Text>
            <Text style={st.statVal}>{isPremium ? 'Sınırsız' : `${voiceMinutesLeft} dk`}</Text>
            <Text style={st.statLabel}>Kalan Ses</Text>
          </View>
          <View style={st.statBox}>
            <Text style={st.statEmoji}>🪙</Text>
            <Text style={st.statVal}>{coins}</Text>
            <Text style={st.statLabel}>Jeton</Text>
          </View>
        </View>

        {!isPremium && (
          <TouchableOpacity style={st.adBtn} onPress={watchAd} activeOpacity={0.8}>
            <View style={st.adBtnInner}>
              <Text style={st.adEmoji}>▶️</Text>
              <View>
                <Text style={st.adTitle}>Reklam İzle</Text>
                <Text style={st.adDesc}>+10 Dakika Sesli Sohbet Kazan</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {!isPremium && (
          <TouchableOpacity style={st.premiumBtn} onPress={buyPremium} activeOpacity={0.8}>
            <Text style={st.premiumBtnTxt}>Teramer Plus'a Yükselt</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={st.actionBtn} onPress={buyCoins} activeOpacity={0.8}>
          <Text style={st.actionBtnTxt}>🪙 Jeton Satın Al (Drip İçin)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={st.logoutBtnTxt}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const THEME = {
  bg: '#070a16', card: 'rgba(255,255,255,0.04)',
  accent: '#8b7cf8', premium: '#f59e0b',
  text: '#e8e0ff', muted: '#9d94c4',
  border: 'rgba(255,255,255,0.07)',
};

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: THEME.border },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.card, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: 24, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: THEME.text },
  
  content: { padding: 20 },
  
  profileCard: { backgroundColor: THEME.card, padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: THEME.border },
  name: { fontSize: 22, fontWeight: '800', color: THEME.text, marginBottom: 4 },
  email: { fontSize: 14, color: THEME.muted, marginBottom: 16 },
  premiumBadge: { backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  premiumTxt: { color: THEME.premium, fontSize: 13, fontWeight: '800' },
  freeBadge: { backgroundColor: THEME.card, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  freeTxt: { color: THEME.muted, fontSize: 13, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: THEME.card, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statVal: { fontSize: 20, fontWeight: '800', color: THEME.text, marginBottom: 4 },
  statLabel: { fontSize: 12, color: THEME.muted },

  adBtn: { backgroundColor: THEME.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: THEME.border },
  adBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  adEmoji: { fontSize: 28 },
  adTitle: { fontSize: 16, fontWeight: '700', color: THEME.text, marginBottom: 2 },
  adDesc: { fontSize: 13, color: THEME.muted },

  premiumBtn: { backgroundColor: THEME.premium, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  premiumBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },

  actionBtn: { backgroundColor: THEME.accent, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  actionBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },

  logoutBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  logoutBtnTxt: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
});
