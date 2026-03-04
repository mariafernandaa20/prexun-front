'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  TrendingUp,
  User,
  Users,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Download,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';
import { useAuthStore } from '@/lib/store/auth-store';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { useUIConfig } from '@/hooks/useUIConfig';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  matricula: string;
}

interface AttendanceDay {
  date: string;
  day_name: string;
  day_name_es: string;
  status: 'present' | 'absent';
  attendance_time?: string;
  created_at?: string;
}

interface StudentReport {
  student: {
    id: string;
    firstname: string;
    lastname: string;
    matricula: string;
    grupo: string;
    period: string;
  };
  period: {
    start_date: string;
    end_date: string;
    total_days: number;
    exclude_weekends: boolean;
  };
  statistics: {
    present_count: number;
    absent_count: number;
    total_days: number;
    attendance_percentage: number;
    absent_percentage: number;
  };
  attendance_details: {
    all_days: AttendanceDay[];
    present_days: AttendanceDay[];
    absent_days: AttendanceDay[];
  };
}

interface GroupReport {
  group: {
    id: string;
    name: string;
    period: string;
    total_students: number;
  };
  period: {
    start_date: string;
    end_date: string;
    exclude_weekends: boolean;
  };
  group_statistics: {
    total_students: number;
    total_present_days: number;
    total_absent_days: number;
    total_possible_days: number;
    group_attendance_percentage: number;
  };
  students_reports: StudentReport[];
}

