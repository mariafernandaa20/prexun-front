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

interface Student {
  id: string;
  name: string;
}

interface Grupo {
  id: string;
  name: string;
  students: Student[];
}

export default function AsistenciaPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Obtener los grupos del maestro
  const fetchTeacherGroups = async () => {
    try {
      const response = await axiosInstance.get('/teacher/groups');
      setGrupos(response.data);
      setIsLoading(false);
    } catch (error) {
      toast('Error al cargar grupos', {
        description: 'No se pudieron cargar los grupos del maestro',
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherGroups();
  }, []);

  // Manejar cambio de asistencia
  const handleAttendanceChange = (studentId: string, checked: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: checked,
    }));
  };

  // Guardar asistencia
  const handleSaveAttendance = async () => {
    try {
      await axiosInstance.post('/teacher/attendance', {
        grupo_id: selectedGrupo,
        date: selectedDate,
        attendance: attendance,
      });

      toast('Asistencia guardada', {
        description: 'La asistencia se guardó correctamente',
      });
    } catch (error) {
      toast('Error al guardar', {
        description: 'No se pudo guardar la asistencia',
      });
    }
  };

  const selectedGroupStudents =
    grupos.find((g) => g.id === selectedGrupo)?.students || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lista de Asistencia</h1>

      <div className="flex gap-4 mb-6">
        <div className="w-1/3">
          <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un grupo" />
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

        <div className="w-1/3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </div>
      </div>

      {selectedGrupo && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Estudiante</TableHead>
                <TableHead>Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedGroupStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={attendance[student.id] || false}
                      onCheckedChange={(checked) =>
                        handleAttendanceChange(student.id, checked as boolean)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveAttendance}>Guardar Asistencia</Button>
          </div>
        </>
      )}
    </div>
  );
}
