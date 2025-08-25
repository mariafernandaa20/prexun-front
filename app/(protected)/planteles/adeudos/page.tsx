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
import { AlertTriangle, CheckCircle, CreditCard, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const cards = [];
const studentId = null;
const paymentFormData = {};
const setPaymentFormData = () => {};
const handleTransactionUpdate = () => {};
const fetchStudentDebts = () => {};

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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
