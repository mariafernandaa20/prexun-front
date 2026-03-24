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
  getCajasHistorial,
} from '@/lib/api';

import { useActiveCampusStore } from '@/lib/store/plantel-store';

interface CajaContextValue {
  caja: Caja | null;
  lastClosedCaja: Caja | null;
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
  const setActiveCaja = useActiveCampusStore((state) => state.setActiveCaja);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [lastClosedCaja, setLastClosedCaja] = useState<Caja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const campusId = activeCampus?.id || null;

  // Sincronizar el estado local con el store
  useEffect(() => {
    setActiveCaja(caja);
  }, [caja, setActiveCaja]);

  const fetchCaja = useCallback(async () => {
    if (!campusId) {
      setCaja(null);
      setLastClosedCaja(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [currentResponse, historyResponse] = await Promise.all([
        getCurrentCaja(campusId),
        getCajasHistorial(campusId),
      ]);
      // 1. Guardamos la caja actual (si hay una abierta)
      if (
        !currentResponse ||
        (typeof currentResponse === 'object' &&
          Object.keys(currentResponse).length === 0)
      ) {
        setCaja(null);
      } else {
        setCaja(currentResponse);
      }

      // 2. Buscamos en el historial la última que se cerró
      if (Array.isArray(historyResponse)) {
        const closedCajas = historyResponse.filter(
          (c) => c.status === 'cerrada'
        );
        if (closedCajas.length > 0) {
          setLastClosedCaja(closedCajas[0]);
        } else {
          setLastClosedCaja(null);
        }
      }
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
  }, [campusId]);

  const openCaja = useCallback(
    async (
      initialAmount: number,
      initialAmountCash: Denomination,
      notes: string
    ) => {
      if (!campusId)
        throw new Error('No se ha seleccionado ningún campus activo.');

      try {
        setLoading(true);
        const newCaja = await openCajaApi(
          campusId,
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
    [campusId]
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
        await closeCajaApi(
          caja.id,
          finalAmount,
          finalAmountCash,
          next_day,
          next_day_cash,
          notes
        );
        setCaja(null);
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
        lastClosedCaja,
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
