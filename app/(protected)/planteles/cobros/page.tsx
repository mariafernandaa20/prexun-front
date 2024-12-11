'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { createCharge, getCharges } from '@/lib/api';
import { Student, Transaction } from '@/lib/types';
import { MultiSelect } from '@/components/multi-select';

export default function CobrosPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['all']);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['all']);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['student', 'amount', 'paymentMethod', 'date', 'notes']);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await getCharges();
      setTransactions(response);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    if (value === 'all') {
      setSelectedPaymentMethods(['all']);
    } else {
      const newMethods = selectedPaymentMethods.filter((m) => m !== 'all');
      if (newMethods.includes(value)) {
        setSelectedPaymentMethods(newMethods.filter((m) => m !== value));
      } else {
        setSelectedPaymentMethods([...newMethods, value]);
      }
    }
  };

  const handleStudentSelect = (values: string[]) => {
    setSelectedStudents(values);
  };

  const handleColumnSelect = (values: string[]) => {
    setVisibleColumns(values);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const studentFullName =
      `${transaction.student?.username} ${transaction.student?.firstname} ${transaction.student?.lastname}`.toLowerCase();
    const searchTerms = searchStudent.toLowerCase().split(' ');
    const matchesSearch = searchTerms.every((term) =>
      studentFullName.includes(term)
    );

    const matchesPaymentMethod =
      selectedPaymentMethods.includes('all') ||
      selectedPaymentMethods.includes(transaction.payment_method);

    const matchesStudent =
      selectedStudents.includes('all') ||
      selectedStudents.includes(transaction.student?.id || '');

    return matchesSearch && matchesPaymentMethod && matchesStudent;
  });

  const uniqueStudents = transactions
    .map(t => ({
      value: t.student?.id || '',
      label: `${t.student?.firstname} ${t.student?.lastname}`,
    }))
    .filter((student, index, self) => 
      index === self.findIndex(s => s.value === student.value)
    );

  const columnOptions = [
    { value: 'student', label: 'Estudiante' },
    { value: 'amount', label: 'Monto' },
    { value: 'paymentMethod', label: 'Método' },
    { value: 'date', label: 'Fecha' },
    { value: 'notes', label: 'Notas' }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Buscar por nombre completo..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="w-[300px]"
          />
          <div className="flex gap-2">
            <Button
              variant={selectedPaymentMethods.includes('all') ? 'default' : 'outline'}
              onClick={() => setSelectedPaymentMethods(['all'])}
            >
              Todos los métodos
            </Button>
            <Button
              variant={selectedPaymentMethods.includes('cash') ? 'default' : 'outline'}
              onClick={() => handlePaymentMethodChange('cash')}
            >
              Efectivo
            </Button>
            <Button
              variant={selectedPaymentMethods.includes('transfer') ? 'default' : 'outline'}
              onClick={() => handlePaymentMethodChange('transfer')}
            >
              Transferencia
            </Button>
            <Button
              variant={selectedPaymentMethods.includes('card') ? 'default' : 'outline'}
              onClick={() => handlePaymentMethodChange('card')}
            >
              Tarjeta
            </Button>
          </div>
          <MultiSelect
            options={[{value: 'all', label: 'Todos los estudiantes'}, ...uniqueStudents]}
            hiddeBadages={true}
            selectedValues={selectedStudents}
            onSelectedChange={handleStudentSelect}
            title="Estudiantes"
            placeholder="Seleccionar estudiantes"
            searchPlaceholder="Buscar estudiante..."
            emptyMessage="No se encontraron estudiantes"
          />
          <MultiSelect
            options={columnOptions}
            hiddeBadages={true}
            selectedValues={visibleColumns}
            onSelectedChange={handleColumnSelect}
            title="Columnas"
            placeholder="Seleccionar columnas"
            searchPlaceholder="Buscar columna..."
            emptyMessage="No se encontraron columnas"
          />
        </div>

      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.includes('student') && <TableHead>Estudiante</TableHead>}
            {visibleColumns.includes('amount') && <TableHead>Monto</TableHead>}
            {visibleColumns.includes('paymentMethod') && <TableHead>Método</TableHead>}
            {visibleColumns.includes('date') && <TableHead>Fecha</TableHead>}
            {visibleColumns.includes('notes') && <TableHead>Notas</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              {visibleColumns.includes('student') && (
                <TableCell>
                  {transaction.student?.firstname} {transaction.student?.lastname}
                </TableCell>
              )}
              {visibleColumns.includes('amount') && (
                <TableCell>${transaction.amount}</TableCell>
              )}
              {visibleColumns.includes('paymentMethod') && (
                <TableCell>
                  {transaction.payment_method === 'cash' && 'Efectivo'}
                  {transaction.payment_method === 'transfer' && 'Transferencia'}
                  {transaction.payment_method === 'card' && 'Tarjeta'}
                </TableCell>
              )}
              {visibleColumns.includes('date') && (
                <TableCell>
                  {new Date(transaction.created_at).toLocaleDateString()}
                </TableCell>
              )}
              {visibleColumns.includes('notes') && (
                <TableCell>{transaction.notes}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
