import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, ImageBackground, StatusBar } from 'react-native';
import { QUOTES } from '../data/quotes';
import { SCENE_CATALOG } from '../data/sceneCatalog';
import { typography } from '../theme/tokens';

export default function SplashQuoteScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rastgele baslangic sozu
  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

  useEffect(() => {
    let active = true;
    
    const runAnimation = async () => {
      for (let i = 0; i < 3; i++) {
        if (!active) break;
        // Fade in
        await new Promise(r => {
          Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start(r);
        });
        // Bekle
        await new Promise(r => setTimeout(r, 2000));
        
        if (i === 2) break; // Son sozde fade out yapma, dogrudan gec

        // Fade out
        await new Promise(r => {
          Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }).start(r);
        });
        
        if (active) {
          setQuoteIndex(prev => (prev + 1) % QUOTES.length);
        }
      }
      
      if (active) {
        navigation.replace('Login');
      }
    };
    
    runAnimation();
    
    return () => { active = false; };
  }, [fadeAnim, navigation]);

  const quote = QUOTES[quoteIndex] || QUOTES[0];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: SCENE_CATALOG.room.imageUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={12}
      >
        <View style={s.overlay} />
      </ImageBackground>

      <Animated.View style={[s.content, { opacity: fadeAnim }]}>
        <Text style={s.quoteText}>"{quote.text}"</Text>
        <Text style={s.authorText}>— {quote.author}</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 94, 60, 0.65)', // Sicak kahverengi/toprak tonu overlay
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  quoteText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 32,
    fontStyle: 'italic',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  authorText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  }
});
