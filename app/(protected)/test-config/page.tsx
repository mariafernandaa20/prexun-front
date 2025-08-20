'use client';

import { useUIConfig } from '@/hooks/useUIConfig';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TestConfigPage() {
  const { config, loading, error, refreshConfig } = useUIConfig();

  if (loading) {
    return <div>Cargando configuraciones...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones del Sitio</CardTitle>
          <CardDescription>
            Prueba de configuraciones cargadas desde la base de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Período por defecto:</strong>{' '}
            {config?.default_period_id || 'No configurado'}
          </div>
          <div>
            <strong>Items por página:</strong> {config?.default_items_per_page}
          </div>
          <div>
            <strong>Tema por defecto:</strong> {config?.default_theme}
          </div>
          <div>
            <strong>Métodos de pago habilitados:</strong>{' '}
            {config?.payment_methods_enabled?.join(', ')}
          </div>
          <div>
            <strong>Método de pago por defecto:</strong>{' '}
            {config?.default_payment_method}
          </div>

          <Button onClick={refreshConfig}>Refrescar Configuraciones</Button>

          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">JSON completo:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
