import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/api/axiosConfig';

interface SendTemplateDialogProps {
  selectedStudents: string[];
  setIsBulkActionLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SendTemplateDialog: React.FC<SendTemplateDialogProps> = ({
  selectedStudents,
  setIsBulkActionLoading,
}) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/whatsapp/templates');
      if (response.data.success) {
        setTemplates(response.data.data);
      } else {
      }
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };
  // TODO: Implementar función para enviar plantilla
  const handleSendTemplate = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: 'Error',
        description: 'Seleccione una plantilla',
        variant: 'destructive',
      });
      return;
    }

    if (
      !confirm(
        `¿Está seguro de enviar la plantilla a ${selectedStudents.length} estudiante(s)?`
      )
    ) {
      return;
    }

    try {
      setIsBulkActionLoading(true);

      // TODO: Implementar llamada a la API para enviar plantilla
      // await sendTemplateToStudents(selectedTemplate, selectedStudents);

      // Simulación temporal
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: 'Plantilla enviada',
        description: `Plantilla enviada exitosamente a ${selectedStudents.length} estudiante(s)`,
      });

      setIsOpen(false);
      setSelectedTemplate('');
    } catch (error: any) {
      toast({
        title: 'Error al enviar plantilla',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const selectedTemplateName = templates.find(
    (t) => t.id === selectedTemplate
  )?.name;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={selectedStudents.length === 0} variant="outline">
          <Send className="mr-2 h-4 w-4" />
          Enviar Plantilla
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Plantilla de WhatsApp</DialogTitle>
          <DialogDescription>
            Selecciona una plantilla para enviar a {selectedStudents.length}{' '}
            estudiante(s) seleccionado(s).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="template-select">Plantilla</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoading
                      ? 'Cargando plantillas...'
                      : 'Selecciona una plantilla'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))
                ) : (
                  <div>No hay plantillas disponibles</div>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Si no ves plantillas, ve a la sección "Gestionar Plantillas".
            </p>
          </div>

          {selectedTemplateName && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Plantilla seleccionada:</p>
              <p className="text-sm text-muted-foreground">
                {selectedTemplateName}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSendTemplate}
            disabled={!selectedTemplate || isLoading}
            className="w-full sm:w-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar a {selectedStudents.length} estudiante(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendTemplateDialog;
