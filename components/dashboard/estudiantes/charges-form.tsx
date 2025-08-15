'use client';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Receipt } from 'lucide-react';
import { Card, Student, Transaction } from '@/lib/types';
import { createCharge, updateCharge } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { Input } from '@/components/ui/input';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface Debt {
  id: number;
  student_id: number;
  concept: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  description?: string;
}

interface ChargesFormProps {
  fetchStudents: () => void;
  student?: Student | null;
  cards: Card[];
  campusId?: number;
  student_id?: number;
  icon?: boolean;
  transaction?: Transaction;
  formData: Transaction;
  setFormData: (formData: Transaction) => void;
  onTransactionUpdate?: (transaction: Transaction) => void;
  mode?: 'create' | 'update';
  debt?: Debt | null;
  buttonText?: string;
  title?: string;
}

export default function ChargesForm({
  fetchStudents,
  cards,
  student,
  campusId,
  student_id,
  icon = false,
  transaction,
  formData,
  setFormData,
  onTransactionUpdate,
  mode = 'create',
  debt = null,
  buttonText,
  title
}: ChargesFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [localFormData, setLocalFormData] = useState<Transaction>(formData);

  const activeCampus = useActiveCampusStore((state) => state.activeCampus);

  const currentCampusId = campusId || activeCampus?.id || 0;

  const { SAT } = useFeatureFlags();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  useEffect(() => {
    if (debt && open) {
      const updatedData = {
        ...localFormData,
        amount: debt.remaining_amount,
        notes: localFormData.notes || `Pago para adeudo: ${debt.concept}`
      };
      setLocalFormData(updatedData);
      if (setFormData) {
        setFormData(updatedData);
      }
    }
  }, [debt, open]);

  useEffect(() => {
    setLocalFormData(formData);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    setLoading(true);

    try {
      const submitData = debt ? {
        ...localFormData,
        campus_id: currentCampusId,
        debt_id: debt.id,
        transaction_type: 'income'
      } : {
        ...localFormData,
        campus_id: currentCampusId
      };

      const updatedTransaction = mode === 'create'
        ? await createCharge(submitData)
        : await updateCharge({
          ...submitData,
          denominations: null,
          paid: 1,
          cash_register_id: activeCampus.latest_cash_register.id,
          payment_date: localFormData.payment_date,
          image: localFormData.image,
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

  const updateFormData = (updates: Partial<Transaction>) => {
    const updatedData = { ...localFormData, ...updates };
    setLocalFormData(updatedData);
    if (setFormData) {
      setFormData(updatedData);
    }
  };

  return (
    <>
      {
        activeCampus?.latest_cash_register ? icon ? (
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Receipt className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant='secondary' onClick={() => setOpen(true)}>
            {buttonText || (mode === 'create' ? 'Crear Pago' : 'Pagar')}
          </Button>
        ) : null
      }


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {title || (mode === 'create' ? 'Registrar Nuevo Pago' : 'Registrar Pago')}
            </DialogTitle>
          </DialogHeader>

          {/* Información del adeudo si existe */}
          {debt && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-neutral-900 rounded-lg border">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Información del Adeudo</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 font-bold">Concepto:</span>
                  <p className="font-medium text-gray-500">{debt.concept}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-bold">Monto Total:</span>
                  <p className="font-medium text-gray-500">{formatCurrency(debt.total_amount)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Pagado:</span>
                  <p className="font-medium text-green-600">{formatCurrency(debt.paid_amount)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Pendiente:</span>
                  <p className="font-medium text-red-600">{formatCurrency(debt.remaining_amount)}</p>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Fecha de pago</Label>
                <Input
                  type="date"
                  value={localFormData.payment_date}
                  onChange={(e) =>
                    updateFormData({ payment_date: e.target.value })
                  }
                  required
                />
                {errors.payment_date && (
                  <p className="text-red-500 text-sm">{errors.payment_date}</p>
                )}
              </div>
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
                  step="0.01"
                  value={localFormData.amount}
                  onChange={(e) =>
                    updateFormData({ amount: Number(e.target.value) })
                  }
                  max={debt?.remaining_amount}
                  required
                />
                {debt && (
                  <p className="text-xs text-gray-500">
                    Máximo disponible: {formatCurrency(debt.remaining_amount)}
                  </p>
                )}
                {errors.amount && (
                  <p className="text-red-500 text-sm">{errors.amount}</p>
                )}
              </div>



              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select
                  value={localFormData.payment_method}
                  onValueChange={(value) => {
                    console.log(value);
                    updateFormData({
                      payment_method: value as 'cash' | 'transfer' | 'card',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-red-500 text-sm">{errors.payment_method}</p>
                )}
              </div>
              {localFormData.payment_method === 'transfer' &&
                (
                  <div className="space-y-2">
                    <Label>Comprobante</Label>
                    <Input
                      type='file'
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        console.log('File selected:', file);
                        updateFormData({ image: file });
                      }}
                    />
                  </div>
                )}
              {localFormData.payment_method === 'transfer' && (
                <div className="space-y-2">
                  <Label>Tarjeta</Label>
                  <Select
                    value={localFormData.card_id}
                    onValueChange={(value) =>
                      updateFormData({
                        card_id: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cards
                        .filter(card => {
                          // Filtrar por campus - solo mostrar tarjetas del campus activo
                          const campusMatch = card.campus_id === currentCampusId;
                          // Filtrar por SAT si está habilitado (feature flag)
                          const satMatch = !SAT || card.sat;
                          return campusMatch && satMatch;
                        })
                        .map(card => (
                          <SelectItem key={card.id} value={card.id.toString()}>
                            <span className='flex items-center gap-2'>
                              {card.sat ? (
                                <div className='text-green-500 bg-green-500 rounded-full size-2 pr-2' />
                              ) : (
                                <div className='text-red-500 bg-red-500 rounded-full size-2 pr-2' />
                              )}
                              {card.name}
                            </span>
                            {card.number} <br /> {card.clabe}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  rows={6}
                  value={localFormData.notes}
                  onChange={(e) =>
                    updateFormData({ notes: e.target.value })
                  }
                />
              </div>
            </div>

            {/* {localFormData.payment_method === 'cash' && (
              <div className="space-y-2">
                <Label>Denominaciones</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['1000', '500', '200', '100', '50', '20', '10', '5'].map(
                    (denom) => (
                      <div key={denom} className="space-y-1">
                        <Label>${denom}</Label>
                        <Input
                          type="number"
                          value={localFormData.denominations[denom] || ''}
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
                  Total en denominaciones: ${localFormData.denominations && typeof localFormData.denominations === 'object' && !Array.isArray(localFormData.denominations) ? calculateDenominationsTotal(localFormData.denominations) : 0}
                </p>
              </div>
            )} */}

            <Button type="submit" disabled={loading}>
              {loading ? 'Procesando...' : (debt ? 'Registrar Pago de Adeudo' : (mode === 'create' ? 'Registrar Pago' : 'Registrar Pago'))}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

