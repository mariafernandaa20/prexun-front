'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axiosInstance from '@/lib/api/axiosConfig';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { formatCurrency, formatTime } from '@/lib/utils';
import { AlertTriangle, CheckCircle, CreditCard, Info, Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const cards = [];
const studentId = null;
const paymentFormData = {};
const setPaymentFormData = () => { };
const handleTransactionUpdate = () => { };
const fetchStudentDebts = () => { };

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      variant: 'secondary' as const,
      icon: AlertTriangle,
    },
    partial: {
      label: 'Parcial',
      variant: 'default' as const,
      icon: CreditCard,
    },
    paid: { label: 'Pagado', variant: 'default' as const, icon: CheckCircle },
    overdue: {
      label: 'Vencido',
      variant: 'destructive' as const,
      icon: AlertTriangle,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1 ">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export default function debtsPage() {
  const [debts, setdebts] = useState([]);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [selectedDebtForPayments, setSelectedDebtForPayments] = useState(null);

  const activeCampus = useActiveCampusStore((state) => state.activeCampus);

  async function getdebts() {
    if (!activeCampus) return;
    try {
      const response = await axiosInstance.get(
        `/debts/campus/${activeCampus.id}`
      );
      setdebts(response.data || []);
    } catch (error) {
      console.error('Error fetching debts:', error);
    }
  }

  useEffect(() => {
    getdebts();
  }, [activeCampus]);

  const getPaymentMethodText = (method: string) => {
    const methods = {
      'card': 'Tarjeta',
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'check': 'Cheque'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const handleShowPayments = (debt: any) => {
    setSelectedDebtForPayments(debt);
    setShowPaymentsModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Adeudos {activeCampus?.name}</h1>
        <Button onClick={getdebts}>Recargar</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead>Asignación</TableHead>
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
              <TableCell>
                <div className="flex items-center gap-4">
                  <a
                    className="text-blue-500"
                    href={`/planteles/estudiantes/${debt.student_id}`}
                  >
                    {debt.student?.firstname} {debt.student?.lastname}
                  </a>
                  <Info />
                </div>
              </TableCell>
              <TableCell className="font-medium">{debt.concept}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  {debt.assignment?.period?.name && (
                    <div className="text-sm font-medium">
                      {debt.assignment.period.name}
                    </div>
                  )}
                  {debt.assignment?.grupo?.name && (
                    <div className="text-xs text-gray-600">
                      Grupo: {debt.assignment.grupo.name}
                    </div>
                  )}
                  {debt.assignment?.semanaIntensiva?.name && (
                    <div className="text-xs text-gray-600">
                      Semana: {debt.assignment.semanaIntensiva.name}
                    </div>
                  )}
                  {!debt.assignment && (
                    <span className="text-gray-500">Sin asignación</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatCurrency(debt.total_amount)}</TableCell>
              <TableCell className="text-green-600">
                {formatCurrency(debt.paid_amount)}
              </TableCell>
              <TableCell className="text-red-600">
                {formatCurrency(debt.remaining_amount)}
              </TableCell>
              <TableCell>{formatTime({ time: debt.due_date })}</TableCell>
              <TableCell>
                <StatusBadge status={debt.status} />
              </TableCell>
              <TableCell>
                {debt.transactions && debt.transactions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowPayments(debt)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Ver Pagos
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Payments Modal */}
      <Dialog open={showPaymentsModal} onOpenChange={setShowPaymentsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Pagos del Adeudo: {selectedDebtForPayments?.concept}
            </DialogTitle>
          </DialogHeader>
          {selectedDebtForPayments?.transactions && selectedDebtForPayments.transactions.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p><strong>Estudiante:</strong> {selectedDebtForPayments.student?.firstname} {selectedDebtForPayments.student?.lastname}</p>
                <p><strong>Monto Total:</strong> {formatCurrency(selectedDebtForPayments.total_amount)}</p>
                <p><strong>Total Pagado:</strong> {formatCurrency(selectedDebtForPayments.paid_amount)}</p>
                <p><strong>Pendiente:</strong> {formatCurrency(selectedDebtForPayments.remaining_amount)}</p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Folio</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDebtForPayments.transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {formatTime({ time: transaction.payment_date })}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {formatCurrency(parseFloat(transaction.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPaymentMethodText(transaction.payment_method)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {transaction.folio_new || transaction.folio || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-32 truncate" title={transaction.notes}>
                          {transaction.notes || 'Sin notas'}
                        </div>
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
  );
}
