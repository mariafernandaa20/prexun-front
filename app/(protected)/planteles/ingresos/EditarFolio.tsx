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
import { useAuthStore } from '@/lib/store/auth-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditarFolioProps {
  transaction: Transaction;
  onSuccess: () => void;
}

export default function EditarFolio({
  transaction,
  onSuccess,
}: EditarFolioProps) {
  const [open, setOpen] = useState(false);
  const [folio, setFolio] = useState(transaction.folio?.toString() || '');
  const [amount, setAmount] = useState(
    transaction.amount !== undefined && transaction.amount !== null
      ? String(transaction.amount)
      : ''
  );
  const [paymentMethod, setPaymentMethod] = useState(
    transaction.payment_method || 'cash'
  );
  const { user } = useAuthStore();
  const [paymentDate, setPaymentDate] = useState(() => {
    if (!transaction.payment_date) return '';
    const date = new Date(transaction.payment_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

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
  const handleSubmitAmount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsedAmount = Number(amount);

      await axiosInstance.put(`/charges/${transaction.id}`, {
        amount: parsedAmount,
      });

      toast({
        title: 'Monto actualizado',
        description: `El monto se actualizó correctamente a ${amount}`,
        variant: 'default',
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar el monto:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el monto. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.put(`/charges/${transaction.id}`, {
        payment_date: paymentDate ? `${paymentDate} 12:00:00` : null,
      });

      toast({
        title: 'Fecha actualizada',
        description: `La fecha de pago se actualizó correctamente.`,
        variant: 'default',
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar la fecha:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la fecha.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.put(`/charges/${transaction.id}`, {
        payment_method: paymentMethod,
      });

      toast({
        title: 'Método de pago actualizado',
        description: `El método de pago se actualizó correctamente.`,
        variant: 'default',
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar el método de pago:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el método de pago.',
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
            Actualiza el folio de la transacción de{' '}
            {transaction.student?.firstname} {transaction.student?.lastname}. Al
            actualizar el numero automaticamente se actualiza al nuevo formato.
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

        {(user?.role === 'super_admin' ||
          user?.role === 'contador' ||
          user?.role === 'contadora') && (
          <form onSubmit={handleSubmitPaymentMethod}>
            <div className="grid gap-2 py-4 border-t">
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="payment_method" className="text-right">
                  Método Pago
                </Label>
                <div className="col-span-3">
                  <Select
                    value={paymentMethod}
                    onValueChange={(val) => setPaymentMethod(val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar método'}
              </Button>
            </DialogFooter>
          </form>
        )}
        <form onSubmit={handleSubmitDate}>
          <div className="grid gap-2 py-4 border-t mt-4">
            {' '}
            {/* Agregué un borde para separar */}
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="payment_date" className="text-right">
                Fecha Pago
              </Label>
              <Input
                id="payment_date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar fecha'}
            </Button>
          </DialogFooter>
        </form>
        <form onSubmit={handleSubmitAmount}>
          <div className="grid gap-2 py-4">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="amount" className="text-right">
                Monto
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar monto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
