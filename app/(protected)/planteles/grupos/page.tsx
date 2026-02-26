'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/lib/store/auth-store';
import axiosInstance from '@/lib/api/axiosConfig';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { useActiveCampusStore } from '@/lib/store/plantel-store';

interface Group {
  id: number;
  name: string;
  type: string;
  start_time: string;
  end_time: string;
  capacity: number;
  frequency: string;
  start_date: string;
  end_date: string;
  students?: Student[];
}

interface Student {
  id: number | string;
  firstname: string;
  lastname: string;
  email: string;
  matricula: string | null;
}

interface AsistenciaItem {
  student_id: number | string;
  status: string;
}

export default function TeachergruposPage() {
  const { activeCampus } = useActiveCampusStore();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const { periods, grupos, getFilteredGrupos } = useAuthStore();
  const [sortBy, setSortBy] = useState<
    'alfabetico' | 'cupo' | 'capacidad' | 'inscritos'
  >('alfabetico');

  const [alumnos, setAlumnos] = useState<Student[]>([]);
  const [asistencia, setAsistencia] = useState<AsistenciaItem[]>([]);
  const [mostrarTabla, setMostrarTabla] = useState(true);
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({});

  const getCurrentPeriodId = () => {
    if (!Array.isArray(periods) || periods.length === 0) return null;

    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const activePeriod = periods.find((period: any) => {
      const start = new Date(`${period.start_date}T00:00:00`);
      const end = new Date(`${period.end_date}T23:59:59`);
      return todayDate >= start && todayDate <= end;
    });

    if (activePeriod?.id) return String(activePeriod.id);

    const sortedByStartDate = [...periods].sort(
      (a: any, b: any) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    return sortedByStartDate[0]?.id ? String(sortedByStartDate[0].id) : null;
  };

  const currentPeriodId = getCurrentPeriodId();

  const filteredGrupos = useMemo(() => {
    const baseGroups = getFilteredGrupos(activeCampus?.id, currentPeriodId);

    return baseGroups.filter((group: any) => {
      const hasPlantelAssociation =
        !!group.plantel_id ||
        (Array.isArray(group.campuses) && group.campuses.length > 0);

      if (hasPlantelAssociation) return true;

      const groupType = String(group.type || '').toLowerCase();
      const isOnlineGroup =
        groupType.includes('linea') ||
        groupType.includes('línea') ||
        groupType.includes('online');

      return isOnlineGroup;
    });
  }, [getFilteredGrupos, activeCampus?.id, currentPeriodId, grupos]);

  useEffect(() => {
    if (filteredGrupos.length === 0) {
      setSelectedGroup(null);
      setAlumnos([]);
      setAsistencia([]);
      return;
    }

    const existsInFiltered = filteredGrupos.some((g) => g.id === selectedGroup);
    if (!existsInFiltered) {
      setSelectedGroup(filteredGrupos[0].id);
    }
  }, [filteredGrupos, selectedGroup]);

  useEffect(() => {
    if (!selectedGroup) return;

    const params: any = {};
    if (activeCampus?.id) {
      params.plantel_id = activeCampus.id;
    }

    axiosInstance
      .get(`/grupos/${selectedGroup}/students`, { params })
      .then((response) => {
        setAlumnos(response.data);
        const lista = response.data.map((alumno: Student) => ({
          student_id: alumno.id,
          status: 'presente',
        }));
        setAsistencia(lista);
        setMostrarTabla(true);
      })
      .catch((err) => {
        console.error(err);
        alert('Error al cargar los alumnos del grupo');
      });
  }, [selectedGroup, activeCampus?.id]);

  useEffect(() => {
    if (filteredGrupos.length === 0) {
      setStudentCounts({});
      return;
    }

    const params: any = {};
    if (activeCampus?.id) {
      params.plantel_id = activeCampus.id;
    }

    let cancelled = false;

    Promise.all(
      filteredGrupos.map(async (group) => {
        const response = await axiosInstance.get(`/grupos/${group.id}/students`, {
          params,
        });
        return { groupId: group.id, count: response.data.length as number };
      })
    )
      .then((results) => {
        if (cancelled) return;
        const counts = results.reduce(
          (acc, item) => {
            acc[item.groupId] = item.count;
            return acc;
          },
          {} as Record<number, number>
        );
        setStudentCounts(counts);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      cancelled = true;
    };
  }, [filteredGrupos, activeCampus?.id]);

  const selectedGroupData = filteredGrupos.find((g) => g.id === selectedGroup);

  const getGroupStudentsCount = (group: any) => {
    if (typeof studentCounts[group.id] === 'number') return studentCounts[group.id];
    if (Array.isArray(group.students)) return group.students.length;
    return group.students_count || 0;
  };

  const getAvailableSeats = (group: any) => {
    const inscritos = getGroupStudentsCount(group);
    return Math.max((group.capacity || 0) - inscritos, 0);
  };

  const sortedGroups = useMemo(() => {
    const groupsCopy = [...filteredGrupos];

    if (sortBy === 'alfabetico') {
      return groupsCopy.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }

    if (sortBy === 'cupo') {
      return groupsCopy.sort(
        (a, b) => getAvailableSeats(b) - getAvailableSeats(a)
      );
    }

    if (sortBy === 'capacidad') {
      return groupsCopy.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
    }

    return groupsCopy.sort(
      (a, b) => getGroupStudentsCount(b) - getGroupStudentsCount(a)
    );
  }, [filteredGrupos, sortBy, studentCounts]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mis Grupos</h1>

      {filteredGrupos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No hay grupos del periodo actual para este plantel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card className="lg:col-span-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Lista de grupos</CardTitle>
                <select
                  className="border rounded-md px-2 py-1 text-sm bg-background"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | 'alfabetico'
                        | 'cupo'
                        | 'capacidad'
                        | 'inscritos'
                    )
                  }
                >
                  <option value="alfabetico">Ordenar alfabéticamente</option>
                  <option value="cupo">Ordenar por cupo</option>
                  <option value="capacidad">Ordenar por capacidad</option>
                  <option value="inscritos">Ordenar por inscritos</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
              {sortedGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`w-full text-left border rounded-md px-2 py-2 transition-colors hover:border-primary ${selectedGroup === group.id ? 'border-primary bg-muted' : ''}`}
                >
                  <p className="font-medium text-sm leading-tight truncate">
                    {group.name}
                  </p>
                  <p className="text-xs text-gray-600 leading-tight">
                    {group.start_time} - {group.end_time}
                  </p>
                  <p className="text-xs text-gray-600 leading-tight">
                    Inscritos: {getGroupStudentsCount(group)} / {group.capacity}
                  </p>
                  <p className="text-xs text-gray-600 leading-tight">
                    Disponibles: {getAvailableSeats(group)}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-8">
            {!selectedGroupData ? (
              <CardContent className="py-10 text-center text-gray-500">
                Selecciona un grupo para ver su información.
              </CardContent>
            ) : (
              <>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span>{selectedGroupData.name}</span>
                    <Link href={`/planteles/grupos/${selectedGroupData.id}`}>
                      <Button variant="ghost" size="icon">
                        <GraduationCap className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Tipo: {selectedGroupData.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Horario: {selectedGroupData.start_time} -{' '}
                    {selectedGroupData.end_time}
                  </p>
                  <p className="text-sm text-gray-600">
                    Frecuencia:{' '}
                    {Object.entries(JSON.parse(selectedGroupData.frequency as any))
                      .map(([day, value]) => value)
                      .join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Estudiantes: {getGroupStudentsCount(selectedGroupData)} de{' '}
                    {selectedGroupData.capacity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Disponibles: {getAvailableSeats(selectedGroupData)}
                  </p>

                  {alumnos.length > 0 && mostrarTabla ? (
                    <div className="pt-3">
                      <div className="flex justify-end pb-2">
                        <button
                          onClick={() => setMostrarTabla(false)}
                          className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                        >
                          Ocultar tabla
                        </button>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {alumnos.map((alumno) => (
                            <TableRow key={alumno.id}>
                              <TableCell>
                                {alumno.firstname} {alumno.lastname}
                              </TableCell>
                              <TableCell>{alumno.email}</TableCell>
                              <TableCell>
                                <select
                                  className="border rounded px-2 py-1"
                                  value={
                                    asistencia.find(
                                      (a) => a.student_id === alumno.id
                                    )?.status || 'presente'
                                  }
                                  onChange={(e) => {
                                    const nuevaLista = asistencia.map((a) =>
                                      a.student_id === alumno.id
                                        ? { ...a, status: e.target.value }
                                        : a
                                    );
                                    setAsistencia(nuevaLista);
                                  }}
                                >
                                  <option value="presente">Presente</option>
                                  <option value="ausente">Ausente</option>
                                  <option value="justificado">Justificado</option>
                                </select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <button
                        className="mt-4 bg-primary text-white px-4 py-2 rounded"
                        onClick={async () => {
                          const fecha = new Date().toISOString().split('T')[0];
                          const payload = {
                            grupo_id: selectedGroup,
                            fecha,
                            asistencias: asistencia,
                          };

                          try {
                            await axiosInstance.post('/asistencias', payload);
                            alert('Asistencia guardada correctamente');
                          } catch (err: any) {
                            console.error(err);
                            const message =
                              err.response?.data?.message ||
                              'Error al guardar asistencia';
                            alert(message);
                          }
                        }}
                      >
                        Guardar asistencia
                      </button>
                    </div>
                  ) : alumnos.length > 0 ? (
                    <div className="pt-3">
                      <button
                        onClick={() => setMostrarTabla(true)}
                        className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                      >
                        Mostrar tabla
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 pt-2">
                      Este grupo no tiene alumnos registrados.
                    </p>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
