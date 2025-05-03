'use client';
import React, { useEffect, useState } from 'react';
import { Promocion, Student } from '@/lib/types';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getPromos,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useActiveCampusStore } from '@/lib/store/plantel-store';

import {
  getMunicipios,
  getPrepas,
} from '@/lib/api';
import { MultiSelect } from '@/components/multi-select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth-store';
import { getColumnDefinitions, getColumnOptions } from './columns';
import { StudentsTable } from "./StudentsTable";
import { StudentDialog } from "./StudentDialog";
import PaginationComponent from "@/components/ui/PaginationComponent";
import BulkActions from './BulkActions';
import Filters from './Filters';
import { usePagination } from '@/hooks/usePagination';

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [municipios, setMunicipios] = useState<Array<{ id: string; name: string }>>([]);
  const [prepas, setPrepas] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [grupoFilter, setGrupoFilter] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<string>();
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchMatricula, setSearchMatricula] = useState<number | null>(null);
  const [promos, setPromos] = useState<Promocion[]>([]);
  const { activeCampus } = useActiveCampusStore();
  const { user, periods, grupos } = useAuthStore();
  const { pagination, setPagination } = usePagination();

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
  }, [pagination.currentPage, pagination.perPage, searchName, searchDate, searchPhone, searchMatricula, periodFilter, grupoFilter]);

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

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col flex-1 w-full overflow-hidden">
        <CardHeader className='sticky top-0 z-20 bg-card'>
          <div className="flex flex-col lg:flex-row justify-between mb-4 max-w-[80vw] overflow-x-auto">
            <h1 className="text-2xl font-bold mb-4 lg:mb-0">Estudiantes</h1>
            <div className="flex flex-col lg:flex-row gap-2">
              <Filters
                periods={periods}
                grupos={grupos}
                setPeriodFilter={setPeriodFilter}
                setGrupoFilter={setGrupoFilter}
                setSearchName={setSearchName}
                setSearchDate={setSearchDate}
                setSearchPhone={setSearchPhone}
                setSearchMatricula={setSearchMatricula}
              >
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
              </Filters>
            </div>
          </div>

          {/* Menú de acciones en masa */}
          {selectedStudents.length > 0 && (
            <BulkActions
              selectedStudents={selectedStudents}
              fetchStudents={fetchStudents}
              setSelectedStudents={setSelectedStudents}
              setIsBulkActionLoading={setIsBulkActionLoading}
            />
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