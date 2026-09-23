import { create } from 'zustand';
import { loginToBackend, registerToBackend } from '../services/api';

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  userEmail: string | null;
  userName: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoggedIn: false,
  userEmail: null,
  userName: null,
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
        isLoading: false,
      });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  logout: () => set({ token: null, isLoggedIn: false, userEmail: null, userName: null }),
  clearError: () => set({ error: null }),
}));
