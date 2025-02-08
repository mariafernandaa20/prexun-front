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
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { Eye, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import InvoicePDF from '@/components/invoice_pdf';
import Link from 'next/link';
import axiosInstance from '@/lib/api/axiosConfig';

export default function CobrosPage() {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['all']);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['student', 'amount', 'paymentMethod', 'date', 'notes', 'paid', 'limit_date', 'actions']);
  const [expirationDate, setExpirationDate] = useState('');
  const { activeCampus } = useActiveCampusStore();
  const { toast } = useToast();

  useEffect(() => {
    setTransactions([]);
    fetchTransactions();
  }, [activeCampus, expirationDate]);

  const fetchTransactions = async () => {
    try {
        const params = {
            campus_id: activeCampus?.id,
            expiration_date: expirationDate || null,
        };

        const response = await axiosInstance.get('/charges/not-paid', { params });
        setTransactions(response.data);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
};
  const handleStudentSelect = (values: string[]) => {
    setSelectedStudents(values);
  };

  const handleColumnSelect = (values: string[]) => {
    setVisibleColumns(values);
  };

  const handleOpenImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const studentFullName =
      `${transaction.student?.username} ${transaction.student?.firstname} ${transaction.student?.lastname}`.toLowerCase();
    const searchTerms = searchStudent.toLowerCase().split(' ');
    const matchesSearch = searchTerms.every((term) =>
      studentFullName.includes(term)
    );

  
    const matchesStudent =
      selectedStudents.includes('all') ||
      selectedStudents.includes(transaction.student?.id || '');

    return matchesSearch && matchesStudent;
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
    { value: 'payment_date', label: 'Fecha de pago' },
    { value: 'date', label: 'Fecha' },
    { value: 'notes', label: 'Notas' },
    { value: 'paid', label: 'Pagado' },
    { value: 'limit_date', label: 'Fecha límite de pago' },
    { value: 'actions', label: 'Acciones' }
  ];

  const handleShare = (transaction: Transaction) => {
    const url = `https://admin.prexun.com/recibo/${transaction.uuid}`;
    const text = `Este es un cobro de ${transaction.student?.firstname} ${transaction.student?.lastname}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Enlace copiado al portapapeles',
      description: 'Puedes compartir este enlace con tus estudiantes',
      variant: 'default'
    });
  };

  return (
    <Card>
      <CardHeader className='sticky top-0 z-10 bg-card'>
        <div className="flex gap-4 justify-between">
          <div className='flex gap-4'>
            <Input
              placeholder="Buscar por nombre completo..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-[300px]"
            />
            <Input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-[200px]"
            />
            <MultiSelect
              options={[{ value: 'all', label: 'Todos los estudiantes' }, ...uniqueStudents]}
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
      </CardHeader>

      <CardContent>

        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('student') && <TableHead>Estudiante</TableHead>}
              {visibleColumns.includes('amount') && <TableHead>Monto</TableHead>}
              {visibleColumns.includes('paymentMethod') && <TableHead>Método</TableHead>}
              {visibleColumns.includes('paid') && <TableHead>Pagado</TableHead>}
              {visibleColumns.includes('payment_date') && <TableHead>Fecha de pago</TableHead>}
              {visibleColumns.includes('date') && <TableHead>Fecha</TableHead>}
              {visibleColumns.includes('notes') && <TableHead>Notas</TableHead>}
              {visibleColumns.includes('limit_date') && <TableHead>Fecha límite de pago</TableHead>}
              <TableHead>Comprobante</TableHead>
              {visibleColumns.includes('actions') && <TableHead>Acciones</TableHead>}
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
                {visibleColumns.includes('paid') && (
                  <TableCell>
                    {transaction.paid ? 'Si' : 'No'}
                  </TableCell>
                )}
                {visibleColumns.includes('payment_date') && (
                  <TableCell>
                    {transaction.payment_date}
                  </TableCell>
                )}
                {visibleColumns.includes('date') && (
                  <TableCell>
                    {transaction.created_at}
                  </TableCell>
                )}
                {visibleColumns.includes('notes') && (
                  <TableCell>{transaction.notes}</TableCell>
                )}
                {visibleColumns.includes('limit_date') && (
                  <TableCell>
                    {transaction.expiration_date ?  transaction.expiration_date : 'No límite de pago'}
                  </TableCell>
                )}
                <TableCell>
                  {transaction.image && (
                    <div className="flex items-center gap-2">
                      <img
                        src={transaction.image as string}
                        alt="Miniatura"
                        className="w-10 h-10 object-cover rounded"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenImage(transaction.image as string)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  )}
                </TableCell>
                {visibleColumns.includes('actions') && (
                  <TableCell className="p-4 flex items-center justify-right gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleShare(transaction)}>
                      <Share className="w-4 h-4 mr-2" />
                    </Button>
                    <InvoicePDF icon={true} invoice={transaction} />
                    <Link href={`/recibo/${transaction.uuid}`} target='_blank'>
                      <Eye className="w-4 h-4 mr-2" />
                    </Link>
                  </TableCell>
                )}

              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-3xl">
            <img src={selectedImage} alt="Comprobante" className="w-full" />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
