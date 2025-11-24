import { create } from 'zustand';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

// Fonction pour charger depuis localStorage
const loadFromStorage = () => {
  if (typeof window === 'undefined') return { user: null, token: null };
  
  try {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('token');
    
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken,
      isAuthenticated: !!(storedToken && storedUser)
    };
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
};

const initialState = loadFromStorage();

export const useAuthStore = create<AuthStore>((set) => ({
  user: initialState.user,
  token: initialState.token,
  isAuthenticated: initialState.isAuthenticated ?? false,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } else {
      localStorage.removeItem('auth_user');
      set({ user: null, isAuthenticated: false });
    }
  },
  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));
