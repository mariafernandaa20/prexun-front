'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  getNominaPublicInfo,
  signNominaPublic,
  getNominaPublicView,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  CheckCircle,
  FileText,
  User,
  Calendar,
  Briefcase,
  Loader2,
  FileSignature,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SignatureModal } from '@/components/nominas/SignatureModal';

export default function FirmaExternaNominaPage() {
  const params = useParams();
  const token = params.token as string;
  const { toast } = useToast();

  const [nomina, setNomina] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchNomina();
    }
  }, [token]);

  const fetchNomina = async () => {
    setLoading(true);
    try {
      const data = await getNominaPublicInfo(token);
      setNomina(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información de la nómina.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (signatureBase64: string) => {
    setIsProcessing(true);
    try {
      await signNominaPublic(token, signatureBase64);
      toast({
        title: '¡Éxito!',
        description: 'Nómina firmada correctamente.',
      });
      setIsSignModalOpen(false);
      fetchNomina();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo firmar la nómina.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const viewPdf = async () => {
    try {
      const blob = await getNominaPublicView(token);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo abrir el PDF.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-muted-foreground animate-pulse">
            Cargando nómina...
          </p>
        </div>
      </div>
    );
  }

  if (!nomina) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 pb-10 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Nómina no encontrada</h2>
            <p className="text-muted-foreground">
              El enlace puede haber expirado o ser incorrecto.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFirmado = nomina.estado === 'firmado';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-2 bg-blue-600" />
          <CardHeader className="bg-white dark:bg-slate-900 border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  Recibo de Nómina
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sistema de Firmas Digitales Prexun
                </p>
              </div>
              {isFirmado && (
                <div className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> FIRMADO
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Empleado
                  </label>
                  <p className="font-semibold text-lg">{nomina.user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    RFC: {nomina.user?.rfc}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> Periodo
                  </label>
                  <p className="font-semibold">{nomina.seccion}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Fecha de Subida
                  </label>
                  <p className="text-sm">
                    {new Date(nomina.created_at).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {isFirmado && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Fecha de Firma
                    </label>
                    <p className="text-sm">
                      {new Date(nomina.fecha_firma).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">
                      Documento PDF
                    </p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400">
                      Recibo de nómina oficial
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={viewPdf}
                  className="bg-white hover:bg-slate-50 border-blue-200 text-blue-700"
                >
                  Ver Documento
                </Button>
              </div>
            </div>

            {!isFirmado ? (
              <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center border">
                  <FileSignature className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Pendiente de Firma</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Para completar este proceso, es necesario que validez tu
                    recibo con tu firma digital.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-10 h-12 text-base font-bold"
                  onClick={() => setIsSignModalOpen(true)}
                >
                  <FileSignature className="mr-2" /> FIRMAR AHORA
                </Button>
              </div>
            ) : (
              <div className="p-8 bg-green-50 dark:bg-green-900/10 border-t flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-green-800 dark:text-green-400">
                  Proceso Finalizado
                </h3>
                <p className="text-sm text-green-700 dark:text-green-500">
                  Esta nómina ya ha sido firmada y procesada correctamente.
                </p>
                {/* <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 border-green-200 text-green-700 hover:bg-green-100"
                  onClick={() => setIsSignModalOpen(true)}
                >
                  Refirmar si es necesario
                </Button> */}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-white dark:bg-slate-950 p-4 border-t justify-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} PREXUN - CONTROL DE NÓMINAS
            </p>
          </CardFooter>
        </Card>
      </div>

      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleSign}
        loading={isProcessing}
      />
    </div>
  );
}
