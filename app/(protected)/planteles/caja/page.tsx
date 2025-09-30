'use client';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import React from 'react';
import CajaLayout from './CajaLayout';
import { closeCaja, openCaja } from '@/lib/api';
import { Denomination } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useCaja } from './useCaja';

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function processCashRegister(data: any) {
  if (!data) {
    return {
      totalCashIngresos: 0,
      totalCashExpenses: 0,
      netCashAmount: 0,
      actualCashAmount: 0,
      balanceCashAmount: 0,
      denominationBreakdown: {},
    };
  }

  const denominationBreakdown: Record<string, number> = {};

  // Procesar dinero inicial en efectivo
  if (data.initial_amount_cash) {
    const initialCash =
      typeof data.initial_amount_cash === 'string'
        ? JSON.parse(data.initial_amount_cash)
        : data.initial_amount_cash;

    Object.entries(initialCash).forEach(([value, quantity]) => {
      denominationBreakdown[value] =
        (denominationBreakdown[value] || 0) + Number(quantity || 0);
    });
  }

  // Ingresos en efectivo (transactions con payment_method 'cash')
  let totalCashIngresos = 0;
  data.transactions?.forEach((transaction: any) => {
    if (transaction.payment_method === 'cash') {
      totalCashIngresos += Number(transaction.amount || 0);
    }
  });

  // Gastos en efectivo
  let totalCashExpenses = 0;
  data.gastos?.forEach((gasto: any) => {
    if (gasto.method === 'cash' || gasto.method === 'Efectivo') {
      totalCashExpenses += Number(gasto.amount || 0);
    }
  });

  // Total contado en caja según denominaciones
  const actualCashAmount = Object.entries(denominationBreakdown).reduce(
    (total, [value, quantity]) => total + Number(value) * Number(quantity),
    0
  );

  // Neto solo ingresos - gastos
  const netCashAmount = round2(totalCashIngresos - totalCashExpenses);

  // Balance final con monto inicial
  const balanceCashAmount = round2(
    Number(data.initial_amount || 0) + totalCashIngresos - totalCashExpenses
  );

  return {
    totalCashIngresos: round2(totalCashIngresos),
    totalCashExpenses: round2(totalCashExpenses),
    netCashAmount,
    actualCashAmount: round2(actualCashAmount),
    balanceCashAmount,
    denominationBreakdown,
  };
}

export default function CajaPage() {
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);
  const { caja, loading, error, fetchCaja } = useCaja();

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
      await openCaja(
        Number(activeCampus?.id),
        initialAmount,
        initialAmountCash,
        notes
      );
      await fetchCaja();
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
        caja.id,
        finalAmount,
        finalAmountCash,
        next_day,
        next_day_cash,
        notes
      );
      await fetchCaja();
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
      {caja ? (
        <div className="space-y-6 p-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estado de Caja (Efectivo)</CardTitle>
                  <CardDescription>
                    Totales y movimientos solo en efectivo
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    caja.status === 'abierta' ? 'default' : 'destructive'
                  }
                >
                  {caja.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <p>Ingresos efectivo: <strong>{formatCurrency(result.totalCashIngresos)}</strong></p>
                  <p>Egresos efectivo: <strong>{formatCurrency(result.totalCashExpenses)}</strong></p>
                  <p>Monto Inicial: <strong>{formatCurrency(caja.initial_amount)}</strong></p>
                  <p>Balance efectivo: <strong>{formatCurrency(result.balanceCashAmount)}</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transacciones en efectivo */}
          <Card>
            <CardHeader>
              <CardTitle>Transacciones en Efectivo</CardTitle>
              <CardDescription>
                Ingresos y egresos registrados en efectivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caja.transactions
                      ?.filter((t: any) => t.payment_method === 'cash')
                      .map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.folio}</TableCell>
                          <TableCell>{new Date(transaction.payment_date).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'}
                            >
                              {transaction.transaction_type === 'income' ? 'Ingreso' : 'Egreso'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>{transaction.notes}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Gastos en efectivo */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos en Efectivo</CardTitle>
              <CardDescription>
                Gastos registrados con método de pago en efectivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caja.gastos
                      ?.filter((g: any) => g.method === 'cash' || g.method === 'Efectivo')
                      .map((gasto: any) => (
                        <TableRow key={gasto.id}>
                          <TableCell>{new Date(gasto.date).toLocaleString()}</TableCell>
                          <TableCell>{gasto.concept}</TableCell>
                          <TableCell>{gasto.category}</TableCell>
                          <TableCell>{formatCurrency(gasto.amount)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
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
    </CajaLayout>
  );
}
