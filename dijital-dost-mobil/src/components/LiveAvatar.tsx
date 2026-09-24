/**
 * LiveAvatar.tsx
 * OrbitControls KULLANILMIYOR — pinch crash çözümü.
 * Dönme: PanResponder (tek parmak) → useFrame ile uygula.
 */
import React, { Suspense, useRef } from 'react';
import { StyleSheet, View, PanResponder, Animated } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, Environment } from '@react-three/drei/native';
import { useAvatarStore, AccessoryType } from '../store/avatarStore';

interface LiveAvatarProps {
  size?: number;
  isSpeaking?: boolean;
  isListening?: boolean;
  rounded?: boolean;
  hideScene?: boolean;
  allowRotate?: boolean;
}

// --- 3D Aksesuar: Şapka ---
function HatMesh() {
  return (
    <group position={[0, 0.98, 0]}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 32]} />
        <meshStandardMaterial color="#5C3D1E" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.22, 0.27, 0.36, 32]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.5} />
      </mesh>
    </group>
  );
}

// --- 3D Aksesuar: Gözlük ---
function GlassesMesh() {
  return (
    <group position={[0, 0.44, 0.28]}>
      <mesh position={[-0.12, 0, 0]}>
        <torusGeometry args={[0.1, 0.015, 8, 24]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.12, 0, 0]}>
        <torusGeometry args={[0.1, 0.015, 8, 24]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.05, 0.015, 0.015]} />
        <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// --- Ana Avatar Modeli ---
function AvatarModel({ url, accessory }: { url: string; accessory: AccessoryType }) {
  const { scene } = useGLTF(url);
  
  // Model url'sine göre dinamik ölçek ve pozisyon ayarı
  const isRobot = url.includes('RobotExpressive');
  const scale = isRobot ? 0.65 : 0.95;
  const positionY = isRobot ? -1.4 : -0.72;

  return (
    <group>
      <primitive object={scene} scale={scale} position={[0, positionY, 0]} />
      {accessory === 'hat' && <HatMesh />}
      {accessory === 'glasses' && <GlassesMesh />}
    </group>
  );
}

// --- Dönen Sahne Grubu (PanResponder'dan rotY alır) ---
function RotatingScene({
  url,
  accessory,
  rotY,
  rotX,
}: {
  url: string;
  accessory: AccessoryType;
  rotY: React.MutableRefObject<number>;
  rotX: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<any>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Yumuşak geçiş: mevcut değere doğru yaklaş
      groupRef.current.rotation.y += (rotY.current - groupRef.current.rotation.y) * 0.15;
      groupRef.current.rotation.x += (rotX.current - groupRef.current.rotation.x) * 0.15;
      // Dikey dönme sınırı: tam ters dönmesin
      groupRef.current.rotation.x = Math.max(-1.2, Math.min(1.2, groupRef.current.rotation.x));
    }
  });

  return (
    <group ref={groupRef}>
      <AvatarModel url={url} accessory={accessory} />
    </group>
  );
}

// --- Dışa aktarılan bileşen ---
export default function LiveAvatar({
  size = 280,
  isSpeaking = false,
  isListening = false,
  rounded = false,
  hideScene = false,
  allowRotate = true,
}: LiveAvatarProps) {
  const rawUrl   = useAvatarStore((s) => s.modelUrl);
  const accessory = useAvatarStore((s) => s.accessory);

  // Güvenlik: undefined veya ölü link kontrolü
  const safeUrl =
    rawUrl && typeof rawUrl === 'string' && !rawUrl.includes('readyplayer.me')
      ? rawUrl
      : 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

  // Geçiş animasyonu için state ve ref
  const [displayUrl, setDisplayUrl] = React.useState(safeUrl);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (safeUrl !== displayUrl) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setDisplayUrl(safeUrl);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }
  }, [safeUrl, displayUrl]);

  // Dönme açıları (ref → re-render yok, performanslı)
  const rotY   = useRef(0);
  const rotX   = useRef(0);
  const lastX  = useRef(0);
  const lastY  = useRef(0);

  // PanResponder: OrbitControls yerine sıfırdan gesture yönetimi
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => allowRotate && !hideScene,
      onMoveShouldSetPanResponder:  () => allowRotate && !hideScene,
      onPanResponderGrant: (e) => {
        // Tek dokunuş noktasını kaydet
        lastX.current = e.nativeEvent.pageX;
        lastY.current = e.nativeEvent.pageY;
      },
      onPanResponderMove: (e) => {
        // Sadece ilk parmağı kullan — multi-touch ignore
        if (e.nativeEvent.touches.length > 1) return;
        const dx = e.nativeEvent.pageX - lastX.current;
        const dy = e.nativeEvent.pageY - lastY.current;
        rotY.current += dx * 0.012;
        rotX.current += dy * 0.008;
        lastX.current = e.nativeEvent.pageX;
        lastY.current = e.nativeEvent.pageY;
      },
    })
  ).current;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        rounded && { borderRadius: size / 2, overflow: 'hidden' },
      ]}
      {...(allowRotate && !hideScene ? panResponder.panHandlers : {})}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]} pointerEvents="none">
        <Canvas
          camera={{ position: [0, 1.0, 3.5], fov: 50 }}
          gl={{ alpha: true }}
        >
          <ambientLight intensity={2.2} />
          <directionalLight position={[3, 5, 5]}  intensity={2.5} />
          <directionalLight position={[-3, 3, -3]} intensity={1.0} />
          <pointLight       position={[0, 3, 2]}   intensity={1.5} />

          <Environment preset="city" />

          <Suspense fallback={null}>
            <RotatingScene
              url={displayUrl}
              accessory={accessory}
              rotY={rotY}
              rotX={rotX}
            />
            {/* Camera target helper: kamera [0,0.8,0]'a bakıyor — yüz hizası */}
          </Suspense>
          {/* OrbitControls KALDIRILDI — crash kaynağıydı */}
        </Canvas>
      </Animated.View>

      {/* Konuşma / Dinleme göstergeleri */}
      {(isSpeaking || isListening) && (
        <View style={styles.indicator}>
          <View style={[styles.dot, isSpeaking ? styles.dotSpeak : styles.dotListen]} />
          <View style={[styles.dot, isSpeaking ? styles.dotSpeak : styles.dotListen]} />
          <View style={[styles.dot, isSpeaking ? styles.dotSpeak : styles.dotListen]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 18,
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#CCC' },
  dotSpeak: { backgroundColor: '#4CAF50' },
  dotListen: { backgroundColor: '#2196F3' },
});
