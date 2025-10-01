'use client';

import React from 'react';
import { Caja } from '@/lib/types';
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
import { Calendar } from 'lucide-react';
import { 
  processCajaData,
  calculateCajaTotals,
} from '@/lib/helpers/cajaHelpers';

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

interface CajaDetailProps {
  caja: Caja;
  showHeader?: boolean;
}

export default function CajaDetail({ caja, showHeader = true }: CajaDetailProps) {
  // Usar el helper para calcular todos los totales
  const totals = calculateCajaTotals(caja);
  const processedData = processCajaData(caja);

  return (
    <div className="space-y-6">
      {/* Header (opcional) */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Caja #{caja.id}</h1>
            <p className="text-muted-foreground">
              {caja.status === 'abierta' ? 'Caja activa' : 'Historial de caja cerrada'}
            </p>
          </div>
          <Badge variant={caja.status === 'abierta' ? 'default' : 'secondary'}>
            {caja.status}
          </Badge>
        </div>
      )}

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
            {!showHeader && (
              <Badge variant={caja.status === 'abierta' ? 'default' : 'secondary'}>
                {caja.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Monto Inicial</p>
              <p className="text-2xl font-bold">{formatCurrency(caja.initial_amount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Ingresos efectivo</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.cashIngresos)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Egresos efectivo</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.cashGastos)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Balance efectivo</p>
              <p className="text-2xl font-bold">{formatCurrency(totals.finalBalance)}</p>
            </div>
          </div>

          {caja.status === 'cerrada' && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Monto Final</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(caja.final_amount || 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Siguiente Día</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(caja.next_day || 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Cerrada</p>
                  <p className="text-lg">
                    {caja.closed_at ? new Date(caja.closed_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                <Calendar className="w-4 h-4 inline mr-2" />
                Abierta: {caja.opened_at ? new Date(caja.opened_at).toLocaleString() : 'N/A'}
              </p>
              {caja.notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Notas:</p>
                  <p className="text-sm text-muted-foreground">{caja.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transacciones en efectivo */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones en Efectivo</CardTitle>
          <CardDescription>
            Ingresos y egresos registrados en efectivo ({processedData.cashTransactions.length} transacciones)
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
                {processedData.cashTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.folio}</TableCell>
                      <TableCell>
                        {new Date(transaction.payment_date).toLocaleString()}
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
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{transaction.notes}</TableCell>
                    </TableRow>
                  ))}
                {processedData.cashTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay transacciones en efectivo registradas
                    </TableCell>
                  </TableRow>
                )}
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
            Gastos registrados con método de pago en efectivo ({processedData.cashGastos.length} gastos)
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
                {processedData.cashGastos.map((gasto: any) => (
                    <TableRow key={gasto.id}>
                      <TableCell>{new Date(gasto.date).toLocaleString()}</TableCell>
                      <TableCell>{gasto.concept}</TableCell>
                      <TableCell>{gasto.category}</TableCell>
                      <TableCell>{formatCurrency(gasto.amount)}</TableCell>
                    </TableRow>
                  ))}
                {processedData.cashGastos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay gastos en efectivo registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
