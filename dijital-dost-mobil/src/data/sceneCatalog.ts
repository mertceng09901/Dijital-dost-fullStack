/**
 * sceneCatalog.ts
 * Her mekanin arka plan gorseli, mekana ozgu esyalar,
 * her esyanin model varyantlari ve renk secenekleri.
 */

export interface SceneItemDef {
  label:    string;
  variants: string[];
  colors:   string[];  // bos dizi = renk secimi yok, sabit
}

export interface SceneDef {
  id:       string;
  label:    string;
  imageUrl: string;  // Unsplash URL (assets olmadan calisan)
  emoji:    string;
  items:    Record<string, SceneItemDef>;
}

export const SCENE_CATALOG: Record<string, SceneDef> = {
  room: {
    id: 'room',
    label: 'Oda',
    emoji: '🛋️',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1080&auto=format&fit=crop',
    items: {
      sofa: {
        label: 'Koltuk',
        variants: ['sofa_01', 'sofa_02', 'sofa_03'],
        colors: ['#4A6FA5', '#8B5E3C', '#5C8A5C', '#B0B0B0'],
      },
      lamp: {
        label: 'Lamba',
        variants: ['lamp_01', 'lamp_02'],
        colors: ['#F5A623', '#FFFFFF', '#2C2C2C'],
      },
      plant: {
        label: 'Bitki',
        variants: ['plant_01', 'plant_02', 'plant_03'],
        colors: [],
      },
      rug: {
        label: 'Hali',
        variants: ['rug_01', 'rug_02'],
        colors: ['#C94C4C', '#4A6FA5', '#D9B382'],
      },
    },
  },

  park: {
    id: 'park',
    label: 'Park',
    emoji: '🌳',
    imageUrl: 'https://images.unsplash.com/photo-1588820464287-21a4f028fc77?q=80&w=1080&auto=format&fit=crop',
    items: {
      bench: {
        label: 'Bank',
        variants: ['bench_01', 'bench_02'],
        colors: ['#8B5E3C', '#3C3C3C'],
      },
      tree: {
        label: 'Agac',
        variants: ['tree_01', 'tree_02'],
        colors: [],
      },
      fountain: {
        label: 'Cesme',
        variants: ['fountain_01'],
        colors: ['#B0B0B0', '#8B8B8B'],
      },
    },
  },

  beach: {
    id: 'beach',
    label: 'Sahil',
    emoji: '🏖️',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1080&auto=format&fit=crop',
    items: {
      umbrella: {
        label: 'Semsiye',
        variants: ['umbrella_01', 'umbrella_02'],
        colors: ['#E74C3C', '#F5A623', '#4A90D9'],
      },
      chair: {
        label: 'Sezlong',
        variants: ['chair_01'],
        colors: ['#FFFFFF', '#D9B382'],
      },
      palm: {
        label: 'Palmiye',
        variants: ['palm_01'],
        colors: [],
      },
    },
  },

  cafe: {
    id: 'cafe',
    label: 'Kafe',
    emoji: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1080&auto=format&fit=crop',
    items: {
      table: {
        label: 'Masa',
        variants: ['table_01', 'table_02'],
        colors: ['#8B5E3C', '#2C2C2C'],
      },
      chair: {
        label: 'Sandalye',
        variants: ['chair_01', 'chair_02'],
        colors: ['#8B5E3C', '#4A4A4A'],
      },
      plant: {
        label: 'Bitki',
        variants: ['plant_01'],
        colors: [],
      },
    },
  },
};

// Varsayilan esya seti — mekan degistiginde kullanilir
export function getDefaultItems(sceneId: string): Record<string, { variant: string; color: string }> {
  const scene = SCENE_CATALOG[sceneId];
  if (!scene) return {};
  const defaults: Record<string, { variant: string; color: string }> = {};
  Object.entries(scene.items).forEach(([key, def]) => {
    defaults[key] = {
      variant: def.variants[0] ?? '',
      color:   def.colors[0]   ?? '',
    };
  });
  return defaults;
}
