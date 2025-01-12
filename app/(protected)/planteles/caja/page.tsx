'use client'
import { useActiveCampusStore } from '@/lib/store/plantel-store'
import React from 'react'
import CajaLayout from './CajaLayout'
import { closeCaja, getCurrentCaja, openCaja } from '@/lib/api'
import { Caja, Transaction, Gasto, Campus, Denomination } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from '@/lib/utils'

const useCaja = ({ activeCampus }: { activeCampus: Campus | null }) => {
  const [caja, setCaja] = React.useState<Caja | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const fetchCaja = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await getCurrentCaja(activeCampus?.id)
      setCaja(response)
      setError(null)
    } catch (err) {
      if (err.response?.status === 404) {
        setCaja(null)
        setError(null)
      } else {
        setError(err instanceof Error ? err : new Error('Error al cargar caja'))
      }
    } finally {
      setLoading(false)
    }
  }, [activeCampus])

  React.useEffect(() => {
    fetchCaja()
  }, [fetchCaja])

  return { caja, loading, error, fetchCaja }
}

export default function CajaPage() {
  const activeCampus = useActiveCampusStore((state) => state.activeCampus)
  const { caja, loading, error, fetchCaja } = useCaja({ activeCampus })

  const calculateTotals = () => {
    if (!caja) return { ingresos: 0, egresos: 0, gastosTotal: 0, balance: 0 }

    const ingresos = caja.transactions?.reduce((sum, t) => sum + t.amount, 0) ?? 0
    const egresos = caja.gastos?.reduce((sum, g) => sum + g.amount, 0) ?? 0
    const balance = ingresos - egresos

    return {
      ingresos,
      egresos,
      balance
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Cargando...</div>
  if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>

  const { ingresos, egresos, gastosTotal, balance } = calculateTotals()
  const handleOpenCaja = async (initialAmount: number, initialAmountCash: Denomination, notes: string) => {
    try {
      await openCaja(Number(activeCampus?.id), initialAmount, initialAmountCash, notes)
      await fetchCaja()
    } catch (error) {
      console.error('Error al abrir caja:', error)
    }
  }
  const handleCloseCaja = async (finalAmount: number, finalAmountCash: Denomination, notes: string) => {
    try {
      await closeCaja(caja.id, finalAmount, finalAmountCash, notes)
      await fetchCaja()
    } catch (error) {
      console.error('Error al cerrar caja:', error)
    }
  }
  function processCashRegister(data) {

    if (!data) {
      return { denominationCount: {}, totalTransactions: 0, totalExpenses: 0, netAmount: 0 };
    }

    // Inicializar contadores
    let denominationCount = {};
    let totalTransactions = 0;
    let totalExpenses = 0;

    // Procesar transacciones
    data.transactions.forEach(transaction => {
      if (transaction.denominations && transaction.denominations.length > 0) {
        transaction.denominations.forEach(denom => {
          const key = `${denom.value}`;
          denominationCount[key] = (denominationCount[key] || 0) + denom.quantity;
          totalTransactions += parseFloat(denom.value) * denom.quantity;
        });
      }
    });

    // Procesar gastos
    data.gastos.forEach(gasto => {
      if (gasto.denominations && gasto.denominations.length > 0) {
        gasto.denominations.forEach(denom => {
          const key = `${denom.value}`;
          denominationCount[key] = (denominationCount[key] || 0) - denom.quantity;
          totalExpenses += parseFloat(denom.value) * denom.quantity;
        });
      }
    });

    // Ordenar denominaciones por valor
    const sortedDenominations = Object.entries(denominationCount)
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
      .filter(([_, count]) => count !== 0)
      .map(([value, count]) => `${value}x${count}`);

    return {
      denominationBreakdown: sortedDenominations,
      totalTransactions: totalTransactions.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      netAmount: (totalTransactions - totalExpenses).toFixed(2)
    };
  }

  const result = processCashRegister(caja);
  
  const actualAmount = Number(result.netAmount ? result.netAmount : 0) + caja?.initial_amount ? Number(caja.initial_amount) : 0;
  //const result = {denominationCount : {}, totalTransactions: 0, totalExpenses: 0, netAmount: 0};

  return (
    <CajaLayout caja={caja} onOpen={handleOpenCaja} onClose={handleCloseCaja} actualAmount={actualAmount}>
      {caja ? (
        <div className="space-y-6 p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estado de Caja</CardTitle>
                  <CardDescription>
                    Información general de la caja actual
                  </CardDescription>
                </div>
                <Badge variant={caja.status === 'abierta' ? 'default' : 'destructive'}>
                  {caja.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Monto Inicial: <span className="font-medium text-foreground">{formatCurrency(caja.initial_amount)}</span>
                  </p>
                  {caja.final_amount && (
                    <p className="text-sm text-muted-foreground">
                      Monto Final: <span className="font-medium text-foreground">{formatCurrency(caja.final_amount)}</span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Ingresos totales: <span className="font-medium text-foreground">{formatCurrency(ingresos)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Egresos totales: <span className="font-medium text-foreground">{formatCurrency(egresos)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Gastos totales: <span className="font-medium text-foreground">{formatCurrency(gastosTotal)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Saldo: <span className="font-medium text-foreground">{formatCurrency(balance)}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Apertura: <span className="font-medium text-foreground">{new Date(caja.opened_at).toLocaleString()}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Efectivo ingresado: <span className="font-medium text-foreground">{formatCurrency(result.totalTransactions)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Efectivo retirado: <span className="font-medium text-foreground">{formatCurrency(result.totalExpenses)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Efectivo actual: <span className="font-medium text-foreground">{formatCurrency(actualAmount)}</span>
                  </p>
                  {caja.closed_at && (
                    <p className="text-sm text-muted-foreground">
                      Cierre: <span className="font-medium text-foreground">{new Date(caja.closed_at).toLocaleString()}</span>
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
                <CardHeader>
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
                            <TableCell>{new Date(transaction.payment_date).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.transaction_type === 'ingreso' ? 'default' : 'destructive'}>
                                {transaction.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(transaction.amount)}</TableCell>
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
                <CardHeader>
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
                          <TableHead>Denominaciones</TableHead>

                          <TableHead>Método</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {caja.gastos?.map((gasto) => (
                          <TableRow key={gasto.id}>
                            <TableCell>{new Date(gasto.date).toLocaleString()}</TableCell>
                            <TableCell>{gasto.concept}</TableCell>
                            <TableCell>{gasto.category}</TableCell>
                            <TableCell>{formatCurrency(gasto.amount)}</TableCell>
                            <TableCell>{gasto.method}</TableCell>
                            <TableCell>
                              {Array.isArray(gasto.denominations) &&
                                gasto.denominations
                                  .map((d: any) => `${d.value}x${d.quantity}`)
                                  .join(', ')}
                            </TableCell>
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
          <CardHeader>
            <CardTitle>Caja Cerrada</CardTitle>
            <CardDescription>
              No hay ninguna caja abierta en este momento
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </CajaLayout>)
}