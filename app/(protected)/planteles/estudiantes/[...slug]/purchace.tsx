'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createCharge, getProductos } from '@/lib/api'
import { useActiveCampusStore } from '@/lib/store/plantel-store'
import { PlusIcon } from 'lucide-react'
import React, { useState, useEffect } from 'react'

interface PurchaseFormProps {
  campusId: number
  studentId: string
  onPurchaseComplete?: (transaction: any)=> void
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
}

export default function Purchase({ campusId, studentId, onPurchaseComplete }: PurchaseFormProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    product_id: '',
    quantity: 1,
    payment_method: 'card',
    amount: 0,
    paid: 0,
    comments: '',
    transaction_type: 'purchase',
    denominations: [],
  })

  const [products, setProducts] = useState<any[]>([])

  const activeCampus = useActiveCampusStore((state) => state.activeCampus);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getProductos()
      setProducts(response)
    }
    fetchProducts()
  },[]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await createCharge({
        campus_id: Number(campusId),
        student_id: Number(studentId),
        amount: formData.amount,
        payment_method: formData.payment_method as "cash" | "transfer" | "card",
        paid: formData.paid,
        notes: formData.comments,
        transaction_type: 'purchase',
        denominations: [],
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
          comments: ''
        })
        setModalOpen(false)
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error)
    }
  }

  return (
    <>
    {activeCampus?.latest_cash_register ? <Button onClick={() => setModalOpen(true)}><PlusIcon className="mr-2 h-4 w-4" /> Comprar</Button> : null}
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Registrar Nuevo Pago</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Producto
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
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
                  Cantidad
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Método de Pago
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Monto
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    required
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Comentarios
                  <Textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
