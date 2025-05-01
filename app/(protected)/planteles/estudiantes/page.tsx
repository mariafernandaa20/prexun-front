'use client';
import { FaWhatsapp } from "react-icons/fa6";

import React, { useEffect, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Grupo, Period, Promocion, Student } from '@/lib/types';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getPeriods,
  getPromos,
  getGrupos,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2, Filter, Eye, ChevronDown, CheckCircle2 } from 'lucide-react';
import { StudentForm } from './student-form';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getCarreras,
  getCohorts,
  getFacultades,
  getMunicipios,
  getPrepas,
} from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/multi-select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth-store';
import { getColumnDefinitions, getColumnOptions } from './columns';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [municipios, setMunicipios] = useState<Array<{ id: string; name: string }>>([]);
  const [prepas, setPrepas] = useState<Array<{ id: string; name: string }>>([]);
  const [facultades, setFacultades] = useState<Array<{ id: string; name: string }>>([]);
  const [carreras, setCarreras] = useState<Array<{ id: string; name: string; facultad_id: string }>>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'preparatoria' | 'facultad'>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchMatricula, setSearchMatricula] = useState<number | null>(null);
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const { activeCampus } = useActiveCampusStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Estados para las acciones en masa
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteForever = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este estudiante permanentemente?')) return;

    try {
      await deleteStudent(id, true);
      await fetchStudents();
      toast({ title: 'Estudiante eliminado correctamente' });
    } catch (error: any) {
      toast({
        title: 'Error al eliminar estudiante',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    }
  };

  const columnDefinitions = React.useMemo(
    () => getColumnDefinitions(user, handleOpenEditModal, handleDeleteForever),
    [user]
  );

  const columnOptions = React.useMemo(
    () => getColumnOptions(columnDefinitions),
    [columnDefinitions]
  );

  const [visibleColumns, setVisibleColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedColumns = localStorage.getItem('studentTableColumns');
      if (savedColumns) {
        return JSON.parse(savedColumns);
      }
    }
    return columnDefinitions
      .filter((col) => col.defaultVisible)
      .map((col) => col.id);
  });

  const handleColumnSelect = (selectedColumns: string[]) => {
    setVisibleColumns(selectedColumns);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'studentTableColumns',
        JSON.stringify(selectedColumns)
      );
    }
  };

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await getStudents(activeCampus?.id);
      setStudents(response);
    } catch (error: any) {
      toast({
        title: 'Error al cargar estudiantes',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGrupos = async () => {
    const response = await getGrupos();
    setGrupos(response);
  };

  const getData = async () => {
    const responseMunicipios = await getMunicipios();
    const responsePrepas = await getPrepas();
    const responseFacultades = await getFacultades();
    const responseCarreras = await getCarreras();

    setMunicipios(responseMunicipios);
    setPrepas(responsePrepas);
    setFacultades(responseFacultades);
    setCarreras(responseCarreras);
  };

  const fetchPeriods = async () => {
    const response = await getPeriods();
    setPeriods(response);
  };

  const fetchPromos = async () => {
    const response = await getPromos();
    setPromos(response.active);
  };

  const handleOpenCreateModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!activeCampus) return;

    fetchStudents();
    fetchPeriods();
    fetchPromos();
    fetchGrupos();
    try {
      getData();
    } catch (error) {
      toast({
        title: 'Error al cargar datos',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    }
  }, [activeCampus]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este estudiante?')) return;

    try {
      await deleteStudent(id);
      await fetchStudents();
      toast({ title: 'Estudiante eliminado correctamente' });
    } catch (error: any) {
      toast({
        title: 'Error al eliminar estudiante',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (formData: Student) => {
    try {
      if (selectedStudent) {
        await updateStudent({ ...formData });
        toast({ title: 'Estudiante actualizado correctamente' });
      } else {
        await createStudent({ ...formData });
        toast({ title: 'Estudiante creado correctamente' });
      }
      await fetchStudents();
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error al guardar estudiante',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesType = typeFilter === 'all' || student.type === typeFilter;
    const matchesPeriod = periodFilter === 'all' || student.period.id === periodFilter;
    const matchesName =
      student.firstname.toLowerCase().includes(searchName.toLowerCase()) ||
      student.lastname.toLowerCase().includes(searchName.toLowerCase());
    const matchesDate =
      !searchDate ||
      new Date(student.created_at).toLocaleDateString().includes(searchDate);
    const matchesPhone = !searchPhone || student.phone.includes(searchPhone);
    const matchesMatricula = !searchMatricula || String(student.id).includes(String(searchMatricula));

    return (
      matchesType && matchesPeriod && matchesName && matchesDate && matchesPhone && matchesMatricula
    );
  });

  // Obtener solo las definiciones de columnas visibles
  const visibleColumnDefs = React.useMemo(
    () => columnDefinitions.filter(col => visibleColumns.includes(col.id)),
    [columnDefinitions, visibleColumns]
  );

  // Maneja la selección individual de estudiantes
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Maneja la selección de todos los estudiantes
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
    setSelectAll(!selectAll);
  };

  // Actualiza el estado selectAll cuando cambian los estudiantes seleccionados
  useEffect(() => {
    if (filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedStudents, filteredStudents]);

  // Funciones para acciones en masa
  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`¿Está seguro de eliminar ${selectedStudents.length} estudiante(s)?`)) return;

    try {
      setIsBulkActionLoading(true);
      // Aquí implementarías una función en el backend para eliminar múltiples estudiantes
      // Ejemplo: await deleteManyStudents(selectedStudents);

      // Por ahora, eliminamos uno por uno:
      for (const id of selectedStudents) {
        await deleteStudent(id);
      }

      await fetchStudents();
      setSelectedStudents([]);
      toast({
        title: 'Acción completada',
        description: `${selectedStudents.length} estudiante(s) eliminados correctamente`
      });
    } catch (error: any) {
      toast({
        title: 'Error al eliminar estudiantes',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkUpdatePeriod = async (periodId: string) => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`¿Está seguro de actualizar el periodo de ${selectedStudents.length} estudiante(s)?`)) return;

    try {
      setIsBulkActionLoading(true);
      // Aquí implementarías una función en el backend para actualizar periodos
      // Ejemplo: await updateManyStudentsPeriod(selectedStudents, periodId);

      // Por ahora, actualizamos uno por uno (esto deberías reemplazarlo con una API optimizada para operaciones en masa):
      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          await updateStudent({
            ...student,
            period: {
              ...student.period,
              id: periodId
            }
          });
        }
      }

      await fetchStudents();
      setSelectedStudents([]);
      toast({
        title: 'Acción completada',
        description: `${selectedStudents.length} estudiante(s) actualizados correctamente`
      });
    } catch (error: any) {
      toast({
        title: 'Error al actualizar estudiantes',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Función para enviar WhatsApp a los seleccionados
  const handleBulkWhatsApp = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    // Obtener números de teléfono de los estudiantes seleccionados
    const selectedPhones = filteredStudents
      .filter(student => selectedStudents.includes(student.id))
      .map(student => student.phone)
      .filter(phone => phone && phone.trim() !== '');

    if (selectedPhones.length === 0) {
      toast({
        title: 'Error',
        description: 'Los estudiantes seleccionados no tienen números de teléfono válidos',
        variant: 'destructive',
      });
      return;
    }

    // Abrir WhatsApp Web con los números seleccionados
    const message = encodeURIComponent('Mensaje para estudiantes');
    window.open(`https://wa.me/${selectedPhones[0]}?text=${message}`, '_blank');

    toast({
      title: 'WhatsApp iniciado',
      description: `Se abrió WhatsApp para ${selectedPhones.length} contacto(s)`
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col flex-1 w-full overflow-hidden">
        <CardHeader className='sticky top-0 z-20 bg-card'>
          <div className="flex flex-col lg:flex-row justify-between items-center mb-4">
            <h1 className="text-2xl font-bold mb-4 lg:mb-0">Estudiantes</h1>
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full lg:w-[200px]"
                />

                <MultiSelect
                  className="w-full lg:w-[200px]"
                  options={columnOptions}
                  hiddeBadages={true}
                  selectedValues={visibleColumns}
                  onSelectedChange={handleColumnSelect}
                  title="Columnas"
                  placeholder="Seleccionar columnas"
                  searchPlaceholder="Buscar columna..."
                  emptyMessage="No se encontraron columnas"
                />
                <Select
                  value={periodFilter}
                  onValueChange={(value) => setPeriodFilter(value)}
                >
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Filtrar por periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los periodos</SelectItem>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleOpenCreateModal} className="whitespace-nowrap">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nuevo Estudiante
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowAllFilters(!showAllFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              {showAllFilters && (
                <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                  <Input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full lg:w-[200px]"
                  />
                  <Input
                    placeholder="Buscar por teléfono..."
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full lg:w-[200px]"
                  />
                  <Input
                    placeholder="Buscar por matricula..."
                    value={searchMatricula?.toString() || ''}
                    onChange={(e) => setSearchMatricula(e.target.value ? Number(e.target.value) : null)}
                    className="w-full lg:w-[200px]"
                  />
                  <Select
                    value={typeFilter}
                    onValueChange={(value: 'all' | 'preparatoria' | 'facultad') =>
                      setTypeFilter(value)
                    }
                  >
                    <SelectTrigger className="w-full lg:w-[180px]">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="preparatoria">Preparatoria</SelectItem>
                      <SelectItem value="facultad">Facultad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Menú de acciones en masa */}
          {selectedStudents.length > 0 && (
            <div className="flex items-center justify-between mt-2 p-2 bg-muted/50 rounded-md">
              <div className="flex items-center">
                <span>{selectedStudents.length} estudiante(s) seleccionado(s)</span>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isBulkActionLoading}>
                      Acciones en masa <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleBulkDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar seleccionados
                    </DropdownMenuItem>
                    {periods.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-full flex items-center px-2 py-1.5 text-sm">
                          <Pencil className="mr-2 h-4 w-4" />
                          Cambiar periodo
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {periods.map((period) => (
                            <DropdownMenuItem
                              key={period.id}
                              onClick={() => handleBulkUpdatePeriod(period.id)}
                            >
                              {period.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <DropdownMenuItem onClick={handleBulkWhatsApp}>
                      <FaWhatsapp className="mr-2 h-4 w-4" />
                      Enviar WhatsApp
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedStudents([])}
                  disabled={isBulkActionLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading || isBulkActionLoading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : (
            <div className="h-full overflow-x-auto max-w-[80vw]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    {/* Columna de checkbox para selección */}
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll && filteredStudents.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Seleccionar todos"
                      />
                    </TableHead>
                    {visibleColumnDefs.map((column) => (
                      <TableHead
                        key={column.id}
                        className="bg-card whitespace-nowrap"
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={visibleColumnDefs.length + 1}
                        className="text-center h-32"
                      >
                        No se encontraron estudiantes
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        {/* Celda de checkbox para selección */}
                        <TableCell className="w-12">
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => handleSelectStudent(student.id)}
                            aria-label={`Seleccionar ${student.firstname} ${student.lastname}`}
                          />
                        </TableCell>
                        {visibleColumnDefs.map((column) => (
                          <TableCell
                            key={`${student.id}-${column.id}`}
                            className="whitespace-nowrap"
                          >
                            {column.render(student, user, handleOpenEditModal, handleDeleteForever)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="lg:min-w-[60rem] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            </DialogTitle>
          </DialogHeader>
          <StudentForm
            campusId={activeCampus?.id}
            student={selectedStudent}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            periods={periods}
            municipios={municipios}
            prepas={prepas}
            facultades={facultades}
            carreras={carreras}
            promos={promos}
            grupos={grupos}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}