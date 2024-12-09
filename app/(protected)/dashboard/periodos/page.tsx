'use client'
import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { createPeriod, deletePeriod, getPeriods, updatePeriod } from '@/lib/api'

interface Period {
  id: number
  name: string
  start_date: string
  end_date: string
}

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: ''
  })

  // Cargar períodos
  const fetchPeriods = async () => {
    const response = await getPeriods()
    setPeriods(response)
  }

  useEffect(() => {
    fetchPeriods()
  }, [])

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentPeriod) {
      await updatePeriod({
        ...formData,
        id: currentPeriod.id
      })
    } else {
      await createPeriod(formData)
    }

    setIsOpen(false)
    fetchPeriods()
    setCurrentPeriod(null)
    setFormData({ name: '', start_date: '', end_date: '' })
  }

  // Eliminar período
  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este período?')) {
      await deletePeriod(id.toString())
      fetchPeriods()
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Períodos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setCurrentPeriod(null)
              setFormData({ name: '', start_date: '', end_date: '' })
            }}>
             <Plus className="mr-2 h-4 w-4" /> Nuevo Período
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentPeriod ? 'Editar Período' : 'Nuevo Período'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nombre"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <Input
                type="date"
                value={formData.start_date}
                onChange={e => setFormData({...formData, start_date: e.target.value})}
              />
              <Input
                type="date"
                value={formData.end_date}
                onChange={e => setFormData({...formData, end_date: e.target.value})}
              />
              <Button type="submit">
                {currentPeriod ? 'Actualizar' : 'Crear'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Fin</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period.id}>
              <TableCell>{period.name}</TableCell>
              <TableCell>{format(new Date(period.start_date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{format(new Date(period.end_date), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentPeriod(period)
                    setFormData({
                      name: period.name,
                      start_date: period.start_date,
                      end_date: period.end_date
                    })
                    setIsOpen(true)
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(period.id)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
