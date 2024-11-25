"use client";

import { create } from 'zustand';
import { auth } from '@/lib/auth';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, password: string, password_confirmation: string, token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  checkAuth: async () => {
    try {
      const user = await auth.getUser();
      set({ user, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      await auth.login(email, password);
      const user = await auth.getUser();
      set({ user });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await auth.logout();
      set({ user: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      await auth.register(name, email, password, password_confirmation);
      const user = await auth.getUser();
      set({ user });
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      await auth.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email: string, password: string, password_confirmation: string, token: string) => {
    try {
      await auth.resetPassword(email, password, password_confirmation, token);
    } catch (error) {
      throw error;
    }
  },

  resendVerification: async () => {
    try {
      await auth.resendVerification();
    } catch (error) {
      throw error;
    }
  },
}));