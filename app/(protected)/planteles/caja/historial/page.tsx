'use client';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import React, { useEffect, useState } from 'react';
import { getCajasHistorial } from '@/lib/api';
import { Caja } from '@/lib/types';
import { useCajaActiva } from '../CajaContext';
import CajaNavigation from '../CajaNavigation';
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
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateCajaTotals, processCajaData } from '@/lib/helpers/cajaHelpers';

export default function CajaHistorialPage() {
  const router = useRouter();
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const activeCampus = useActiveCampusStore((state) => state.activeCampus);
  const { caja: currentCaja } = useCajaActiva();

  useEffect(() => {
    if (activeCampus?.id) {
      fetchHistorial();
    }
  }, [activeCampus?.id]);

  const fetchHistorial = async () => {
    if (!activeCampus?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const historialCajas = await getCajasHistorial(activeCampus.id);
      setCajas(historialCajas);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCaja = (cajaId: number) => {
    router.push(`/planteles/caja/${cajaId}`);
  };

  const handleGoToCurrent = () => {
    router.push(`/planteles/caja`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando historial de cajas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar el historial: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <CajaNavigation />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historial de Cajas</h1>
          <p className="text-muted-foreground">
            Gestiona y consulta todas las cajas del campus
          </p>
        </div>
        
        <div className="flex gap-2">
          {currentCaja && (
            <Button onClick={handleGoToCurrent}>
              <Calendar className="w-4 h-4 mr-2" />
              Caja Actual
            </Button>
          )}
        </div>
      </div>

      {/* Caja Actual Card */}
      {currentCaja && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-primary">Caja Actual</CardTitle>
                <CardDescription>
                  Abierta el {new Date(currentCaja.opened_at!).toLocaleString()}
                </CardDescription>
              </div>
              <Badge variant="default">Abierta</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Monto Inicial</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(currentCaja.initial_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(calculateCajaTotals(currentCaja).ingresos)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(calculateCajaTotals(currentCaja).balance)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleGoToCurrent} size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Cajas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cajas</CardTitle>
          <CardDescription>
            Todas las cajas registradas para este campus
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cajas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay cajas registradas para este campus
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Apertura</TableHead>
                  <TableHead>Fecha Cierre</TableHead>
                  <TableHead>Monto Inicial</TableHead>
                  <TableHead>Monto Final</TableHead>
                  <TableHead>Ingresos</TableHead>
                  <TableHead>Egresos</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cajas.map((caja) => {
                  const processed = processCajaData(caja);
                  return (
                    <TableRow 
                      key={caja.id} 
                      className={caja.status === 'abierta' ? 'bg-primary/5' : ''}
                    >
                      <TableCell className="font-medium">#{caja.id}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={caja.status === 'abierta' ? 'default' : 'secondary'}
                        >
                          {caja.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {caja.opened_at ? new Date(caja.opened_at).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {caja.closed_at ? new Date(caja.closed_at).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(caja.initial_amount)}
                      </TableCell>
                      <TableCell>
                        {caja.final_amount ? formatCurrency(caja.final_amount) : '-'}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(processed.totals.cashIngresos)}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {formatCurrency(processed.totals.cashGastos)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(processed.totals.finalBalance)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewCaja(caja.id!)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}