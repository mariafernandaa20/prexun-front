'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createCharge, getProductos, getStudentAssignmentsByStudent } from '@/lib/api'
import { useActiveCampusStore } from '@/lib/store/plantel-store'
import { getTodayDate } from '@/lib/utils'
import { PlusIcon, ShoppingBag } from 'lucide-react'
import React, { useState, useEffect } from 'react'

interface PurchaseFormProps {
  campusId: number
  studentId: string
  onPurchaseComplete?: (transaction: any) => void
}

interface FormData {
  product_id: string
  quantity: number
  paid: number
  payment_method: string
  amount: number
  comments?: string
  transaction_type?: string
  denominations?: any
  customPrice?: number
  customName?: string
  isCustom: boolean
  expiration_date: string
}

export default function Purchase({ campusId, studentId, onPurchaseComplete }: PurchaseFormProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [assignments, setAssignments] = useState<any[]>([])

  const [formData, setFormData] = useState<FormData>({
    product_id: '',
    quantity: 1,
    payment_method: 'card',
    amount: 0,
    paid: 0,
    comments: '',
    transaction_type: 'purchase',
    denominations: [],
    customPrice: 0,
    customName: '',
    isCustom: false,
    expiration_date: ''
  })

  const [products, setProducts] = useState<any[]>([])
  const activeCampus = useActiveCampusStore((state) => state.activeCampus)
  const fetchAssignments = async () => {
    try {
      const response = await getStudentAssignmentsByStudent(studentId as any)
      setAssignments(response.filter((assignment: any) => assignment.is_active) || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
    }
  }
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProductos()
      setProducts(response)
    }
    fetchProducts()
  }, [])

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(product => product.id === parseInt(productId))
    if (selectedProduct) {
      setFormData({
        ...formData,
        product_id: productId,
        amount: selectedProduct.price * formData.quantity,
        comments: `Compra de ${selectedProduct.name}`,
        paid: 0,
        customPrice: selectedProduct.price,
        customName: selectedProduct.name,
        isCustom: false
      })
    }
  }

  const handleQuantityChange = (quantity: number) => {
    if (formData.isCustom) {
      setFormData({
        ...formData,
        quantity,
        amount: (formData.customPrice || 0) * quantity,
        paid: 0
      })
    } else {
      const selectedProduct = products.find(product => product.id === parseInt(formData.product_id))
      if (selectedProduct) {
        setFormData({
          ...formData,
          quantity,
          amount: selectedProduct.price * quantity,
          paid: 0
        })
      }
    }
  }

  const handleCustomPriceChange = (price: number) => {
    setFormData({
      ...formData,
      customPrice: price,
      amount: price * formData.quantity,
      isCustom: true
    })
  }

  const handleCustomNameChange = (name: string) => {
    setFormData({
      ...formData,
      customName: name,
      comments: `Compra de ${name}`,
      isCustom: true
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await createCharge({
        campus_id: Number(campusId),
        student_id: Number(studentId),
        amount: formData.amount,
        payment_method: formData.payment_method as "cash" | "transfer" | "card",
        paid: 0,
        notes: formData.comments,
        transaction_type: 'purchase',
        denominations: [],
        payment_date: null,
        expiration_date: formData.expiration_date || null,
        debt_id: null
      })

      if (response) {
        onPurchaseComplete?.(response)
        setFormData({
          product_id: '',
          quantity: 1,
          payment_method: 'cash',
          amount: 0,
          paid: 0,
          denominations: [],
          comments: '',
          customPrice: 0,
          customName: '',
          isCustom: false,
          expiration_date: ''
        })
        setModalOpen(false)
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error)
    }
  }

  useEffect(() => {
    if (!formData.expiration_date) {
      formData.expiration_date = getTodayDate();
    }
  }, [])

  return (
    <>
      {activeCampus?.latest_cash_register ?
        <Button onClick={() => setModalOpen(true)} title='Agregar productos' variant='secondary'>
          <ShoppingBag className="mr-2 h-4 w-4" /> Compras
        </Button>
        : null}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Registrar Nuevo Pago</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* <div>
                <label className="block text-sm font-medium mb-1">
                  Asignación
                  <select
                    value={debtFormData.assignment_id}
                    onChange={(e) => setDebtFormData({ ...debtFormData, assignment_id: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="">Seleccione una asignación</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.period?.name}
                        {assignment.grupo?.name && ` - Grupo: ${assignment.grupo.name}`}
                        {assignment.semanaIntensiva?.name && ` - Semana: ${assignment.semanaIntensiva.name}`}
                        {assignment.period?.price && ` - ${formatCurrency(assignment.period.price)}`}
                      </option>
                    ))}
                  </select>
                </label>
              </div> */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Producto
                  <select
                    value={formData.product_id}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="">Seleccione un producto</option>
                    {products?.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre Personalizado
                  <Input
                    type="text"
                    value={formData.customName}
                    onChange={(e) => handleCustomNameChange(e.target.value)}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha Límite de Pago
                  <Input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio Personalizado
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.customPrice}
                    onChange={(e) => handleCustomPriceChange(parseFloat(e.target.value))}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cantidad
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    required
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Método de Pago
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Monto Total
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    required
                    readOnly
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Comentarios
                  <Textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  />
                </label>
              </div>

              <Button type="submit">
                Registrar Pago
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
