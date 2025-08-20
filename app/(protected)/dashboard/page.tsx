'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  Download,
  Filter,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';
import { Campus } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionDashboardData {
  summary: {
    total_income: number;
    total_expenses: number;
    net_balance: number;
    transaction_count: number;
    expense_count: number;
    total_count: number;
  };
  payment_method_totals: {
    [key: string]: {
      income: number;
      expenses: number;
      net: number;
      income_count: number;
      expense_count: number;
    };
  };
  daily_summary: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
    transaction_count: number;
    expense_count: number;
  }>;
  campus_summary: Array<{
    campus_id: number;
    campus_name: string;
    income: number;
    expenses: number;
    net: number;
    transaction_count: number;
    expense_count: number;
  }>;
  transactions: Array<{
    id: number;
    type: 'income' | 'expense';
    amount: number;
    payment_method: string;
    date: string;
    description: string;
    campus: string;
    reference?: string;
    student_name?: string;
    notes?: string;
    category?: string;
    user_name?: string;
  }>;
  filters: {
    start_date: string;
    end_date: string;
    campus_id?: number;
    payment_method?: string;
    transaction_type: string;
  };
}

const paymentMethodLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

const transactionTypeLabels = {
  all: 'Todos',
  income: 'Ingresos',
  expense: 'Gastos',
};

export default function DashboardPage() {
  const [data, setData] = useState<TransactionDashboardData | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    campus_id: 'all',
    start_date: format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      'yyyy-MM-dd'
    ),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'all',
    transaction_type: 'all',
  });

  useEffect(() => {
    fetchCampuses();
    fetchDashboardData();
  }, []);

  const fetchCampuses = async () => {
    try {
      const response = await axiosInstance.get(
        '/transaction-dashboard/campuses'
      );
      setCampuses(response.data);
    } catch (error) {
      toast.error('Error al cargar planteles');
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.campus_id && filters.campus_id !== 'all')
        params.append('campus_id', filters.campus_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.payment_method && filters.payment_method !== 'all')
        params.append('payment_method', filters.payment_method);
      if (filters.transaction_type && filters.transaction_type !== 'all')
        params.append('transaction_type', filters.transaction_type);

      const response = await axiosInstance.get(
        `/transaction-dashboard?${params.toString()}`
      );
      setData(response.data);
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchDashboardData();
  };

  const resetFilters = () => {
    setFilters({
      campus_id: 'all',
      start_date: format(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        'yyyy-MM-dd'
      ),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      payment_method: 'all',
      transaction_type: 'all',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getPaymentMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'card':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'transfer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTransactionTypeBadgeColor = (type: string) => {
    return type === 'income'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[100vw] overflow-x-hidden p-4">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard de Transacciones</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="campus">Plantel</Label>
              <Select
                value={filters.campus_id}
                onValueChange={(value) =>
                  handleFilterChange('campus_id', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los planteles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los planteles</SelectItem>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={campus.id.toString()}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Fecha Inicio</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange('start_date', e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="end_date">Fecha Fin</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="payment_method">Método de Pago</Label>
              <Select
                value={filters.payment_method}
                onValueChange={(value) =>
                  handleFilterChange('payment_method', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los métodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transaction_type">Tipo</Label>
              <Select
                value={filters.transaction_type}
                onValueChange={(value) =>
                  handleFilterChange('transaction_type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de transacción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Ingresos</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={applyFilters} className="flex-1">
                Aplicar
              </Button>
              <Button onClick={resetFilters} variant="outline">
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ingresos Totales
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.summary.total_income)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.transaction_count} transacciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gastos Totales
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.summary.total_expenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.expense_count} gastos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Balance Neto
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    data.summary.net_balance >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(data.summary.net_balance)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.summary.total_count} transacciones totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actividad</CardTitle>
                <Activity className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {data.summary.total_count}
                </div>
                <p className="text-xs text-muted-foreground">
                  Movimientos en el período
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Totales por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(data.payment_method_totals).map(
                  ([method, totals]) => (
                    <div key={method} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {paymentMethodLabels[
                            method as keyof typeof paymentMethodLabels
                          ] || method}
                        </h3>
                        <Badge className={getPaymentMethodBadgeColor(method)}>
                          {paymentMethodLabels[
                            method as keyof typeof paymentMethodLabels
                          ] || method}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Ingresos:</span>
                          <span className="text-green-600 font-medium">
                            {formatCurrency(totals.income)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gastos:</span>
                          <span className="text-red-600 font-medium">
                            {formatCurrency(totals.expenses)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="font-medium">Neto:</span>
                          <span
                            className={`font-bold ${
                              totals.net >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(totals.net)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Campus Summary */}
          {data.campus_summary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumen por Plantel</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plantel</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-right">Gastos</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">
                        Transacciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.campus_summary.map((campus) => (
                      <TableRow key={campus.campus_id}>
                        <TableCell className="font-medium">
                          {campus.campus_name}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(campus.income)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(campus.expenses)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            campus.net >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(campus.net)}
                        </TableCell>
                        <TableCell className="text-right">
                          {campus.transaction_count + campus.expense_count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Plantel</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Referencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((transaction) => (
                    <TableRow key={`${transaction.type}-${transaction.id}`}>
                      <TableCell>
                        <Badge
                          className={getTransactionTypeBadgeColor(
                            transaction.type
                          )}
                        >
                          {transactionTypeLabels[transaction.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPaymentMethodBadgeColor(
                            transaction.payment_method
                          )}
                        >
                          {paymentMethodLabels[
                            transaction.payment_method as keyof typeof paymentMethodLabels
                          ] || transaction.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.campus}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.reference || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
