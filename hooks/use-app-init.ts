import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export function useAppInit() {
  const { initializeApp, isInitialized } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (!initRef.current && !isInitialized) {
      initRef.current = true;
      initializeApp();
    }
  }, [initializeApp, isInitialized]);

  return { isInitialized };
}
