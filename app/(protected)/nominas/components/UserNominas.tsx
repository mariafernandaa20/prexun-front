'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  FileSignature,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { getNominasUser, signNomina, getNominaUserView } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { SignatureModal } from '@/components/nominas/SignatureModal';

export default function UserNominas() {
  const [nominas, setNominas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [signingNomina, setSigningNomina] = useState<any>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isProcessingSignature, setIsProcessingSignature] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNominas();
  }, []);

  const fetchNominas = async () => {
    setLoading(true);
    try {
      const data = await getNominasUser();
      setNominas(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus nóminas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSignModal = (nomina: any) => {
    setSigningNomina(nomina);
    setIsSignModalOpen(true);
  };

  const handleSign = async (signatureBase64: string) => {
    if (!signingNomina) return;

    setIsProcessingSignature(true);
    try {
      await signNomina(signingNomina.id, signatureBase64);
      toast({
        title: 'Éxito',
        description: 'Nómina firmada correctamente',
      });
      setIsSignModalOpen(false);
      setSigningNomina(null);
      fetchNominas();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo firmar la nómina',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingSignature(false);
    }
  };

  const viewPdf = async (nominaId: number) => {
    try {
      const blob = await getNominaUserView(nominaId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo abrir el PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mis Recibos de Nómina</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNominas}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semana / Sección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Firma</TableHead>
                <TableHead>Fecha de Subida</TableHead>
                <TableHead>Ver Original</TableHead>
                <TableHead>Ver Firmado</TableHead>
                <TableHead className="text-right">FIRMAR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nominas.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {item.seccion?.nombre}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.estado === 'firmado' ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-xs py-1 px-2 bg-green-50 dark:bg-green-900/30 rounded">
                          <CheckCircle2 className="h-3 w-3" /> FIRMADO
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-xs py-1 px-2 bg-amber-50 dark:bg-amber-900/30 rounded">
                          <Clock className="h-3 w-3" /> PENDIENTE
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {item.fecha_firma
                      ? new Date(item.fecha_firma).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground"
                      onClick={() => viewPdf(item.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" /> Original
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-blue-600"
                      disabled={item.estado !== 'firmado'}
                      onClick={() => viewPdf(item.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" /> Firmado
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.estado === 'pendiente' && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex gap-2 font-bold bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleOpenSignModal(item)}
                      >
                        <FileSignature className="h-4 w-4" /> FIRMAR
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {nominas.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground italic"
                  >
                    No tienes nóminas disponibles para este periodo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Importante
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Recuerda que tus recibos de nómina deben ser firmados
                electrónicamente antes de que finalice la semana actual. Si
                tienes algún problema con los datos mostrados, contacta al
                departamento de contabilidad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={handleSign}
        loading={isProcessingSignature}
      />
    </div>
  );
}
