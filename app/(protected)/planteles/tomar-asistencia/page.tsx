'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Clock, Calendar as CalendarIcon, Scan, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';
import QrScanner from 'react-qr-barcode-scanner';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  matricula: string;
  grupo?: {
    id: string;
    name: string;
    period: {
      id: string;
      name: string;
    };
  };
}

interface AttendanceRecord {
  studentId: string;
  student: Student;
  present: boolean;
  timestamp: Date;
  grupo_name?: string;
}

export default function TomarAsistenciasPage() {
  const [matricula, setMatricula] = useState<string>('');
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [todayDate] = useState<Date>(new Date());
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isQrScannerReady, setIsQrScannerReady] = useState(false);

  // Cargar asistencias del día actual
  const loadTodayAttendance = async () => {
    try {
      const formattedDate = todayDate.toISOString().split('T')[0];
      // Este endpoint debería devolver todas las asistencias del día actual
      const response = await axiosInstance.get(`/teacher/attendance/today/${formattedDate}`);

      if (response.data.success && response.data.data) {
        const records: AttendanceRecord[] = response.data.data.map((record: any) => ({
          studentId: record.student_id,
          student: record.student,
          present: record.present,
          timestamp: new Date(record.updated_at),
          grupo_name: record.grupo?.name || 'Sin grupo',
        }));
        setTodayAttendance(records);
      }
    } catch (error) {
      console.error('Error loading today attendance:', error);
    }
  };

  // Manejar el resultado del QR scanner
  const handleQrScanResult = (err: unknown, result?: any) => {
    if (result) {
      const scannedText = result.getText ? result.getText() : result.text || result;
      if (scannedText) {
        const upperMatricula = scannedText.toUpperCase();
        setMatricula(upperMatricula);
        toast.success('QR escaneado correctamente', {
          description: `Matrícula detectada: ${scannedText}`,
        });
        // Procesar inmediatamente para permitir escaneos secuenciales
        processStudentAttendanceWithMatricula(upperMatricula);
      }
    }
    if (err) {
      console.error('QR Scanner Error:', err);
    }
  };

  // Abrir el QR scanner
  const openQrScanner = () => {
    setShowQrScanner(!showQrScanner);
    setIsQrScannerReady(false);
  };

  // Cerrar el QR scanner
  const closeQrScanner = () => {
    setShowQrScanner(false);
    setIsQrScannerReady(false);
  };

  const processStudentAttendance = async () => {
    if (!matricula.trim()) {
      toast.error('Ingresa una matrícula');
      return;
    }
    await processStudentAttendanceWithMatricula(matricula);
  };

  const processStudentAttendanceWithMatricula = async (studentMatricula: string) => {
    if (!studentMatricula.trim()) {
      toast.error('Matrícula vacía');
      return;
    }

    setIsLoading(true);
    try {
      // Buscar estudiante
      const studentResponse = await axiosInstance.get(`/teacher/student/${studentMatricula}`);

      if (!studentResponse.data.success) {
        toast.error('Estudiante no encontrado');
        setIsLoading(false);
        return;
      }

      const student = studentResponse.data.data;

      console.log(student)

      // Verificar si ya tiene asistencia hoy
      const existingAttendance = todayAttendance.find(record => record.studentId === student.id);

      if (existingAttendance) {
        toast.info(
          `${student.firstname} ${student.lastname} ya está marcado como ${existingAttendance.present ? 'PRESENTE' : 'AUSENTE'}`,
          {
            description: `Asistencia registrada a las ${existingAttendance.timestamp.toLocaleTimeString('es-ES')}`,
            duration: 4000,
          }
        );
        setMatricula('');
        if (!showQrScanner) {
          document.getElementById('matricula-input')?.focus();
        }
        setIsLoading(false);
        return;
      }

      const date = new Date();
      const isoString = date.toISOString();
      const dateFormatted = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const payload = {
        student_id: student.id,
        date: dateFormatted,
        present: true,
        attendance_time: isoString,
      };

      const attendanceResponse = await axiosInstance.post('/teacher/attendance/quick', payload);

      if (attendanceResponse.data.success) {
        // Actualizar la lista local
        const newRecord: AttendanceRecord = {
          studentId: student.id,
          student: student,
          present: true,
          timestamp: new Date(),
          grupo_name: student.grupo?.name || 'Sin grupo',
        };

        setTodayAttendance(prev => [newRecord, ...prev]);

        toast.success(
          `¡${student.firstname} ${student.lastname} PRESENTE!`,
          {
            description: `Grupo: ${student.grupo?.name || 'Sin grupo'} - ${isoString}`,
            duration: 3000,
          }
        );

        // Limpiar campo y auto-enfocar solo si no está el scanner abierto
        setMatricula('');
        if (!showQrScanner) {
          document.getElementById('matricula-input')?.focus();
        }
      }
    } catch (error: any) {
      console.error('Error processing attendance:', error);
      toast.error('Error al procesar asistencia');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar asistencias al montar el componente
  useEffect(() => {
    loadTodayAttendance();
    // Auto-enfocar el campo de matrícula
    document.getElementById('matricula-input')?.focus();
  }, []);

  // Buscar con Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processStudentAttendance();
    }
  };

  // Refrescar cada 30 segundos
  useEffect(() => {
    const interval = setInterval(loadTodayAttendance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manejar el escape para cerrar el QR scanner
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showQrScanner) {
        closeQrScanner();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showQrScanner]);

  const presentCount = todayAttendance.filter(record => record.present).length;
  const totalCount = todayAttendance.length;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-background dark:bg-background">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground dark:text-foreground">Tomar Asistencia</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground dark:text-muted-foreground">
          <CalendarIcon className="h-5 w-5" />
          <span className="text-lg">
            {todayDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Escáner principal */}
      <Card className="mb-8 bg-card dark:bg-card border-border dark:border-border">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-card-foreground dark:text-card-foreground">
            <Scan className="h-8 w-8" />
            Escáner de Matrícula
          </CardTitle>
          <p className="text-muted-foreground dark:text-muted-foreground">
            Ingresa la matrícula manualmente o escanea el código QR del estudiante
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 max-w-md mx-auto mb-4">
            {showQrScanner && (
              <div className=''>
                <div className="">
                  <Button
                    onClick={closeQrScanner}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="relative">
                  <QrScanner
                    onUpdate={handleQrScanResult}
                    onError={(error) => console.error('QR Scanner Error:', error)}
                    width="100%"
                    height={300}
                  />
                </div>
            
              </div>
            )}
            <Input
              id="matricula-input"
              placeholder="Ingresa matrícula y presiona Enter"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="flex-1 text-lg text-center"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button
              onClick={processStudentAttendance}
              disabled={isLoading || !matricula.trim()}
              size="lg"
            >
              {isLoading ? (
                <Clock className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Botón para abrir QR Scanner */}
          <div className="text-center">
            <Button
              onClick={openQrScanner}
              variant="outline"
              size="lg"
              className="bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800 dark:text-blue-100"
            >
              <Camera className="h-5 w-5 mr-2" />
              Activar la camara para escanear QR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-card dark:bg-card border-border dark:border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{presentCount}</div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">Presentes Hoy</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card dark:bg-card border-border dark:border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalCount}</div>
              <div className="text-sm text-muted-foreground dark:text-muted-foreground">Total Asistencias</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de asistencias del día */}
      {todayAttendance.length > 0 && (
        <Card className="bg-card dark:bg-card border-border dark:border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground dark:text-card-foreground">
              <User className="h-5 w-5" />
              Asistencias de Hoy ({todayAttendance.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {todayAttendance.map((record) => (
                <div
                  key={`${record.studentId}-${record.timestamp.getTime()}`}
                  className="flex items-center justify-between p-4 border border-border dark:border-border rounded-lg bg-muted/50 dark:bg-muted/50 hover:bg-muted dark:hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-foreground dark:text-foreground">
                      {record.student.firstname} {record.student.lastname}
                    </div>
                    <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Matrícula: {record.student.matricula || record.student.id}
                    </div>
                    <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Grupo: {record.grupo_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={record.present ? "default" : "destructive"}
                      className={`${record.present ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600" : ""} text-sm`}
                    >
                      {record.present ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          PRESENTE
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          AUSENTE
                        </>
                      )}
                    </Badge>
                    <div className="text-sm text-muted-foreground dark:text-muted-foreground text-right">
                      <div>{record.timestamp.toLocaleTimeString('es-ES')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay asistencias */}
      {todayAttendance.length === 0 && (
        <Card className="bg-card dark:bg-card border-border dark:border-border">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground dark:text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay asistencias registradas hoy</p>
              <p className="text-sm">Comienza escaneando la primera matrícula</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
