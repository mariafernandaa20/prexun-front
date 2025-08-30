'use client';
import type React from 'react';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  AlertTriangle,
  ArrowDownIcon as BanknoteArrowDown,
  CheckCircle,
  CreditCard,
  Eye,
  Calendar,
  DollarSign,
  FileText,
  User,
  Wallet,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { formatCurrency, formatTime, getPaymentMethodLabel } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Link from 'next/link';
import TransactionsModal from '../TransactionsModal';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pendiente',
      className:
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      icon: AlertTriangle,
    },
    partial: {
      label: 'Parcial',
      className:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      icon: CreditCard,
    },
    paid: {
      label: 'Pagado',
      className:
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      icon: CheckCircle,
    },
    overdue: {
      label: 'Vencido',
      className:
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      icon: AlertTriangle,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
};

const PaymentMethodBadge: React.FC<{ method: string }> = ({ method }) => {
  const methodConfig = {
    cash: {
      label: 'Efectivo',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    transfer: {
      label: 'Transferencia',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    card: {
      label: 'Tarjeta',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  };

  const config = methodConfig[method] || {
    label: method,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default function AdeudosModal({ student }) {
  const [open, setOpen] = useState(false);
  const { debts = [], transactions = [] } = student || {};

  const totalDebt = debts.reduce((sum, debt) => sum + debt.remaining_amount, 0);
  const totalPaid = debts.reduce((sum, debt) => sum + debt.paid_amount, 0);
  const overdueDebts = debts.filter((debt) => debt.status === 'overdue').length;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title="Ver Adeudos"
        onClick={() => setOpen(true)}
        className="hover:bg-accent"
      >
        <Wallet className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Estado Financiero del Estudiante
            </DialogTitle>
          </DialogHeader>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-500" />
                  Total Pendiente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalDebt)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Total Pagado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPaid)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Adeudos Vencidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {overdueDebts}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="debts" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="debts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Adeudos ({debts.length})
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Transacciones ({transactions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="debts" className="mt-4 overflow-auto flex-1">
              {debts.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Concepto</TableHead>
                        <TableHead className="w-[180px]">Asignación</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Pagado</TableHead>
                        <TableHead className="text-right">Pendiente</TableHead>
                        <TableHead className="w-[120px]">Vencimiento</TableHead>
                        <TableHead className="w-[100px]">Estado</TableHead>
                        <TableHead className="w-[100px]">Pagos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debts.map((debt) => (
                        <TableRow key={debt.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {debt.concept}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {debt.assignment?.period?.name && (
                                <div className="text-sm font-medium">
                                  {debt.assignment.period.name}
                                </div>
                              )}
                              {debt.assignment?.grupo?.name && (
                                <div className="text-xs text-muted-foreground">
                                  Grupo: {debt.assignment.grupo.name}
                                </div>
                              )}
                              {debt.assignment?.semanaIntensiva?.name && (
                                <div className="text-xs text-muted-foreground">
                                  Semana: {debt.assignment.semanaIntensiva.name}
                                </div>
                              )}
                              {!debt.assignment && (
                                <span className="text-muted-foreground text-sm">
                                  Sin asignación
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(debt.total_amount)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {formatCurrency(debt.paid_amount)}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-medium">
                            {formatCurrency(debt.remaining_amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {formatTime({ time: debt.due_date })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={debt.status} />
                          </TableCell>
                          <TableCell>
                            <TransactionsModal debt={debt} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <CardTitle className="text-lg mb-2">
                      ¡Sin adeudos!
                    </CardTitle>
                    <CardDescription>
                      Este estudiante no tiene adeudos pendientes
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent
              value="transactions"
              className="mt-4 overflow-auto flex-1"
            >
              {transactions.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Folio</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Fecha de Pago</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="w-[80px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-mono text-sm">
                            {transaction.folio_new ||
                              transaction.folio ||
                              `#${transaction.id}`}
                          </TableCell>
                          <TableCell>
                            <PaymentMethodBadge
                              method={getPaymentMethodLabel(
                                transaction.payment_method
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {formatTime({ time: transaction.payment_date })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={
                                transaction.paid !== 0 ? 'paid' : 'pending'
                              }
                            />
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {transaction.notes || '-'}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/recibo/${transaction.uuid}`}
                              target="_blank"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle className="text-lg mb-2">
                      Sin transacciones
                    </CardTitle>
                    <CardDescription>
                      No hay transacciones registradas para este estudiante
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
