'use client';
import { getCurrentCaja } from '@/lib/api';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { Caja } from '@/lib/types';
import React from 'react';

export const useCaja = () => {
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);

  const [caja, setCaja] = React.useState<Caja | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchCaja = React.useCallback(async () => {
    if (!activeCampus) return;

    try {
      setLoading(true);
      const response = await getCurrentCaja(activeCampus?.id);
      setCaja(response);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setCaja(null);
        setError(null);
      } else {
        setError(
          err instanceof Error ? err : new Error('Error al cargar caja')
        );
      }
    } finally {
      setLoading(false);
    }
  }, [activeCampus]);

  React.useEffect(() => {
    fetchCaja();
  }, [fetchCaja]);

  return { caja, loading, error, fetchCaja };
};
