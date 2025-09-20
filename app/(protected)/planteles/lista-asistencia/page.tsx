'use client';

import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Edit, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';
import { useAuthStore } from '@/lib/store/auth-store';
import EditAttendanceModal from '@/components/EditAttendanceModal';

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

interface Grupo {
  id: string;
  name: string;
  students: Student[];
}

export default function AttendanceListPage() {
  const { grupos, periods } = useAuthStore();
  const [periodId, setPeriodId] = useState<string>('');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [attendanceTimes, setAttendanceTimes] = useState<Record<string, string>>({});
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>({});
  const [attendanceIds, setAttendanceIds] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceData | null>(null);

  const fetchAttendanceForDate = async (date: Date, grupoId: string) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(
        `/teacher/attendance/${grupoId}/${formattedDate}`
      );

      if (response.data.success && response.data.data && response.data.data.length > 0) {
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
        students.forEach((student) => {
          defaultAttendance[student.id] = false;
        });
        setAttendance(defaultAttendance);
        setAttendanceTimes({});
        setAttendanceNotes({});
        setAttendanceIds({});
      }
    } catch {
      const defaultAttendance: Record<string, boolean> = {};
      students.forEach((student) => {
        defaultAttendance[student.id] = false;
      });
      setAttendance(defaultAttendance);
      setAttendanceTimes({});
      setAttendanceNotes({});
      setAttendanceIds({});
    }
  };

  useEffect(() => {
    if (selectedGrupo && selectedDate) {
      fetchAttendanceForDate(selectedDate, selectedGrupo);
    }
  }, [selectedDate, selectedGrupo, students]);

  useEffect(() => {
    if (selectedGrupo && students.length > 0) {
      const defaultAttendance: Record<string, boolean> = {};
      students.forEach((student) => {
        defaultAttendance[student.id] = false;
      });
      setAttendance(defaultAttendance);
      setAttendanceTimes({});
      setAttendanceNotes({});
      setAttendanceIds({});

      if (selectedDate) {
        fetchAttendanceForDate(selectedDate, selectedGrupo);
      }
    }
  }, [selectedGrupo, students]);


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
      const formattedDate = selectedDate.toISOString().split('T')[0];
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

      console.log('Asistencia guardada', {
        grupo_id: selectedGrupo,
        fecha: formattedDate,
        total_estudiantes: Object.keys(attendance).length,
        presentes: Object.values(attendance).filter(p => p).length,
        ausentes: Object.values(attendance).filter(p => !p).length,
        timestamp: new Date().toISOString(),
        response: response.data
      });

      toast.success('¡Asistencia Guardada!', {
        description: `Se guardó correctamente la asistencia del grupo para el día ${formattedDate}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error al guardar la asistencia', error);
      toast.error('Error al Guardar', {
        description: 'No se pudo guardar la asistencia. Por favor, intente nuevamente.',
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
      date: selectedDate.toISOString().split('T')[0],
    };
    
    setSelectedAttendance(attendanceData);
    setIsModalOpen(true);
  };

  const handleSaveAttendanceEdit = (updatedAttendance: AttendanceData) => {
    // Actualizar los estados locales
    setAttendance(prev => ({
      ...prev,
      [updatedAttendance.student.id]: updatedAttendance.present
    }));

    if (updatedAttendance.attendance_time) {
      setAttendanceTimes(prev => ({
        ...prev,
        [updatedAttendance.student.id]: updatedAttendance.attendance_time!
      }));
    }

    if (updatedAttendance.notes) {
      setAttendanceNotes(prev => ({
        ...prev,
        [updatedAttendance.student.id]: updatedAttendance.notes!
      }));
    } else {
      setAttendanceNotes(prev => {
        const updated = { ...prev };
        delete updated[updatedAttendance.student.id];
        return updated;
      });
    }
  };

  async function fetchStudentsForGrupo(grupoId: string) {
    try {
      const response = await axiosInstance.get(`/grupos/${grupoId}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students for group:', error);
    }
  }

  useEffect(() => {
    if (selectedGrupo) {
      fetchStudentsForGrupo(selectedGrupo);
    }
  }, [selectedGrupo]);

  return (
    <div className="p-6 text-xs">
      <h1 className="text-4xl font-bold mb-6">Lista de asistencia</h1>

      <div className="flex flex-col gap-4 mb-6">
        <div className='flex flex-row gap-4'>
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
                  {grupos.filter(
                    (grupo) =>
                      !periodId || grupo.period_id.toString() === periodId.toString()
                  ).map((grupo) => (
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
                  if (date && selectedGrupo) {
                    const defaultAttendance: Record<string, boolean> = {};
                    students.forEach((student) => {
                      defaultAttendance[student.id] = false;
                    });
                    setAttendance(defaultAttendance);
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
                    <TableCell className="py-3 px-4">{student.id}</TableCell>
                    <TableCell className="py-3 px-4"><a className='hover:underline' href={`/planteles/estudiantes/${student.id}`} target='_blank'>{student.firstname + ' ' + student.lastname}</a></TableCell>
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
                        {attendance[student.id] && attendanceTimes[student.id] ? (
                          <>
                            <Clock className="h-3 w-3" />
                            {new Date(attendanceTimes[student.id]).toLocaleTimeString('es-ES')}
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
