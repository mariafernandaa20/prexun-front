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
import { Loader2, Search } from 'lucide-react';
import axiosInstance from '@/lib/api/axiosConfig';
import { getGrupos, getCampuses, getPeriods } from '@/lib/api';
import { Grupo, Campus, Period } from '@/lib/types';

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

    // Montar componente y recuperar valores del localStorage
    useEffect(() => {
        setIsMounted(true);
        const plantelId = localStorage.getItem('calificaciones_plantelId') || '';
        const periodoId = localStorage.getItem('calificaciones_periodoId') || '';
        const grupoId = localStorage.getItem('calificaciones_grupoId') || '';
        
        setSelectedPlantelId(plantelId);
        setSelectedPeriodoId(periodoId);
        setSelectedGrupoId(grupoId);
    }, []);

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
                const response = await getGrupos();
                const gruposOrdenados = response.sort((a, b) => a.name.localeCompare(b.name));
                setGrupos(gruposOrdenados);
                console.log('All grupos loaded:', gruposOrdenados.length);
                console.log('First few grupos:', gruposOrdenados.slice(0, 5));
                setIsInitialized(true);
            } catch (error) {
                console.error('Error cargando grupos:', error);
                setIsInitialized(true);
            }
        };
        fetchGrupos();
    }, []);

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
        if (!isInitialized) return;
        
        if (selectedPlantelId && !planteles.find(p => p.id?.toString() === selectedPlantelId)) {
            setSelectedPlantelId('');
            localStorage.removeItem('calificaciones_plantelId');
        }
        
        if (selectedPeriodoId && !periodos.find(p => p.id === selectedPeriodoId)) {
            setSelectedPeriodoId('');
            localStorage.removeItem('calificaciones_periodoId');
        }
        
        if (selectedGrupoId && !grupos.find(g => g.id?.toString() === selectedGrupoId)) {
            setSelectedGrupoId('');
            localStorage.removeItem('calificaciones_grupoId');
        }
    }, [isInitialized, planteles, periodos, grupos]);

    useEffect(() => {
        if (!selectedPlantelId) return;

        console.log('Selected plantel changed:', selectedPlantelId);
        console.log('Filtered grupos available:', filteredGrupos.length);

        const fetchStudents = async () => {
            setLoadingEstudiantes(true);
            setStudents([]);
            setGrades({});
            setSelectedStudent(null);

            try {
                console.log('Fetching all students for plantel:', selectedPlantelId);
                // Cargar todos los estudiantes del plantel
                const studentsRes = await axiosInstance.get('/students', {
                    params: { campus_id: selectedPlantelId }
                });
                console.log('Students response:', studentsRes.data);
                console.log('Students response status:', studentsRes.status);
                console.log('Students response headers:', studentsRes.headers);
                
                let studentsData: Student[] = [];
                
                // Handle different response formats
                if (Array.isArray(studentsRes.data)) {
                    studentsData = studentsRes.data;
                } else if (studentsRes.data?.data && Array.isArray(studentsRes.data.data)) {
                    studentsData = studentsRes.data.data;
                } else if (studentsRes.data?.students && Array.isArray(studentsRes.data.students)) {
                    studentsData = studentsRes.data.students;
                }
                
                console.log('Processed students:', studentsData.length);
                console.log('First few students:', studentsData.slice(0, 3));
                setStudents(studentsData);

                // Fetch grades in background
                if (studentsData.length > 0) {
                    fetchGradesInBackground(studentsData);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
                console.error('Error details:', error.response?.data || error.message);
                setStudents([]);
            } finally {
                setLoadingEstudiantes(false);
            }
        };

        const fetchGradesInBackground = async (studentsData: Student[]) => {
            const gradesData: Record<string | number, Grade[]> = {};

            await Promise.all(
                studentsData.map(async (student) => {
                    try {
                        console.log(`Fetching grades for student ${student.id} (${student.firstname} ${student.lastname})`);
                        const gradesRes = await axiosInstance.get(`/students/${student.id}/grades`);
                        console.log(`Raw grades response for student ${student.id}:`, gradesRes.data);
                        const gr = gradesRes.data;

                        let processedGrades: Grade[] = [];
                        
                        if (Array.isArray(gr)) {
                            processedGrades = gr;
                            console.log(`Student ${student.id}: Found ${gr.length} grades (array format)`);
                        } else if (gr && Array.isArray(gr.grades)) {
                            processedGrades = gr.grades;
                            console.log(`Student ${student.id}: Found ${gr.grades.length} grades (gr.grades format)`);
                        } else if (gr && gr.data && Array.isArray(gr.data.grades)) {
                            processedGrades = gr.data.grades;
                            console.log(`Student ${student.id}: Found ${gr.data.grades.length} grades (gr.data.grades format)`);
                        } else if (gr && gr.data && Array.isArray(gr.data)) {
                            processedGrades = gr.data;
                            console.log(`Student ${student.id}: Found ${gr.data.length} grades (gr.data array format)`);
                        } else {
                            console.warn(`Student ${student.id}: Unknown grades format:`, gr);
                            processedGrades = [];
                        }
                        
                        // Log first few grades for debugging
                        if (processedGrades.length > 0) {
                            console.log(`Student ${student.id} first 3 grades:`, processedGrades.slice(0, 3));
                        }
                        
                        gradesData[student.id] = processedGrades;
                    } catch (err) {
                        console.error(`Error con alumno ${student.id}:`, err);
                        gradesData[student.id] = [];
                    }
                })
            );
            setGrades(gradesData);
        };

        fetchStudents();
    }, [selectedPlantelId]);

    const filteredGrupos = selectedPlantelId && selectedPeriodoId
        ? grupos.filter(grupo => grupo.plantel_id === parseInt(selectedPlantelId) && grupo.period_id === parseInt(selectedPeriodoId))
        : [];

    console.log('Filtered grupos:', filteredGrupos.length, 'for plantel:', selectedPlantelId, 'periodo:', selectedPeriodoId);

    const filteredStudents = students.filter(student => {
        // Primero filtrar por búsqueda de texto
        const query = searchQuery.toLowerCase();
        const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
        const matricula = String(student.matricula || student.id).toLowerCase();
        const matchesSearch = fullName.includes(query) || matricula.includes(query);
        
        // Si hay un grupo seleccionado, filtrar también por grupo
        if (selectedGrupoId) {
            // Aquí necesitaríamos verificar si el estudiante pertenece al grupo seleccionado
            // Por ahora, mostramos todos los estudiantes del plantel cuando hay grupo seleccionado
            // pero podríamos agregar lógica adicional si tenemos la información de asignación
        }
        
        return matchesSearch;
    });

    const getStudentAverage = (student: Student): string | number => {
        if (!(student.id in grades)) return 'Cargando...';

        const studentGrades = grades[student.id] || [];
        console.log(`Calculando promedio para ${student.firstname} ${student.lastname} (ID: ${student.id})`);
        console.log(`Total de calificaciones encontradas: ${studentGrades.length}`);
        
        if (studentGrades.length === 0) {
            console.log(`No hay calificaciones para ${student.firstname}`);
            return 'N/A';
        }

        // Log de todas las calificaciones para debugging
        studentGrades.forEach((g, index) => {
            console.log(`Calificación ${index + 1}:`, {
                course_name: g.course_name,
                course_fullname: g.course_fullname,
                name: g.name,
                final_grade: g.final_grade,
                rawgrade: g.rawgrade,
                grade: g.grade
            });
        });

        // Filtrar y convertir valores válidos a números
        const validGrades: number[] = [];
        
        studentGrades.forEach(g => {
            // Preferencia: final_grade > rawgrade > grade
            let val = g.final_grade !== undefined && g.final_grade !== null ? g.final_grade 
                    : g.rawgrade !== undefined && g.rawgrade !== null ? g.rawgrade 
                    : g.grade !== undefined && g.grade !== null ? g.grade 
                    : null;
            
            console.log(`Procesando calificación - Materia: ${g.course_name || g.course_fullname || g.name}, Valor extraído: ${val}`);
            
            if (val === null || val === undefined) {
                console.log(`Valor nulo/undefined, saltando`);
                return;
            }
            
            // Convertir a número
            const numVal = typeof val === 'number' ? val : Number(String(val).trim());
            console.log(`Convertido a número: ${numVal}`);
            
            // Validar que sea un número válido y no sea -1 (valor de error común)
            if (!isNaN(numVal) && numVal >= 0) {
                validGrades.push(numVal);
                console.log(`Calificación válida agregada: ${numVal}`);
            } else {
                console.log(`Calificación inválida descartada: ${numVal}`);
            }
        });

        console.log(`Calificaciones válidas encontradas: ${validGrades.length} de ${studentGrades.length}`);
        
        if (validGrades.length === 0) {
            console.log(`No hay calificaciones válidas para ${student.firstname}`);
            return 'N/A';
        }

        const sum = validGrades.reduce((acc, val) => acc + val, 0);
        const average = sum / validGrades.length;
        
        console.log(`Promedio calculado para ${student.firstname}: ${average.toFixed(2)} (suma: ${sum}, calificaciones válidas: ${validGrades.length})`);
        
        return average.toFixed(2);
    };

    return (
        <div className="w-full flex-1 min-w-0 p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Calificaciones por Plantel y Período</h1>
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
                                        <SelectItem key={plantel.id} value={plantel.id?.toString() || ''}>
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
                                    <SelectValue placeholder={
                                        !selectedPlantelId || !selectedPeriodoId
                                            ? "Primero selecciona plantel y período"
                                            : filteredGrupos.length === 0
                                                ? "No hay grupos disponibles"
                                                : "Despliega y elige un grupo"
                                    } />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredGrupos.map((grupo) => (
                                        <SelectItem key={grupo.id} value={grupo.id.toString()}>
                                            {grupo.name} {grupo.type ? `(${grupo.type})` : ''}
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
                <div className="flex gap-4 h-[600px]">
                    {/* Tabla de estudiantes a la izquierda */}
                    <Card className="flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Alumnos y Notas</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            {loadingEstudiantes ? (
                                <div className="flex justify-center items-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-2" />
                                    <span className="text-muted-foreground">Cargando datos...</span>
                                </div>
                            ) : students.length === 0 ? (
                                <Alert>
                                    <AlertDescription>
                                        No hay alumnos inscritos en este grupo. Verifica que el grupo tenga estudiantes asignados.
                                        <br />
                                        <strong>Grupo seleccionado:</strong> {filteredGrupos.find(g => g.id?.toString() === selectedGrupoId)?.name || 'Desconocido'}
                                        <br />
                                        <strong>ID del grupo:</strong> {selectedGrupoId}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full caption-bottom text-sm">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Matrícula</th>
                                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Nombre del Alumno</th>
                                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Promedio Final</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {filteredStudents.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="h-24 text-center">
                                                        No se encontraron resultados.
                                                    </td>
                                                </tr>
                                            ) : filteredStudents.map((student) => {
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
                                                            <span className={`px-3 py-1 rounded-md font-bold ${
                                                                average !== 'N/A' && Number(average) < 60
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {average}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
                                    Calificaciones de {selectedStudent.firstname} {selectedStudent.lastname}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                                {(() => {
                                    const studentGrades = grades[selectedStudent.id] || [];
                                    return studentGrades.length > 0 ? (
                                        <div className="space-y-4">
                                            {studentGrades.map((g, idx) => {
                                                const name = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
                                                const val = g.final_grade ?? g.rawgrade ?? g.grade ?? 'N/A';
                                                return (
                                                    <div key={idx} className="flex justify-between items-center py-3 px-4 border rounded-lg bg-card">
                                                        <span className="text-sm font-medium truncate mr-4">{name}</span>
                                                        <span className="px-3 py-1 text-sm rounded-md font-bold border bg-background">
                                                            {val === '-' ? 'N/A' : val}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">Sin notas disponibles.</div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}