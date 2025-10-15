'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, RefreshCw, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getStudentGrades } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface StudentGradesProps {
  studentId: string;
}

interface Activity {
  id: number | null;
  name: string;
  type: string;
  module: string | null;
  grade: string;
  rawgrade: number | null;
  max_grade: number | null;
  min_grade: number | null;
  percentage: string | null;
  feedback: string | null;
  weight: string | null;
}

interface CourseDetails {
  max_grade: number | null;
  min_grade: number | null;
  percentage: string | null;
}

interface CourseGrades {
  course_id: number;
  course_name: string;
  course_type?: string;
  carrera_name?: string;
  course_shortname: string;
  grade?: string;
  rawgrade?: number;
  rank?: number;
  activities?: Activity[];
  activities_count?: number;
  course_details?: CourseDetails | null;
}

export default function StudentGrades({ studentId }: StudentGradesProps) {
  const { toast } = useToast();
  const [grades, setGrades] = useState<CourseGrades[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

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
          <div key={courseGrade.course_id} className="space-y-3 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">{courseGrade.course_name}</h3>
                  {courseGrade.course_type && (
                    <Badge variant="outline" className="text-xs">
                      {courseGrade.course_type}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">{courseGrade.course_shortname}</p>
                  {courseGrade.carrera_name && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">{courseGrade.carrera_name}</p>
                    </>
                  )}
                  {courseGrade.rank && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">Posición #{courseGrade.rank}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {courseGrade.grade && (
                  <Badge variant="default" className="text-lg px-4 py-2">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {courseGrade.grade}
                  </Badge>
                )}
                {courseGrade.activities_count && courseGrade.activities_count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCourse(courseGrade.course_id)}
                  >
                    {expandedCourses.has(courseGrade.course_id) ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Ver actividades ({courseGrade.activities_count})
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {courseGrade.course_details && courseGrade.rawgrade !== undefined && courseGrade.rawgrade !== null && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Calificación: {courseGrade.rawgrade.toFixed(2)} / {courseGrade.course_details.max_grade}
                </span>
                {courseGrade.course_details.percentage && (
                  <Badge variant="secondary">{courseGrade.course_details.percentage}</Badge>
                )}
              </div>
            )}

            {expandedCourses.has(courseGrade.course_id) && courseGrade.activities && (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Calificación</TableHead>
                      <TableHead className="text-right">Porcentaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseGrade.activities.map((activity, index) => (
                      <TableRow key={activity.id || index}>
                        <TableCell className="font-medium">
                          {activity.name}
                          {activity.feedback && (
                            <p className="text-xs text-muted-foreground mt-1">{activity.feedback}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {activity.module || activity.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {activity.rawgrade !== null && activity.max_grade !== null ? (
                            <span>
                              {activity.rawgrade.toFixed(2)} / {activity.max_grade}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{activity.grade}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {activity.percentage ? (
                            <Badge variant="secondary">{activity.percentage}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
