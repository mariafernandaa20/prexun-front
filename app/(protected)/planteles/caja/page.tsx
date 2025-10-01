'use client';
import React from 'react';
import CajaLayout from './CajaLayout';
import { Denomination } from '@/lib/types';
import { useCajaActiva } from './CajaContext';
import CajaNavigation from './CajaNavigation';
import CajaDetail, { processCashRegister } from './CajaDetail';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CajaPage() {
  const { caja, loading, error, openCaja, closeCaja } = useCajaActiva();

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  if (error)
    return <div className="text-red-500 p-4">Error: {error.message}</div>;

  const handleOpenCaja = async (
    initialAmount: number,
    initialAmountCash: Denomination,
    notes: string
  ) => {
    try {
      await openCaja(initialAmount, initialAmountCash, notes);
    } catch (error) {
      console.error('Error al abrir caja:', error);
    }
  };

  const handleCloseCaja = async (
    finalAmount: number,
    finalAmountCash: Denomination,
    next_day: number,
    next_day_cash: Denomination,
    notes: string
  ) => {
    try {
      await closeCaja(
        result.balanceCashAmount,
        finalAmountCash,
        next_day,
        next_day_cash,
        notes
      );
    } catch (error) {
      console.error('Error al cerrar caja:', error);
    }
  };

  const result = processCashRegister(caja);

  return (
    <CajaLayout
      caja={caja}
      onOpen={handleOpenCaja}
      onClose={handleCloseCaja}
      actualAmount={result.balanceCashAmount}
    >
      <div className="p-6">
        <CajaNavigation />
        {caja ? (
          <CajaDetail caja={caja} showHeader={false} />
        ) : (
        <Card className="m-6">
          <CardHeader>
            <CardTitle>Caja Cerrada</CardTitle>
            <CardDescription>
              No hay ninguna caja abierta en este momento
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      </div>
    </CajaLayout>
  );
}
