"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    // Set up axios interceptor for token
    const interceptor = axios.interceptors.request.use(function (config) {
      const token = auth.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      // Remove interceptor when component unmounts
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  async function checkUser() {
    try {
      const user = await auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Check user error:', error);
      auth.logout(); // Clear invalid token
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      if (response.user) {
        setUser(response.user);
        router.push('/dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    auth.logout();
    setUser(null);
    router.push('/login');
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await auth.register(name, email, password, password_confirmation);
      if (response.user) {
        setUser(response.user);
        router.push('/dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

