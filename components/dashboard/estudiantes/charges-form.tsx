'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Receipt } from 'lucide-react';
import { Student, Transaction } from '@/lib/types';
import { createCharge } from '@/lib/api';

export default function ChargesForm({ student }: { student: Student }) {
  const [formData, setFormData] = useState<Transaction>({
    student_id: Number(student.id),
    amount: 0,
    payment_method: 'cash',
    denominations: {},
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await createCharge(formData);
      setOpen(false);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDenominationChange = (denomination: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      denominations: {
        ...prev.denominations,
        [denomination]: parseInt(value) || 0,
      },
    }));
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Receipt className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Pago</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estudiante</Label>
                <Input
                  type="text"
                  value={`${student.firstname} ${student.lastname}`}
                  disabled
                />
                {errors.student_id && (
                  <p className="text-red-500 text-sm">{errors.student_id}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Deuda actual</Label>
                <Input type="text" value={student.period.price} disabled />
                {errors.student_id && (
                  <p className="text-red-500 text-sm">{errors.student_id}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  required
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      payment_method: value as 'cash' | 'transfer' | 'card',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-red-500 text-sm">
                    {errors.payment_method}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            {formData.payment_method === 'cash' && (
              <div className="space-y-2">
                <Label>Denominaciones</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['1000', '500', '200', '100', '50', '20', '10', '5'].map(
                    (denom) => (
                      <div key={denom} className="space-y-1">
                        <Label>${denom}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.denominations[denom] || ''}
                          onChange={(e) =>
                            handleDenominationChange(denom, e.target.value)
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Procesando...' : 'Registrar Pago'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
