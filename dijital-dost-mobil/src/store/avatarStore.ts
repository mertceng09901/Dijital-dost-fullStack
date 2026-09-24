import { create } from 'zustand';

export type AvatarSpecies = 'girl' | 'boy' | 'cat' | 'bunny' | 'dog';
export type AvatarRole = 'friend' | 'mentor' | 'therapist';
export type AccessoryType = 'none' | 'hat' | 'glasses';

interface AvatarState {
  friendName:          string;
  onboardingCompleted: boolean;
  species:             AvatarSpecies;
  role:                AvatarRole;

  modelUrl:   string;
  accessory:  AccessoryType;

  setModelUrl:    (url: string) => void;
  setAccessory:   (acc: AccessoryType) => void;
  setSceneItem:   (key: string, value: string) => void;
  setAvatarConfig: (config: Partial<AvatarState>) => void;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  friendName:          'Teramer',
  onboardingCompleted: false,
  species:             'girl',
  role:                'friend',

  // Yüzü net görünen, tam boy çalışan aktif GLB
  modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  accessory: 'none',

  setModelUrl:  (url) => set({ modelUrl: url }),
  setAccessory: (acc) => set({ accessory: acc }),

  // Geriye dönük uyumluluk (OnboardingScreen, Avatar3DStudioScreen kullanır)
  setSceneItem: (key, value) => {
    if (key === 'modelUrl') set({ modelUrl: value });
    if (key === 'accessory') set({ accessory: value as AccessoryType });
  },

  setAvatarConfig: (config) => set((state) => ({ ...state, ...config })),
}));
