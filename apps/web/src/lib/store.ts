import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  brandId?: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  activeBrandId: string | null;
  setUser: (user: User | null, token?: string, refreshToken?: string) => void;
  setActiveBrandId: (brandId: string | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('acf_token') : null,
  activeBrandId: null,

  setUser: (user, token, refreshToken) => {
    if (token) localStorage.setItem('acf_token', token);
    if (refreshToken) localStorage.setItem('acf_refresh_token', refreshToken);
    if (user) localStorage.setItem('acf_user_id', user.id);

    set({ user, token: token || null });
  },

  setActiveBrandId: (activeBrandId) => set({ activeBrandId }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('acf_token');
      localStorage.removeItem('acf_refresh_token');
      localStorage.removeItem('acf_user_id');
    }
    set({ user: null, token: null, activeBrandId: null });
  },
}));
