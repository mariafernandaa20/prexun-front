'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';

interface User {
  id: string;
  name: string;
  email: string;
}

interface ChecadorRecord {
  id: string;
  user_id: string;
  work_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  status: 'present' | 'on_break' | 'back_from_break' | 'checked_out' | 'rest_day' | 'absent';
  break_start_at: string | null;
  break_end_at: string | null;
  break_duration: number | null;
  hours_worked: number | null;
  is_complete_day: boolean;
  user: User;
}

interface DailyReportResponse {
  success: boolean;
  data: ChecadorRecord[];
}

export default function ReportesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<ChecadorRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDailyReport = async (date: Date) => {
    try {
      setLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await axiosInstance.get(`/chat/checador/daily-report?date=${formattedDate}`);
      
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setReportData([]);
        toast.error('No se pudieron cargar los datos del reporte');
      }
    } catch (error: any) {
      console.error('Error fetching daily report:', error);
      setReportData([]);
      toast.error('Error al cargar el reporte diario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReport(selectedDate);
  }, [selectedDate]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { label: 'Normal', color: ' text-white' },
      on_break: { label: 'En Descanso', color: 'text-yellow-800' },
      back_from_break: { label: 'De Vuelta', color: 'text-blue-800' },
      checked_out: { label: 'Salió', color: 'text-gray-800' },
      rest_day: { label: 'Día de Descanso', color: 'text-purple-800' },
      absent: { label: 'Ausente', color: 'text-white' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.absent;
    return <span className={config.color}>{config.label}</span>;
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBreakInfo = (record: ChecadorRecord) => {
    if (!record.break_start_at || !record.break_end_at) {
      return '-';
    }

    const startTime = formatTime(record.break_start_at);
    const endTime = formatTime(record.break_end_at);
    const duration = record.break_duration || 0;

    return (
      <div className="text-xs">
        <div className="mb-1">
          <span>{startTime} - {endTime}</span>
        </div>
        <div className="text-gray-500">
          ({duration} min)
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Reporte del Checador</h1>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-row gap-4 items-center">
          <div>
            <label className="text-sm font-medium mb-2 block">Seleccionar Fecha:</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                }
              }}
              className="rounded-md border"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Cargando reporte...</p>
          </div>
        ) : (
          <>
            {reportData.length > 0 ? (
              <div className="overflow-x-auto overflow-y-visible">
                <Table className="w-full min-w-[800px] text-sm border rounded-lg border-separate" style={{borderSpacing: '2px'}}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-3 px-3 min-w-[120px]">Usuario</TableHead>
                      <TableHead className="py-3 px-8 min-w-[100px]">Estado</TableHead>
                      <TableHead className="py-3 px-4 min-w-[110px]">Hora Entrada</TableHead>
                      <TableHead className="py-3 px-4 min-w-[110px]">Hora Salida</TableHead>
                      <TableHead className="py-3 px-4 min-w-[100px]">Descanso</TableHead>
                      <TableHead className="py-3 px-4 min-w-[130px]">Horas Trabajadas</TableHead>
                      <TableHead className="py-3 px-4 min-w-[110px]">Día Completo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="py-3 px-4 font-medium min-w-[120px]">
                          {record.user.name}
                        </TableCell>
                        <TableCell className="py-3 px-8 min-w-[100px]">
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell className="py-3 px-4 min-w-[110px]">
                          {record.check_in_at ? formatTime(record.check_in_at) : '-'}
                        </TableCell>
                        <TableCell className="py-3 px-4 min-w-[110px]">
                          {record.check_out_at ? formatTime(record.check_out_at) : '-'}
                        </TableCell>
                        <TableCell className="py-3 px-4 min-w-[100px]">
                          {formatBreakInfo(record)}
                        </TableCell>
                        <TableCell className="py-3 px-4 min-w-[130px]">
                          {record.hours_worked
                            ? Number(record.hours_worked).toFixed(2)
                            : '0.00'} hrs
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          {record.is_complete_day ? (
                            <Badge className="text-white">Sí</Badge>
                          ) : (
                            <Badge className="text-white">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay registros de asistencia para la fecha seleccionada.</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => fetchDailyReport(selectedDate)}
                disabled={loading}
              >
                Actualizar Reporte
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
