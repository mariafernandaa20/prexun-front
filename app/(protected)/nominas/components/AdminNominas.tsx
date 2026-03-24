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
import { Input } from '@/components/ui/input';
import {
  Upload,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  getNominasAdmin,
  uploadNominas,
  getNominaAdminView,
  getNominaSeccion,
  getNominasUsers,
  uploadNominaToUser,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import SearchableSelect from '@/components/SearchableSelect';

export default function AdminNominas() {
  const [secciones, setSecciones] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Workflow States
  const [activeSeccionId, setActiveSeccionId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  // Batch Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Selected Section Details (with its nominas)
  const [activeSeccionDetail, setActiveSeccionDetail] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Update detail when active section changes
  useEffect(() => {
    if (activeSeccionId) {
      fetchSeccionDetail(parseInt(activeSeccionId));
    } else {
      setActiveSeccionDetail(null);
    }
  }, [activeSeccionId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [seccData, userData] = await Promise.all([
        getNominasAdmin(),
        getNominasUsers(),
      ]);
      setSecciones(seccData);
      setUsuarios(userData);

      // If there are sections and none active, select the latest one
      if (seccData.length > 0 && !activeSeccionId) {
        setActiveSeccionId(seccData[0].id.toString());
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSeccionDetail = async (id: number) => {
    try {
      const detail = await getNominaSeccion(id);
      setActiveSeccionDetail(detail);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionName) return;
    setUploading(true);
    try {
      // Create empty section by uploading 0 files but providing name
      const response = await uploadNominas(newSectionName, []);
      toast({ title: 'Éxito', description: 'Sección creada' });
      setNewSectionName('');
      setIsCreatingNew(false);

      // Refresh list and select the new one
      const data = await getNominasAdmin();
      setSecciones(data);
      if (response.seccion_id) {
        setActiveSeccionId(response.seccion_id.toString());
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la sección',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBatchUpload = async () => {
    if (!activeSeccionId || selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const response = await uploadNominas(
        null,
        selectedFiles,
        parseInt(activeSeccionId)
      );
      toast({
        title: 'Carga completa',
        description: `Éxito: ${response.results.success}. Fallidos: ${response.results.failed.length}`,
      });
      setSelectedFiles([]);
      fetchSeccionDetail(parseInt(activeSeccionId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error en la carga masiva',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUserFileUpload = async (userId: number, file: File) => {
    if (!activeSeccionId) return;
    try {
      await uploadNominaToUser(userId, parseInt(activeSeccionId), file);
      toast({ title: 'Éxito', description: 'Nómina cargada correctamente' });
      fetchSeccionDetail(parseInt(activeSeccionId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar archivo a usuario',
        variant: 'destructive',
      });
    }
  };

  const viewPdf = async (nominaId: number) => {
    try {
      const blob = await getNominaAdminView(nominaId);
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

  // Helper to cross-reference users with current section nominas
  const getUserStatus = (user: any) => {
    if (!activeSeccionDetail?.nominas) return null;
    return activeSeccionDetail.nominas.find((n: any) => n.user_id === user.id);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* PASO 1: SELECCIONAR O CREAR SEMANA */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            1
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Seleccionar Semana o Sección
          </h2>
        </div>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Semana / Periodo Activo
                </label>
                <SearchableSelect
                  options={secciones.map((s) => ({
                    value: s.id.toString(),
                    label: s.nombre,
                  }))}
                  value={activeSeccionId}
                  placeholder="Seleccionar periodo..."
                  onChange={setActiveSeccionId}
                  disabled={loading || isCreatingNew}
                />
              </div>
              <div className="flex items-center gap-2">
                {!isCreatingNew ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingNew(true)}
                    className="dark:border-slate-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nueva Sección
                  </Button>
                ) : (
                  <div className="flex gap-2 items-center bg-muted/50 dark:bg-slate-800/50 p-1 rounded-lg border dark:border-slate-700">
                    <Input
                      placeholder="Nombre de la nueva sección..."
                      className="h-9 w-[250px] dark:bg-slate-900"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateSection}
                      disabled={uploading || !newSectionName}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Crear'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsCreatingNew(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* PASO 2: SUBIR ARCHIVOS (MASIVO) */}
      {activeSeccionId && (
        <section className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-blue-600">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              2
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Carga Masiva de PDFs
            </h2>
          </div>

          <Card className="border-l-4 border-l-slate-400 bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex-col gap-1">
                  <p className="text-sm font-medium">
                    Detectar por RFC automáticamente
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Sube múltiples archivos y el sistema los asignará por nombre{' '}
                    <code className="bg-white dark:bg-slate-800 px-1">
                      RFC_...pdf
                    </code>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {selectedFiles.slice(0, 3).map((f, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center shadow-sm"
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                      </div>
                    ))}
                    {selectedFiles.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 border dark:border-slate-600 flex items-center justify-center text-[10px] font-bold">
                        +{selectedFiles.length - 3}
                      </div>
                    )}
                  </div>

                  <Input
                    type="file"
                    multiple
                    accept=".pdf"
                    className="hidden"
                    id="batch-upload"
                    onChange={(e) =>
                      setSelectedFiles(Array.from(e.target.files || []))
                    }
                  />
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="batch-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {selectedFiles.length > 0
                        ? 'Cambiar Selección'
                        : 'Seleccionar Archivos'}
                    </label>
                  </Button>

                  <Button
                    size="sm"
                    disabled={uploading || selectedFiles.length === 0}
                    onClick={handleBatchUpload}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Cargar {selectedFiles.length}{' '}
                    {selectedFiles.length === 1 ? 'Archivo' : 'Archivos'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* PASO 3: TABLA DE NOMINAS */}
      {activeSeccionId && (
        <section className="space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                3
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider">
                Tablero de Control de Nóminas
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black text-muted-foreground mr-2">
                Estado General:
              </span>
              <div className="flex gap-1">
                <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[9px] font-bold">
                  {activeSeccionDetail?.firmadas_count ?? 0} Firmadas
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[9px] font-bold">
                  {activeSeccionDetail?.total_nominas ?? 0} Totales
                </span>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border-t-0 border-x-0 border-b-0 shadow-lg dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHead className="w-[300px] text-xs font-bold uppercase">
                    Empleado
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase text-center">
                    RFC
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase text-center">
                    Estado de Nómina
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-muted-foreground italic"
                    >
                      No hay usuarios registrados (excepto proveedores).
                    </TableCell>
                  </TableRow>
                )}
                {usuarios.map((user) => {
                  const record = getUserStatus(user);
                  return (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <TableCell className="py-3">
                        <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <code className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 font-mono">
                          {user.rfc || 'SIN RFC'}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        {!record ? (
                          <span className="inline-flex items-center gap-1.5 text-neutral-400 text-[10px] font-bold border rounded-full px-2.5 py-0.5 border-dashed dark:border-neutral-700">
                            SIN ARCHIVO
                          </span>
                        ) : record.estado === 'firmado' ? (
                          <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 text-[10px] font-black bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full px-2.5 py-0.5">
                            <CheckCircle2 className="h-3 w-3" /> COMPLETADO
                            (FIRMADO)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900 rounded-full px-2.5 py-0.5">
                            <Clock className="h-3 w-3" /> PENDIENTE DE FIRMA
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!record ? (
                          <div className="flex justify-end items-center gap-2">
                            <Input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              id={`user-file-${user.id}`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUserFileUpload(user.id, file);
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <label
                                htmlFor={`user-file-${user.id}`}
                                className="cursor-pointer"
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Subir PDF
                              </label>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-[10px] border-slate-200 dark:border-slate-700"
                              onClick={() => viewPdf(record.id)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" /> VER PDF
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}
