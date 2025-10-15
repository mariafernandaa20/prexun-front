'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { getStudentGrades } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface StudentGradesProps {
  studentId: string;
}

interface GradeItem {
  id: number;
  itemname: string;
  itemtype: string;
  gradeformatted?: string;
  graderaw?: number;
  grademax?: number;
  grademin?: number;
  percentageformatted?: string;
  feedback?: string;
}

interface CourseGrades {
  course_id: number;
  course_name: string;
  course_shortname: string;
  grade?: string;
  rawgrade?: number;
}

export default function StudentGrades({ studentId }: StudentGradesProps) {
  const { toast } = useToast();
  const [grades, setGrades] = useState<CourseGrades[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  const fetchGrades = async () => {
    if (!studentId) return;

    try {
      setIsLoading(true);
      const data = await getStudentGrades(parseInt(studentId));
      setGrades(data.grades || []);
      setStudentInfo(data.student);
    } catch (error: any) {
      console.error('Error al cargar calificaciones:', error);
      toast({
        title: 'Error al cargar calificaciones',
        description: error.response?.data?.message || 'No se pudieron obtener las calificaciones de Moodle',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [studentId]);

  const getGradeBadgeVariant = (percentage: string | undefined) => {
    if (!percentage) return 'secondary';
    const value = parseFloat(percentage.replace('%', ''));
    if (value >= 90) return 'default';
    if (value >= 70) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Cargando calificaciones...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Calificaciones
              </CardTitle>
              <CardDescription className="mt-1.5">
                Calificaciones sincronizadas desde Moodle
              </CardDescription>
            </div>
            <Button onClick={fetchGrades} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Sin calificaciones</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No se encontraron calificaciones para este estudiante en Moodle.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Calificaciones
            </CardTitle>
            <CardDescription className="mt-1.5">
              {grades.length} {grades.length === 1 ? 'curso' : 'cursos'} con calificaciones
            </CardDescription>
          </div>
          <Button onClick={fetchGrades} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {grades.map((courseGrade) => (
          <div key={courseGrade.course_id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base">{courseGrade.course_name}</h3>
                <p className="text-sm text-muted-foreground">{courseGrade.course_shortname}</p>
              </div>
              {courseGrade.grade && (
                <Badge variant="default" className="text-lg px-4 py-2">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {courseGrade.grade}
                </Badge>
              )}
            </div>

            {courseGrade.rawgrade !== undefined && (
              <div className="text-sm text-muted-foreground">
                Calificación numérica: {courseGrade.rawgrade}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
