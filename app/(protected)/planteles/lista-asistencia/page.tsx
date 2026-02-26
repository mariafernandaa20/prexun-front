'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  matricula: string;
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

export default function AttendanceListPage() {
  const { grupos, periods, getFilteredGrupos } = useAuthStore();
  const { activeCampus } = useActiveCampusStore();
  const { config } = useUIConfig();
  const [periodId, setPeriodId] = useState<string>('');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [attendanceTimes, setAttendanceTimes] = useState<
    Record<string, string>
  >({});
  const [attendanceNotes, setAttendanceNotes] = useState<
    Record<string, string>
  >({});
  const [attendanceIds, setAttendanceIds] = useState<Record<string, string>>(
    {}
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceData | null>(null);

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
      (grupo) => !periodId || grupo.period_id.toString() === periodId.toString()
    );
  }, [campusGroups, periodId]);

  const formatDateToLocalIso = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (periodId || periods.length === 0) return;

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
      setSelectedGrupo('');
      setStudents([]);
      setAttendance({});
      setAttendanceTimes({});
      setAttendanceNotes({});
      setAttendanceIds({});
      return;
    }

    const groupExists = filteredGroups.some(
      (group) => group.id.toString() === selectedGrupo
    );

    if (!groupExists) {
      setSelectedGrupo(filteredGroups[0].id.toString());
    }
  }, [filteredGroups, selectedGrupo]);

  const fetchAttendanceForDate = async (
    date: Date,
    grupoId: string,
    currentStudents: Student[]
  ) => {
    try {
      const formattedDate = formatDateToLocalIso(date);
      const params: any = {};
      if (activeCampus?.id) {
        params.plantel_id = activeCampus.id;
      }

      const response = await axiosInstance.get(
        `/teacher/attendance/${grupoId}/${formattedDate}`,
        { params }
      );

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const attendanceMap: Record<string, boolean> = {};
        const timeMap: Record<string, string> = {};
        const notesMap: Record<string, string> = {};
        const idsMap: Record<string, string> = {};

        response.data.data.forEach((record: AttendanceRecord) => {
          attendanceMap[record.student_id] = record.present;
          idsMap[record.student_id] = record.id || '';

          if (record.attendance_time) {
            timeMap[record.student_id] = record.attendance_time;
          }

          if (record.notes) {
            notesMap[record.student_id] = record.notes;
          }
        });

        setAttendance(attendanceMap);
        setAttendanceTimes(timeMap);
        setAttendanceNotes(notesMap);
        setAttendanceIds(idsMap);
      } else {
        const defaultAttendance: Record<string, boolean> = {};
        currentStudents.forEach((student) => {
          defaultAttendance[student.id] = false;
        });
        setAttendance(defaultAttendance);
        setAttendanceTimes({});
        setAttendanceNotes({});
        setAttendanceIds({});
      }
    } catch {
      const defaultAttendance: Record<string, boolean> = {};
      currentStudents.forEach((student) => {
        defaultAttendance[student.id] = false;
      });
      setAttendance(defaultAttendance);
      setAttendanceTimes({});
      setAttendanceNotes({});
      setAttendanceIds({});
    }
  };

  const handleAttendanceChange = (studentId: string, checked: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: checked,
    }));

    if (checked) {
      const now = new Date();
      const fullTimestamp = now.toISOString();
      setAttendanceTimes((prev) => ({
        ...prev,
        [studentId]: fullTimestamp,
      }));
    } else {
      setAttendanceTimes((prev) => {
        const updated = { ...prev };
        delete updated[studentId];
        return updated;
      });
    }
  };

  const handleSaveAttendance = async () => {
    try {
      const formattedDate = formatDateToLocalIso(selectedDate);
      const payload = {
        grupo_id: selectedGrupo,
        date: formattedDate,
        attendance: Object.keys(attendance).map((studentId) => ({
          student_id: studentId,
          present: attendance[studentId],
          attendance_time: attendanceTimes[studentId] || null,
          notes: attendanceNotes[studentId] || null,
        })),
      };

      const response = await axiosInstance.post('/teacher/attendance', payload);

      toast.success('¡Asistencia Guardada!', {
        description: `Se guardó correctamente la asistencia del grupo para el día ${formattedDate}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error al guardar la asistencia', error);
      toast.error('Error al Guardar', {
        description:
          'No se pudo guardar la asistencia. Por favor, intente nuevamente.',
        duration: 4000,
      });
    }
  };

  const handleEditAttendance = (student: Student) => {
    const attendanceData: AttendanceData = {
      id: attendanceIds[student.id],
      student: student,
      present: attendance[student.id] || false,
      attendance_time: attendanceTimes[student.id] || null,
      notes: attendanceNotes[student.id] || null,
      date: formatDateToLocalIso(selectedDate),
    };

    setSelectedAttendance(attendanceData);
    setIsModalOpen(true);
  };

  const handleSaveAttendanceEdit = (updatedAttendance: AttendanceData) => {
    // Actualizar los estados locales
    setAttendance((prev) => ({
      ...prev,
      [updatedAttendance.student.id]: updatedAttendance.present,
    }));

    if (updatedAttendance.attendance_time) {
      setAttendanceTimes((prev) => ({
        ...prev,
        [updatedAttendance.student.id]: updatedAttendance.attendance_time!,
      }));
    }

    if (updatedAttendance.notes) {
      setAttendanceNotes((prev) => ({
        ...prev,
        [updatedAttendance.student.id]: updatedAttendance.notes!,
      }));
    } else {
      setAttendanceNotes((prev) => {
        const updated = { ...prev };
        delete updated[updatedAttendance.student.id];
        return updated;
      });
    }
  };

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

  useEffect(() => {
    if (!selectedGrupo) return;

    let cancelled = false;

    const loadAttendancePageData = async () => {
      const fetchedStudents = await fetchStudentsForGrupo(selectedGrupo);
      if (cancelled) return;
      setStudents(fetchedStudents);
      await fetchAttendanceForDate(selectedDate, selectedGrupo, fetchedStudents);
    };

    loadAttendancePageData();

    return () => {
      cancelled = true;
    };
  }, [selectedGrupo, selectedDate, activeCampus?.id]);

  return (
    <div className="p-6 text-xs">
      <h1 className="text-4xl font-bold mb-6">Lista de asistencia</h1>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-row gap-4">
          <div>
            <Select value={periodId} onValueChange={setPeriodId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un periodo" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div>
              <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {filteredGroups.map((grupo) => (
                    <SelectItem key={grupo.id} value={grupo.id.toString()}>
                      {grupo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
              />
            </div>
          </div>
        </div>
        {selectedGrupo && (
          <>
            <Table className="w-full text-xs border rounded-lg">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 px-4">Matrícula</TableHead>
                  <TableHead className="py-3 px-4">Nombre</TableHead>
                  <TableHead className="py-3 px-4">Asistencia</TableHead>
                  <TableHead className="py-3 px-4">Hora de Registro</TableHead>
                  <TableHead className="py-3 px-4">Notas</TableHead>
                  <TableHead className="py-3 px-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="py-3 px-4">
                      {student.matricula || student.id}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <a
                        className="hover:underline"
                        href={`/planteles/estudiantes/${student.id}`}
                        target="_blank"
                      >
                        {student.firstname + ' ' + student.lastname}
                      </a>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Checkbox
                        checked={attendance[student.id] || false}
                        onCheckedChange={(checked) =>
                          handleAttendanceChange(student.id, checked as boolean)
                        }
                        className="h-5 w-5"
                      />
                    </TableCell>
                    <TableCell className="py-3 px-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        {attendance[student.id] &&
                          attendanceTimes[student.id] ? (
                          <>
                            <Clock className="h-3 w-3" />
                            {new Date(
                              attendanceTimes[student.id]
                            ).toLocaleTimeString('es-ES')}
                          </>
                        ) : (
                          '-'
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 max-w-32">
                      {attendanceNotes[student.id] ? (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-blue-600" />
                          <span
                            className="text-xs text-gray-600 truncate"
                            title={attendanceNotes[student.id]}
                          >
                            {attendanceNotes[student.id]}
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
              <Button className="text-xs" onClick={handleSaveAttendance}>
                Guardar
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Modal de edición */}
      <EditAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attendanceData={selectedAttendance}
        onSave={handleSaveAttendanceEdit}
      />
    </div>
  );
}
