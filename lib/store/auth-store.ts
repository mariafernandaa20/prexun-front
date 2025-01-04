"use client";

import { create } from "zustand";
import { auth } from "@/lib/auth";
import Cookies from "js-cookie";
import axios from "axios";
import axiosInstance from "../api/axiosConfig";
import { AUTH_ENDPOINTS } from "../api/endpoints";
import { Campus, User } from "../types";
import { getUsers } from "../api";
import { getCampuses } from "../api";


interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    password: string,
    password_confirmation: string,
    token: string
  ) => Promise<void>;
  resendVerification: () => Promise<void>;
  checkAuth: () => Promise<void>;
  users: User[];
  setUsers: (users: User[]) => void;
  fetchUsers: () => Promise<void>;
  campuses: Campus[];
  setCampuses: (campuses: Campus[]) => void;
  fetchCampuses: () => Promise<void>;
  initializeApp: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  users: [],
  campuses: [],
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
    const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
    });

    const user = response.data.user;
    const token = response.data.token;

    console.log(user);

    Cookies.set("auth-token", token, {
      expires: 7, // 7 días
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: window.location.hostname,
    });

    Cookies.set("user-role", user.role, {
      expires: 7,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: window.location.hostname,
    });

    set({ user });
    return user;
  },

  logout: () => {
    Cookies.remove("auth-token");
    Cookies.remove("user-role");
    set({ user: null });
  },

  register: async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ) => {
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

  resetPassword: async (
    email: string,
    password: string,
    password_confirmation: string,
    token: string
  ) => {
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

  setUsers: (users) => set({ users }),
  fetchUsers: async () => {
    try {
      const response = await getUsers();
      set({ users: response });
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ users: [] });
    }
  },
  setCampuses: (campuses) => set({ campuses }),
  fetchCampuses: async () => {
    const response = await getCampuses();
    set({ campuses: response });
  },
  initializeApp: async () => {
    try {
      await Promise.all([
        getUsers().then(users => set({ users })),
        getCampuses().then(campuses => set({ campuses }))
      ]);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
}));
