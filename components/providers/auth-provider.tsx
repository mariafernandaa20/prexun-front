'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import Cookies from 'js-cookie';
import { auth } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, user } = useAuthStore();

  useEffect(() => {
    const verifyAuth = async () => {
      // Solo verificar si no hay usuario y hay token
      const token = Cookies.get('auth-token');

      if (token && !user) {
        try {
          const userData = await auth.getUser();
          if (userData) {
            setUser(userData);
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
  }, [setUser, user]);

  return <>{children}</>;
}
