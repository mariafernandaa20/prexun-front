'use client';

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
import { PlusCircle, Pencil, Trash2, Upload, Filter, Eye } from 'lucide-react';
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
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth-store';

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [municipios, setMunicipios] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [prepas, setPrepas] = useState<Array<{ id: string; name: string }>>([]);
  const [facultades, setFacultades] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [carreras, setCarreras] = useState<
    Array<{ id: string; name: string; facultad_id: string }>
  >([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'preparatoria' | 'facultad'
  >('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [showtAllFilters, setShowtAllFilters] = useState(false);
  const { activeCampus } = useActiveCampusStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const columnOptions = [
    { value: 'matricula', label: 'Matrícula', defaultVisible: false },
    {
      value: 'created_at',
      label: 'Fecha de Inscripción',
      defaultVisible: false,
    },
    { value: 'firstname', label: 'Nombre', defaultVisible: true },
    { value: 'lastname', label: 'Apellido', defaultVisible: true },
    { value: 'email', label: 'Email', defaultVisible: true },
    { value: 'phone', label: 'Teléfono', defaultVisible: true },
    { value: 'type', label: 'Curso', defaultVisible: false },
    { value: 'period', label: 'Periodo', defaultVisible: false },
    { value: 'carrera', label: 'Carrera', defaultVisible: false },
    { value: 'facultad', label: 'Facultad', defaultVisible: false },
    { value: 'prepa', label: 'Preparatoria', defaultVisible: false },
    { value: 'municipio', label: 'Municipio', defaultVisible: false },
    { value: 'tutor_name', label: 'Tutor', defaultVisible: false },
    {
      value: 'tutor_phone',
      label: 'Teléfono del Tutor',
      defaultVisible: false,
    },
    {
      value: 'tutor_relationship',
      label: 'Relación con el Tutor',
      defaultVisible: false,
    },
    { value: 'status', label: 'Estado', defaultVisible: false },
    {
      value: 'health_conditions',
      label: 'Condiciones de Salud',
      defaultVisible: false,
    },
    { value: 'how_found_out', label: 'Cómo se Enteró', defaultVisible: false },
    {
      value: 'preferred_communication',
      label: 'Medio de Comunicación',
      defaultVisible: false,
    },
    { value: 'actions', label: 'Acciones', defaultVisible: true },
  ];

  const [visibleColumns, setVisibleColumns] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedColumns = localStorage.getItem('studentTableColumns');
      if (savedColumns) {
        return JSON.parse(savedColumns);
      }
    }
    return columnOptions
      .filter((col) => col.defaultVisible)
      .map((col) => col.value);
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
    const responseCohorts = await getCohorts();
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

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  useEffect(() => {
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
    const matchesPeriod =
      periodFilter === 'all' || student.period.id === periodFilter;
    const matchesName =
      student.firstname.toLowerCase().includes(searchName.toLowerCase()) ||
      student.lastname.toLowerCase().includes(searchName.toLowerCase());
    const matchesDate =
      !searchDate ||
      new Date(student.created_at).toLocaleDateString().includes(searchDate);
    const matchesPhone = !searchPhone || student.phone.includes(searchPhone);

    return (
      matchesType && matchesPeriod && matchesName && matchesDate && matchesPhone
    );
  });

  return (
    <Card>
      <CardHeader className='sticky top-0 z-10 bg-card'>
        <div className="flex justify-between mb-6 max-w-[100vw-30rem] ">
          <h1 className="text-2xl font-bold">Estudiantes</h1>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Input
                placeholder="Buscar por nombre..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-[200px]"
              />

              <MultiSelect
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
                <SelectTrigger className="w-[180px]">
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
              <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Estudiante
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowtAllFilters(!showtAllFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            {showtAllFilters && (
              <div className="flex gap-4">
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-[200px]"
                />
                <Input
                  placeholder="Buscar por teléfono..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-[200px]"
                />
                <Select
                  value={typeFilter}
                  onValueChange={(value: 'all' | 'preparatoria' | 'facultad') =>
                    setTypeFilter(value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
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
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-w-[calc(100vw-20rem)]">
          {isLoading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes('matricula') && (
                    <TableHead>Matrícula</TableHead>
                  )}
                  {visibleColumns.includes('firstname') && (
                    <TableHead>Nombre</TableHead>
                  )}
                  {visibleColumns.includes('lastname') && (
                    <TableHead>Apellido</TableHead>
                  )}
                  {visibleColumns.includes('created_at') && (
                    <TableHead>Fecha de Inscripción</TableHead>
                  )}
                  {visibleColumns.includes('email') && (
                    <TableHead>Email</TableHead>
                  )}
                  {visibleColumns.includes('phone') && (
                    <TableHead>Teléfono</TableHead>
                  )}
                  {visibleColumns.includes('type') && (
                    <TableHead>Curso</TableHead>
                  )}
                  {visibleColumns.includes('period') && (
                    <TableHead>Periodo</TableHead>
                  )}

                  {visibleColumns.includes('carrera') && (
                    <TableHead>Carrera</TableHead>
                  )}
                  {visibleColumns.includes('facultad') && (
                    <TableHead>Facultad</TableHead>
                  )}
                  {visibleColumns.includes('prepa') && (
                    <TableHead>Preparatoria</TableHead>
                  )}
                  {visibleColumns.includes('municipio') && (
                    <TableHead>Municipio</TableHead>
                  )}
                  {visibleColumns.includes('tutor_name') && (
                    <TableHead>Tutor</TableHead>
                  )}
                  {visibleColumns.includes('tutor_phone') && (
                    <TableHead>Teléfono del Tutor</TableHead>
                  )}
                  {visibleColumns.includes('tutor_relationship') && (
                    <TableHead>Relación con el Tutor</TableHead>
                  )}
                  {visibleColumns.includes('preferred_communication') && (
                    <TableHead>Medio de Comunicación</TableHead>
                  )}
                  {visibleColumns.includes('status') && (
                    <TableHead>Estado</TableHead>
                  )}
                  {visibleColumns.includes('health_conditions') && (
                    <TableHead>Condiciones de Salud</TableHead>
                  )}
                  {visibleColumns.includes('how_found_out') && (
                    <TableHead>Cómo se Enteró</TableHead>
                  )}
                  {visibleColumns.includes('preferred_communication') && (
                    <TableHead>Medio de Comunicación</TableHead>
                  )}
                  {visibleColumns.includes('actions') && (
                    <TableHead>Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    {visibleColumns.includes('matricula') && (
                      <TableCell>{student.id}</TableCell>
                    )}
                    {visibleColumns.includes('firstname') && (
                      <TableCell>{student.firstname}</TableCell>
                    )}
                    {visibleColumns.includes('lastname') && (
                      <TableCell>{student.lastname}</TableCell>
                    )}
                    {visibleColumns.includes('created_at') && (
                      <TableCell>
                        {new Date(student.created_at).toLocaleDateString()}
                      </TableCell>
                    )}
                    {visibleColumns.includes('email') && (
                      <TableCell>{student.email}</TableCell>
                    )}
                    {visibleColumns.includes('phone') && (
                      <TableCell>{student.phone}</TableCell>
                    )}
                    {visibleColumns.includes('type') && (
                      <TableCell>{student.type}</TableCell>
                    )}
                    {visibleColumns.includes('period') && (
                      <TableCell>{student.period.name}</TableCell>
                    )}
                    {visibleColumns.includes('carrera') && (
                      <TableCell>{student?.carrera?.name}</TableCell>
                    )}
                    {visibleColumns.includes('facultad') && (
                      <TableCell>{student?.facultad?.name}</TableCell>
                    )}
                    {visibleColumns.includes('prepa') && (
                      <TableCell>{student?.prepa?.name}</TableCell>
                    )}
                    {visibleColumns.includes('municipio') && (
                      <TableCell>{student?.municipio?.name}</TableCell>
                    )}
                    {visibleColumns.includes('tutor_name') && (
                      <TableCell>{student.tutor_name}</TableCell>
                    )}
                    {visibleColumns.includes('tutor_phone') && (
                      <TableCell>{student.tutor_phone}</TableCell>
                    )}
                    {visibleColumns.includes('tutor_relationship') && (
                      <TableCell>{student.tutor_relationship}</TableCell>
                    )}
                    {visibleColumns.includes('preferred_communication') && (
                      <TableCell>{student.preferred_communication}</TableCell>
                    )}
                    {visibleColumns.includes('status') && (
                      <TableCell>{student.status}</TableCell>
                    )}
                    {visibleColumns.includes('health_conditions') && (
                      <TableCell>{student.health_conditions}</TableCell>
                    )}
                    {visibleColumns.includes('how_found_out') && (
                      <TableCell>{student.how_found_out}</TableCell>
                    )}
                    {visibleColumns.includes('preferred_communication') && (
                      <TableCell>{student.preferred_communication}</TableCell>
                    )}
                    {visibleColumns.includes('actions') && (
                      <TableCell className="p-4">
                        <div className="flex gap-2">
                          {/* <ChargesForm
                          campusId={Number(activeCampus?.id)}
                          fetchStudents={fetchStudents}
                          student={student}
                        /> */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Link className={buttonVariants({ variant: 'ghost' })} href={`/planteles/estudiantes/${student.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(student.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button> */}
                          {user?.role === 'super_admin' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className='text-red-500 hover:text-red-700'
                              onClick={() => handleDeleteForever(student.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="min-w-[60rem]">
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
    </Card>
  );
}
