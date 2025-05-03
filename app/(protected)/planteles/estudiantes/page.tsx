'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Promocion, Student } from '@/lib/types';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkDeleteStudents,
  getPromos,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Filter, ChevronDown, } from 'lucide-react';
import { useActiveCampusStore } from '@/lib/store/plantel-store';

import {
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
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth-store';
import { getColumnDefinitions, getColumnOptions } from './columns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StudentsTable } from "./StudentsTable";
import { StudentDialog } from "./StudentDialog";
import PaginationComponent from "@/components/ui/PaginationComponent";

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [municipios, setMunicipios] = useState<Array<{ id: string; name: string }>>([]);
  const [prepas, setPrepas] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'preparatoria' | 'facultad'>('all');
  const [grupoFilter, setGrupoFilter] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<string>();
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchMatricula, setSearchMatricula] = useState<number | null>(null);
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const { activeCampus } = useActiveCampusStore();
  const { user, periods, grupos } = useAuthStore();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 50,
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const { toast } = useToast();

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
    const params = {
      campus_id: activeCampus?.id,
      page: pagination.currentPage,
      perPage: pagination.perPage,
      search: searchName,
      searchDate: searchDate,
      searchPhone: searchPhone,
      searchMatricula: searchMatricula,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      grupo: grupoFilter ? grupoFilter : undefined,
      period: periodFilter,
    }

    try {
      setIsLoading(true);
      const response = await getStudents({ params });
      setStudents(response.data);
      setPagination({
        currentPage: pagination.currentPage,
        lastPage: response.last_page || 1,
        total: response.total || response.length,
        perPage: pagination.perPage,
      });
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

  const getData = async () => {
    const responseMunicipios = await getMunicipios();
    const responsePrepas = await getPrepas();

    setMunicipios(responseMunicipios);
    setPrepas(responsePrepas);
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
    fetchPromos();
    try {
      getData();
    } catch (error) {
      toast({
        title: 'Error al cargar datos',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    }
  }, [activeCampus,]);

  useEffect(() => {
    fetchStudents();
  }, [pagination.currentPage, pagination.perPage, searchName, searchDate, searchPhone, searchMatricula, typeFilter, periodFilter, grupoFilter]);

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

  const visibleColumnDefs = React.useMemo(
    () => columnDefinitions.filter(col => visibleColumns.includes(col.id)),
    [columnDefinitions, visibleColumns]
  );

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    if (students.length > 0 && selectedStudents.length === students.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedStudents, students]);

  useEffect(() => {
    if (periods && periods.length > 0) {
      setPeriodFilter(periods[periods.length - 1].id);
    }
  }, [periods]);

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

  const handleBulkDeleteForever = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`¿Está seguro de eliminar permanentemente ${selectedStudents.length} estudiante(s)? Esta acción no se puede deshacer.`)) return;

    try {
      setIsBulkActionLoading(true);
      await bulkDeleteStudents(selectedStudents, true);
      await fetchStudents();
      setSelectedStudents([]);
      toast({
        title: 'Acción completada',
        description: `${selectedStudents.length} estudiante(s) eliminados permanentemente`
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

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col flex-1 w-full overflow-hidden">
        <CardHeader className='sticky top-0 z-20 bg-card'>
          <div className="flex flex-col lg:flex-row justify-between mb-4 max-w-[80vw] overflow-x-auto">
            <h1 className="text-2xl font-bold mb-4 lg:mb-0">Estudiantes</h1>
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full lg:w-[200px]"
                />
                <Select
                  value={periodFilter}
                  onValueChange={(value) => setPeriodFilter(value)}
                >
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Filtrar por periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={grupoFilter}
                  onValueChange={(value) =>
                    setGrupoFilter(value)
                  }
                >
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Filtrar por grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>Todos</SelectItem>
                    {grupos.map((grupo, i) => {
                      return <SelectItem key={i} value={(grupo.id).toString()}>{grupo.name}</SelectItem>
                    })}
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
                    <DropdownMenuItem onClick={handleBulkDeleteForever}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar permanentemente
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
              <StudentsTable students={students} visibleColumnDefs={visibleColumnDefs} selectedStudents={selectedStudents} selectAll={selectAll} handleSelectAll={handleSelectAll} handleSelectStudent={handleSelectStudent} user={user} handleOpenEditModal={handleOpenEditModal} handleDeleteForever={handleDeleteForever} />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <PaginationComponent pagination={pagination} setPagination={setPagination} />
        </CardFooter>
      </Card>
      <StudentDialog isOpen={isModalOpen} setIsOpen={setIsModalOpen} selectedStudent={selectedStudent} onSubmit={handleSubmit} municipios={municipios} prepas={prepas} promos={promos} />
    </div>
  );
}