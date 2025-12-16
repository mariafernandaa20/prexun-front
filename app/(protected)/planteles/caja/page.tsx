'use client';
import React from 'react';
import CajaLayout from './CajaLayout';
import { Denomination } from '@/lib/types';
import { useCajaActiva } from './CajaContext';
import CajaNavigation from './CajaNavigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { useCaja } from './useCaja';
import { processCajaData } from '@/lib/helpers/cajaHelpers';
import { toast } from 'sonner';

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
      toast.error(error instanceof Error ? error.message : 'Error al abrir caja');
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
        finalAmount,
        finalAmountCash,
        next_day,
        next_day_cash,
        notes
      );
    } catch (error) {
      console.error('Error al cerrar caja:', error);
      toast.error(error instanceof Error ? error.message : 'Error al cerrar caja');
    }
  };

  const processed = caja ? processCajaData(caja) : null;

  if (processed) {
    console.log(processed);
  }

  return (
    <CajaLayout
      caja={caja}
      onOpen={handleOpenCaja}
      onClose={handleCloseCaja}
      actualAmount={processed?.totals.finalBalance || 0}
    >
      <div className="p-6">
        <CajaNavigation />
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
                    <p>
                      Ingresos efectivo:{' '}
                      <strong>
                        {formatCurrency(processed?.totals.cashIngresos || 0)}
                      </strong>
                    </p>
                    <p>
                      Egresos efectivo:{' '}
                      <strong>
                        {formatCurrency(processed?.totals.cashGastos || 0)}
                      </strong>
                    </p>
                    <p>
                      Monto Inicial:{' '}
                      <strong>{formatCurrency(caja.initial_amount)}</strong>
                    </p>
                    <p>
                      Balance efectivo:{' '}
                      <strong>
                        {formatCurrency(processed?.totals.finalBalance || 0)}
                      </strong>
                    </p>
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
                      {processed?.cashTransactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.folio}</TableCell>
                          <TableCell>
                            {new Date(
                              transaction.payment_date
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.transaction_type === 'income'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {transaction.transaction_type === 'income'
                                ? 'Ingreso'
                                : 'Egreso'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
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
                      {processed?.cashGastos.map((gasto: any) => (
                        <TableRow key={gasto.id}>
                          <TableCell>
                            {new Date(gasto.date).toLocaleString()}
                          </TableCell>
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
      </div>
    </CajaLayout>
  );
}
