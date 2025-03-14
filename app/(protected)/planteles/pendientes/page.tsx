'use client';
import { useEffect, useState } from 'react';
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
import { Eye, Share, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { MultiSelect } from '@/components/multi-select';
import InvoicePDF from '@/components/invoice_pdf';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/api/axiosConfig';
import { Transaction, Card as CardType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import ChargesForm from '@/components/dashboard/estudiantes/charges-form';

// Constants
const COLUMN_OPTIONS = [
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

const DEFAULT_VISIBLE_COLUMNS = ['student', 'amount', 'paymentMethod', 'date', 'notes', 'paid', 'limit_date', 'actions', 'folio'];

const PAYMENT_METHOD_LABELS = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta'
};

const TransactionActions: React.FC<{
  transaction: Transaction;
  cards: CardType[];
  onTransactionUpdate: (updatedTransaction: Transaction) => void;
}> = ({ transaction, onTransactionUpdate, cards }) => {
  const [formData, setFormData] = useState<Transaction>({
    ...transaction,
    denominations: {},
    notes: transaction.notes || '',
    payment_date: transaction.payment_date || new Date().toISOString().split('T')[0],
    card_id: transaction.card_id || null,
    image: transaction.image || null,
  });

  const handleMarkAsPaid = async () => {
    try {
      await axiosInstance.put(`/charges/${transaction.id}`, {
        ...formData,
        paid: 1
      });
      onTransactionUpdate({
        ...transaction,
        paid: 1,
        payment_date: formData.payment_date,
        notes: formData.notes
      });
      setFormData({
        ...transaction,
        denominations: {},
        notes: '',
        payment_date: new Date().toISOString().split('T')[0],
        image: null,
      });
    } catch (error) {
      console.error('Error marking transaction as paid:', error);
    }
  };

  if (transaction.paid !== 0) return null;

  return (
    <ChargesForm
      campusId={transaction.campus_id}
      cards={cards}
      fetchStudents={handleMarkAsPaid}
      student_id={transaction.student_id}
      transaction={transaction}
      formData={formData}
      setFormData={setFormData}
      onTransactionUpdate={onTransactionUpdate}
      mode="update"
      student={null}
      icon={false}
    />
  );
};

export default function CobrosPage() {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['all']);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);
  const [expirationDate, setExpirationDate] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState("50");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 200
  });

  // Hooks
  const { activeCampus } = useActiveCampusStore();
  const { toast } = useToast();

  // Event handlers
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.lastPage) {
      setPagination(prev => ({...prev, currentPage: newPage}));
    }
  };
  
  const handleItemsPerPageChange = (value: string) => {
    console.log(value);
    setItemsPerPage(value);
    setPagination(prev => ({...prev, currentPage: 1}));
  };

  // API interactions
  const fetchTransactions = async (page = 1) => {
    if (!activeCampus) return;
    try {
      const params = {
        campus_id: activeCampus?.id,
        expiration_date: expirationDate || null,
        page: page,
        per_page: Number(itemsPerPage)
      };

      const response = await axiosInstance.get('/charges/not-paid', { params });
      setTransactions(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
        perPage: response.data.per_page
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

   useEffect(() => {
    if (!activeCampus) return;
    fetchTransactions(pagination.currentPage);
  }, [activeCampus, pagination.currentPage, itemsPerPage]);

  // Event handlers
  const handleStudentSelect = (values: string[]) => {
    setSelectedStudents(values);
  };

  const handleColumnSelect = (values: string[]) => {
    setVisibleColumns(values);
  };

  const handleOpenImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleShare = (transaction: Transaction) => {
    const url = `https://admin.prexun.com/recibo/${transaction.uuid}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Enlace copiado al portapapeles',
      description: 'Puedes compartir este enlace con tus estudiantes',
      variant: 'default'
    });
  };

  console.log(transactions)
  // Derived data
  const filteredTransactions = transactions?.filter((transaction) => {
    if (!transaction || !transaction.student) return false;
    
    // Filter by search terms
    const studentFullName = `${transaction.student.username || ''} ${transaction.student.firstname || ''} ${transaction.student.lastname || ''}`.toLowerCase();
    const searchTerms = searchStudent.toLowerCase().split(' ');
    const matchesSearch = searchTerms.every((term) => studentFullName.includes(term));

    // Filter by selected students
    const matchesStudent = selectedStudents.includes('all') ||
      selectedStudents.includes(transaction.student.id || '');

    return matchesSearch && matchesStudent;
  }) || [];

  const uniqueStudents = transactions?.length ? transactions
    .map(t => ({
      value: t.student?.id || '',
      label: `${t.student?.firstname} ${t.student?.lastname}`,
    }))
    .filter((student, index, self) =>
      index === self.findIndex(s => s.value === student.value)
    ) : [];

  // Component rendering helpers
  const renderTableHeaders = () => (
    <TableHeader>
      <TableRow>
        {visibleColumns.includes('folio') && <TableHead>Folio</TableHead>}
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
  );

  const renderTransactionRow = (transaction: Transaction) => (
    <TableRow key={transaction.id}>
      {visibleColumns.includes('folio') && (
        <TableCell>{transaction.folio}</TableCell>
      )}
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
          {PAYMENT_METHOD_LABELS[transaction.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || transaction.payment_method}
        </TableCell>
      )}
      {visibleColumns.includes('paid') && (
        <TableCell>{transaction.paid ? 'Si' : 'No'}</TableCell>
      )}
      {visibleColumns.includes('payment_date') && (
        <TableCell>{transaction.payment_date}</TableCell>
      )}
      {visibleColumns.includes('date') && (
        <TableCell>{transaction.created_at}</TableCell>
      )}
      {visibleColumns.includes('notes') && (
        <TableCell>{transaction.notes}</TableCell>
      )}
      {visibleColumns.includes('limit_date') && (
        <TableCell>
          {transaction.expiration_date ? transaction.expiration_date : 'No límite de pago'}
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
          <TransactionActions
            cards={cards}
            transaction={transaction}
            onTransactionUpdate={() => { }}
          />
        </TableCell>
      )}
    </TableRow>
  );

  // Main render
  return (
    <Card>
      <CardHeader className='sticky top-0 z-8 bg-card'>
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
              options={COLUMN_OPTIONS}
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
          {renderTableHeaders()}
          <TableBody>
            {filteredTransactions.map(renderTransactionRow)}
          </TableBody>
        </Table>

        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-3xl">
            <img src={selectedImage} alt="Comprobante" className="w-full" />
          </DialogContent>
        </Dialog>
      </CardContent>

      <CardFooter>
        <div className="flex flex-col sm:flex-row justify-between items-center border-t p-4 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="text-sm text-muted-foreground">
              {filteredTransactions.length} resultados
            </div>
            <Select value={itemsPerPage} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="50 por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Página {pagination.currentPage} de {pagination.lastPage}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}