'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, MessageCircle } from 'lucide-react';
import axiosInstance from '@/lib/api/axiosConfig';
import { getGrupos, getCampuses, getPeriods } from '@/lib/api';
import { Grupo, Campus, Period } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { useUIConfig } from '@/hooks/useUIConfig';

interface Student {
  id: number | string;
  firstname: string;
  lastname: string;
  email: string;
  matricula: string | null;
  phone?: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

const whatsappTemplates: MessageTemplate[] = [
  {
    id: 'resumen',
    name: 'Resumen general',
    content:
      'Hola {{nombre}}, te compartimos tu avance:\n\n{{calificaciones}}\n\n¡Sigue esforzándote!',
  },
  {
    id: 'seguimiento',
    name: 'Seguimiento académico',
    content:
      'Hola {{nombre}}, este es el seguimiento de tus calificaciones:\n\n{{calificaciones}}\n\nPor favor contáctanos si tienes alguna duda.',
  },
  {
    id: 'felicitacion',
    name: 'Felicitación',
    content:
      'Hola {{nombre}}, ¡excelente trabajo en este periodo!\n\n{{calificaciones}}\n\nEstamos muy orgullosos de tu progreso.',
  },
];

interface Grade {
  student_id: number | string;
  course_name: string;
  grade: number | string;
  final_grade?: number;
  rawgrade?: number;
  course_fullname?: string;
  name?: string;
}

export default function CalificacionesPage() {
  const [isMounted, setIsMounted] = useState(false);

  const [planteles, setPlanteles] = useState<Campus[]>([]);
  const [selectedPlantelId, setSelectedPlantelId] = useState<string>('');
  const [periodos, setPeriodos] = useState<Period[]>([]);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<string>('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string | number, Grade[]>>({});
  const [loadingPlanteles, setLoadingPlanteles] = useState(true);
  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>('resumen');

  const { user } = useAuthStore();
  const { activeCampus } = useActiveCampusStore();
  const { config: uiConfig } = useUIConfig();
  const { toast } = useToast();
  const [isInitializedData, setIsInitializedData] = useState(false);

  // Montar componente y recuperar valores del localStorage
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }

    // Recuperar lo que tengamos a la mano
    let plantelId =
      selectedPlantelId ||
      localStorage.getItem('calificaciones_plantelId') ||
      '';
    let periodoId =
      selectedPeriodoId ||
      localStorage.getItem('calificaciones_periodoId') ||
      '';
    let grupoId =
      selectedGrupoId || localStorage.getItem('calificaciones_grupoId') || '';

    // Prioridad del Plantel
    if (!plantelId) {
      if (activeCampus?.id) {
        plantelId = activeCampus.id.toString();
      } else if (user?.campuses && user.campuses.length > 0) {
        plantelId = user.campuses[0].id?.toString() || '';
      }
    }

    if (periodos.length > 0) {
      const jun2026Period = periodos.find((p) =>
        p.name?.toUpperCase().replace(/\s+/g, '').includes('JUN2026')
      );

      if (jun2026Period) {
        periodoId = jun2026Period.id.toString();
      } else if (!periodoId && uiConfig?.default_period_id) {
        periodoId = uiConfig.default_period_id.toString();
      }
    }

    if (plantelId && plantelId !== selectedPlantelId) {
      setSelectedPlantelId(plantelId);
    }

    if (periodoId && periodoId !== selectedPeriodoId) {
      setSelectedPeriodoId(periodoId);
    }

    if (grupoId && grupoId !== selectedGrupoId) {
      setSelectedGrupoId(grupoId);
    }

    if (plantelId && periodoId && !isInitializedData) {
      setIsInitializedData(true);
    }
  }, [isMounted, user, activeCampus, uiConfig, periodos]);

  useEffect(() => {
    const fetchPlanteles = async () => {
      try {
        const response = await getCampuses();
        setPlanteles(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPlanteles(false);
      }
    };
    fetchPlanteles();
  }, []);

  useEffect(() => {
    const fetchPeriodos = async () => {
      try {
        const response = await getPeriods();
        setPeriodos(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPeriodos(false);
      }
    };
    fetchPeriodos();
  }, []);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const params: Record<string, any> = {};
        if (selectedPlantelId) params.plantel_id = selectedPlantelId;
        if (selectedPeriodoId) params.period_id = selectedPeriodoId;

        const response = await getGrupos(params);
        const gruposOrdenados = response.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setGrupos(gruposOrdenados);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error cargando grupos:', error);
        setIsInitialized(true);
      }
    };
    fetchGrupos();
  }, [selectedPlantelId, selectedPeriodoId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calificaciones_plantelId', selectedPlantelId);
    }
  }, [selectedPlantelId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calificaciones_periodoId', selectedPeriodoId);
    }
  }, [selectedPeriodoId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calificaciones_grupoId', selectedGrupoId);
    }
  }, [selectedGrupoId]);

  useEffect(() => {
    if (!isInitialized || loadingPlanteles || loadingPeriodos) return;

    if (
      selectedPlantelId &&
      !planteles.find((p) => p.id?.toString() === selectedPlantelId)
    ) {
      setSelectedPlantelId('');
      localStorage.removeItem('calificaciones_plantelId');
    }

    if (
      selectedPeriodoId &&
      !periodos.find((p) => p.id === selectedPeriodoId)
    ) {
      setSelectedPeriodoId('');
      localStorage.removeItem('calificaciones_periodoId');
    }

    if (
      selectedGrupoId &&
      !grupos.find((g) => g.id?.toString() === selectedGrupoId)
    ) {
      setSelectedGrupoId('');
      localStorage.removeItem('calificaciones_grupoId');
    }
  }, [
    isInitialized,
    loadingPlanteles,
    loadingPeriodos,
    planteles,
    periodos,
    grupos,
  ]);

  useEffect(() => {
    if (!selectedPlantelId || !selectedPeriodoId) return;

    const fetchStudents = async () => {
      setLoadingEstudiantes(true);
      setStudents([]);
      setGrades({});
      setSelectedStudent(null);

      try {
        // Usamos el endpoint especializado que busca alumnos tanto por grupo_id como por assignments
        const params = {
          campus_id: selectedPlantelId,
          grupo: selectedGrupoId || undefined,
          perPage: 1000, // Traer todos los alumnos
        };

        const studentsRes = await axiosInstance.get(
          `/student-assignments/students-by-period/${selectedPeriodoId}`,
          { params }
        );

        let studentsData: Student[] = [];

        if (Array.isArray(studentsRes.data)) {
          studentsData = studentsRes.data;
        } else if (studentsRes.data?.data) {
          studentsData = studentsRes.data.data;
        } else if (studentsRes.data?.students) {
          studentsData = studentsRes.data.students;
        }

        setStudents(studentsData);

        if (studentsData.length > 0) {
          fetchGradesInBackground(studentsData);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      } finally {
        setLoadingEstudiantes(false);
      }
    };

    const fetchGradesInBackground = async (studentsData: Student[]) => {
      if (!studentsData || studentsData.length === 0) return;

      try {
        const studentIds = studentsData.map((s) => s.id);
        const gradesRes = await axiosInstance.post('/students/batch-grades', {
          student_ids: studentIds,
        });

        if (gradesRes.data && typeof gradesRes.data === 'object') {
          setGrades(gradesRes.data);
        } else {
          setGrades({});
        }
      } catch (err) {
        console.error('Error fetching batch grades:', err);
        setGrades({});
      }
    };

    fetchStudents();
  }, [selectedPlantelId, selectedPeriodoId, selectedGrupoId]);

  const filteredGrupos = React.useMemo(() => {
    if (!selectedPlantelId || !selectedPeriodoId) return [];

    return grupos.filter((grupo) => {
      // Forzamos a String ambos para que no importe si es número o texto
      const matchPeriodo =
        String(grupo.period_id) === String(selectedPeriodoId);

      // plantel_id puede no estar presente si el grupo se relaciona vía la tabla pivot campus_group_pivot
      const matchPlantelFromField = grupo.plantel_id
        ? String(grupo.plantel_id) === String(selectedPlantelId)
        : false;

      const matchPlantelFromPivot = Array.isArray(grupo.campuses)
        ? grupo.campuses.some(
            (campus) => String(campus.id) === String(selectedPlantelId)
          )
        : false;

      const matchPlantel = matchPlantelFromField || matchPlantelFromPivot;
      const hasStudents = (grupo.active_assignments_count || 0) > 0;

      return matchPlantel && matchPeriodo && hasStudents;
    });
  }, [selectedPlantelId, selectedPeriodoId, grupos]);

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
    const matricula = String(student.matricula || student.id).toLowerCase();

    return fullName.includes(query) || matricula.includes(query);
  });

  const getStudentAverage = (student: Student): string | number => {
    if (!(student.id in grades)) return 'Cargando...';

    const studentGrades = grades[student.id] || [];

    if (studentGrades.length === 0) {
      return 'N/A';
    }

    // Filtrar y convertir valores válidos a números
    const validGrades: number[] = [];

    studentGrades.forEach((g) => {
      // Preferencia: final_grade > rawgrade > grade
      let gradeStr = g.final_grade ?? g.rawgrade ?? g.grade ?? 'N/A';

      // Filtrar null o 'N/A'
      if (gradeStr !== 'N/A' && gradeStr != null && gradeStr !== '-') {
        const numericGrade = parseFloat(gradeStr.toString());
        if (!isNaN(numericGrade)) {
          validGrades.push(numericGrade);
        }
      }
    });

    if (validGrades.length === 0) return 'N/A';

    const sum = validGrades.reduce((acc, val) => acc + val, 0);
    const average = sum / validGrades.length;

    return average.toFixed(2);
  };

  const getGeneratedWhatsAppMessage = () => {
    if (!selectedStudent) return '';

    const template =
      whatsappTemplates.find((t) => t.id === selectedTemplateId) ||
      whatsappTemplates[0];
    const studentGrades = grades[selectedStudent.id] || [];

    const validGradesForMessage = studentGrades.filter((g) => {
      const name = g.course_name ?? g.course_fullname ?? g.name ?? '';
      const val = g.final_grade ?? g.rawgrade ?? g.grade;
      return (
        name !== 'Curso desconocido' &&
        val != null &&
        val !== 'N/A' &&
        val !== '-'
      );
    });

    const calificacionesText =
      validGradesForMessage.length > 0
        ? validGradesForMessage
            .map((g) => {
              const name =
                g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
              const val = g.final_grade ?? g.rawgrade ?? g.grade;
              return `- ${name}: ${typeof val === 'number' ? val.toFixed(2) : val}`;
            })
            .join('\n')
        : 'Sin calificaciones registradas.';

    const nombre =
      `${selectedStudent.firstname} ${selectedStudent.lastname}`.trim();

    return template.content
      .replace(/{{nombre}}/g, nombre)
      .replace(/{{calificaciones}}/g, calificacionesText)
      .replace(/\s{2,}/g, ' ')
      .trim(); // Sanitiza dobles espacios
  };

  const generatedWhatsAppMessage = getGeneratedWhatsAppMessage();

  const handleCopyMessage = async () => {
    if (!generatedWhatsAppMessage) return;

    try {
      await navigator.clipboard.writeText(generatedWhatsAppMessage);
      toast({
        title: 'Mensaje copiado',
        description: 'El mensaje se copió al portapapeles.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Cópialo manualmente desde la caja de texto.',
        variant: 'destructive',
      });
    }
  };

  const handleSendWhatsApp = () => {
    if (!generatedWhatsAppMessage) return;

    const encodedMessage = encodeURIComponent(generatedWhatsAppMessage);
    const phone = selectedStudent?.phone
      ? selectedStudent.phone.replace(/\D/g, '')
      : '';
    const phoneWithCode = phone.length === 10 ? `52${phone}` : phone;

    const whatsappUrl = phoneWithCode
      ? `https://api.whatsapp.com/send?phone=${phoneWithCode}&text=${encodedMessage}`
      : `https://api.whatsapp.com/send?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="w-full flex-1 min-w-0 p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Calificaciones por Plantel y Período
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecciona Plantel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="w-full">
              <Select
                value={selectedPlantelId}
                onValueChange={(value) => {
                  setSelectedPlantelId(value);
                  setSelectedPeriodoId(''); // Reset período when plantel changes
                  setSelectedGrupoId(''); // Reset grupo when plantel changes
                  setStudents([]);
                  setGrades({});
                  setSelectedStudent(null);
                }}
                disabled={loadingPlanteles}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plantel" />
                </SelectTrigger>
                <SelectContent>
                  {planteles.map((plantel) => (
                    <SelectItem
                      key={plantel.id}
                      value={plantel.id?.toString() || ''}
                    >
                      {plantel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Select
                value={selectedPeriodoId}
                onValueChange={(value) => {
                  setSelectedPeriodoId(value);
                  setSelectedGrupoId(''); // Reset grupo when período changes
                  setStudents([]);
                  setGrades({});
                  setSelectedStudent(null);
                }}
                disabled={loadingPeriodos || !selectedPlantelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un período" />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((periodo) => (
                    <SelectItem key={periodo.id} value={periodo.id}>
                      {periodo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Select
                value={selectedGrupoId}
                onValueChange={setSelectedGrupoId}
                disabled={!selectedPlantelId || !selectedPeriodoId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedPlantelId || !selectedPeriodoId
                        ? 'Primero selecciona plantel y período'
                        : filteredGrupos.length === 0
                          ? 'No hay grupos disponibles'
                          : 'Despliega y elige un grupo'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredGrupos.map((grupo) => (
                    <SelectItem key={grupo.id} value={grupo.id.toString()}>
                      {grupo.name} {grupo.type ? `(${grupo.type})` : ''} -{' '}
                      {grupo.active_assignments_count || 0}{' '}
                      {grupo.active_assignments_count === 1
                        ? 'alumno'
                        : 'alumnos'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              {selectedGrupoId && (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alumno..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedGrupoId && (
        <div className="flex gap-4 h-[750px]">
          {/* Tabla de estudiantes a la izquierda */}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Alumnos y Notas</span>
                {!loadingEstudiantes && students.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border">
                    {searchQuery
                      ? `Mostrando ${filteredStudents.length} de ${students.length}`
                      : `${students.length} ${
                          students.length === 1 ? 'alumno' : 'alumnos'
                        }`}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {loadingEstudiantes ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">
                    Cargando datos...
                  </span>
                </div>
              ) : students.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No hay alumnos inscritos en este grupo. Verifica que el
                    grupo tenga estudiantes asignados.
                    <br />
                    <strong>Grupo seleccionado:</strong>{' '}
                    {filteredGrupos.find(
                      (g) => g.id?.toString() === selectedGrupoId
                    )?.name || 'Desconocido'}
                    <br />
                    <strong>ID del grupo:</strong> {selectedGrupoId}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                          Matrícula
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                          Nombre del Alumno
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                          Promedio Final
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="h-24 text-center">
                            No se encontraron resultados.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => {
                          const average = getStudentAverage(student);
                          const isSelected = selectedStudent?.id === student.id;

                          return (
                            <tr
                              key={student.id}
                              className={`cursor-pointer border-b transition-colors ${
                                isSelected
                                  ? 'bg-primary/10 border-primary'
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setSelectedStudent(student)}
                            >
                              <td className="p-4 align-middle font-medium text-xs text-muted-foreground">
                                {student.matricula || student.id || '-'}
                              </td>
                              <td className="p-4 align-middle font-medium">
                                {student.firstname} {student.lastname}
                              </td>
                              <td className="p-4 align-middle text-right">
                                <span
                                  className={`px-3 py-1 rounded-md font-bold ${
                                    average !== 'N/A' && Number(average) < 60
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {average}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalles de calificaciones a la derecha */}
          {selectedStudent && (
            <Card className="w-1/3 flex flex-col">
              <CardHeader>
                <CardTitle>
                  Calificaciones de {selectedStudent.firstname}{' '}
                  {selectedStudent.lastname}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {(() => {
                  const allStudentGrades = grades[selectedStudent.id] || [];
                  const validStudentGrades = allStudentGrades.filter((g) => {
                    const name =
                      g.course_name ?? g.course_fullname ?? g.name ?? '';
                    const val = g.final_grade ?? g.rawgrade ?? g.grade;
                    return (
                      name !== 'Curso desconocido' &&
                      val != null &&
                      val !== 'N/A' &&
                      val !== '-'
                    );
                  });

                  return validStudentGrades.length > 0 ? (
                    <div className="space-y-4">
                      {validStudentGrades.map((g, idx) => {
                        const name =
                          g.course_name ??
                          g.course_fullname ??
                          g.name ??
                          'Materia';
                        const val = g.final_grade ?? g.rawgrade ?? g.grade;
                        const displayVal =
                          typeof val === 'number' ? val.toFixed(2) : val;
                        return (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-3 px-4 border rounded-lg bg-card"
                          >
                            <span className="text-sm font-medium truncate mr-4">
                              {name}
                            </span>
                            <span className="px-3 py-1 text-sm rounded-md font-bold border bg-background">
                              {displayVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border-b pb-8">
                      Sin notas disponibles.
                    </div>
                  );
                })()}

                {/* Generador de Mensajes (WhatsApp) */}
                {grades[selectedStudent.id] &&
                  grades[selectedStudent.id].length > 0 && (
                    <div className="mt-6 border-t pt-4 space-y-4">
                      <h4 className="font-semibold text-sm">Enviar reporte</h4>
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-xs font-medium mb-1 text-muted-foreground">
                            Plantilla
                          </p>
                          <select
                            value={selectedTemplateId}
                            onChange={(e) =>
                              setSelectedTemplateId(e.target.value)
                            }
                            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                          >
                            {whatsappTemplates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <p className="text-xs font-medium mb-1 text-muted-foreground">
                            Vista Previa
                          </p>
                          <Textarea
                            readOnly
                            value={generatedWhatsAppMessage}
                            className="min-h-[140px] text-xs resize-none bg-muted/30"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto text-xs"
                            onClick={handleCopyMessage}
                            disabled={!generatedWhatsAppMessage}
                          >
                            Copiar texto
                          </Button>
                          <Button
                            onClick={handleSendWhatsApp}
                            disabled={!generatedWhatsAppMessage}
                            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebd5a] text-white flex gap-2 text-xs"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
