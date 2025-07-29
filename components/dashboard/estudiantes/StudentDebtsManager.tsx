'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableCell, TableHead, TableHeader, TableRow, TableBody } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'
import axiosInstance from '@/lib/api/axiosConfig'
import { formatTime } from '@/lib/utils'
import { useActiveCampusStore } from '@/lib/store/plantel-store'
import { createCharge } from '@/lib/api'

interface Debt {
  id: number
  student_id: number
  period_id: number
  concept: string
  total_amount: number
  paid_amount: number
  remaining_amount: number
  due_date: string
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  description?: string
  created_at: string
  updated_at: string
  period?: {
    id: number
    name: string
    price: number
  }
  transactions?: any[]
}

interface Period {
  id: number
  name: string
  price: number
  start_date: string
  end_date: string
}

interface StudentDebtsManagerProps {
  studentId: number
  onTransactionUpdate?: (transaction: any) => void
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: { label: 'Pendiente', variant: 'secondary' as const, icon: AlertTriangle },
    partial: { label: 'Parcial', variant: 'default' as const, icon: CreditCard },
    paid: { label: 'Pagado', variant: 'default' as const, icon: CheckCircle },
    overdue: { label: 'Vencido', variant: 'destructive' as const, icon: AlertTriangle }
  }
  
  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export default function StudentDebtsManager({ studentId, onTransactionUpdate }: StudentDebtsManagerProps) {
  const [debts, setDebts] = useState<Debt[]>([])
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const activeCampus = useActiveCampusStore((state) => state.activeCampus)
  
  const [debtFormData, setDebtFormData] = useState({
    period_id: '',
    concept: '',
    total_amount: '',
    due_date: '',
    description: ''
  })
  
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    payment_method: 'card',
    notes: ''
  })
  
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (studentId) {
      fetchStudentDebts()
      fetchPeriods()
    }
  }, [studentId])

  const fetchStudentDebts = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/debts/student/${studentId}`)
      setDebts(response.data.debts || [])
    } catch (error) {
      console.error('Error fetching student debts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPeriods = async () => {
    try {
      const response = await axiosInstance.get('/periods')
      setPeriods(response.data.data || response.data || [])
    } catch (error) {
      console.error('Error fetching periods:', error)
    }
  }

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      await axiosInstance.post('/debts', {
        ...debtFormData,
        student_id: studentId,
        total_amount: parseFloat(debtFormData.total_amount)
      })
      
      setDebtFormData({
        period_id: '',
        concept: '',
        total_amount: '',
        due_date: '',
        description: ''
      })
      setShowCreateForm(false)
      fetchStudentDebts()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        console.error('Error creating debt:', error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDebt) return
    
    setSubmitting(true)
    setErrors({})

    try {
      const response = await createCharge({
        campus_id: activeCampus?.id || 0,
        student_id: studentId,
        amount: parseFloat(paymentFormData.amount),
        payment_method: paymentFormData.payment_method as "cash" | "transfer" | "card",
        paid: 1,
        notes: paymentFormData.notes || `Pago para adeudo: ${selectedDebt.concept}`,
        transaction_type: 'income',
        debt_id: selectedDebt.id,
        denominations: [],
        payment_date: new Date().toISOString().split('T')[0]
      })

      if (response && onTransactionUpdate) {
        onTransactionUpdate(response)
      }
      
      setPaymentFormData({
        amount: '',
        payment_method: 'card',
        notes: ''
      })
      setShowPaymentForm(false)
      setSelectedDebt(null)
      fetchStudentDebts()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        console.error('Error creating payment:', error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const openPaymentForm = (debt: Debt) => {
    setSelectedDebt(debt)
    setPaymentFormData({
      amount: debt.remaining_amount.toString(),
      payment_method: 'card',
      notes: `Pago para adeudo: ${debt.concept}`
    })
    setShowPaymentForm(true)
  }

  const getTotalSummary = () => {
    return {
      total: debts.reduce((sum, debt) => sum + debt.total_amount, 0),
      paid: debts.reduce((sum, debt) => sum + debt.paid_amount, 0),
      remaining: debts.reduce((sum, debt) => sum + debt.remaining_amount, 0),
      overdue: debts.filter(debt => debt.status === 'overdue').length
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  const summary = getTotalSummary()

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gestión de Adeudos</h2>
          <Button onClick={() => setShowCreateForm(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Crear Adeudo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        {debts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Adeudos</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(summary.total)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Pagado</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(summary.paid)}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Pendiente</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(summary.remaining)}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Adeudos Vencidos</p>
              <p className="text-lg font-semibold text-orange-600">
                {summary.overdue}
              </p>
            </div>
          </div>
        )}

        {/* Debts Table */}
        {debts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Pendiente</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell className="font-medium">{debt.concept}</TableCell>
                  <TableCell>{debt.period?.name || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(debt.total_amount)}</TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(debt.paid_amount)}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {formatCurrency(debt.remaining_amount)}
                  </TableCell>
                  <TableCell>
                    {formatTime({ time: debt.due_date })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={debt.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {debt.status !== 'paid' && (
                        <Button
                          size="sm"
                          onClick={() => openPaymentForm(debt)}
                          disabled={!activeCampus?.latest_cash_register}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay adeudos registrados para este estudiante</p>
          </div>
        )}

        {/* Create Debt Modal */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Adeudo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Período
                  <select
                    value={debtFormData.period_id}
                    onChange={(e) => setDebtFormData({ ...debtFormData, period_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="">Seleccione un período</option>
                    {periods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name} - {formatCurrency(period.price)}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.period_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.period_id[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Concepto
                  <Input
                    type="text"
                    value={debtFormData.concept}
                    onChange={(e) => setDebtFormData({ ...debtFormData, concept: e.target.value })}
                    placeholder="Ej: Colegiatura, Material, Examen..."
                    required
                  />
                </label>
                {errors.concept && (
                  <p className="text-red-500 text-sm mt-1">{errors.concept[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Monto Total
                  <Input
                    type="number"
                    step="0.01"
                    value={debtFormData.total_amount}
                    onChange={(e) => setDebtFormData({ ...debtFormData, total_amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </label>
                {errors.total_amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.total_amount[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de Vencimiento
                  <Input
                    type="date"
                    value={debtFormData.due_date}
                    onChange={(e) => setDebtFormData({ ...debtFormData, due_date: e.target.value })}
                    required
                  />
                </label>
                {errors.due_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.due_date[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción (Opcional)
                  <Textarea
                    value={debtFormData.description}
                    onChange={(e) => setDebtFormData({ ...debtFormData, description: e.target.value })}
                    placeholder="Información adicional sobre el adeudo..."
                    rows={3}
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear Adeudo'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payment Modal */}
        <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Pago</DialogTitle>
            </DialogHeader>
            {selectedDebt && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedDebt.concept}</h4>
                <p className="text-sm text-gray-600">
                  Pendiente: {formatCurrency(selectedDebt.remaining_amount)}
                </p>
              </div>
            )}
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Monto a Pagar
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                    max={selectedDebt?.remaining_amount}
                    required
                  />
                </label>
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Método de Pago
                  <select
                    value={paymentFormData.payment_method}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="cash">Efectivo</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notas (Opcional)
                  <Textarea
                    value={paymentFormData.notes}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                    placeholder="Información adicional sobre el pago..."
                    rows={3}
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting || !activeCampus?.latest_cash_register}>
                  {submitting ? 'Procesando...' : 'Registrar Pago'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}