'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';
import { useAuthStore } from '@/lib/store/auth-store';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import EditAttendanceModal from '@/components/EditAttendanceModal';
import { useUIConfig } from '@/hooks/useUIConfig';
import { MultiSelect } from '@/components/multi-select';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  matricula: string;
}

interface StudentWithGroup extends Student {
  grupo_id: string;
  grupo_name: string;
  attendance_key: string;
}

interface AttendanceRecord {
  id?: string;
  student_id: string;
  present: boolean;
  attendance_time?: string;
  notes?: string;
}

interface AttendanceData {
  id?: string;
  student: Student;
  present: boolean;
  attendance_time: string | null;
  notes: string | null;
  date: string;
}

function AttendanceListContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { grupos, periods, getFilteredGrupos } = useAuthStore();
  const { activeCampus } = useActiveCampusStore();
  const { config } = useUIConfig();

  const [periodId, setPeriodId] = useState<string>('');
  const [selectedGrupos, setSelectedGrupos] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [attendanceTimes, setAttendanceTimes] = useState<Record<string, string>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});
  const [attendanceIds, setAttendanceIds] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<StudentWithGroup[]>([]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceData | null>(null);
  const [selectedAttendanceKey, setSelectedAttendanceKey] = useState<string | null>(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const hasHydratedFromQueryRef = useRef(false);

  const formatDateToLocalIso = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return formatter.format(date);
  };

  const parseDateFromIso = (isoDate: string) => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(isoDate)) {
      return null;
    }

    const parsedDate = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate;
  };

  const getCurrentPeriodId = () => {
    if (!Array.isArray(periods) || periods.length === 0) return null;

    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const activePeriod = periods.find((period: any) => {
      const start = new Date(`${period.start_date}T00:00:00`);
      const end = new Date(`${period.end_date}T23:59:59`);
      return todayDate >= start && todayDate <= end;
    });

    if (activePeriod?.id) return String(activePeriod.id);

    const sortedByStartDate = [...periods].sort(
      (a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    return sortedByStartDate[0]?.id ? String(sortedByStartDate[0].id) : null;
  };

  const currentPeriodId = getCurrentPeriodId();

  const campusGroups = useMemo(() => {
    const baseGroups = getFilteredGrupos(activeCampus?.id, undefined);

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
  }, [getFilteredGrupos, activeCampus?.id, grupos]);

  const filteredGroups = useMemo(() => {
    return campusGroups.filter(
      (grupo) => !periodId || String(grupo.period_id) === String(periodId)
    );
  }, [campusGroups, periodId]);

  const getGroupNameById = (id: string) => {
    const group = filteredGroups.find((item) => String(item.id) === String(id));
    return group?.name || `Grupo ${id}`;
  };

  const getPeriodNameById = (id: string | number) => {
    const period = periods.find((item: any) => String(item.id) === String(id));
    return period?.name || `Periodo ${id}`;
  };

  useEffect(() => {
    if (hasHydratedFromQueryRef.current) return;

    const periodFromQuery = searchParams.get('p');
    const groupsFromQuery = searchParams.get('g');
    const dateFromQuery = searchParams.get('d');

    if (periodFromQuery) {
      setPeriodId(periodFromQuery);
    }

    if (groupsFromQuery) {
      const queryGroupIds = Array.from(
        new Set(
          groupsFromQuery
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      if (queryGroupIds.length > 0) {
        setSelectedGrupos(queryGroupIds);
      }
    }

    if (dateFromQuery) {
      const parsedDate = parseDateFromIso(dateFromQuery);
      if (parsedDate) {
        setSelectedDate(parsedDate);
      }
    }

    hasHydratedFromQueryRef.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (periods.length === 0) return;

    const hasCurrentPeriod = periodId
      ? periods.some((period: any) => String(period.id) === String(periodId))
      : false;

    if (hasCurrentPeriod) return;

    const configuredPeriodId = config?.default_period_id
      ? String(config.default_period_id)
      : null;

    const hasConfiguredPeriod = configuredPeriodId
      ? periods.some((period: any) => String(period.id) === configuredPeriodId)
      : false;

    if (hasConfiguredPeriod && configuredPeriodId) {
      setPeriodId(configuredPeriodId);
      return;
    }

    if (currentPeriodId) {
      setPeriodId(currentPeriodId);
      return;
    }

    setPeriodId(String(periods[0].id));
  }, [periodId, periods, config?.default_period_id, currentPeriodId]);

  useEffect(() => {
    if (filteredGroups.length === 0) {
      setSelectedGrupos((prev) => (prev.length === 0 ? prev : []));
      setStudents((prev) => (prev.length === 0 ? prev : []));
      setAttendance((prev) =>
        Object.keys(prev).length === 0 ? prev : {}
      );
      setAttendanceTimes((prev) =>
        Object.keys(prev).length === 0 ? prev : {}
      );
      setAttendanceNotes((prev) =>
        Object.keys(prev).length === 0 ? prev : {}
      );
      setAttendanceIds((prev) =>
        Object.keys(prev).length === 0 ? prev : {}
      );
      setHasUnsavedChanges((prev) => (prev ? false : prev));
      return;
    }

    const validIds = new Set(filteredGroups.map((g) => String(g.id)));
    const nextSelected = selectedGrupos.filter((id) => validIds.has(String(id)));

    const changed =
      nextSelected.length !== selectedGrupos.length ||
      nextSelected.some((id, index) => id !== selectedGrupos[index]);

    if (changed) {
      setSelectedGrupos(nextSelected);
      return;
    }

    if (nextSelected.length === 0) {
      setSelectedGrupos([String(filteredGroups[0].id)]);
    }
  }, [filteredGroups, selectedGrupos]);

  useEffect(() => {
    if (!hasHydratedFromQueryRef.current) return;

    const nextParams = new URLSearchParams(searchParams.toString());

    if (periodId) {
      nextParams.set('p', periodId);
    } else {
      nextParams.delete('p');
    }

    const uniqueSortedGroups = Array.from(new Set(selectedGrupos)).sort();
    if (uniqueSortedGroups.length > 0) {
      nextParams.set('g', uniqueSortedGroups.join(','));
    } else {
      nextParams.delete('g');
    }

    nextParams.set('d', formatDateToLocalIso(selectedDate));

    const currentQuery = searchParams.toString();
    const nextQuery = nextParams.toString();

    if (currentQuery === nextQuery) return;

    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [periodId, selectedGrupos, selectedDate, pathname, router, searchParams]);

  async function fetchStudentsForGrupo(grupoId: string) {
    try {
      const params: any = {};
      if (activeCampus?.id) {
        params.plantel_id = activeCampus.id;
      }
      const response = await axiosInstance.get(`/grupos/${grupoId}/students`, { params });
      return response.data as Student[];
    } catch (error) {
      console.error('Error fetching students for group:', error);
      return [];
    }
  }

  const fetchAttendanceForDate = async (
    date: Date,
    grupoId: string,
    currentStudents: StudentWithGroup[]
  ) => {
    const formattedDate = formatDateToLocalIso(date);
    const params: any = {};
    if (activeCampus?.id) {
      params.plantel_id = activeCampus.id;
    }

    const defaultAttendanceMap: Record<string, boolean> = {};
    currentStudents.forEach((student) => {
      defaultAttendanceMap[student.attendance_key] = false;
    });

    try {
      const response = await axiosInstance.get(
        `/teacher/attendance/${grupoId}/${formattedDate}`,
        { params }
      );

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const attendanceMap = { ...defaultAttendanceMap };
        const timeMap: Record<string, string> = {};
        const notesMap: Record<string, string> = {};
        const idsMap: Record<string, string> = {};

        response.data.data.forEach((record: AttendanceRecord) => {
          const key = `${grupoId}-${record.student_id}`;
          attendanceMap[key] = record.present;
          idsMap[key] = record.id || '';

          if (record.attendance_time) {
            timeMap[key] = record.attendance_time;
          }

          if (record.notes) {
            notesMap[key] = record.notes;
          }
        });

        return {
          attendanceMap,
          timeMap,
          notesMap,
          idsMap,
        };
      }

      return {
        attendanceMap: defaultAttendanceMap,
        timeMap: {},
        notesMap: {},
        idsMap: {},
      };
    } catch {
      return {
        attendanceMap: defaultAttendanceMap,
        timeMap: {},
        notesMap: {},
        idsMap: {},
      };
    }
  };

  useEffect(() => {
    if (selectedGrupos.length === 0) return;

    let cancelled = false;

    const loadAttendancePageData = async () => {
      const groupResults = await Promise.all(
        selectedGrupos.map(async (grupoId) => {
          const fetchedStudents = await fetchStudentsForGrupo(grupoId);
          const sortedStudents = [...fetchedStudents].sort((a, b) => {
            const lastA = (a.lastname || '').toLowerCase();
            const lastB = (b.lastname || '').toLowerCase();
            if (lastA < lastB) return -1;
            if (lastA > lastB) return 1;
            const firstA = (a.firstname || '').toLowerCase();
            const firstB = (b.firstname || '').toLowerCase();
            return firstA.localeCompare(firstB);
          });

          const studentsWithGroup: StudentWithGroup[] = sortedStudents.map((student) => ({
            ...student,
            grupo_id: grupoId,
            grupo_name: getGroupNameById(grupoId),
            attendance_key: `${grupoId}-${student.id}`,
          }));

          const groupAttendance = await fetchAttendanceForDate(
            selectedDate,
            grupoId,
            studentsWithGroup
          );

          return {
            students: studentsWithGroup,
            ...groupAttendance,
          };
        })
      );

      if (cancelled) return;

      const mergedStudents = groupResults
        .flatMap((result) => result.students)
        .sort((a, b) => {
          const lastA = (a.lastname || '').toLowerCase();
          const lastB = (b.lastname || '').toLowerCase();
          if (lastA < lastB) return -1;
          if (lastA > lastB) return 1;
          const firstA = (a.firstname || '').toLowerCase();
          const firstB = (b.firstname || '').toLowerCase();
          return firstA.localeCompare(firstB);
        });
      const mergedAttendance = Object.assign(
        {},
        ...groupResults.map((result) => result.attendanceMap)
      );
      const mergedTimes = Object.assign({}, ...groupResults.map((result) => result.timeMap));
      const mergedNotes = Object.assign({}, ...groupResults.map((result) => result.notesMap));
      const mergedIds = Object.assign({}, ...groupResults.map((result) => result.idsMap));

      setStudents(mergedStudents);
      setAttendance(mergedAttendance);
      setAttendanceTimes(mergedTimes);
      setAttendanceNotes(mergedNotes);
      setAttendanceIds(mergedIds);
      setHasUnsavedChanges(false);
    };

    loadAttendancePageData();

    return () => {
      cancelled = true;
    };
  }, [selectedGrupos, selectedDate, activeCampus?.id]);

  const handleAttendanceChange = (attendanceKey: string, checked: boolean) => {
    setHasUnsavedChanges(true);
    setAttendance((prev) => ({
      ...prev,
      [attendanceKey]: checked,
    }));

    if (checked) {
      const now = new Date();
      const fullTimestamp = now.toISOString();
      setAttendanceTimes((prev) => ({
        ...prev,
        [attendanceKey]: fullTimestamp,
      }));
    } else {
      setAttendanceTimes((prev) => {
        const updated = { ...prev };
        delete updated[attendanceKey];
        return updated;
      });
    }
  };

  const saveAttendanceForGroups = async (
    grupoIdsToSave: string[],
    options?: { silent?: boolean }
  ) => {
    if (grupoIdsToSave.length === 0) return true;

    setIsSaving(true);

    try {
      const formattedDate = formatDateToLocalIso(selectedDate);

      const payloads = grupoIdsToSave.map((grupoId) => {
        const groupStudents = students.filter((student) => student.grupo_id === grupoId);

        return {
          grupo_id: grupoId,
          date: formattedDate,
          attendance: groupStudents.map((student) => ({
            student_id: student.id,
            present: attendance[student.attendance_key] || false,
            attendance_time: attendanceTimes[student.attendance_key] || null,
            notes: attendanceNotes[student.attendance_key] || null,
          })),
        };
      });

      await Promise.all(
        payloads.map((payload) => axiosInstance.post('/teacher/attendance', payload))
      );

      setHasUnsavedChanges(false);

      if (!options?.silent) {
        toast.success('¡Asistencia Guardada!', {
          description: `Se guardó correctamente la asistencia para ${grupoIdsToSave.length} grupo(s) el día ${formattedDate}`,
          duration: 5000,
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error al guardar la asistencia', error);
      toast.error(
        options?.silent
          ? 'No se pudo guardar automáticamente'
          : 'Error al Guardar',
        {
          description:
            'No se pudo guardar la asistencia. Por favor, intente nuevamente.',
          duration: 4000,
        }
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAttendance = async () => {
    await saveAttendanceForGroups(selectedGrupos);
  };

  const handleGrupoChange = async (newGrupoIds: string[]) => {
    const nextSelection = [...newGrupoIds].sort();
    const currentSelection = [...selectedGrupos].sort();

    const hasSameSelection =
      nextSelection.length === currentSelection.length &&
      nextSelection.every((id, index) => id === currentSelection[index]);

    if (hasSameSelection) return;

    if (hasUnsavedChanges && selectedGrupos.length > 0) {
      const saved = await saveAttendanceForGroups(selectedGrupos, {
        silent: true,
      });

      if (!saved) return;

      toast.success('Asistencia guardada automáticamente', {
        description: 'Se guardaron los cambios antes de cambiar grupos.',
        duration: 3000,
      });
    }

    setSelectedGrupos(newGrupoIds);
  };

  const handlePeriodChange = async (newPeriodId: string) => {
    if (newPeriodId === periodId) return;

    if (hasUnsavedChanges && selectedGrupos.length > 0) {
      const saved = await saveAttendanceForGroups(selectedGrupos, {
        silent: true,
      });

      if (!saved) return;

      toast.success('Asistencia guardada automáticamente', {
        description: 'Se guardaron los cambios antes de cambiar de periodo.',
        duration: 3000,
      });
    }

    setPeriodId(newPeriodId);
  };

  const handleDateChange = async (newDate: Date) => {
    const currentDate = formatDateToLocalIso(selectedDate);
    const nextDate = formatDateToLocalIso(newDate);

    if (currentDate === nextDate) return;

    if (hasUnsavedChanges && selectedGrupos.length > 0) {
      const saved = await saveAttendanceForGroups(selectedGrupos, {
        silent: true,
      });

      if (!saved) return;

      toast.success('Asistencia guardada automáticamente', {
        description: 'Se guardaron los cambios antes de cambiar de día.',
        duration: 3000,
      });
    }

    setSelectedDate(newDate);
  };

  const handleEditAttendance = (student: StudentWithGroup) => {
    const attendanceData: AttendanceData = {
      id: attendanceIds[student.attendance_key],
      student,
      present: attendance[student.attendance_key] || false,
      attendance_time: attendanceTimes[student.attendance_key] || null,
      notes: attendanceNotes[student.attendance_key] || null,
      date: formatDateToLocalIso(selectedDate),
    };

    setSelectedAttendanceKey(student.attendance_key);
    setSelectedAttendance(attendanceData);
    setIsModalOpen(true);
  };

  const handleSaveAttendanceEdit = (updatedAttendance: AttendanceData) => {
    if (!selectedAttendanceKey) return;

    setHasUnsavedChanges(true);
    setAttendance((prev) => ({
      ...prev,
      [selectedAttendanceKey]: updatedAttendance.present,
    }));

    if (updatedAttendance.attendance_time) {
      setAttendanceTimes((prev) => ({
        ...prev,
        [selectedAttendanceKey]: updatedAttendance.attendance_time!,
      }));
    }

    if (updatedAttendance.notes) {
      setAttendanceNotes((prev) => ({
        ...prev,
        [selectedAttendanceKey]: updatedAttendance.notes!,
      }));
    } else {
      setAttendanceNotes((prev) => {
        const updated = { ...prev };
        delete updated[selectedAttendanceKey];
        return updated;
      });
    }
  };

  return (
    <div className="p-6 text-xs">
      <h1 className="text-4xl font-bold mb-6">Lista de asistencia</h1>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-row gap-4">
          <div>
            <Select value={periodId} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un periodo" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={String(period.id)}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div>
              <MultiSelect
                title="Grupos"
                placeholder="Seleccionar grupos"
                searchPlaceholder="Buscar grupo..."
                emptyMessage="No se encontraron grupos"
                options={filteredGroups.map((grupo) => ({
                  value: String(grupo.id),
                  label: `${grupo.name} - ${getPeriodNameById(grupo.period_id)}`,
                }))}
                selectedValues={selectedGrupos}
                onSelectedChange={handleGrupoChange}
              />
            </div>

            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    handleDateChange(date);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {selectedGrupos.length > 0 && (
          <>
            <Table className="w-full text-xs border rounded-lg">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4">Grupo</TableHead>
                  <TableHead className="py-3 px-4">Matrícula</TableHead>
                  <TableHead className="py-3 px-4">Estudiante (Apellido Nombre)</TableHead>
                  <TableHead className="py-3 px-4">Asistencia</TableHead>
                  <TableHead className="py-3 px-4">Hora de Registro</TableHead>
                  <TableHead className="py-3 px-4">Notas</TableHead>
                  <TableHead className="py-3 px-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.attendance_key}>
                    <TableCell className="py-3 px-4">{student.grupo_name}</TableCell>
                    <TableCell className="py-3 px-4">
                      {student.matricula || student.id}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <a
                        className="hover:underline"
                        href={`/planteles/estudiantes/${student.id}`}
                        target="_blank"
                      >
                        {student.lastname} {student.firstname}
                      </a>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Checkbox
                        checked={attendance[student.attendance_key] || false}
                        onCheckedChange={(checked) =>
                          handleAttendanceChange(student.attendance_key, checked as boolean)
                        }
                        className="h-5 w-5"
                      />
                    </TableCell>
                    <TableCell className="py-3 px-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        {attendance[student.attendance_key] &&
                        attendanceTimes[student.attendance_key] ? (
                          <>
                            <Clock className="h-3 w-3" />
                            {new Date(
                              attendanceTimes[student.attendance_key]
                            ).toLocaleTimeString('es-ES')}
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 max-w-32">
                      {attendanceNotes[student.attendance_key] ? (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-blue-600" />
                          <span
                            className="text-xs text-gray-600 truncate"
                            title={attendanceNotes[student.attendance_key]}
                          >
                            {attendanceNotes[student.attendance_key]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAttendance(student)}
                        className="h-8 w-8 p-0"
                        title="Editar asistencia"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 flex justify-end">
              <Button className="text-xs" onClick={handleSaveAttendance} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </>
        )}
      </div>

      <EditAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attendanceData={selectedAttendance}
        onSave={handleSaveAttendanceEdit}
      />
    </div>
  );
}

export default function AttendanceListPage() {
  return (
    <Suspense fallback={null}>
      <AttendanceListContent />
    </Suspense>
  );
}
