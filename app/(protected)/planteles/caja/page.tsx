'use client'
import { createCaja } from '@/lib/api'
import React, { useState, useEffect } from 'react'
import { getCurrentCaja } from '@/lib/api'
import { useActiveCampusStore } from '@/lib/store/plantel-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'
import { Caja } from '@/lib/types'
export default function Page() {
  const [currentCashCut, setCurrentCashCut] = useState(null)
  const [isCashboxOpen, setIsCashboxOpen] = useState(true)
  const [modal, setModal] = useState(false)
  const [formData, setFormData] = useState<Caja>({
    id: undefined,
    amount: 0,
    campus_id: 0,
    created_at: '',
    updated_at: '',
    final_amount: 0,
    real_amount: 0,
    date: '',
  });
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);

  const handleOpenCashbox = () => {
    setIsCashboxOpen(true)
  }

  const handleCloseCashbox = () => {
    setIsCashboxOpen(false)
  }
  // useEffect(() => {
  //   const fetchCurrentCashCut = async () => {
  //     const currentCut = await getCurrentCaja(activeCampus.id)
  //     setCurrentCashCut(currentCut)
  //   }
  //   fetchCurrentCashCut()
  // }, [])

  const handleCreateCashCut = async () => {
    const newCashCut = await createCaja(formData)
    setCurrentCashCut(newCashCut)
  }

  return (
    <div>
      <h1>Corte de Caja</h1>
      <div>
        <h2>Corte Actual</h2>
        {currentCashCut ? (
          <div>{currentCashCut.total}</div>
        ) : (
          <div>No hay corte actual</div>
        )}
      </div>
      <div>
        <h2>Crear Nuevo Corte</h2>
        <Button onClick={()=>setModal(true)}>Abrir Caja</Button>
      </div>
      <div>
        <Button onClick={isCashboxOpen ? handleCloseCashbox : handleOpenCashbox}>
          {isCashboxOpen ? 'Cerrar Caja' : 'Abrir Caja'}
        </Button>
      </div>

      <Dialog open={modal} onOpenChange={() => setModal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Corte de Caja</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <form onSubmit={handleCreateCashCut} className="space-y-4">

              <div className="space-y-2">
                <label htmlFor="amount">Monto</label>
                <Input type="number" id="amount" name="amount" value={currentCashCut?.amount} disabled />
              </div>
              <div className="space-y-2">
                <label htmlFor="campus_id">Campus</label>
                <Input type="number" id="campus_id" name="campus_id" value={currentCashCut?.campus_id} disabled />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseCashbox}>
                  Cancelar
                </Button>
                <Button type="submit">Abrir Corte</Button>
              </div>
            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}
