'use client';
import React, { useState, useEffect } from 'react';
import { createCaja, getCurrentCaja } from '@/lib/api';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Caja } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const DENOMINATIONS = [
  { value: 1000, label: '$1000' },
  { value: 500, label: '$500' },
  { value: 200, label: '$200' },
  { value: 100, label: '$100' },
  { value: 50, label: '$50' },
  { value: 20, label: '$20' },
  { value: 10, label: '$10' },
  { value: 5, label: '$5' },
  { value: 2, label: '$2' },
  { value: 1, label: '$1' },
  { value: 0.5, label: '50¢' },
];

interface Denomination {
  value: number;
  quantity: number;
}

export default function Page() {
  const [currentCashCut, setCurrentCashCut] = useState<Caja | null>(
    {amount: 1000,}
  );
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [denominations, setDenominations] = useState<Denomination[]>(
    DENOMINATIONS.map(d => ({ value: d.value, quantity: 0 }))
  );
  const [totalAmount, setTotalAmount] = useState(0);
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);

  const [formData, setFormData] = useState<Caja>({
    id: undefined,
    amount: 1000,
    campus_id: activeCampus?.id || 0,
    created_at: '',
    updated_at: '',
    final_amount: 0,
    real_amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchCurrentCashCut = async () => {
      if (activeCampus?.id) {
        const currentCut = await getCurrentCaja(activeCampus.id);
        setCurrentCashCut(currentCut);
      }
    };
    fetchCurrentCashCut();
  }, [activeCampus]);

  useEffect(() => {
    const total = denominations.reduce((sum, d) => sum + (d.value * d.quantity), 0);
    setTotalAmount(total);
    setFormData(prev => ({ ...prev, amount: total }));
  }, [denominations]);

  const handleDenominationChange = (value: number, quantity: string) => {
    setDenominations(prev => 
      prev.map(d => 
        d.value === value ? { ...d, quantity: parseInt(quantity) || 0 } : d
      )
    );
  };

  const handleOpenCashbox = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCashCut = await createCaja({
        ...formData,
        denominations: denominations,
      });
      setCurrentCashCut(newCashCut);
      setOpenModal(false);
    } catch (error) {
      console.error('Error al abrir caja:', error);
    }
  };

  const handleCloseCashbox = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aquí iría la llamada a la API para cerrar la caja
      const finalAmount = totalAmount;
      const updatedCashCut = {
        ...currentCashCut,
        final_amount: finalAmount,
        real_amount: totalAmount,
      };
      // await closeCaja(updatedCashCut);
      setCurrentCashCut(null);
      setCloseModal(false);
    } catch (error) {
      console.error('Error al cerrar caja:', error);
    }
  };

  const DenominationsTable = ({ onDenominationChange }: { onDenominationChange: (value: number, quantity: string) => void }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Denominación</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Subtotal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {denominations.map((d) => (
          <TableRow key={d.value}>
            <TableCell>{DENOMINATIONS.find(den => den.value === d.value)?.label}</TableCell>
            <TableCell>
              <Input
                type="number"
                min="0"
                value={d.quantity}
                onChange={(e) => onDenominationChange(d.value, e.target.value)}
                className="w-24"
              />
            </TableCell>
            <TableCell>${(d.value * d.quantity).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Corte de Caja</h1>
        <div className="space-x-4">
          <Button 
            onClick={() => setOpenModal(true)}
            disabled={currentCashCut !== null}
          >
            Abrir Caja
          </Button>
          <Button 
            onClick={() => setCloseModal(true)}
            disabled={currentCashCut === null}
            variant="destructive"
          >
            Cerrar Caja
          </Button>
        </div>
      </div>

      {currentCashCut && (
        <Card>
          <CardHeader>
            <CardTitle>Caja Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Monto Inicial:</strong> ${currentCashCut.amount}</p>
              <p><strong>Fecha Apertura:</strong> {new Date(currentCashCut.created_at).toLocaleString()}</p>
              <p><strong>Campus:</strong> {activeCampus?.name}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Abrir Caja</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={handleOpenCashbox} className="space-y-6">
              <DenominationsTable onDenominationChange={handleDenominationChange} />
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Total: ${totalAmount.toFixed(2)}</p>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Abrir Caja</Button>
                </div>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>

      <Dialog open={closeModal} onOpenChange={setCloseModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Cerrar Caja</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={handleCloseCashbox} className="space-y-6">
              <DenominationsTable onDenominationChange={handleDenominationChange} />
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <p className="font-semibold">Monto Inicial: ${currentCashCut?.amount}</p>
                  <p className="font-semibold">Monto Final: ${totalAmount.toFixed(2)}</p>
                  <p className="font-semibold">Diferencia: ${(totalAmount - (currentCashCut?.amount || 0)).toFixed(2)}</p>
                </div>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCloseModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="destructive">Cerrar Caja</Button>
                </div>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}