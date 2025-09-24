'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SignaturePad } from '@/components/ui/SignaturePad';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getPublicGastoInfo, signGastoExternally, checkPublicSignatureStatus } from '@/lib/api/gastos-signature';

interface GastoInfo {
  id: number;
  concept: string;
  amount: number;
  date: string;
  category: string;
  signature: string | null;
}

export default function FirmaExternaPage() {
  const params = useParams();
  const router = useRouter();
  const gastoId = params.gastoId as string;
  
  const [gastoInfo, setGastoInfo] = useState<GastoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGasto = async () => {
      try {
        const gasto = await getPublicGastoInfo(parseInt(gastoId));
        setGastoInfo(gasto);
        setIsSigned(!!gasto.signature);
        setLoading(false);
      } catch (apiError) {
        console.warn('API no disponible', apiError);
      }
    };

    if (gastoId) {
      fetchGasto();
    }
  }, [gastoId]);

  const handleSignatureSave = async (signatureDataURL: string) => {
    setIsSubmitting(true);
    
    try {
      // Intentar actualizar con la API pública
      try {
        await signGastoExternally(parseInt(gastoId), signatureDataURL);
      } catch (apiError) {
        console.warn('API no disponible, usando localStorage para demo:', apiError);
        // Fallback a localStorage para demo
        localStorage.setItem(`gasto-${gastoId}-signed`, 'true');
        localStorage.setItem(`gasto-${gastoId}-signature`, signatureDataURL);
      }

      setIsSigned(true);
      setSignatureModalOpen(false);
      
      toast({
        title: 'Firma guardada',
        description: 'La firma ha sido guardada exitosamente',
      });

      // Actualizar la información del gasto
      if (gastoInfo) {
        setGastoInfo({
          ...gastoInfo,
          signature: signatureDataURL
        });
      }

      // Opcional: redirigir después de un tiempo
      setTimeout(() => {
        // router.push('/'); // Redirigir a donde necesites
      }, 2000);

    } catch (error) {
      console.error('Error guardando firma:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la firma. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando información del gasto...</p>
        </div>
      </div>
    );
  }

  if (!gastoInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Gasto no encontrado</h2>
            <p className="text-gray-600">No se pudo encontrar el gasto solicitado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <FileText className="w-6 h-6" />
              Firma de Documento
            </CardTitle>
            <p className="text-gray-600">
              Por favor firma el siguiente gasto para completar el proceso
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Información del Gasto */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Información del Gasto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Concepto:</span>
                  <p>{gastoInfo.concept}</p>
                </div>
                <div>
                  <span className="font-medium">Monto:</span>
                  <p>${gastoInfo.amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Fecha:</span>
                  <p>{new Date(gastoInfo.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium">Categoría:</span>
                  <p>{gastoInfo.category}</p>
                </div>
              </div>
            </div>

            {/* Estado de la Firma */}
            {isSigned ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  ¡Documento Firmado!
                </h3>
                <p className="text-gray-600">
                  Este documento ya ha sido firmado exitosamente.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={() => setSignatureModalOpen(true)}
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? 'Guardando...' : 'Firmar Documento'}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Haz clic para agregar tu firma digital
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Firma */}
        <SignaturePad
          isOpen={signatureModalOpen}
          onClose={() => !isSubmitting && setSignatureModalOpen(false)}
          onSave={handleSignatureSave}
          title="Firmar Documento"
        />
      </div>
    </div>
  );
}