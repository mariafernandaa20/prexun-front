'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCajaById } from '@/lib/api';
import { Caja } from '@/lib/types';
import CajaNavigation from '../CajaNavigation';
import CajaDetail from '../CajaDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CajaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cajaId = params.id as string;

  const [caja, setCaja] = useState<Caja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cajaId) {
      fetchCaja();
    }
  }, [cajaId]);

  const fetchCaja = async () => {
    try {
      setLoading(true);
      const response = await getCajaById(Number(cajaId));
      setCaja(response);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('Error al cargar caja'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando detalles de caja...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/planteles/caja/historial')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Historial
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar la caja: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!caja) {
    return (
      <div className="p-6 space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/planteles/caja/historial')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Historial
        </Button>
        <Alert>
          <AlertDescription>
            No se encontró la caja especificada.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <CajaNavigation />

      {/* Botón Volver */}
      <Button
        variant="ghost"
        onClick={() => router.push('/planteles/caja/historial')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Historial
      </Button>

      {/* Componente de Detalle */}
      <CajaDetail caja={caja} showHeader={true} />
    </div>
  );
}
