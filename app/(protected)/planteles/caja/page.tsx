'use client'
import { useActiveCampusStore } from '@/lib/store/plantel-store'
import React from 'react'
import CajaLayout from './CajaLayout'
import { closeCaja, getCurrentCaja, openCaja } from '@/lib/api'
import { Caja, Campus } from '@/lib/types'

const useCaja = ({ activeCampus }: { activeCampus: Campus | null }) => {
  const [caja, setCaja] = React.useState<Caja | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const fetchCaja = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await getCurrentCaja(activeCampus?.id)
      setCaja(response)
      setError(null)
    } catch (err) {
      if (err.response?.status === 404) {
        setCaja(null)
        setError(null)
      } else {
        setError(err instanceof Error ? err : new Error('Error al cargar caja'))
      }
    } finally {
      setLoading(false)
    }
  }, [activeCampus])

  React.useEffect(() => {
    fetchCaja()
  }, [fetchCaja])

  return { caja, loading, error, fetchCaja }
}

export default function CajaPage() {
  const activeCampus = useActiveCampusStore((state) => state.activeCampus)
  const { caja, loading, error, fetchCaja } = useCaja({ activeCampus })

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>
  
  const handleOpenCaja = async (initialAmount: number, notes: string) => {
    try {
      await openCaja(Number(activeCampus?.id), initialAmount, notes)
      await fetchCaja()
    } catch (error) {
      console.error('Error al abrir caja:', error)
    }
  }
  const handleCloseCaja = async (finalAmount: number, notes: string) => {
    try {
      await closeCaja(caja.id, finalAmount, notes)
      await fetchCaja()
    } catch (error) {
      console.error('Error al cerrar caja:', error)
    }
  }

  return (
    <CajaLayout caja={caja} onOpen={handleOpenCaja} onClose={handleCloseCaja}>
      {caja ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Detalles de Caja</h2>
          <p><strong>Estado:</strong> {caja.status}</p>
          <p><strong>Monto Inicial:</strong> {caja.initial_amount}</p>
          {caja.final_amount && <p><strong>Monto Final:</strong> {caja.final_amount}</p>}
          {caja.notes && <p><strong>Notas:</strong> {caja.notes}</p>}
          <p><strong>Abierta:</strong> {caja.opened_at}</p>
          {caja.closed_at && <p><strong>Cerrada:</strong> {caja.closed_at}</p>}
        </div>
      ) : (
        <div>
          <p>Caja cerrada</p>
        </div>
      )}
    </CajaLayout>
  )
}