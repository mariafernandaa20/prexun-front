import React from 'react'
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
import { Caja } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function CajaLayout({ children, caja, onOpen, onClose }: {
  children: React.ReactNode
  caja: Caja | null
  onOpen: (initialAmount: number, notes: string) => Promise<void>
  onClose: (finalAmount: number, notes: string) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [initialAmount, setInitialAmount] = React.useState('')
  const [finalAmount, setFinalAmount] = React.useState('')
  const [notes, setNotes] = React.useState('')

  const handleOpenCaja = async () => {
    await onOpen(Number(initialAmount), notes)
    setOpen(false)
    setInitialAmount('')
    setNotes('')
  }

  const handleCloseCaja = async () => {
    await onClose(Number(finalAmount), notes)
    setOpen(false)
    setFinalAmount('')
    setNotes('')
  }

  return (
    <div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{caja ? 'Cerrar Caja' : 'Abrir Caja'}</DialogTitle>
            <DialogDescription>
              {caja && caja
                ? 'Ingrese el monto final y notas para cerrar la caja'
                : 'Ingrese el monto inicial y notas para abrir la caja'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto {caja && caja ? 'Final' : 'Inicial'}
              </Label>
              <Input
                id="amount"
                value={caja && caja ? finalAmount : initialAmount}
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
              onClick={caja && caja ? handleCloseCaja : handleOpenCaja}
            >
              {caja && caja ? 'Cerrar Caja' : 'Abrir Caja'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader>
          <div>
            {caja ? (
              <Button onClick={() => setOpen(true)}>Cerrar Caja</Button>
            ) : (
              <Button onClick={() => setOpen(true)}>Abrir Caja</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}