'use client';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import React from 'react';
import CajaLayout from './CajaLayout';
import { closeCaja, getCurrentCaja, openCaja } from '@/lib/api';
import { Caja, Transaction, Gasto, Campus, Denomination } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import { useCaja } from './useCaja';


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

  // Handlers para abrir/cerrar caja (se mantienen iguales)
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
  // INICIO DE processCashRegister CORREGIDO
  function processCashRegister(data) {
    const denominationBreakdown = {};
    let totalCashIngresos = 0;
    let totalCashEgresos = 0;
    let totalNonCashIngresos = 0;
    let totalNonCashEgresos = 0;
    let totalCashExpenses = 0;
    let totalExpenses = 0;

    if (!data) {
      return {
        denominationBreakdown: [],
        totalCashIngresos: 0,
        totalCashEgresos: 0,
        totalNonCashIngresos: 0,
        totalNonCashEgresos: 0,
        totalCashExpenses: 0,
        totalExpenses: 0,
        netCashAmount: 0,
        actualCashAmount: 0,
        denominationSummary: {},
      };
    }

    // Inicializar denominaciones con el monto inicial si existe
    if (data.initial_amount_cash) {
      const initialCash = typeof data.initial_amount_cash === 'string'
        ? JSON.parse(data.initial_amount_cash)
        : data.initial_amount_cash;

      Object.entries(initialCash).forEach(([value, quantity]) => {
        denominationBreakdown[value] = (denominationBreakdown[value] || 0) + Number(quantity || 0);
      });
      // NO SUMAMOS el initialAmount aquí a totalCashIngresos
    }


    data.transactions?.forEach((transaction) => {
      const amount = Number(transaction.amount || 0);
      const isIngreso = transaction.transaction_type === 'income' && transaction.paid === true;
      const isEgreso = transaction.transaction_type === 'egreso';
      if (transaction.payment_method === 'cash') {
        if (isIngreso) {
          totalCashIngresos += amount;
        } else if (isEgreso) {
          totalCashEgresos += amount;
        }
      } else {
        if (isIngreso) {
          totalNonCashIngresos += amount;
        } else if (isEgreso) {
          totalNonCashEgresos += amount;
        }
      }

      // Procesar denominaciones si existen (solo aplica a efectivo)
      if (transaction.payment_method === 'cash' && transaction.denominations && transaction.denominations.length > 0) {
        transaction.denominations.forEach((denom) => {
          const value = Number(denom.value || 0);
          const quantity = Number(denom.quantity || 0);

          if (isIngreso) {
            denominationBreakdown[value] = (denominationBreakdown[value] || 0) + quantity;
          } else {
            denominationBreakdown[value] = (denominationBreakdown[value] || 0) - quantity;
          }
        });
      }
    });

    // Procesar gastos
    data.gastos?.forEach((gasto) => {
      const amount = Number(gasto.amount || 0);
      totalExpenses += amount;

      if (gasto.method === 'cash') {
        totalCashExpenses += amount;
      }


      if (gasto.method === 'cash' && gasto.denominations && gasto.denominations.length > 0) {
        gasto.denominations.forEach((denom) => {
          const value = Number(denom.value || 0);
          const quantity = Number(denom.quantity || 0);
          denominationBreakdown[value] = (denominationBreakdown[value] || 0) - quantity;
        });
      }
    });


    const actualCashAmount = Object.entries(denominationBreakdown).reduce((total, [value, quantity]) => {
      return total + (Number(value) * Number(quantity));
    }, 0);


    const denominationSummary = Object.entries(denominationBreakdown)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .filter(([, count]) => Number(count) !== 0)
      .reduce((acc, [value, count]) => {
        acc[value] = Number(count);
        return acc;
      }, {});

    const breakdownArray = Object.entries(denominationBreakdown)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .filter(([, count]) => Number(count) !== 0)
      .map(([value, count]) => `$${value} x ${count}`);

    const netCashAmount = totalCashIngresos - totalCashEgresos - totalCashExpenses;

    return {
      denominationBreakdown: breakdownArray,
      totalCashIngresos: Number(totalCashIngresos.toFixed(2)),
      totalCashEgresos: Number(totalCashEgresos.toFixed(2)),
      totalNonCashIngresos: Number(totalNonCashIngresos.toFixed(2)),
      totalNonCashEgresos: Number(totalNonCashEgresos.toFixed(2)),
      totalCashExpenses: Number(totalCashExpenses.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netCashAmount: Number(netCashAmount.toFixed(2)),
      actualCashAmount: Number(actualCashAmount.toFixed(2)),
      denominationSummary,
    };
  }


  const result = processCashRegister(caja);


  const actualAmount = result.actualCashAmount;
  // Usamos los nuevos campos de 'result'
  const totalCashIngresos = result.totalCashIngresos;
  const totalNonCashIngresos = result.totalNonCashIngresos;

  return (
    <CajaLayout
      caja={caja}
      onOpen={handleOpenCaja}
      onClose={handleCloseCaja}
      actualAmount={actualAmount}
    >
      {caja ? (
        <div className="space-y-6 p-6">
          <Card>
            <CardHeader className="sticky top-0 z-8 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estado de Caja</CardTitle>
                  <CardDescription>
                    Información general de la caja actual
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p>
                    Ingresos tarjeta o transferencia: {formatCurrency(result.totalNonCashIngresos)}
                  </p>
                  <p>
                    Ingresos efectivo: {formatCurrency(result.totalCashIngresos)}
                  </p>
                  <p>
                    Ingresos totales: {formatCurrency(result.totalCashIngresos + result.totalNonCashIngresos)}
                  </p>
                </div>
                <div>
                  <p>
                    Egresos efectivo: {formatCurrency(result.totalCashEgresos)}
                  </p>
                  <p>
                    Egresos tarjeta o transferencia: {formatCurrency(result.totalNonCashEgresos)}
                  </p>
                  <p>
                    Egresos totales: {formatCurrency(result.totalCashEgresos + result.totalNonCashEgresos)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs y tablas de transacciones y gastos... (se mantienen iguales) */}
          <Tabs defaultValue="transactions">
            <TabsList>
              <TabsTrigger value="transactions">Transacciones</TabsTrigger>
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
              <Card>
                <CardHeader className="sticky top-0 z-8 bg-card">
                  <CardTitle>Transacciones</CardTitle>
                  <CardDescription>
                    Lista de todas las transacciones realizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Folio</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Denominaciones</TableHead>
                          <TableHead>Notas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caja.transactions?.map((transaction) => (
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
                                {transaction.transaction_type === 'income' ? 'Ingreso' : transaction.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>{transaction.payment_method}</TableCell>
                            <TableCell>
                              {Array.isArray(transaction.denominations) &&
                                transaction.denominations
                                  .map((d: any) => `${d.value}x${d.quantity}`)
                                  .join(', ')}
                            </TableCell>
                            <TableCell>{transaction.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="gastos">
              <Card>
                <CardHeader className="sticky top-0 z-8 bg-card">
                  <CardTitle>Gastos</CardTitle>
                  <CardDescription>
                    Lista de todos los gastos registrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Concepto</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Método</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caja.gastos?.map((gasto) => (
                          <TableRow key={gasto.id}>
                            <TableCell>
                              {new Date(gasto.date).toLocaleString()}
                            </TableCell>
                            <TableCell>{gasto.concept}</TableCell>
                            <TableCell>{gasto.category}</TableCell>
                            <TableCell>
                              {formatCurrency(gasto.amount)}
                            </TableCell>
                            <TableCell>{gasto.method}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card className="m-6">
          <CardHeader className="sticky top-0 z-8 bg-card">
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