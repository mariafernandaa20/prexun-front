'use client';

import React, { useState } from 'react';
import { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Send, User, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';

interface WhatsAppMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function WhatsAppMessageModal({
  isOpen,
  onClose,
  student,
}: WhatsAppMessageModalProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!student?.phone) {
      toast.error('El estudiante no tiene número de teléfono');
      return;
    }

    if (!customMessage.trim()) {
      toast.error('Por favor escribe un mensaje');
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post('/whatsapp/send-message', {
        phone_number: student.phone,
        message: customMessage,
      });

      toast.success('Mensaje enviado correctamente');
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCustomMessage('');
    onClose();
  };

  const formatPhoneNumber = (phone: string) => {
    // Formatear el número de teléfono para mostrar
    if (phone.startsWith('52')) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
    }
    return phone;
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaWhatsapp className="h-5 w-5 text-green-600" />
            Enviar Mensaje WhatsApp
          </DialogTitle>
        </DialogHeader>

        {/* Información del estudiante */}
        <div className="bg-gray-50 dark:bg-neutral-900 p-4 rounded-lg mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="font-medium">
                {student.firstname} {student.lastname}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-600" />
              <span className="text-sm">
                {formatPhoneNumber(student.phone || 'Sin teléfono')}
              </span>
            </div>
            {student.email && (
              <Badge variant="outline" className="text-xs w-fit">
                {student.email}
              </Badge>
            )}
          </div>
        </div>

        {/* Mensaje personalizado */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mensaje Personalizado
            </label>
            <Textarea
              placeholder={`Hola ${student.firstname}, ...`}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Vista previa del mensaje */}
          {customMessage.trim() && (
            <div className="bg-green-50 dark:bg-neutral-900 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FaWhatsapp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Vista Previa
                </span>
              </div>
              <div className="bg-white dark:bg-neutral-950 p-3 rounded-lg border text-sm">
                {customMessage}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !customMessage.trim()}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            Enviar Mensaje
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
