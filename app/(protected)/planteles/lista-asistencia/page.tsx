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
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';
import { useAuthStore } from '@/lib/store/auth-store';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  matricula: string;
}

interface AttendanceRecord {
  student_id: string;
  present: boolean;
  attendance_time?: string;
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
  const [students, setStudents] = useState<Student[]>([]);

  const fetchAttendanceForDate = async (date: Date, grupoId: string) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(
        `/teacher/attendance/${grupoId}/${formattedDate}`
      );

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const attendanceMap: Record<string, boolean> = {};
        const timeMap: Record<string, string> = {};

        response.data.data.forEach((record: AttendanceRecord) => {
          attendanceMap[record.student_id] = record.present;
          if (record.attendance_time) {
            timeMap[record.student_id] = record.attendance_time;
          }
        });

        setAttendance(attendanceMap);
        setAttendanceTimes(timeMap);
      } else {
        const defaultAttendance: Record<string, boolean> = {};
        students.forEach((student) => {
          defaultAttendance[student.id] = false;
        });
        setAttendance(defaultAttendance);
        setAttendanceTimes({});
      }
    } catch {
      const defaultAttendance: Record<string, boolean> = {};
      students.forEach((student) => {
        defaultAttendance[student.id] = false;
      });
      setAttendance(defaultAttendance);
      setAttendanceTimes({});
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
                  <TableHead className="py-3 px-4">Apellido</TableHead>
                  <TableHead className="py-3 px-4">Asistencia</TableHead>
                  <TableHead className="py-3 px-4">Hora de Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="py-3 px-4">{student.id}</TableCell>
                    <TableCell className="py-3 px-4">{student.firstname}</TableCell>
                    <TableCell className="py-3 px-4">{student.lastname}</TableCell>
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
                      {attendance[student.id] && attendanceTimes[student.id] 
                        ? new Date(attendanceTimes[student.id]).toLocaleTimeString('es-ES') 
                        : '-'}
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
    </div>
  );
}
