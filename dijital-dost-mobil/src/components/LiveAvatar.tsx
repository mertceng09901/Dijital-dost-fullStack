import React, { Suspense } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei/native';
import { useAvatarStore, AccessoryType } from '../store/avatarStore';

interface LiveAvatarProps {
  size?: number;
  isSpeaking?: boolean;
  isListening?: boolean;
  rounded?: boolean;
  hideScene?: boolean;
  allowRotate?: boolean;
}

// Modelin gerçek boyutlarına göre ölçek/konum
// Astronaut.glb: yaklaşık 1.5 birim yükseklik
// RobotExpressive.glb: yaklaşık 1.8 birim yükseklik
function AvatarModel({ url, accessory }: { url: string; accessory: AccessoryType }) {
  const { scene } = useGLTF(url);
  // scene.clone() KULLANMIYORUZ — renk değişimi yok, orijinal materyal korunuyor
  return (
    <group>
      {/* Model: ölçek ve konum tam yüz görünecek şekilde */}
      <primitive object={scene} scale={1.15} position={[0, -0.85, 0]} />

      {/* Şapka aksesuar — Three.js primitive (GLB değil) */}
      {accessory === 'hat' && (
        <group position={[0, 0.98, 0]}>
          {/* Şapka ağzı */}
          <mesh>
            <cylinderGeometry args={[0.32, 0.32, 0.04, 32]} />
            <meshStandardMaterial color="#5C3D1E" roughness={0.6} />
          </mesh>
          {/* Şapka gövdesi */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.22, 0.27, 0.36, 32]} />
            <meshStandardMaterial color="#8B5E3C" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* Gözlük aksesuar */}
      {accessory === 'glasses' && (
        <group position={[0, 0.44, 0.28]}>
          {/* Sol cam */}
          <mesh position={[-0.12, 0, 0]}>
            <torusGeometry args={[0.1, 0.015, 8, 24]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Sağ cam */}
          <mesh position={[0.12, 0, 0]}>
            <torusGeometry args={[0.1, 0.015, 8, 24]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Köprü */}
          <mesh>
            <boxGeometry args={[0.05, 0.015, 0.015]} />
            <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function LiveAvatar({
  size = 280,
  isSpeaking = false,
  isListening = false,
  rounded = false,
  hideScene = false,
  allowRotate = true,
}: LiveAvatarProps) {
  const modelUrl = useAvatarStore((s) => s.modelUrl);
  const accessory = useAvatarStore((s) => s.accessory);

  // Ölü linkleri engelle
  const safeUrl =
    modelUrl && !modelUrl.includes('readyplayer.me')
      ? modelUrl
      : 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        rounded && { borderRadius: size / 2, overflow: 'hidden' },
      ]}
    >
      <View style={StyleSheet.absoluteFill}>
        <Canvas
          // Kamera: YÜZ görünecek kadar yakın, tam boy için geniş FOV
          camera={{ position: [0, 0.3, 3.8], fov: 52 }}
          gl={{ alpha: true }}
        >
          <ambientLight intensity={2.2} />
          <directionalLight position={[3, 5, 5]} intensity={2.5} castShadow />
          <directionalLight position={[-3, 3, -3]} intensity={1} />
          <pointLight position={[0, 3, 2]} intensity={1.5} />

          <Environment preset="city" />

          <Suspense fallback={null}>
            <AvatarModel url={safeUrl} accessory={accessory} />
          </Suspense>

          <OrbitControls
            // HEDEF: tam göğüs/yüz hizası (model y=0.3 civarında merkezlenir)
            target={[0, 0.3, 0]}
            enableZoom={allowRotate}
            enablePan={false}
            enableRotate={allowRotate && !hideScene}
            // TAM 360 DERECE dönme — hem yatay hem dikey
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
            // Yakınlaştırma sınırları
            minDistance={1.5}
            maxDistance={6}
          />
        </Canvas>
      </View>

      {/* Konuşma / Dinleme animasyon noktaları */}
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
