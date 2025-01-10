'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Caja, Denomination } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useForm } from 'react-hook-form'

interface FormData {
  denominations: Denomination;
}

function calculateDenominationsTotal(denominations: Denomination): number {
  return Object.entries(denominations).reduce((total, [denom, count]) => {
    return total + Number(denom) * count;
  }, 0);
}

export default function CajaLayout({ children, caja, onOpen, onClose }: {
  children: React.ReactNode
  caja: Caja | null
  onOpen: (initialAmount: number, initialAmountCash: Denomination, notes: string) => Promise<void>
  onClose: (finalAmount: number, finalAmountCash: Denomination, notes: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [initialAmount, setInitialAmount] = useState('')
  const [finalAmount, setFinalAmount] = useState('')
  const [notes, setNotes] = useState('')

  const { register, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      denominations: {
        '1000': 0, '500': 0, '200': 0, '100': 0,
        '50': 0, '20': 0, '10': 0, '5': 0
      }
    }
  });

  const formData = watch();

  const handleOpenCaja = async () => {
    await onOpen(Number(calculateDenominationsTotal(formData.denominations)), formData.denominations, notes);
    setOpen(false);
    setInitialAmount('');
    setNotes('');

    //if (typeof window !== 'undefined') {
    //  window.location.reload();
    //}
  };

  const handleCloseCaja = async () => {
    await onClose(Number(calculateDenominationsTotal(formData.denominations)), formData.denominations, notes);
    setOpen(false);
    setFinalAmount('');
    setNotes('');

    //if (typeof window !== 'undefined') {
    //  window.location.reload();
    //}
  };

  const handleDenominationChange = (denomination: string, value: string) => {
    const newDenominations = {
      ...formData.denominations,
      [denomination]: Number(value) || 0,
    };
    setValue('denominations', newDenominations);
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
                : 'Ingrese el monto inicial y notas para abrir la caja'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto {caja ? 'Final' : 'Inicial'}
              </Label>
              <div className="space-y-2 col-span-3">
                <Label>Denominaciones</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['1000', '500', '200', '100', '50', '20', '10', '5'].map(
                    (denom) => (
                      <div key={denom} className="space-y-1">
                        <Label>${denom}</Label>
                        <Input
                          type="number"
                          value={formData.denominations[denom] || ''}
                          onChange={(e) =>
                            handleDenominationChange(denom, e.target.value)
                          }
                        />
                      </div>
                    )
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Total en denominaciones: ${calculateDenominationsTotal(formData.denominations)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto Total
              </Label>
              <Input
                id="amount"
                value={caja ? finalAmount : initialAmount}
                onChange={(e) =>
                  caja
                    ? setFinalAmount(e.target.value)
                    : setInitialAmount(e.target.value)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notas
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={caja ? handleCloseCaja : handleOpenCaja}
            >
              {caja ? 'Cerrar Caja' : 'Abrir Caja'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-end px-6'>
            <Button onClick={() => setOpen(true)}>
              {caja ? 'Cerrar Caja' : 'Abrir Caja'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

