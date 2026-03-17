'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronDown, ChevronRight, Search } from 'lucide-react';
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
    const [expandedStudents, setExpandedStudents] = useState<Record<string | number, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const toggleStudent = (id: string | number) => {
        setExpandedStudents(prev => ({ ...prev, [id]: !prev[id] }));
    };

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

        const fetchStudentsAndGrades = async () => {
            setLoadingEstudiantes(true);
            setStudents([]);
            setGrades({});

            try {
                const studentsRes = await axiosInstance.get(`/grupos/${selectedGrupoId}/students`);
                const studentsData: Student[] = studentsRes.data;
                setStudents(studentsData);

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
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingEstudiantes(false);
            }
        };

        fetchStudentsAndGrades();
    }, [selectedGrupoId]);

    const filteredStudents = students.filter(student => {
        const query = searchQuery.toLowerCase();
        const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
        const matricula = String(student.matricula || student.id).toLowerCase();
        return fullName.includes(query) || matricula.includes(query);
    });

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
                <Card>
                    <CardHeader>
                        <CardTitle>Alumnos y Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40px]"></TableHead>
                                            <TableHead>Matrícula</TableHead>
                                            <TableHead>Nombre del Alumno</TableHead>
                                            <TableHead className="text-right">Promedio Final</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No se encontraron resultados.
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredStudents.map((student) => {
                                            const studentGrades = grades[student.id] || [];
                                            const isExpanded = !!expandedStudents[student.id];

                                            let average: string | number = 'N/A';
                                            if (studentGrades.length > 0) {
                                                const validGrades = studentGrades.filter(g => {
                                                    const val = g.final_grade ?? g.rawgrade ?? g.grade;
                                                    return String(val).trim() !== '-' && val !== null && val !== undefined && String(val).trim() !== '';
                                                });

                                                if (validGrades.length > 0) {
                                                    const sum = validGrades.reduce((acc, g) => {
                                                        const val = g.final_grade ?? g.rawgrade ?? String(g.grade).replace(/[^0-9.]/g, '');
                                                        return acc + (Number(val) || 0);
                                                    }, 0);
                                                    average = (sum / validGrades.length).toFixed(2);
                                                }
                                            }

                                            return (
                                                <React.Fragment key={student.id}>
                                                    <TableRow
                                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                                        onClick={() => toggleStudent(student.id)}
                                                    >
                                                        <TableCell>
                                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-xs text-muted-foreground">
                                                            {student.matricula || student.id || '-'}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {student.firstname} {student.lastname}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={`px-3 py-1 rounded-md font-bold ${average !== 'N/A' && Number(average) < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-800'}`}>
                                                                {average}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isExpanded && (
                                                        <TableRow className="bg-muted/20">
                                                            <TableCell colSpan={4} className="p-0 border-b-0">
                                                                <div className="p-4 px-12">
                                                                    <div className="rounded-xl border bg-card shadow-sm">
                                                                        <div className="p-4 font-semibold border-b bg-muted/40 flex justify-between">
                                                                            <span>Materias y Calificaciones</span>
                                                                        </div>
                                                                        <div className="p-5">
                                                                            {studentGrades.length > 0 ? (
                                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                                    {studentGrades.map((g, idx) => {
                                                                                        const name = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
                                                                                        const val = g.final_grade ?? g.rawgrade ?? g.grade ?? 'N/A';
                                                                                        return (
                                                                                            <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                                                                                <span className="text-sm truncate mr-4">{name}</span>
                                                                                                <span className="px-2 py-1 text-xs rounded-md font-bold border bg-background">
                                                                                                    {val === '-' ? 'N/A' : val}
                                                                                                </span>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-center py-4 text-muted-foreground">Sin notas.</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}