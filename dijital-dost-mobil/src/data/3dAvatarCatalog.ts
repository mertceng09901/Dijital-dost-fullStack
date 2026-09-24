/**
 * 3dAvatarCatalog.ts
 * Gercek .glb veya .gltf 3D model URL'leri (Three.js icin)
 * Herkese acik, aktif statik .glb baglantilari.
 */

export interface AvatarVariant {
  id: string;
  url: string;
  thumb: string;
}

export const AVATAR_CATALOG = {
  bases: [
    {
      id: 'base_astronaut',
      // Aktif olarak calisan, ModelViewer acik kaynak modeli (Ready Player Me kapandigi icin)
      url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      thumb: 'https://cdn3d.iconscout.com/3d/premium/thumb/astronaut-5460599-4554366.png'
    }
  ]
};
