import { create } from 'zustand';

// ─── Avatar Karakter Tipleri ───────────────────────────────────────────────────
export type AvatarSpecies = 'girl' | 'boy' | 'cat' | 'bunny' | 'dog';

// ─── Görsel Özellikler ────────────────────────────────────────────────────────
export type EyeColor    = 'purple' | 'cyan' | 'amber' | 'green' | 'blue';
export type HairStyle   = 'long' | 'short' | 'curly' | 'bun' | 'twin';
export type HairColor   = 'black' | 'brown' | 'blonde' | 'pink' | 'white' | 'blue';
export type OutfitId    = 'casual' | 'sport' | 'formal' | 'cute' | 'hoodie';
export type OutfitColor = 'purple' | 'navy' | 'teal' | 'rose' | 'mint' | 'orange';
export type AccessoryId = 'none' | 'glasses' | 'sunglasses' | 'headphones' | 'crown' | 'bow' | 'hat';
export type BackgroundId= 'room' | 'park' | 'beach' | 'cafe' | 'space' | 'forest' | 'city';

// Legacy compat
export type SkinTone     = 'light' | 'medium' | 'dark' | 'cosmic';
export type CharacterType= 'ablacik' | 'abi' | 'notr';
export type OutfitStyle  = OutfitId;
export type AccessoryType= AccessoryId;

interface AvatarState {
  // Kimlik
  friendName: string;
  onboardingCompleted: boolean;

  // Karakter
  species:     AvatarSpecies;
  eyeColor:    EyeColor;
  hairStyle:   HairStyle;
  hairColor:   HairColor;
  outfitId:    OutfitId;
  outfitColor: OutfitColor;
  accessory:   AccessoryId;
  background:  BackgroundId;

  // Legacy
  characterType: CharacterType;
  gender:      'erkek' | 'kadin';
  skinTone:    SkinTone;
  outfitStyle: OutfitId;

  setAvatarConfig: (config: Partial<Omit<AvatarState, 'setAvatarConfig'>>) => void;
}

export const useAvatarStore = create<AvatarState>((set) => ({
  friendName:  'Teramer',
  onboardingCompleted: false,

  species:     'girl',
  eyeColor:    'purple',
  hairStyle:   'long',
  hairColor:   'brown',
  outfitId:    'casual',
  outfitColor: 'purple',
  accessory:   'none',
  background:  'room',

  // Legacy
  characterType: 'ablacik',
  gender:        'kadin',
  skinTone:      'medium',
  outfitStyle:   'casual',

  setAvatarConfig: (config) => set((state) => ({ ...state, ...config })),
}));