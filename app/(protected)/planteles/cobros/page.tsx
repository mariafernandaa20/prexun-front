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
import { Button, buttonVariants } from '@/components/ui/button';
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
import { ChevronLeft, ChevronRight, Eye, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import InvoicePDF from '@/components/invoice_pdf';
import Link from 'next/link';
import AgregarIngreso from './AgregarIngreso';
import EditarFolio from './EditarFolio';
import ActualizarFolios from './actualizar/ActualizarFolios';
import { useAuthStore } from '@/lib/store/auth-store';

export default function CobrosPage() {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['all']);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['all']);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['student', 'amount', 'paymentMethod', 'date', 'notes', 'paid', 'limit_date', 'actions', 'folio']);
  const { activeCampus } = useActiveCampusStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // Agregar estados para manejar la paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 200
  });
  
  const [loading, setLoading] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState("50");

  useEffect(() => {
    if (!activeCampus) return;
    fetchTransactions(pagination.currentPage);
  }, [activeCampus, pagination.currentPage, itemsPerPage]);

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getCharges(Number(activeCampus.id), page, parseInt(itemsPerPage));
      
      setTransactions(response.data);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
        perPage: parseInt(itemsPerPage)
      });

    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.lastPage) {
      setPagination(prev => ({...prev, currentPage: newPage}));
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value);
    setPagination(prev => ({...prev, currentPage: 1})); // Regresar a primera página al cambiar items por página
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
  
  const handleOpenImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
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
    { value: 'payment_date', label: 'Fecha de pago' },
    { value: 'date', label: 'Fecha' },
    { value: 'notes', label: 'Notas' },
    { value: 'paid', label: 'Pagado' },
    { value: 'folio', label: 'Folio' },
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
      <CardHeader className='sticky top-0 z-8 bg-card'>
        <div className="flex gap-4 justify-between">
          <div className='flex gap-4'>
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
          <div className="flex gap-2">
            <AgregarIngreso />
            <Link href="/planteles/cobros/actualizar" className={buttonVariants({variant:'default'})}>Actualizar Folios</Link>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Cargando transacciones...</p>
          </div>
        ) : (
          <Table>
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
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    {visibleColumns.includes('folio') && (
                      <TableCell>
                        {transaction.folio}
                      </TableCell>
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
                        {new Date(transaction.payment_date).toLocaleDateString()}
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
                    {visibleColumns.includes('limit_date') && (
                      <TableCell>
                        {transaction.expiration_date ? new Date(transaction.expiration_date).toLocaleDateString() : 'No límite de pago'}
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
                        {user?.role === 'super_admin' && <EditarFolio transaction={transaction} onSuccess={() => fetchTransactions(pagination.currentPage)} />}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} className="text-center py-4">
                    No se encontraron transacciones
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] h-full overflow-y-scroll">
            <img src={selectedImage} alt="Comprobante" className="w-full" />
          </DialogContent>
        </Dialog>
      </CardContent>
      
      {/* Paginación */}
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t p-4 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="text-sm text-muted-foreground">
            Mostrando {Math.min(pagination.total, (pagination.currentPage - 1) * pagination.perPage + 1)} a {Math.min(pagination.total, pagination.currentPage * pagination.perPage)} de {pagination.total} transacciones
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="itemsPerPage" className="text-sm">
              Ítems por página:
            </Label>
            <Select value={itemsPerPage} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger id="itemsPerPage" className="w-[80px]">
                <SelectValue placeholder="200" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
              // Determine which page numbers to show based on current page
              let pageNum;
              if (pagination.lastPage <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.lastPage - 2) {
                pageNum = pagination.lastPage - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={pagination.currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.lastPage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}