'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  matricula: string;
}

interface AttendanceData {
  id?: string;
  student: Student;
  present: boolean;
  attendance_time: string | null;
  notes: string | null;
  date: string;
}

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceData: AttendanceData | null;
  onSave: (updatedAttendance: AttendanceData) => void;
}

export default function EditAttendanceModal({
  isOpen,
  onClose,
  attendanceData,
  onSave,
}: EditAttendanceModalProps) {
  const [isPresent, setIsPresent] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [attendanceTime, setAttendanceTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && attendanceData) {
      setIsPresent(attendanceData.present);
      setNotes(attendanceData.notes || '');

      // Formatear la hora para el input time
      if (attendanceData.attendance_time) {
        const time = new Date(attendanceData.attendance_time);
        const timeString = time.toTimeString().slice(0, 5); // HH:MM
        setAttendanceTime(timeString);
      } else {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5);
        setAttendanceTime(timeString);
      }
    }
  }, [isOpen, attendanceData]);

  const handleSave = async () => {
    if (!attendanceData?.id) {
      toast.error('No se puede actualizar: falta ID de asistencia');
      return;
    }

    setIsLoading(true);

    try {
      // Construir datetime completo
      const today = attendanceData.date;
      const fullDateTime = attendanceTime
        ? `${today}T${attendanceTime}:00`
        : null;

      const payload = {
        present: isPresent,
        notes: notes.trim() || null,
        attendance_time: fullDateTime,
      };

      const response = await axiosInstance.put(
        `/teacher/attendance/${attendanceData.id}`,
        payload
      );

      if (response.data.success) {
        const updatedAttendance: AttendanceData = {
          ...attendanceData,
          present: isPresent,
          notes: notes.trim() || null,
          attendance_time: fullDateTime,
        };

        onSave(updatedAttendance);

        toast.success('Asistencia actualizada', {
          description: `${attendanceData.student.firstname} ${attendanceData.student.lastname} - ${isPresent ? 'Presente' : 'Ausente'}`,
          duration: 3000,
        });

        onClose();
      }
    } catch (error: any) {
      console.error('Error updating attendance:', error);
      toast.error('Error al actualizar asistencia', {
        description: 'No se pudo guardar los cambios. Intenta nuevamente.',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!attendanceData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Asistencia
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del estudiante */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-semibold text-lg">
              {attendanceData.student.firstname}{' '}
              {attendanceData.student.lastname}
            </div>
            <div className="text-sm text-gray-600">
              Matrícula:{' '}
              {attendanceData.student.matricula || attendanceData.student.id}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {new Date(attendanceData.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Estado de asistencia */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Estado de Asistencia
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attendance-status"
                checked={isPresent}
                onCheckedChange={(checked) => setIsPresent(checked as boolean)}
              />
              <Label
                htmlFor="attendance-status"
                className="flex items-center gap-2 cursor-pointer"
              >
                {isPresent ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Presente</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">Ausente</span>
                  </>
                )}
              </Label>
            </div>
          </div>

          {/* Hora de llegada */}
          {isPresent && (
            <div className="space-y-2">
              <Label
                htmlFor="attendance-time"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Hora de Llegada
              </Label>
              <Input
                id="attendance-time"
                type="time"
                value={attendanceTime}
                onChange={(e) => setAttendanceTime(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas
            </Label>
            <Textarea
              id="notes"
              placeholder="Agregar comentarios... (ej: llegó tarde, justificó falta, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {notes.length}/500 caracteres
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Clock className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
