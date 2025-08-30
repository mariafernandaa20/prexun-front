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
  const [students, setStudents] = useState<Student[]>([]);
  const fetchAttendanceForDate = async (date: Date, grupoId: string) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(
        `/teacher/attendance/${grupoId}/${formattedDate}`
      );

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const attendanceMap: Record<string, boolean> = {};
        response.data.data.forEach((record: any) => {
          attendanceMap[record.student_id] = record.present;
        });
        setAttendance(attendanceMap);
      } else {
        // Limpiar asistencias - empezar con celdas vacías (false)
        const defaultAttendance: Record<string, boolean> = {};
        students.forEach((student) => {
          defaultAttendance[student.id] = false;
        });
        setAttendance(defaultAttendance);
      }
    } catch {
      // En caso de error, también empezar con celdas vacías
      const defaultAttendance: Record<string, boolean> = {};
      students.forEach((student) => {
        defaultAttendance[student.id] = false;
      });
      setAttendance(defaultAttendance);
    }
  };

  useEffect(() => {
    if (selectedGrupo && selectedDate) {
      fetchAttendanceForDate(selectedDate, selectedGrupo);
    }
  }, [selectedDate, selectedGrupo, students]);

  // Limpiar asistencias cuando cambie el grupo
  useEffect(() => {
    if (selectedGrupo && students.length > 0) {
      // Resetear asistencias para el nuevo grupo
      const defaultAttendance: Record<string, boolean> = {};
      students.forEach((student) => {
        defaultAttendance[student.id] = false;
      });
      setAttendance(defaultAttendance);

      // Luego cargar asistencias para la fecha actual
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
  };

  const handleSaveAttendance = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const payload = {
        grupo_id: selectedGrupo,
        date: formattedDate,
        attendance: attendance,
      };

      const response = await axiosInstance.post('/teacher/attendance', payload);

      const consoleMessage = {
        status: 'success',
        action: 'attendance_saved',
        data: {
          grupo_id: selectedGrupo,
          fecha: formattedDate,
          total_estudiantes: Object.keys(attendance).length,
          presentes: Object.values(attendance).filter(present => present).length,
          ausentes: Object.values(attendance).filter(present => !present).length,
          timestamp: new Date().toISOString(),
          response: response.data
        }
      };

      console.log('Asistencia guardada', consoleMessage);

      toast.success('¡Asistencia Guardada!', {
        description: `Se guardó correctamente la asistencia del grupo para el día ${formattedDate}`,
        duration: 5000,
      });
    } catch (error: any) {
      const errorMessage = {
        status: 'error',
        action: 'attendance_save_failed',
        data: {
          error: error.message,
          grupo_id: selectedGrupo,
          fecha: selectedDate.toISOString().split('T')[0],
          timestamp: new Date().toISOString(),
          errorDetails: error.response?.data
        }
      };

      console.error('Error al guardar la asistencia', errorMessage);

      toast.error('Error al Guardar', {
        description:
          'No se pudo guardar la asistencia. Por favor, intente nuevamente.',
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
  }, [selectedGrupo])
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
                      !periodId ||
                      grupo.period_id.toString() === periodId.toString()
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
                    // Limpiar asistencias inmediatamente al cambiar fecha
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="py-3 px-4">{student.id}</TableCell>
                    <TableCell className="py-3 px-4">
                      {student.firstname}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {student.lastname}
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
