import React, { useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAvatarStore } from '../store/avatarStore';
import { colors } from '../theme/tokens';

export default function AvatarCreatorScreen({ navigation }: any) {
  const { setAvatarUrl, saveAvatarConfig } = useAvatarStore();
  const webviewRef = useRef<WebView>(null);

  const subdomain = 'demo'; // Kullanicinin subdomain'i (orn: dijitaldost) ile degistirilebilir. 'demo' herkese acik test url'idir.
  const url = `https://${subdomain}.readyplayer.me/avatar?frameApi`;

  const onMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.source !== 'readyplayerme') return;

      if (data.eventName === 'v1.avatar.exported') {
        const avatarUrl = data.data.url;
        console.log(`Avatar olusturuldu: ${avatarUrl}`);
        
        // Zustand store'u guncelle
        setAvatarUrl(avatarUrl);
        
        // Backend'e kaydet (opsiyonel olarak loading state eklenebilir)
        try {
          await saveAvatarConfig();
          Alert.alert('Basarili', '3D Avatarin basariyla kaydedildi!');
          navigation.goBack();
        } catch (e) {
          Alert.alert('Hata', 'Avatar kaydedilirken bir sorun olustu.');
        }
      }
    } catch (error) {
      console.warn('RPM mesaj ayiklanamadi:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeTxt}>Kapat</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Karakterini Yarat</Text>
        <View style={{ width: 50 }} />
      </View>
      <WebView
        ref={webviewRef}
        source={{ uri: url }}
        style={styles.webview}
        onMessage={onMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingTxt}>Stüdyo Yükleniyor...</Text>
          </View>
        )}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    padding: 8,
  },
  closeTxt: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  webview: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingTxt: {
    marginTop: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  }
});
