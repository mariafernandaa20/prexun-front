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
  const user = useAuthStore((state) => state.user);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar las asistencias de una fecha específica
  const fetchAttendanceForDate = async (date: Date, grupoId: string) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(`/teacher/attendance/${grupoId}/${formattedDate}`);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Convertir los datos de asistencia al formato que espera el estado
        const attendanceMap: Record<string, boolean> = {};
        response.data.data.forEach((record: any) => {
          attendanceMap[record.student_id] = record.present;
        });
        setAttendance(attendanceMap);
      } else {
        // Si no hay asistencias para esa fecha, marcar todas como presentes por defecto
        const defaultAttendance: Record<string, boolean> = {};
        selectedGroupStudents.forEach((student) => {
          defaultAttendance[student.id] = true;
        });
        setAttendance(defaultAttendance);
      }
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      // Si hay un error, marcar todas las asistencias como presentes por defecto
      const defaultAttendance: Record<string, boolean> = {};
      selectedGroupStudents.forEach((student) => {
        defaultAttendance[student.id] = true;
      });
      setAttendance(defaultAttendance);
    }
  };

  // Efecto para cargar asistencias cuando cambie la fecha o el grupo
  useEffect(() => {
    if (selectedGrupo && selectedDate) {
      fetchAttendanceForDate(selectedDate, selectedGrupo);
    }
  }, [selectedDate, selectedGrupo]);

  const fetchTeacherGroups = async () => {
    try {
      if (!user?.id) return;
      const response = await axiosInstance.get(`/teacher/groups/${user.id}`);
      setGrupos(response.data);
      setIsLoading(false);
    } catch (error) {
      toast('Error loading groups', {
        description: 'Could not load teacher groups',
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTeacherGroups();
    }
  }, [user]);

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

      toast.success('¡Asistencia Guardada!', {
        description: `Se guardó correctamente la asistencia del grupo para el día ${formattedDate}`,
        duration: 5000,
        style: {
          background: '#ecfdf5',
          border: '1px solid #059669',
          color: '#065f46',
        },
      });
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Detalles del error:', error.response?.data);
      toast.error('Error al Guardar', {
        description: 'No se pudo guardar la asistencia. Por favor, intente nuevamente.',
        duration: 4000,
        style: {
          background: '#fef2f2',
          border: '1px solid #dc2626',
          color: '#991b1b',
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xs">Loading groups...</div>
      </div>
    );
  }

  const selectedGroupStudents = grupos.find((g) => g.id === selectedGrupo)?.students || [];

  return (
    <div className="p-6 text-xs">
      <h1 className="text-lg font-bold mb-6">Attendance List</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
            <SelectTrigger>
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {grupos.map((grupo) => (
                <SelectItem key={grupo.id} value={grupo.id}>
                  {grupo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date && selectedGrupo) {
                setSelectedDate(date);
                // Las asistencias se cargarán automáticamente por el useEffect
              }
            }}
          />
        </div>
      </div>

      {selectedGrupo && (
        <>
          <div className="overflow-x-auto">
            <div className="w-full min-w-[1000px] lg:min-w-[1200px]">
              <Table className="w-full text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3 px-4">Matrícula</TableHead>
                    <TableHead className="py-3 px-4">Nombre</TableHead>
                    <TableHead className="py-3 px-4">Apellido</TableHead>
                    <TableHead className="py-3 px-4">Asistencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGroupStudents.map((student) => (
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button className="text-xs" onClick={handleSaveAttendance}>Guardar</Button>
          </div>
        </>
      )}
    </div>
  );
}
