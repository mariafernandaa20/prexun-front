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

const useCaja = ({ activeCampus }: { activeCampus: Campus | null }) => {
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

export default function CajaPage() {
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);
  const { caja, loading, error, fetchCaja } = useCaja({ activeCampus });

  const calculateTotals = () => {
    if (!caja) return { ingresos: 0, egresos: 0, gastosTotal: 0, balance: 0 };

    const ingresos =
      caja.transactions?.filter((t) => t.transaction_type === 'ingreso').reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      ) ?? 0;
    const egresos = caja.transactions?.filter(t => t.transaction_type === 'egreso').reduce((sum, t) => sum + Number(t.amount || 0),
        0
      ) ?? 0;
    const gastosTotal = caja.gastos?.reduce((sum, g) => sum + Number(g.amount || 0), 0) ?? 0;
    const balance = ingresos - egresos - gastosTotal;

    return {
      ingresos,
      egresos,
      gastosTotal,
      balance,
      
    };
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  if (error)
    return <div className="text-red-500 p-4">Error: {error.message}</div>;

  const { ingresos, egresos, gastosTotal, balance } = calculateTotals();
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

  function processCashRegister(data) {
    const denominationBreakdown = {};
    let totalCashIngresos = 0;
    let totalCashEgresos = 0;
    let totalCashExpenses = 0;
    let totalExpenses = 0; 

    if (!data) {
      return {
        denominationBreakdown: [],
        totalCashIngresos: 0,
        totalCashEgresos: 0,
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
        denominationBreakdown[value] = Number(quantity || 0);
      });
    }


    data.transactions?.forEach((transaction) => {
      const amount = Number(transaction.amount || 0);
      const isIngreso = transaction.transaction_type === 'ingreso';
      
     
      if (transaction.payment_method === 'cash') {
        if (isIngreso) {
          totalCashIngresos += amount;
        } else {
          totalCashEgresos += amount;
        }
      }
      
      // Procesar denominaciones si existen
      if (transaction.denominations && transaction.denominations.length > 0) {
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
      
   
      gasto.denominations?.forEach((denom) => {
        const value = Number(denom.value || 0);
        const quantity = Number(denom.quantity || 0);
        denominationBreakdown[value] = (denominationBreakdown[value] || 0) - quantity;
      });
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
      totalCashExpenses: Number(totalCashExpenses.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netCashAmount: Number(netCashAmount.toFixed(2)),
      actualCashAmount: Number(actualCashAmount.toFixed(2)),
      denominationSummary,
    };
  }

  const result = processCashRegister(caja);


  const actualAmount = result.actualCashAmount;


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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Monto Inicial:{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(caja.initial_amount)}
                    </span>
                  </p>
                  {caja.final_amount && (
                    <p className="text-sm text-muted-foreground">
                      Monto Final:{' '}
                      <span className="font-medium text-foreground">
                        {formatCurrency(caja.final_amount)}
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Ingresos totales:{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(ingresos)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Egresos totales:{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(egresos)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gastos totales:{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(gastosTotal)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Saldo:{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(balance)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Efectivo disponible:{' '}
                    <span className="font-medium text-primary">
                      {formatCurrency(result.actualCashAmount)}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Apertura:{' '}
                    <span className="font-medium text-foreground">
                      {new Date(caja.opened_at).toLocaleString()}
                    </span>
                  </p>
                  {caja.closed_at && (
                    <p className="text-sm text-muted-foreground">
                      Cierre:{' '}
                      <span className="font-medium text-foreground">
                        {new Date(caja.closed_at).toLocaleString()}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
                                  transaction.transaction_type === 'ingreso'
                                    ? 'default'
                                    : 'destructive'
                                }
                              >
                                {transaction.transaction_type}
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
