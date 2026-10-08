import { create } from 'zustand';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const STORAGE_KEY_TOKEN = 'watchlater_token';
const STORAGE_KEY_USER = 'watchlater_user';

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
  const savedUserStr = localStorage.getItem(STORAGE_KEY_USER);
  let savedUser: AuthUser | null = null;
  try {
    if (savedUserStr) {
      savedUser = JSON.parse(savedUserStr);
    }
  } catch (e) {
    console.error('Failed to parse saved user', e);
  }

  return {
    user: savedUser,
    token: savedToken,
    setAuth: (user, token) => {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      set({ user, token });
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      set({ user: null, token: null });
    },
  };
});
