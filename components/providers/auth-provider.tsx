"use client";

import { useEffect } from "react";
import axiosInstance from "@/lib/api/axiosConfig";
import { useAuthStore } from "@/lib/store/auth-store";
import Cookies from 'js-cookie';
import { auth } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = Cookies.get('auth-token');
      
      if (token) {
        try {
          const user = await auth.getUser();
          if (user) {
            setUser(user);
          } else {
            Cookies.remove('auth-token');
            Cookies.remove('user-role');
          }
        } catch (error) {
          Cookies.remove('auth-token');
          Cookies.remove('user-role');
        }
      }
    };

    verifyAuth();
  }, [setUser]);

  return <>{children}</>;
}