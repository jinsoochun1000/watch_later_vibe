import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  username: string | null;
  ready: boolean;
  setSession: (token: string, username: string) => void;
  clear: () => void;
  setReady: () => void;
}
// Deliberately memory-only: never persist credentials or access tokens in browser storage.
export const useAuth = create<AuthState>((set) => ({
  accessToken: null, username: null, ready: false,
  setSession: (accessToken, username) => set({ accessToken, username, ready: true }),
  clear: () => set({ accessToken: null, username: null, ready: true }),
  setReady: () => set({ ready: true }),
}));
