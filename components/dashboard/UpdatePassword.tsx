import React, { useState } from 'react';
import { Button } from '../ui/button';
import { KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { updateStudentPassword } from '@/lib/api/studentApi';
import { toast } from '@/hooks/use-toast';

interface UpdatePasswordProps {
  studentId: number;
}

export default function UpdatePassword({ studentId }: UpdatePasswordProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await updateStudentPassword(studentId, password);

      if (response.message) {
        toast({
          title: 'Contraseña actualizada',
          description:
            'La contraseña de Moodle ha sido actualizada correctamente.',
        });
        setOpen(false);
        setPassword('');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Error al actualizar la contraseña.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Cambiar Contraseña Moodle">
          <KeyRound className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizar Contraseña de Moodle</DialogTitle>
          <div className="text-sm text-gray-500">
            Esto cambiará la contraseña del estudiante directamente en Moodle.
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || password.length < 6}
          >
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
