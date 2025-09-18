'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Promocion, Student } from '@/lib/types';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getPromos,
  getMunicipios,
  getPrepas,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePagination } from '@/hooks/usePagination';
import { useUIConfig } from '@/hooks/useUIConfig';

import { MultiSelect } from '@/components/multi-select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCwIcon } from 'lucide-react';
import SectionContainer from '@/components/SectionContainer';

import { getColumnDefinitions, getColumnOptions } from './columns';
import { StudentsTable } from './StudentsTable';
import { StudentDialog } from './StudentDialog';
import PaginationComponent from '@/components/ui/PaginationComponent';
import BulkActions from './BulkActions';
import Filters from './Filters';
import WhatsAppMessageModal from '@/components/students/WhatsAppMessageModal';

const INITIAL_VISIBLE_COLUMNS_KEY = 'studentTableColumns';

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [municipios, setMunicipios] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [prepas, setPrepas] = useState<Array<{ id: string; name: string }>>([]);
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // WhatsApp modal states
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppStudent, setWhatsAppStudent] = useState<Student | null>(null);

  // Filter states
  const [semanaIntensivaFilter, setSemanaIntensivaFilter] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [grupoFilter, setGrupoFilter] = useState<string | null>(null);
  const [assignedPeriodFilter, setAssignedPeriodFilter] = useState<string>('');
  const [assignedGrupoFilter, setAssignedGrupoFilter] = useState<string>('');
  const [carreraFilter, setCarreraFilter] = useState<string | null>(null);
  const [facultadFilter, setFacultadFilter] = useState<string | null>(null);
  const [moduloFilter, setModuloFilter] = useState<string | null>(null);
  const [bookDeliveryTypeFilter, setBookDeliveryTypeFilter] = useState<string | null>(null);
  const [bookDeliveredFilter, setBookDeliveredFilter] = useState<string | null>(null);
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  // Search states
  const [searchFirstname, setSearchFirstname] = useState('');
  const [searchLastname, setSearchLastname] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchMatricula, setSearchMatricula] = useState<number | null>(null);

  const { toast } = useToast();
  const { activeCampus } = useActiveCampusStore();
  const { user, periods, grupos } = useAuthStore();
  const { config: uiConfig, loading: configLoading } = useUIConfig();
  const { pagination, setPagination } = usePagination({ initialPerPage: 50 });
  const router = useRouter();

  const fetchStudents = useCallback(async () => {
    if (!activeCampus?.id) return;

    // Check if any search field is being used
    const isSearching =
      searchFirstname ||
      searchLastname ||
      searchEmail ||
      searchPhone ||
      searchMatricula;


    // All params send 
    const params = {
      campus_id: activeCampus.id,
      page: !isSearching ? pagination.currentPage : 1,
      perPage: pagination.perPage,
      searchFirstname: searchFirstname,
      searchLastname: searchLastname,
      searchEmail: searchEmail,
      searchDate: searchDate,
      searchPhone: searchPhone,
      searchMatricula: searchMatricula,
      grupo: (!isSearching && grupoFilter) || undefined,
      semanaIntensivaFilter: (!isSearching && semanaIntensivaFilter) || undefined,
      period: (!isSearching && periodFilter) || undefined,
      assignedPeriod: (!isSearching && assignedPeriodFilter) || undefined,
      assignedGrupo: (!isSearching && assignedGrupoFilter) || undefined,
      carrera: (!isSearching && carreraFilter) || undefined,
      facultad: (!isSearching && facultadFilter) || undefined,
      modulo: (!isSearching && moduloFilter) || undefined,
      book_delivery_type: ( bookDeliveryTypeFilter) || undefined,
      book_delivered: ( bookDeliveredFilter !== null ? bookDeliveredFilter : undefined),
    };

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
  }, [
    activeCampus?.id,
    pagination.currentPage,
    pagination.perPage,
    searchFirstname,
    searchLastname,
    searchEmail,
    searchDate,
    searchPhone,
    searchMatricula,
    grupoFilter,
    semanaIntensivaFilter,
    periodFilter,
    assignedPeriodFilter,
    assignedGrupoFilter,
    carreraFilter,
    facultadFilter,
    moduloFilter,
    toast,
    setPagination,
  ]);

  const handleOpenEditModal = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  }, []);

  const handleDeleteForever = useCallback(
    async (id: string) => {
      if (
        !confirm('¿Estás seguro de eliminar este estudiante permanentemente?')
      )
        return;

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
    },
    [fetchStudents, toast]
  );

  const handleOpenWhatsAppModal = useCallback((student: Student) => {
    setWhatsAppStudent(student);
    setIsWhatsAppModalOpen(true);
  }, []);

  const columnDefinitions = useMemo(
    () =>
      getColumnDefinitions(
        user,
        handleOpenEditModal,
        handleDeleteForever,
        handleOpenWhatsAppModal
      ),
    [user, handleOpenEditModal, handleDeleteForever, handleOpenWhatsAppModal]
  );

  const columnOptions = useMemo(
    () => getColumnOptions(columnDefinitions),
    [columnDefinitions]
  );

  const [visibleColumns, setVisibleColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedColumns = localStorage.getItem(INITIAL_VISIBLE_COLUMNS_KEY);
      if (savedColumns) {
        return JSON.parse(savedColumns);
      }
    }
    return columnDefinitions
      .filter((col) => col.defaultVisible)
      .map((col) => col.id);
  });

  const visibleColumnDefs = useMemo(
    () => columnDefinitions.filter((col) => visibleColumns.includes(col.id)),
    [columnDefinitions, visibleColumns]
  );

  // Initialize filters with default values
  useEffect(() => {
    if (uiConfig?.default_period_id && !filtersInitialized) {
      setAssignedPeriodFilter(uiConfig.default_period_id);
      setPeriodFilter('');
      setFiltersInitialized(true);
    }
  }, [uiConfig?.default_period_id, filtersInitialized]);

  const handlePeriodFilterChange = useCallback((value: string) => {
    setPeriodFilter(value);
  }, []);

  const handleColumnSelect = useCallback((selectedColumns: string[]) => {
    setVisibleColumns(selectedColumns);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        INITIAL_VISIBLE_COLUMNS_KEY,
        JSON.stringify(selectedColumns)
      );
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const [municipiosResponse, prepasResponse, promosResponse] =
        await Promise.all([getMunicipios(), getPrepas(), getPromos()]);

      setMunicipios(municipiosResponse);
      setPrepas(prepasResponse);
      setPromos(promosResponse.active);
    } catch (error: any) {
      toast({
        title: 'Error al cargar datos iniciales',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleSubmit = useCallback(
    async (formData: Student) => {
      try {
        if (selectedStudent) {
          await updateStudent({ ...formData });
          toast({ title: 'Estudiante actualizado correctamente' });
          await fetchStudents();
          setIsModalOpen(false);
        } else {
          const response = await createStudent({ ...formData });
          toast({ title: 'Estudiante creado correctamente' });
          setIsModalOpen(false);

          // Redirect to the new student's detail page
          if (response?.id) {
            router.push(`/planteles/estudiantes/${response.id}`);
          } else {
            await fetchStudents();
          }
        }
      } catch (error: any) {
        toast({
          title: 'Error al guardar estudiante',
          description: error.response?.data?.message || 'Intente nuevamente',
          variant: 'destructive',
        });
      }
    },
    [selectedStudent, fetchStudents, toast, router]
  );

  const handleSelectStudent = useCallback((studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((student) => student.id));
    }
    setSelectAll(!selectAll);
  }, [selectAll, students]);

  // Load initial data
  useEffect(() => {
    if (activeCampus && filtersInitialized) {
      fetchInitialData();
    }
  }, [activeCampus, filtersInitialized, fetchInitialData]);

  // Fetch students when filters change
  useEffect(() => {
    if (!filtersInitialized) return;

    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    } else {
      fetchStudents();
    }
  }, [
    bookDeliveryTypeFilter,
    bookDeliveredFilter,
    grupoFilter,
    assignedGrupoFilter,
    semanaIntensivaFilter,
    filtersInitialized,
    searchFirstname,
    searchLastname,
    searchEmail,
    searchDate,
    searchPhone,
    searchMatricula,
    periodFilter,
    grupoFilter,
    semanaIntensivaFilter,
    assignedPeriodFilter,
    carreraFilter,
    facultadFilter,
    moduloFilter,
    pagination.currentPage,
    setPagination,
    fetchStudents,
  ]);

  // Fetch students when pagination changes
  useEffect(() => {
    if (filtersInitialized) {
      fetchStudents();
    }
  }, [
    pagination.currentPage,
    pagination.perPage,
    filtersInitialized,
    fetchStudents,
  ]);

  // Update selectAll state based on selected students
  useEffect(() => {
    setSelectAll(
      students.length > 0 && selectedStudents.length === students.length
    );
  }, [selectedStudents, students]);

  if (!activeCampus) {
    return <div className="text-center py-4">Seleccione un campus</div>;
  }
  
  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col flex-1 w-full overflow-hidden">
        <CardHeader className="sticky top-0 z-20 bg-card">
          <SectionContainer>
            <div>
              <div className="flex items-center justify-between gap-2 mb-4 lg:mb-0">
                <h1 className="text-2xl font-bold">Estudiantes</h1>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    onClick={() => {
                      setSelectedStudent(null);
                      setIsModalOpen(true);
                    }}
                    title="Nuevo Estudiante"
                  >
                    <Plus />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={fetchStudents}
                    title="Refrescar Estudiantes"
                  >
                    <RefreshCwIcon />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Filters
                setPeriodFilter={handlePeriodFilterChange}
                periodFilter={periodFilter}
                setAssignedPeriodFilter={setAssignedPeriodFilter}
                assignedPeriodFilter={assignedPeriodFilter}
                setGrupoFilter={setGrupoFilter}
                setSemanaIntensivaFilter={setSemanaIntensivaFilter}
                setCarreraFilter={setCarreraFilter}
                carreraFilter={carreraFilter}
                setFacultadFilter={setFacultadFilter}
                facultadFilter={facultadFilter}
                setModuloFilter={setModuloFilter}
                moduloFilter={moduloFilter}
                setSearchFirstname={setSearchFirstname}
                setSearchLastname={setSearchLastname}
                setSearchEmail={setSearchEmail}
                setSearchDate={setSearchDate}
                setSearchPhone={setSearchPhone}
                setSearchMatricula={setSearchMatricula}
                setAssignedGrupoFilter={setAssignedGrupoFilter}
                assignedGrupoFilter={assignedGrupoFilter}
                setBookDeliveryTypeFilter={setBookDeliveryTypeFilter}
                bookDeliveryTypeFilter={bookDeliveryTypeFilter}
                setBookDeliveredFilter={setBookDeliveredFilter}
                bookDeliveredFilter={bookDeliveredFilter}
              >
                <MultiSelect
                  className="w-full"
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
              <div className="block">
                {selectedStudents.length > 0 && (
                  <BulkActions
                    selectedStudents={selectedStudents}
                    fetchStudents={fetchStudents}
                    setSelectedStudents={setSelectedStudents}
                    setIsBulkActionLoading={setIsBulkActionLoading}
                  />
                )}
              </div>
            </div>
          </SectionContainer>
        </CardHeader>
        <CardContent>
          <SectionContainer>
            {isLoading || isBulkActionLoading ? (
              <div className="text-center py-4">Cargando...</div>
            ) : (
              <StudentsTable
                students={students}
                visibleColumnDefs={visibleColumnDefs}
                selectedStudents={selectedStudents}
                selectAll={selectAll}
                handleSelectAll={handleSelectAll}
                handleSelectStudent={handleSelectStudent}
                user={user}
                handleOpenEditModal={handleOpenEditModal}
                handleDeleteForever={handleDeleteForever}
                handleOpenWhatsAppModal={handleOpenWhatsAppModal}
              />
            )}
          </SectionContainer>
        </CardContent>
        <CardFooter>
          <SectionContainer>
            <PaginationComponent
              pagination={pagination}
              setPagination={setPagination}
            />
          </SectionContainer>
        </CardFooter>
      </Card>
      <StudentDialog
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        onSubmit={handleSubmit}
        municipios={municipios}
        prepas={prepas}
        promos={promos}
      />
      <WhatsAppMessageModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        student={whatsAppStudent}
      />
    </div>
  );
}
