"use client";

import { useEffect, useState } from 'react';
import { teacherService } from '@/app/services/teacher';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/lib/store/auth-store";

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

export default function TeachergruposPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const { grupos } = useAuthStore();

  const selectedGroupData = grupos.find(g => g.id === selectedGroup);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mis Grupos</h1>

      {grupos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tienes grupos asignados actualmente.</p>
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
                <CardTitle>{group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Tipo: {group.type}</p>
                <p className="text-sm text-gray-600">Horario: {group.start_time} - {group.end_time}</p>
                <p className="text-sm text-gray-600">Frecuencia: {Object.entries(JSON.parse(group.frequency as any))
                  .map(([day, value]) => value)
                  .join(', ')}</p>
                <p className="text-sm text-gray-600">Estudiantes: {group.students_count || 0} de {group.capacity}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* {selectedGroupData && selectedGroupData.students && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Lista de Alumnos - {selectedGroupData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGroupData.students.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No hay alumnos registrados en este grupo.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGroupData.students
                    .filter(student => student !== null)
                    .map((student, index) => (
                      <TableRow key={`${selectedGroupData.id}-${student.matricula || `index-${index}`}`}>
                        <TableCell>{student.id || 'No asignada'}</TableCell>
                        <TableCell>{student.firstname}</TableCell>
                        <TableCell>{student.lastname}</TableCell>
                        <TableCell>{student.email}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}
