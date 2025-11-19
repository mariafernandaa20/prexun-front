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
import axiosInstance from '@/lib/api/axiosConfig';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Student {
  id: number | string;
  firstname: string;
  lastname: string;
  email: string;
  matricula: string | null;
}

interface Grade {
  student_id: number | string;
  course_name: string;
  grade: number;
  final_grade?: number;
}

interface Group {
  id: number;
  name: string;
  type: string;
  start_time: string;
  end_time: string;
  frequency: string;
}

export default function GroupGradesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string | number, Grade[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, studentsRes] = await Promise.all([
          axiosInstance.get(`/grupos/${params.id}`),
          axiosInstance.get(`/grupos/${params.id}/students`),
        ]);

        setGroup(groupRes.data);
        setStudents(studentsRes.data);

        const gradesData: Record<string | number, Grade[]> = {};
        await Promise.all(
          studentsRes.data.map(async (student: Student) => {
            try {
              const gradesRes = await axiosInstance.get(
                `/students/${student.id}/grades`
              );
              gradesData[student.id] = gradesRes.data;
            } catch (err) {
              gradesData[student.id] = [];
            }
          })
        );

        setGrades(gradesData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!group) {
    return <div className="p-6">Grupo no encontrado</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Calificaciones - {group.name}</h1>
          <p className="text-sm text-muted-foreground">
            Horario: {group.start_time} - {group.end_time}
          </p>
        </div>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay estudiantes asignados a este grupo
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes y Calificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cursos</TableHead>
                  <TableHead>Promedio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const studentGrades = grades[student.id] || [];
                  const average =
                    studentGrades.length > 0
                      ? (
                          studentGrades.reduce(
                            (sum, g) => sum + (g.final_grade || g.grade || 0),
                            0
                          ) / studentGrades.length
                        ).toFixed(2)
                      : 'N/A';

                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.matricula || student.id}</TableCell>
                      <TableCell>
                        {student.firstname} {student.lastname}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {studentGrades.length > 0 ? (
                          <div className="space-y-1">
                            {studentGrades.map((grade, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">
                                  {grade.course_name}:
                                </span>{' '}
                                {grade.final_grade || grade.grade || 'N/A'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Sin calificaciones
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">{average}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
