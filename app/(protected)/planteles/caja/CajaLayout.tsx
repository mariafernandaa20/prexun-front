'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Caja, Denomination } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';

interface FormData {
  denominations: Denomination;
  next_day_cash: Denomination;
}

function calculateDenominationsTotal(denominations: Denomination): number {
  return Object.entries(denominations).reduce((total, [denom, count]) => {
    return total + Number(denom) * (Number(count) || 0);
  }, 0);
}


export default function CajaLayout({
  children,
  caja,
  onOpen,
  onClose,
  actualAmount,
  isReadOnly = false,
}: {
  children: React.ReactNode;
  caja: Caja | null;
  onOpen: (
    initialAmount: number,
    initialAmountCash: Denomination,
    notes: string
  ) => Promise<void>;
  onClose: (
    finalAmount: number,
    finalAmountCash: Denomination,
    next_day: number,
    next_day_cash: Denomination,
    notes: string
  ) => Promise<void>;
  actualAmount: number;
  isReadOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [notes, setNotes] = useState('');

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      denominations: {
        '1000': 0,
        '500': 0,
        '200': 0,
        '100': 0,
        '50': 0,
        '20': 0,
        '10': 0,
        '5': 0,
        '2': 0,
        '1': 0,
      },
      next_day_cash: {
        '1000': 0,
        '500': 0,
        '200': 0,
        '100': 0,
        '50': 0,
        '20': 0,
        '10': 0,
        '5': 0,
        '2': 0,
        '1': 0,
      },
    },
  });

  const formData = watch();

  const handleOpenCaja = async () => {
    const denominationsTotal = calculateDenominationsTotal(
      formData.denominations
    );

    await onOpen(Number(denominationsTotal), formData.denominations, notes);
    setOpen(false);
    setInitialAmount('');
    setNotes('');

    // if (typeof window !== 'undefined') {
    //   window.location.reload();
    // }
  };

  const handleCloseCaja = async () => {
    const denominationsTotal = calculateDenominationsTotal(
      formData.denominations
    );
    const nextDayTotal = calculateDenominationsTotal(formData.next_day_cash);

    // Validación para cierre de caja - debe coincidir con el efectivo actual
    const tolerance = 0.01; // Tolerancia de 1 centavo para diferencias de redondeo
    if (Math.abs(denominationsTotal - actualAmount) > tolerance) {
      const difference = denominationsTotal - actualAmount;
      const message = difference > 0
        ? `Hay un sobrante de ${formatCurrency(Math.abs(difference))}`
        : `Falta ${formatCurrency(Math.abs(difference))}`;

      const confirmed = confirm(`${message}. El monto total de denominaciones (${formatCurrency(denominationsTotal)}) no coincide exactamente con el efectivo disponible en caja (${formatCurrency(actualAmount)}). ¿Desea continuar con el cierre?`);

      if (!confirmed) {
        return;
      }
    }

    await onClose(
      Number(denominationsTotal),
      formData.denominations,
      nextDayTotal,
      formData.next_day_cash,
      notes
    );
    setOpen(false);
    setFinalAmount('');
    setNotes('');

    // if (typeof window !== 'undefined') {
    //   window.location.reload();
    // }
  };

  const handleDenominationChange = (denomination: string, value: string) => {
    const newDenominations = {
      ...formData.denominations,
      [denomination]: Number(value) || 0,
    };
    setValue('denominations', newDenominations);
  };
  const handleNextDayDenominationChange = (
    denomination: string,
    value: string
  ) => {
    const newDenominations = {
      ...formData.next_day_cash,
      [denomination]: Number(value) || 0,
    };
    setValue('next_day_cash', newDenominations);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{caja ? 'Cerrar Caja' : 'Abrir Caja'}</DialogTitle>
            <DialogDescription>
              {caja
                ? 'Ingrese el monto final y notas para cerrar la caja'
                : 'No es necesario ingresar el monto inicial, el monto inicial se define al cerrar la caja y se agrega automaticamente, si lo desea puede remplazarlo manualmente.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-4">
            <div>
              <Label htmlFor="amount" className="text-right text-lg">
                Monto {caja ? 'Final' : 'Inicial'}
              </Label>
              <div className="space-y-2 col-span-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    '1000',
                    '500',
                    '200',
                    '100',
                    '50',
                    '20',
                    '10',
                    '5',
                    '2',
                    '1',
                  ].map((denom) => (
                    <div key={denom} className="space-y-1">
                      <Label>${denom}</Label>
                      <Input
                        type="number"
                        {...register(`denominations.${denom}` as any, {
                          valueAsNumber: true,
                          setValueAs: (v) => Number(v) || 0,
                        })}
                      />

                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="text-white"> Total en denominaciones:</span>{' '}
                  {formatCurrency(
                    calculateDenominationsTotal(formData.denominations)
                  )}
                </p>
                {caja && (
                  <p className="col-span-4 text-sm text-gray-500">
                    <span className="text-white"> Monto actual en caja:</span>{' '}
                    {formatCurrency(actualAmount)}
                  </p>
                )}
              </div>
            </div>
            {caja && (
              <>
                <div>
                  <Label htmlFor="amount" className="text-right text-lg">
                    Siguiente día
                  </Label>
                  <div className="space-y-2 col-span-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        '1000',
                        '500',
                        '200',
                        '100',
                        '50',
                        '20',
                        '10',
                        '5',
                        '2',
                        '1',
                      ].map((denom) => (
                        <div key={denom} className="space-y-1">
                          <Label>${denom}</Label>
                          <Input
                            type="number"
                            {...register(`next_day_cash.${denom}` as any, {
                              valueAsNumber: true,
                              setValueAs: (v) => Number(v) || 0,
                            })}
                          />

                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Total en denominaciones: $
                      {calculateDenominationsTotal(formData.next_day_cash)}
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-right">
                    Notas
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={caja ? handleCloseCaja : handleOpenCaja}>
              {caja ? 'Cerrar Caja' : 'Abrir Caja'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div>
        <div>
          <div className="flex items-center justify-end px-6">
            {!isReadOnly && (
              <Button onClick={() => setOpen(true)}>
                {caja ? 'Cerrar Caja' : 'Abrir Caja'}
              </Button>
            )}
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
