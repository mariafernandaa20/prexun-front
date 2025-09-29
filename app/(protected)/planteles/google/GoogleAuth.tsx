'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useEffect, useRef, useState } from 'react';
import { FaGoogle } from 'react-icons/fa6';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const SCOPES =
  'https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/userinfo.email';

export default function GoogleAuth() {
  const tokenClientRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const handleAuth = (token: string) => {
    setAccessToken(token);
    localStorage.setItem('google_access_token', token);
    setSuccessMessage('Inicio de sesión exitoso ✅');
  };

  const handleLogout = () => {
    localStorage.removeItem('google_access_token');
    setAccessToken('');
    setSuccessMessage('');
  };

  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    if (token) {
      handleAuth(token);
    }

    const loadGoogleLibs = async () => {
      const loadScript = (src: string) =>
        new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });

      await loadScript('https://accounts.google.com/gsi/client');
      await loadScript('https://apis.google.com/js/api.js');

      await new Promise((resolve) => {
        (window as any).gapi.load('client', resolve);
      });

      await (window as any).gapi.client.init({
        discoveryDocs: [
          'https://people.googleapis.com/$discovery/rest?version=v1',
        ],
      });

      tokenClientRef.current = (
        window as any
      ).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            (window as any).gapi.client.setToken(response);
            handleAuth(response.access_token);
          }
        },
      });

      setIsReady(true);
    };

    loadGoogleLibs();
  }, []);

  const handleLogin = () => {
    tokenClientRef.current?.requestAccessToken();
  };

  if (!isReady) return null;

  return (
    <>
      {!successMessage && (
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 "
          style={{
            backgroundColor: '#fff',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            style={{ width: '18px', height: '18px' }}
          />
          <span>Iniciar sesión con Google</span>
        </button>
      )}

      {successMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2"
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '5px 10px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            <FaGoogle />
            Cerrar sesión
          </button>
        </div>
      )}
    </>
  );
}
