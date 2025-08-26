'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  const CLIENTID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  return (
    <GoogleOAuthProvider clientId={CLIENTID}>
      <SWRConfig
        value={{
          refreshInterval: 0, // Deshabilitado por defecto, cada hook define su propio intervalo
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          dedupingInterval: 2000,
          errorRetryCount: 3,
          errorRetryInterval: 5000,
          onError: (error, key) => {
            console.error('SWR Error:', error, 'Key:', key);
          },
        }}
      >
        {children}
      </SWRConfig>
    </GoogleOAuthProvider>
  );
}
