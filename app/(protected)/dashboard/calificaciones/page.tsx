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
import { getGrupos } from '@/lib/api';
import { Grupo } from '@/lib/types';

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
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [selectedGrupoId, setSelectedGrupoId] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [grades, setGrades] = useState<Record<string | number, Grade[]>>({});
    const [loadingGrupos, setLoadingGrupos] = useState(true);
    const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const response = await getGrupos();
                const gruposOrdenados = response.sort((a, b) => a.name.localeCompare(b.name));
                setGrupos(gruposOrdenados);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingGrupos(false);
            }
        };
        fetchGrupos();
    }, []);

    useEffect(() => {
        if (!selectedGrupoId) return;

        const fetchStudents = async () => {
            setLoadingEstudiantes(true);
            setStudents([]);
            setGrades({});
            setSelectedStudent(null);

            try {
                const studentsRes = await axiosInstance.get(`/grupos/${selectedGrupoId}/students`);
                const studentsData: Student[] = studentsRes.data;
                setStudents(studentsData);

                // Fetch grades in background
                fetchGradesInBackground(studentsData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingEstudiantes(false);
            }
        };

        const fetchGradesInBackground = async (studentsData: Student[]) => {
            const gradesData: Record<string | number, Grade[]> = {};

            await Promise.all(
                studentsData.map(async (student) => {
                    try {
                        const gradesRes = await axiosInstance.get(`/students/${student.id}/grades`);
                        const gr = gradesRes.data;

                        if (Array.isArray(gr)) {
                            gradesData[student.id] = gr;
                        } else if (gr && Array.isArray(gr.grades)) {
                            gradesData[student.id] = gr.grades;
                        } else if (gr && gr.data && Array.isArray(gr.data.grades)) {
                            gradesData[student.id] = gr.data.grades;
                        } else {
                            gradesData[student.id] = [];
                        }
                    } catch (err) {
                        console.error(`Error con alumno ${student.id}:`, err);
                        gradesData[student.id] = [];
                    }
                })
            );
            setGrades(gradesData);
        };

        fetchStudents();
    }, [selectedGrupoId]);

    const filteredStudents = students.filter(student => {
        const query = searchQuery.toLowerCase();
        const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
        const matricula = String(student.matricula || student.id).toLowerCase();
        return fullName.includes(query) || matricula.includes(query);
    });

    const getStudentAverage = (student: Student): string | number => {
        if (!(student.id in grades)) return 'Cargando...';

        const studentGrades = grades[student.id] || [];
        if (studentGrades.length === 0) return 'N/A';

        const validGrades = studentGrades.filter(g => {
            const val = g.final_grade ?? g.rawgrade ?? g.grade;
            return String(val).trim() !== '-' && val !== null && val !== undefined && String(val).trim() !== '';
        });

        if (validGrades.length === 0) return 'N/A';

        const sum = validGrades.reduce((acc, g) => {
            const val = g.final_grade ?? g.rawgrade ?? String(g.grade).replace(/[^0-9.]/g, '');
            return acc + (Number(val) || 0);
        }, 0);
        return (sum / validGrades.length).toFixed(2);
    };

    return (
        <div className="w-full flex-1 min-w-0 p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Calificaciones por Grupo</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Selecciona un Grupo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="w-full sm:max-w-md">
                            <Select
                                value={selectedGrupoId}
                                onValueChange={setSelectedGrupoId}
                                disabled={loadingGrupos}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingGrupos ? "Cargando grupos..." : "Despliega y elige un grupo"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {grupos.map((grupo) => (
                                        <SelectItem key={grupo.id} value={grupo.id.toString()}>
                                            {grupo.name} {grupo.type ? `(${grupo.type})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedGrupoId && (
                            <div className="relative w-full sm:max-w-xs">
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
                                    <AlertDescription>No hay alumnos inscritos.</AlertDescription>
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