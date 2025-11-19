'use client';

import { useEffect, useState } from 'react';
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
  const user = useAuthStore((state) => state.user);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const { grupos } = useAuthStore();

  const [alumnos, setAlumnos] = useState<Student[]>([]);
  const [asistencia, setAsistencia] = useState<AsistenciaItem[]>([]);
  const [mostrarTabla, setMostrarTabla] = useState(true);

  useEffect(() => {
    if (!selectedGroup) return;

    axiosInstance
      .get(`/grupos/${selectedGroup}/students`)
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
  }, [selectedGroup]);

  const selectedGroupData = grupos.find((g) => g.id === selectedGroup);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mis Grupos</h1>

      {grupos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No tienes grupos asignados actualmente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((group) => (
            <Card
              key={group.id}
              className={`cursor-pointer hover:border-primary transition-colors ${selectedGroup === group.id ? 'border-primary' : ''}`}
              onClick={() => setSelectedGroup(group.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{group.name}</span>
                  <Link href={`/planteles/grupos/${group.id}`}>
                    <Button variant="ghost" size="icon">
                      <GraduationCap className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Tipo: {group.type}</p>
                <p className="text-sm text-gray-600">
                  Horario: {group.start_time} - {group.end_time}
                </p>
                <p className="text-sm text-gray-600">
                  Frecuencia:{' '}
                  {Object.entries(JSON.parse(group.frequency as any))
                    .map(([day, value]) => value)
                    .join(', ')}
                </p>
                <p className="text-sm text-gray-600">
                  Estudiantes: {group.students_count || 0} de {group.capacity}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGroup && alumnos.length > 0 && mostrarTabla && (
        <Card className="mt-6">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CardTitle>Tomar asistencia - {selectedGroupData?.name}</CardTitle>
            <button
              onClick={() => setMostrarTabla(false)}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              Ocultar tabla
            </button>
          </CardHeader>
          <CardContent>
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
                          asistencia.find((a) => a.student_id === alumno.id)
                            ?.status || 'presente'
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
