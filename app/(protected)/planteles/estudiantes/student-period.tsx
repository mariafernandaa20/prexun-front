'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Trash2, Calendar, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  StudentAssignment,
  Student,
  Grupo,
  SemanaIntensiva,
  Period,
} from '@/lib/types';
import {
  getStudentAssignmentsByStudent,
  createStudentAssignment,
  updateStudentAssignment,
  deleteStudentAssignment,
  toggleStudentAssignmentActive,
} from '@/lib/api';

interface StudentPeriodProps {
  student: Student;
  onRefresh?: () => void;
}

interface AssignmentFormData {
  student_id: string;
  grupo_id?: number | null;
  semana_intensiva_id?: number | null;
  period_id: string;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  book_delivered?: boolean;
  book_delivery_type?: string;
  book_delivery_date?: string;
  book_notes?: string;
}

export default function StudentPeriod({
  student,
  onRefresh,
}: StudentPeriodProps) {
  const { toast } = useToast();
  const { periods, grupos, carreras, facultades, semanasIntensivas, campuses } =
    useAuthStore();

  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<StudentAssignment | null>(null);
  const [formData, setFormData] = useState<AssignmentFormData>({
  student_id: student.id || '',
  grupo_id: null,
  semana_intensiva_id: null,
  period_id: student.period_id,
  valid_from: undefined,
  valid_until: undefined,
  is_active: true,
  book_delivered: false,
  book_delivery_type: '',
  book_delivery_date: '',
  book_notes: '',
  });

  useEffect(() => {
    if (student.id) {
      fetchAssignments();
    }
  }, [student.id]);
  const fetchAssignments = async () => {
    if (!student.id) return;

    try {
      setIsLoading(true);
      const studentIdNumber = parseInt(student.id);
      const data = await getStudentAssignmentsByStudent(studentIdNumber);
      setAssignments(data);
    } catch (error: any) {
      toast({
        title: 'Error al cargar asignaciones',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: student.id || '',
      grupo_id: null,
      semana_intensiva_id: null,
      period_id: student.period_id,
      valid_from: undefined,
      valid_until: undefined,
      is_active: true,
    });
    setIsEditing(false);
    setEditingAssignment(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  const handleOpenEditDialog = (assignment: StudentAssignment) => {
    setFormData({
      student_id: assignment.student_id,
      grupo_id: assignment.grupo_id,
      semana_intensiva_id: assignment.semana_intensiva_id,
      period_id: assignment.period_id,
      valid_from: assignment.valid_from || undefined,
      valid_until: assignment.valid_until || undefined,
      is_active: assignment.is_active,
      book_delivered: assignment.book_delivered ?? false,
      book_delivery_type: assignment.book_delivery_type ?? '',
      book_delivery_date: assignment.book_delivery_date ?? '',
      book_notes: assignment.book_notes ?? '',
    });
    setIsEditing(true);
    setEditingAssignment(assignment);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const validateForm = (): boolean => {
    if (
      !formData.grupo_id ||
      formData.grupo_id === 0 ||
      !formData.semana_intensiva_id ||
      formData.semana_intensiva_id === 0
    ) {
      toast({
        title: 'Error de validación',
        description:
          'Debe seleccionar al menos un grupo o una semana intensiva',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.valid_from && formData.valid_until) {
      if (new Date(formData.valid_until) <= new Date(formData.valid_from)) {
        toast({
          title: 'Error de validación',
          description:
            'La fecha de fin debe ser posterior a la fecha de inicio',
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
      };
      if (isEditing && editingAssignment?.id) {
        const updateData = {
          ...submitData,
          id: editingAssignment.id,
        };
        await updateStudentAssignment(updateData);
        toast({
          title: 'Asignación actualizada',
          description: 'La asignación se ha actualizado correctamente',
        });
      } else {
        await createStudentAssignment(submitData);
        toast({
          title: 'Asignación creada',
          description: 'La nueva asignación se ha creado correctamente',
        });
      }

      await fetchAssignments();
      handleCloseDialog();
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: isEditing ? 'Error al actualizar' : 'Error al crear',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta asignación?')) return;

    try {
      await deleteStudentAssignment(assignmentId);
      toast({
        title: 'Asignación eliminada',
        description: 'La asignación se ha eliminado correctamente',
      });
      await fetchAssignments();
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: 'Error al eliminar',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (assignmentId: number) => {
    try {
      await toggleStudentAssignmentActive(assignmentId);
      toast({
        title: 'Estado actualizado',
        description:
          'El estado de la asignación se ha actualizado correctamente',
      });
      await fetchAssignments();
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: 'Error al actualizar estado',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    }
  };

  const getGrupoName = (grupoId: number | null) => {
    if (!grupoId) return 'N/A';
    const grupo = grupos.find((g) => g.id === grupoId);
    return grupo?.name || `Grupo ${grupoId}`;
  };

  const getSemanaIntensivaName = (semanaId: number | null) => {
    if (!semanaId) return 'N/A';
    const semana = semanasIntensivas.find((s) => s.id === semanaId);
    return semana?.name || `Semana ${semanaId}`;
  };

  const getPeriodName = (periodId: string) => {
    const period = periods.find((p) => p.id === periodId);
    return period?.name || `Periodo ${periodId}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asignaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">
              Cargando asignaciones...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Asignaciones
            </CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAddDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Asignación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? 'Editar Asignación' : 'Nueva Asignación'}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? 'Modifica los datos de la asignación seleccionada'
                    : 'Crea una nueva asignación para el estudiante'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="book_delivered">¿Libro entregado?</Label>
                    <Select
                      value={formData.book_delivered ? 'true' : 'false'}
                      onValueChange={(value) =>
                        handleInputChange('book_delivered', value === 'true')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sí</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="book_delivery_type">Tipo de entrega libro</Label>
                    <Select
                      value={formData.book_delivery_type ?? 'none'}
                      onValueChange={(value) =>
                        handleInputChange('book_delivery_type', value === 'none' ? null : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo de entrega" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin especificar</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="fisico">Físico</SelectItem>
                        <SelectItem value="paqueteria">Paquetería</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="book_delivery_date">Fecha entrega libro</Label>
                    <Input
                      id="book_delivery_date"
                      type="date"
                      value={formData.book_delivery_date || ''}
                      onChange={(e) =>
                        handleInputChange('book_delivery_date', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="book_notes">Notas libro</Label>
                    <Input
                      id="book_notes"
                      type="text"
                      value={formData.book_notes || ''}
                      onChange={(e) =>
                        handleInputChange('book_notes', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period_id">Periodo *</Label>
                    <Select
                      value={formData?.period_id?.toString()}
                      onValueChange={(value) =>
                        handleInputChange('period_id', value.toString())
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar periodo" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem
                            key={period.id}
                            value={period.id.toString()}
                          >
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grupo_id">Grupo</Label>
                    <Select
                      value={formData.grupo_id?.toString() || 'none'}
                      onValueChange={(value) =>
                        handleInputChange(
                          'grupo_id',
                          value === 'none' ? null : parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguno</SelectItem>
                        {grupos
                          .filter(
                            (grupo) =>
                              grupo.period_id.toString() ===
                              (formData.period_id
                                ? formData.period_id.toString()
                                : null)
                          )
                          .map((grupo) => (
                            <SelectItem
                              key={grupo.id}
                              value={grupo.id!.toString()}
                            >
                              {grupo.name} (
                              {grupo.active_assignments_count || 0}/
                              {grupo.capacity})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semana_intensiva_id">
                      Semana Intensiva
                    </Label>
                    <Select
                      value={formData.semana_intensiva_id?.toString() || 'none'}
                      onValueChange={(value) =>
                        handleInputChange(
                          'semana_intensiva_id',
                          value === 'none' ? null : parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar semana intensiva (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguna</SelectItem>
                        {semanasIntensivas
                          .filter(
                            (semana) =>
                              semana.period_id.toString() ===
                              (formData.period_id
                                ? formData.period_id.toString()
                                : null)
                          )
                          .map((semana) => (
                            <SelectItem
                              key={semana.id}
                              value={semana.id!.toString()}
                            >
                              {semana.name} (
                              {semana.active_assignments_count || 0}/
                              {semana.capacity})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valid_from">Válido desde</Label>
                    <Input
                      id="valid_from"
                      type="date"
                      value={formData.valid_from || ''}
                      onChange={(e) =>
                        handleInputChange('valid_from', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valid_until">Válido hasta</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until || ''}
                      onChange={(e) =>
                        handleInputChange('valid_until', e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="is_active">Estado</Label>
                    <Select
                      value={formData.is_active.toString()}
                      onValueChange={(value) =>
                        handleInputChange('is_active', value === 'true')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isEditing ? 'Actualizar' : 'Crear'} Asignación
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              Sin asignaciones
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Este estudiante no tiene asignaciones a grupos o semanas
              intensivas
            </p>
            {/* <Button onClick={handleOpenAddDialog} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Crear primera asignación
            </Button> */}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Asignación</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {assignment.grupo_id && (
                            <Badge variant="secondary" className="text-xs">
                              Grupo
                            </Badge>
                          )}
                          {assignment.semana_intensiva_id && (
                            <Badge variant="outline" className="text-xs">
                              Semana Intensiva
                            </Badge>
                          )}
                          {assignment.book_delivered && (
                            <Badge variant="default" className="text-xs">
                              Libro Entregado
                            </Badge>
                          )}
                          {assignment.book_delivery_type && (
                            <Badge variant="secondary" className="text-xs">
                              {assignment.book_delivery_type.charAt(0).toUpperCase() + assignment.book_delivery_type.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {assignment.grupo_id && (
                            <div className="text-sm font-medium">
                              {getGrupoName(assignment.grupo_id)}
                            </div>
                          )}
                          {assignment.semana_intensiva_id && (
                            <div className="text-sm text-muted-foreground">
                              {getSemanaIntensivaName(
                                assignment.semana_intensiva_id
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getPeriodName(assignment.period_id)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Desde: {formatDate(assignment.valid_from)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Hasta: {formatDate(assignment.valid_until)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(assignment.id!)}
                          className="p-0"
                        >
                          <Badge
                            variant={
                              assignment.is_active ? 'default' : 'secondary'
                            }
                          >
                            {assignment.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(assignment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(assignment.id!)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
