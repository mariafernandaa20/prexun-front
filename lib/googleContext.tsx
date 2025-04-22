'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleContext = createContext(null);

export const GoogleProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/contacts',
    onSuccess: async (tokenResponse) => {
      setToken(tokenResponse.access_token);
      const profile = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      setUser(profile.data);
    },
    onError: () => alert('Error al iniciar sesión'),
  });

  const logout = () => {
    googleLogout();
    setUser(null);
    setToken(null);
  };

  return (
    <GoogleContext.Provider value={{ user, token, login, logout }}>
      {children}
    </GoogleContext.Provider>
  );
};

export const useGoogle = () => useContext(GoogleContext);
