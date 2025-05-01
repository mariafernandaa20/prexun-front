"use client";

import { create } from "zustand";
import { auth } from "@/lib/auth";
import Cookies from "js-cookie";
import axiosInstance from "../api/axiosConfig";
import { AUTH_ENDPOINTS } from "../api/endpoints";
import { Campus, Carrera, Grupo, Promocion, User } from "../types";
import { getCampuses, getCarreras, getFacultades, getGrupos, getPeriods, getSemanas, getUsers } from "../api";

// Interfaces separadas para mejor organización
interface UserState {
  user: User | null;
  users: User[];
  loading: boolean;
}

interface CampusState {
  campuses: Campus[];
}

interface GrupoState {
  semanasIntensivas: Grupo[];
}

interface TokenState {
  accessToken: string | null;
}

interface AppState {
  periods: any,
  municipios: any,
  prepas: any,
  facultades: any,
  carreras: Carrera[],
  promos: Promocion[],
  grupos: Grupo[],
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  setLoading: (loading: boolean) => void;
  setAccessToken: (token: string) => void;
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
}

interface DataActions {
  setCampuses: (campuses: Campus[]) => void;
  fetchUsers: () => Promise<void>;
  fetchCampuses: () => Promise<void>;
  fetchSemanas: () => Promise<void>;
  fetchPeriods: () => Promise<void>;
  fetchCarreras: () => Promise<void>;
  fetchGrupos: () => Promise<void>;
  fetchFacultades: () => Promise<void>;
  initializeApp: () => Promise<void>;
}

// Combinamos todas las interfaces
type AuthState = UserState & CampusState & GrupoState & TokenState & AuthActions & DataActions & AppState;

// Helpers para manejo de cookies
const COOKIE_OPTIONS = {
  expires: 7, // 7 días
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  domain: typeof window !== 'undefined' ? window.location.hostname : '',
};

const setCookie = (name: string, value: string) => {
  Cookies.set(name, value, COOKIE_OPTIONS);
};

const removeCookie = (name: string) => {
  Cookies.remove(name);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial
  user: null,
  users: [],
  campuses: [],
  semanasIntensivas: [],
  accessToken: null,
  loading: true,
  periods: [],
  municipios: [],
  prepas: [],
  facultades: [],
  carreras: [],
  promos: [],
  grupos: [],

  // Setters simples
  setUser: (user) => set({ user }),
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
  setCampuses: (campuses) => set({ campuses }),
  setAccessToken: (token) => set({ accessToken: token }),
  setSemanas: (semanas) => set({ semanasIntensivas: semanas }),
  setPeriods: (periods) => set({ periods }),
  setMunicipios: (municipios) => set({ municipios }),
  setPrepas: (prepas) => set({ prepas }),
  setFacultades: (facultades) => set({ facultades }),
  setCarreras: (carreras) => set({ carreras }),
  setPromos: (promos) => set({ promos }),
  setGrupos: (grupos) => set({ grupos }),

  // Acciones de autenticación
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

    const { user, token } = response.data;

    setCookie("auth-token", token);
    setCookie("user-role", user.role);

    // También almacenamos el token en el estado
    set({
      user,
      accessToken: token
    });

    return user;
  },

  logout: () => {
    removeCookie("auth-token");
    removeCookie("user-role");
    set({
      user: null,
      accessToken: null
    });
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

  // Acciones para obtener datos
  fetchUsers: async () => {
    try {
      const users = await getUsers();
      set({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ users: [] });
    }
  },

  fetchSemanas: async () => {
    try {
      const semanasIntensivas = await getSemanas();
      set({ semanasIntensivas });
    } catch (error) {
      console.error('Error fetching semanas:', error);
      set({ semanasIntensivas: [] });
    }
  },

  fetchCampuses: async () => {
    try {
      const campuses = await getCampuses();
      set({ campuses });
    } catch (error) {
      console.error('Error fetching campuses:', error);
      set({ campuses: [] });
    }
  },

  fetchPeriods: async () => {
    try {
      const periods = await getPeriods();
      set({ periods });
    } catch (error) {
      console.error('Error fetching periods:', error);
      set({ periods: [] });
    }
  },

  fetchGrupos: async () => {
    try {
      const grupos = await getGrupos();
      set({ grupos });
    } catch (error) {
      console.error('Error fetching periods:', error);
      set({ grupos: [] });
    }
  },

  fetchCarreras: async () => {
    try {
      const carreras = await getCarreras();
      set({ carreras });
    } catch (error) {
      console.error('Error fetching periods:', error);
      set({ carreras: [] });
    }
  },
  fetchFacultades: async () => {
    try {
      const facultades = await getFacultades();
      set({ facultades });
    } catch (error) {
      console.error('Error fetching periods:', error);
      set({ facultades: [] });
    }
  },

  // Inicialización de la aplicación
  initializeApp: async () => {
    try {
      set({ loading: true });

      // Intenta recuperar el token si existe en cookies
      const storedToken = Cookies.get("auth-token");
      if (storedToken) {
        set({ accessToken: storedToken });
      }

      await Promise.all([
        get().fetchUsers(),
        get().fetchCampuses(),
        get().fetchSemanas(),
        get().fetchPeriods(),
        get().fetchGrupos(),
        get().fetchCarreras(),
        get().fetchFacultades(),
      ]);

      await get().checkAuth();
    } catch (error) {
      console.error('Error initializing app:', error);
      set({ loading: false });
    }
  }
}));