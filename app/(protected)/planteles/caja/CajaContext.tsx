'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { Caja, Denomination } from '@/lib/types';
import {
  getCurrentCaja,
  openCaja as openCajaApi,
  closeCaja as closeCajaApi,
} from '@/lib/api';
import { useActiveCampusStore } from '@/lib/store/plantel-store';

interface CajaContextValue {
  caja: Caja | null;
  loading: boolean;
  error: Error | null;
  fetchCaja: () => Promise<void>;
  openCaja: (
    initialAmount: number,
    initialAmountCash: Denomination,
    notes: string
  ) => Promise<void>;
  closeCaja: (
    finalAmount: number,
    finalAmountCash: Denomination,
    next_day: number,
    next_day_cash: Denomination,
    notes: string
  ) => Promise<void>;
}

const CajaContext = createContext<CajaContextValue | undefined>(undefined);

export function CajaProvider({ children }: { children: React.ReactNode }) {
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCaja = useCallback(async () => {
    if (!activeCampus) {
      setCaja(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getCurrentCaja(activeCampus.id);
      setCaja(response);
      setError(null);
    } catch (err: any) {
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

  const openCaja = useCallback(
    async (
      initialAmount: number,
      initialAmountCash: Denomination,
      notes: string
    ) => {
      if (!activeCampus) throw new Error('No hay campus activo');

      try {
        setLoading(true);
        const newCaja = await openCajaApi(
          activeCampus.id,
          initialAmount,
          initialAmountCash,
          notes
        );
        setCaja(newCaja);
        setError(null);
      } catch (err: any) {
        setError(err instanceof Error ? err : new Error('Error al abrir caja'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [activeCampus]
  );

  const closeCaja = useCallback(
    async (
      finalAmount: number,
      finalAmountCash: Denomination,
      next_day: number,
      next_day_cash: Denomination,
      notes: string
    ) => {
      if (!caja) throw new Error('No hay caja activa');

      try {
        setLoading(true);
        const closedCaja = await closeCajaApi(
          caja.id,
          finalAmount,
          finalAmountCash,
          next_day,
          next_day_cash,
          notes
        );
        setCaja(closedCaja);
        setError(null);
      } catch (err: any) {
        setError(
          err instanceof Error ? err : new Error('Error al cerrar caja')
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [caja]
  );

  useEffect(() => {
    fetchCaja();
  }, [fetchCaja]);

  return (
    <CajaContext.Provider
      value={{
        caja,
        loading,
        error,
        fetchCaja,
        openCaja,
        closeCaja,
      }}
    >
      {children}
    </CajaContext.Provider>
  );
}

export function useCajaActiva() {
  const context = useContext(CajaContext);
  if (context === undefined) {
    throw new Error('useCajaActiva must be used within a CajaProvider');
  }
  return context;
}
