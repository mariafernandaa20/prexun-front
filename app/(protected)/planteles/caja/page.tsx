'use client'
import { useActiveCampusStore } from '@/lib/store/plantel-store'
import React from 'react'
import CajaLayout from './CajaLayout'
import { closeCaja, getCurrentCaja, openCaja } from '@/lib/api'

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
          <p>Caja abierta</p>
          <p>Monto inicial: {caja.initialAmount}</p>
          <p>Notas: {caja.openingNotes}</p>
        </div>
      ) : (
        <div>
          <p>Caja cerrada</p>
        </div>
      )}
    </CajaLayout>
  )
}