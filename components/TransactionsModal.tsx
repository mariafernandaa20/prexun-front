import React from 'react'
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from '@/components/ui/table';
import { formatCurrency, formatTime } from '@/lib/utils';
import { AlertTriangle, CreditCard, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import Link from 'next/link';
export default function TransactionsModal({ debt }) {
  const [showPaymentsModal, setShowPaymentsModal] = React.useState(false);

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPaymentsModal(true)}
        className="flex items-center gap-1"
      >
        <Eye className="w-3 h-3" />
        Ver Pagos
      </Button>

      <Dialog open={showPaymentsModal} onOpenChange={setShowPaymentsModal}>

        <DialogContent className="max-w-3xl max-h-[60v  h] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Pagos del Adeudo
            </DialogTitle>
          </DialogHeader>
          {debt?.transactions && debt.transactions.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p><strong>Monto Total:</strong> {formatCurrency(debt.total_amount)}</p>
                <p><strong>Total Pagado:</strong> {formatCurrency(debt.paid_amount)}</p>
                <p><strong>Pendiente:</strong> {formatCurrency(debt.remaining_amount)}</p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Folio</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debt.transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {formatTime({ time: transaction.payment_date })}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {formatCurrency(parseFloat(transaction.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
 {transaction?.paid ? (
  <>
    {transaction?.folio_new + " "}
    {(
      transaction?.folio ??
      transaction?.folio_cash ??
      transaction?.folio_transfer ??
      0
    )
      .toString()
      .padStart(4, "0")}
  </>
) : (
  "No Pagado"
)}                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-32 truncate" title={transaction.notes}>
                          {transaction.notes || 'Sin notas'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Link href={`/recibo/${transaction.uuid}`} target="_blank">
                            <Eye className="w-4 h-4 mr-2 " />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay pagos registrados para este adeudo</p>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPaymentsModal(false)}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
