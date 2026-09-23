import { create } from 'zustand';
import { loginToBackend, registerToBackend } from '../services/api';

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  userEmail: string | null;
  userName: string | null;
  isPremium: boolean;
  coins: number;
  voiceMinutesLeft: number;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  updatePremiumState: (updates: Partial<{ isPremium: boolean, coins: number, voiceMinutesLeft: number }>) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoggedIn: false,
  userEmail: null,
  userName: null,
  isPremium: false,
  coins: 0,
  voiceMinutesLeft: 10,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginToBackend(email, password);
      set({
        token: data.token,
        isLoggedIn: true,
        userEmail: data.user.email,
        userName: data.user.name,
        isPremium: data.user.isPremium || false,
        coins: data.user.coins || 0,
        voiceMinutesLeft: data.user.voiceMinutesLeft ?? 10,
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const data = await registerToBackend(email, password, name);
      set({
        token: data.token,
        isLoggedIn: true,
        userEmail: data.user.email,
        userName: data.user.name,
        isPremium: data.user.isPremium || false,
        coins: data.user.coins || 0,
        voiceMinutesLeft: data.user.voiceMinutesLeft ?? 10,
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updatePremiumState: (updates) => set((state) => ({ ...state, ...updates })),

  logout: () => set({ 
    token: null, isLoggedIn: false, userEmail: null, userName: null, 
    isPremium: false, coins: 0, voiceMinutesLeft: 10 
  }),
  clearError: () => set({ error: null }),
}));
