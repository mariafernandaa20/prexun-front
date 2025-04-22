'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

// Aquí envolvemos todos los componentes de tu aplicación con el GoogleOAuthProvider
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="">
      {children}
    </GoogleOAuthProvider>
  );
}