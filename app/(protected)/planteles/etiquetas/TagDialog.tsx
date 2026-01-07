'use client';
import React, { useState, useEffect } from 'react';
import { tagsService, Tag } from '@/app/services/tags';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
  campusId?: number;
  onSuccess: () => void;
}

export default function TagDialog({
  open,
  onOpenChange,
  tag,
  campusId,
  onSuccess,
}: TagDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000'); // Estado para el color
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color || '#000000'); // Cargar color existente
    } else {
      setName('');
      setColor('#000000'); // Resetear color
    }
  }, [tag, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es requerido',
        variant: 'destructive',
      });
      return;
    }

    if (!tag && !campusId) {
      toast({
        title: 'Error',
        description: 'No se ha seleccionado un campus',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (tag) {
        await tagsService.updateTag(tag.id, { 
          name: name.trim(),
          color: color // Enviar color
        });
        toast({
          title: 'Éxito',
          description: 'Etiqueta actualizada correctamente',
        });
      } else {
        await tagsService.createTag({
          campus_id: campusId!,
          name: name.trim(),
          color: color, // Enviar color
        });
        toast({
          title: 'Éxito',
          description: 'Etiqueta creada correctamente',
        });
      }
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Error al guardar la etiqueta',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tag ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Becado, Destacado, Seguimiento..."
                disabled={isSubmitting}
              />
            </div>

            {/* Selector de Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                  disabled={isSubmitting}
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                  maxLength={7}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}