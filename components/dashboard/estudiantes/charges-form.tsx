'use client';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { createCharge, updateCharge } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';

interface ChargesFormProps {
  fetchStudents: () => void;
  student?: Student | null;
  campusId: number;
  student_id?: number;
  icon?: boolean;
  transaction?: Transaction;
  formData: Transaction;
  setFormData: (formData: Transaction) => void;
  onTransactionUpdate?: (transaction: Transaction) => void;
  mode?: 'create' | 'update';
}

export default function ChargesForm({
  fetchStudents,
  student,
  campusId,
  student_id,
  icon = false,
  transaction,
  formData,
  setFormData,
  onTransactionUpdate,
  mode = 'create'
}: ChargesFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const calculateDenominationsTotal = (denominations: Record<string, number>): number => {
    console.log(denominations);
    return Object.entries(denominations).reduce((total, [denomination, count]) => {
      console.log(denomination, count);
      return total + (Number(denomination) * (count || 0));
    }, 0);
  };

  const validateDenominations = (): boolean => {
    if (formData.payment_method === 'cash') {
      const denominationsTotal = Number(calculateDenominationsTotal(formData.denominations)).toFixed(2);
      const amount = Number(formData.amount).toFixed(2);
      
      if (denominationsTotal !== amount) {
        setErrors({
          ...errors,
          denominations: `El total de las denominaciones (${denominationsTotal}) debe ser igual al monto del pago (${amount})`
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateDenominations()) {
      return;
    }

    setLoading(true);

    try {
      const updatedTransaction = mode === 'create'
        ? await createCharge(formData)
        : await updateCharge({
          ...formData,
          denominations: formData.payment_method === 'cash' ? formData.denominations : null,
          paid: 1,
          payment_date: new Date().toISOString().split('T')[0],
        });

      setOpen(false);
      if (onTransactionUpdate) {
        onTransactionUpdate(updatedTransaction);
      }
      fetchStudents();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDenominationChange = (denomination: string, value: string) => {
    const newDenominations = {
      ...formData.denominations,
      [denomination]: parseInt(value) || 0,
    };

    setFormData({
      ...formData,
      denominations: newDenominations,
    });

    if (errors.denominations) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.denominations;
        return newErrors;
      });
    }
  };

  return (
    <>
      {icon ? (
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Receipt className="w-4 h-4" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          {mode === 'create' ? 'Crear Pago' : 'Registrar Pago'}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Registrar Nuevo Pago' : 'Registrar Pago'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student && (
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
              )}

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
                  <p className="text-red-500 text-sm">{errors.payment_method}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  rows={6}
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
                {errors.denominations && (
                  <p className="text-red-500 text-sm mt-2">{errors.denominations}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Total en denominaciones: ${calculateDenominationsTotal(formData.denominations)}
                </p>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Procesando...' : mode === 'create' ? 'Registrar Pago' : 'Registrar Pago'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

