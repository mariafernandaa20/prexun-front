'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/api/axiosConfig';
import { Pencil } from 'lucide-react';

interface EditarFolioProps {
  transaction: Transaction;
  onSuccess: () => void;
}

export default function EditarFolio({ transaction, onSuccess }: EditarFolioProps) {
  const [open, setOpen] = useState(false);
  const [folio, setFolio] = useState(transaction.folio?.toString() || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Actualizar el folio de la transacción
      await axiosInstance.put(`/charges/${transaction.id}/update-folio`, {
        folio: parseInt(folio),
      });

      toast({
        title: 'Folio actualizado',
        description: `El folio se ha actualizado correctamente a ${folio}`,
        variant: 'default',
      });

      setOpen(false);
      onSuccess(); // Refrescar la lista de transacciones
    } catch (error) {
      console.error('Error al actualizar el folio:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el folio. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Editar folio">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Folio</DialogTitle>
          <DialogDescription>
            Actualiza el folio de la transacción de {transaction.student?.firstname} {transaction.student?.lastname}.
            Al actualizar el numero automaticamente se actualiza al nuevo formato. 
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-2 py-4">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="folio" className="text-right">
                Folio
              </Label>
              <Input
                id="folio"
                type="number"
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}