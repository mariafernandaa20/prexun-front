"use client";

import { useEffect } from "react";
import axiosInstance from "@/lib/api/axiosConfig";
import { useAuthStore } from "@/lib/store/auth-store";
import Cookies from 'js-cookie';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const token = Cookies.get('auth-token');
    
    if (token) {
      axiosInstance
        .get("/api/auth/user")
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          // Si hay error, limpiar cookies
          Cookies.remove('auth-token');
          Cookies.remove('user-role');
        });
    }
  }, [setUser]);

  return <>{children}</>;
}