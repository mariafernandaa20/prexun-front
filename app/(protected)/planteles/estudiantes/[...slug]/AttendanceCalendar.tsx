'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AttendanceRecord {
  id: number;
  student_id: number;
  grupo_id: number;
  user_id: number | null;
  date: string;
  present: boolean;
  created_at: string;
  updated_at: string;
  attendance_time: string;
  notes: string | null;
}

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[];
  month?: number;
  year?: number;
}

export default function AttendanceCalendar({
  attendance,
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
}: AttendanceCalendarProps) {
  // Estado para la navegación
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);

  // Funciones de navegación
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Función para formatear la hora
  const formatTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      return 'Hora no válida';
    }
  };

  // Obtener el primer día del mes y cuántos días tiene
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Nombres de los días de la semana
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  // Crear un mapa de asistencias por fecha
  const attendanceMap = new Map<string, AttendanceRecord>();
  attendance.forEach((record) => {
    const date = new Date(record.date);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    attendanceMap.set(dateKey, record);
  });

  // Generar los días del calendario
  const calendarDays = [];

  // Días vacíos al inicio del mes
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    const attendanceRecord = attendanceMap.get(dateKey);
    const hasAttendance = attendanceMap.has(dateKey);
    const isPresent = attendanceRecord?.present;

    calendarDays.push({
      day,
      hasAttendance,
      isPresent,
      attendanceRecord,
    });
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendario */}
        <TooltipProvider>
          <div className="grid grid-cols-7 gap-1">
            {/* Encabezados de días de la semana */}
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Días del calendario */}
            {calendarDays.map((dayData, index) => {
              if (!dayData) {
                return <div key={index} className="invisible" />;
              }

              const dayContent = (
                <div
                  className={`
                    aspect-square p-1 text-center text-sm border rounded-md cursor-pointer
                    ${
                      dayData.hasAttendance
                        ? dayData.isPresent
                          ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
                          : 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
                        : 'bg-muted/50 border-border text-muted-foreground'
                    }
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="font-medium">{dayData.day}</span>
                    {dayData.hasAttendance && (
                      <div className="text-xs mt-1">
                        {dayData.isPresent ? '✓' : '✗'}
                      </div>
                    )}
                  </div>
                </div>
              );

              if (dayData.hasAttendance && dayData.attendanceRecord) {
                const record = dayData.attendanceRecord;
                const time = record.attendance_time
                  ? formatTime(record.attendance_time)
                  : 'Hora no registrada';
                const notes = record.notes || 'Sin notas';

                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>{dayContent}</TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {record.present ? 'Presente' : 'Ausente'}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Hora:</span> {time}
                        </p>
                        {record.notes && (
                          <p className="text-sm">
                            <span className="font-medium">Notas:</span> {notes}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={index}>{dayContent}</div>;
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}