export default function ReportesAsistenciaPage() {
  const { grupos, periods, getFilteredGrupos } = useAuthStore();
  const { activeCampus } = useActiveCampusStore();
  const { config } = useUIConfig();
  const [periodId, setPeriodId] = useState<string>('');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [excludeWeekends, setExcludeWeekends] = useState<boolean>(true);
  const [studentReport, setStudentReport] = useState<StudentReport | null>(
    null
  );
  const [groupReport, setGroupReport] = useState<GroupReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('student');

  const formatDateInMexicoIso = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return formatter.format(date);
  };

  const parseDateInput = (value: string) => {
    if (!value) return new Date();
    return new Date(`${value}T12:00:00`);
  };

  const formatServerDate = (value?: string) => {
    if (!value) return '-';

    const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnlyPattern.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString(
        'es-MX',
        { timeZone: 'America/Mexico_City' }
      );
    }

    return new Date(value).toLocaleDateString('es-MX', {
      timeZone: 'America/Mexico_City',
    });
  };

  const getCurrentPeriodId = () => {
    if (!Array.isArray(periods) || periods.length === 0) return null;

    const today = new Date();
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const activePeriod = periods.find((period: any) => {
      const start = new Date(`${period.start_date}T00:00:00`);
      const end = new Date(`${period.end_date}T23:59:59`);
      return todayDate >= start && todayDate <= end;
    });

    if (activePeriod?.id) return String(activePeriod.id);

    const sortedByStartDate = [...periods].sort(
      (a: any, b: any) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    return sortedByStartDate[0]?.id ? String(sortedByStartDate[0].id) : null;
  };

  const currentPeriodId = getCurrentPeriodId();

  const campusGroups = useMemo(() => {
    const baseGroups = getFilteredGrupos(activeCampus?.id, undefined);

    return baseGroups.filter((group: any) => {
      const hasPlantelAssociation =
        !!group.plantel_id ||
        (Array.isArray(group.campuses) && group.campuses.length > 0);

      if (hasPlantelAssociation) return true;

      const groupType = String(group.type || '').toLowerCase();
      const isOnlineGroup =
        groupType.includes('linea') ||
        groupType.includes('línea') ||
        groupType.includes('online');

      return isOnlineGroup;
    });
  }, [getFilteredGrupos, activeCampus?.id, grupos]);

  const filteredGroups = useMemo(() => {
    return campusGroups.filter(
      (grupo) => !periodId || grupo.period_id.toString() === periodId
    );
  }, [campusGroups, periodId]);

  useEffect(() => {
    if (periodId || periods.length === 0) return;

    const configuredPeriodId = config?.default_period_id
      ? String(config.default_period_id)
      : null;

    const hasConfiguredPeriod = configuredPeriodId
      ? periods.some((period: any) => String(period.id) === configuredPeriodId)
      : false;

    if (hasConfiguredPeriod && configuredPeriodId) {
      setPeriodId(configuredPeriodId);
      return;
    }

    if (currentPeriodId) {
      setPeriodId(currentPeriodId);
      return;
    }

    setPeriodId(String(periods[0].id));
  }, [periodId, periods, config?.default_period_id, currentPeriodId]);

  useEffect(() => {
    if (filteredGroups.length === 0) {
      setSelectedGrupo('');
      setStudentId('');
      setStudents([]);
      return;
    }

    const groupExists = filteredGroups.some(
      (group) => group.id.toString() === selectedGrupo
    );

    if (!groupExists) {
      setSelectedGrupo(filteredGroups[0].id.toString());
      setStudentId('');
    }
  }, [filteredGroups, selectedGrupo]);

  // Cargar estudiantes cuando se selecciona un grupo
  const fetchStudentsForGroup = async (groupId: string) => {
    try {
      const params: any = {};
      if (activeCampus?.id) {
        params.plantel_id = activeCampus.id;
      }
      const response = await axiosInstance.get(`/grupos/${groupId}/students`, { params });
      const uniqueStudents = Array.from(
        new Map(
          (response.data as Student[])
            .filter((student) => student?.id && (student.firstname || student.lastname))
            .map((student) => [student.id, student])
        ).values()
      ).sort((a, b) => {
        const lastA = (a.lastname || '').toLowerCase();
        const lastB = (b.lastname || '').toLowerCase();
        if (lastA < lastB) return -1;
        if (lastA > lastB) return 1;
        const firstA = (a.firstname || '').toLowerCase();
        const firstB = (b.firstname || '').toLowerCase();
        return firstA.localeCompare(firstB);
      });

      setStudents(uniqueStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error al cargar estudiantes');
    }
  };

  useEffect(() => {
    if (selectedGrupo) {
      fetchStudentsForGroup(selectedGrupo);
    }
  }, [selectedGrupo, activeCampus?.id]);

  // Generar reporte de estudiante
  const generateStudentReport = async () => {
    if (!studentId || !startDate || !endDate) {
      toast.error('Selecciona un estudiante y el rango de fechas');
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: formatDateInMexicoIso(startDate),
        end_date: formatDateInMexicoIso(endDate),
        exclude_weekends: excludeWeekends.toString(),
      });

      if (activeCampus?.id) {
        params.append('plantel_id', activeCampus.id.toString());
      }

      const response = await axiosInstance.get(
        `/teacher/attendance/student/${studentId}/report?${params.toString()}`
      );

      if (response.data.success) {
        setStudentReport(response.data.data);
        toast.success('Reporte generado exitosamente');
      }
    } catch (error: any) {
      console.error('Error generating student report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  // Generar reporte de grupo
  const generateGroupReport = async () => {
    if (!selectedGrupo || !startDate || !endDate) {
      toast.error('Selecciona un grupo y el rango de fechas');
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: formatDateInMexicoIso(startDate),
        end_date: formatDateInMexicoIso(endDate),
        exclude_weekends: excludeWeekends.toString(),
      });

      if (activeCampus?.id) {
        params.append('plantel_id', activeCampus.id.toString());
      }

      const response = await axiosInstance.get(
        `/teacher/attendance/group/${selectedGrupo}/report?${params.toString()}`
      );

      if (response.data.success) {
        setGroupReport(response.data.data);
        toast.success('Reporte de grupo generado exitosamente');
      }
    } catch (error: any) {
      console.error('Error generating group report:', error);
      toast.error('Error al generar el reporte del grupo');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener color para el porcentaje de asistencia
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Reportes de Asistencia</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Reporte Individual
          </TabsTrigger>
          <TabsTrigger value="group" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Reporte de Grupo
          </TabsTrigger>
        </TabsList>

        {/* Controles de filtros */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Filtros de Reporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Selector de periodo */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Periodo
                </label>
                <Select value={periodId} onValueChange={setPeriodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selector de grupo */}
              <div>
                <label className="text-sm font-medium mb-2 block">Grupo</label>
                <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGroups.map((grupo) => (
                      <SelectItem key={grupo.id} value={grupo.id.toString()}>
                        {grupo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha inicio */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={formatDateInMexicoIso(startDate)}
                  onChange={(e) => setStartDate(parseDateInput(e.target.value))}
                />
              </div>

              {/* Fecha fin */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={formatDateInMexicoIso(endDate)}
                  onChange={(e) => setEndDate(parseDateInput(e.target.value))}
                />
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={excludeWeekends}
                  onChange={(e) => setExcludeWeekends(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Excluir fines de semana</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <TabsContent value="student">
          <Card>
            <CardHeader>
              <CardTitle>Reporte Individual de Estudiante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Estudiante
                  </label>
                  <Select value={studentId} onValueChange={setStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstname} {student.lastname} -{' '}
                          {student.matricula}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={generateStudentReport}
                    disabled={isLoading || !studentId}
                    className="w-full"
                  >
                    {isLoading ? 'Generando...' : 'Generar Reporte'}
                  </Button>
                </div>
              </div>

              {/* Mostrar reporte del estudiante */}
              {studentReport && (
                <div className="mt-6 space-y-6">
                  {/* Información del estudiante */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {studentReport.student.firstname}{' '}
                            {studentReport.student.lastname}
                          </h3>
                          <p className="text-gray-600">
                            Matrícula: {studentReport.student.matricula}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Grupo</p>
                          <p className="font-medium">
                            {studentReport.student.grupo}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Periodo</p>
                          <p className="font-medium">
                            {studentReport.student.period}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rango</p>
                          <p className="font-medium">
                            {formatServerDate(studentReport.period.start_date)} -{' '}
                            {formatServerDate(studentReport.period.end_date)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div
                            className={`text-3xl font-bold ${getAttendanceColor(studentReport.statistics.attendance_percentage)}`}
                          >
                            {studentReport.statistics.attendance_percentage}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Asistencia
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {studentReport.statistics.present_count}
                          </div>
                          <div className="text-sm text-gray-600">
                            Días Presente
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {studentReport.statistics.absent_count}
                          </div>
                          <div className="text-sm text-gray-600">
                            Días Ausente
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {studentReport.statistics.total_days}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Días
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detalle de días */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalle de Asistencia</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                          {studentReport.attendance_details.all_days.map(
                            (day, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="font-medium">
                                      {formatServerDate(day.date)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {day.day_name_es}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      day.status === 'present'
                                        ? 'default'
                                        : 'destructive'
                                    }
                                    className={
                                      day.status === 'present'
                                        ? 'bg-green-600'
                                        : ''
                                    }
                                  >
                                    {day.status === 'present' ? (
                                      <>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Presente
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Ausente
                                      </>
                                    )}
                                  </Badge>
                                  {day.attendance_time && (
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        day.attendance_time
                                      ).toLocaleTimeString('es-MX', {
                                        timeZone: 'America/Mexico_City',
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end mb-4">
                <Button
                  onClick={generateGroupReport}
                  disabled={isLoading || !selectedGrupo}
                  className="w-full md:w-auto"
                >
                  {isLoading ? 'Generando...' : 'Generar Reporte de Grupo'}
                </Button>
              </div>

              {/* Mostrar reporte del grupo */}
              {groupReport && (
                <div className="mt-6 space-y-6">
                  {/* Información del grupo */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {groupReport.group.name}
                          </h3>
                          <p className="text-gray-600">Grupo</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Periodo</p>
                          <p className="font-medium">
                            {groupReport.group.period}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estudiantes</p>
                          <p className="font-medium">
                            {groupReport.group.total_students}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Asistencia Grupal
                          </p>
                          <p
                            className={`font-medium text-lg ${getAttendanceColor(groupReport.group_statistics.group_attendance_percentage)}`}
                          >
                            {
                              groupReport.group_statistics
                                .group_attendance_percentage
                            }
                            %
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de estudiantes del grupo */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen por Estudiante</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {groupReport.students_reports.map(
                          (studentReport, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  {studentReport.student.firstname}{' '}
                                  {studentReport.student.lastname}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Matrícula: {studentReport.student.matricula}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-sm text-gray-600">
                                    Presentes
                                  </div>
                                  <div className="font-semibold text-green-600">
                                    {studentReport.statistics.present_count}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">
                                    Ausentes
                                  </div>
                                  <div className="font-semibold text-red-600">
                                    {studentReport.statistics.absent_count}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">
                                    Asistencia
                                  </div>
                                  <div
                                    className={`font-semibold ${getAttendanceColor(studentReport.statistics.attendance_percentage)}`}
                                  >
                                    {
                                      studentReport.statistics
                                        .attendance_percentage
                                    }
                                    %
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
