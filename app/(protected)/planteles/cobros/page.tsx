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
import PaginationComponent from '@/components/ui/PaginationComponent';
import { usePagination } from '@/hooks/usePagination';

export default function CobrosPage() {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['all']);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['all']);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['student', 'amount', 'paymentMethod', 'payment_date', 'notes', 'paid', 'actions', 'folio']);

  const [availableColumnIds, setAvailableColumnIds] = useState<string[]>([]);
  const { activeCampus } = useActiveCampusStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const {pagination, setPagination} = usePagination();


  const [loading, setLoading] = useState(false);

  const commonColumnDefinitions = [
    {
      id: 'id',
      label: 'ID',
      render: (transaction: Transaction) => transaction.id
    },
    {
      id: 'folio',
      label: 'Folio',
      render: (transaction: Transaction) => transaction.folio
    },
    {
      id: 'folio_new',
      label: 'Nuevo Folio',
      render: (transaction: Transaction) => transaction.folio_new
    },
    {
      id: 'student',
      label: 'Estudiante',
      render: (transaction: Transaction) =>
        `${transaction.student?.firstname} ${transaction.student?.lastname}`
    },
    {
      id: 'amount',
      label: 'Monto',
      render: (transaction: Transaction) => `${transaction.amount}`
    },
    {
      id: 'paymentMethod',
      label: 'Método',
      render: (transaction: Transaction) => {
        if (transaction.payment_method === 'transfer') return 'Transferencia';
        if (transaction.payment_method === 'card') return 'Tarjeta';
        return transaction.payment_method;
      }
    },
    {
      id: 'paid',
      label: 'Pagado',
      render: (transaction: Transaction) => transaction.paid ? 'Si' : 'No'
    },
    {
      id: 'payment_date',
      label: 'Fecha de pago',
      render: (transaction: Transaction) => transaction.payment_date
    },
    {
      id: 'date',
      label: 'Fecha',
      render: (transaction: Transaction) =>
        new Date(transaction.created_at).toLocaleDateString()
    },
    {
      id: 'notes',
      label: 'Notas',
      render: (transaction: Transaction) => transaction.notes
    },
    {
      id: 'limit_date',
      label: 'Fecha límite de pago',
      render: (transaction: Transaction) =>
        transaction.expiration_date
          ? new Date(transaction.expiration_date).toLocaleDateString()
          : 'No límite de pago'
    },
    {
      id: 'comprobante',
      label: 'Comprobante',
      render: (transaction: Transaction) => (
        transaction.image ? (
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
        ) : null
      ),
      alwaysVisible: true // Esta columna siempre se muestra
    },
    {
      id: 'actions',
      label: 'Acciones',
      render: (transaction: Transaction) => (
        <div className="p-4 flex items-center justify-right gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleShare(transaction)}>
            <Share className="w-4 h-4 mr-2" />
          </Button>
          <InvoicePDF icon={true} invoice={transaction} />
          <Link href={`/recibo/${transaction.uuid}`} target='_blank'>
            <Eye className="w-4 h-4 mr-2" />
          </Link>
          {(user?.role === 'super_admin' || user?.role === 'contador') &&
            <EditarFolio
              transaction={transaction}
              onSuccess={() => fetchTransactions(pagination.currentPage)}
            />
          }
        </div>
      )
    },
  ];

  // Función para generar definiciones de columnas dinámicas basadas en los datos recibidos
  const generateDynamicColumns = (transactions: Transaction[]) => {
    if (!transactions.length) return [];

    // Extraer todas las claves de la primera transacción
    const sampleTransaction = transactions[0];
    const allKeys = Object.keys(sampleTransaction);

    // Crear columnas dinámicas para las propiedades que no están en las columnas predefinidas
    const knownColumnIds = commonColumnDefinitions.map(col => col.id);
    const dynamicColumns = allKeys
      .filter(key =>
        // Excluir propiedades que ya tenemos definidas o que son objetos complejos
        !knownColumnIds.includes(key) &&
        typeof sampleTransaction[key as keyof Transaction] !== 'object' &&
        key !== 'student' && // Ya manejamos student en una columna personalizada
        key !== 'image' && // Ya manejamos image en la columna comprobante
        key !== 'uuid' && // No necesitamos mostrar el UUID
        key !== 'created_at' && // Ya manejamos created_at en la columna date
        key !== 'payment_method' // Ya manejamos payment_method en la columna paymentMethod
      )
      .map(key => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), // Formato más legible
        render: (transaction: Transaction) => {
          const value = transaction[key as keyof Transaction];

          // Formatear valores según su tipo
          if (typeof value === 'boolean') return value ? 'Sí' : 'No';
          if (value instanceof Date) return value.toLocaleDateString();
          if (value === null || value === undefined) return '-';

          return String(value);
        }
      }));

    return dynamicColumns;
  };

  // Combinar columnas conocidas con columnas dinámicas
  const [columnDefinitions, setColumnDefinitions] = useState<Array<any>>(commonColumnDefinitions);

  useEffect(() => {
    if (!activeCampus) return;
    fetchTransactions(pagination.currentPage);
  }, [activeCampus, pagination.currentPage, pagination.perPage]);

  // Actualizar las definiciones de columnas cuando se carguen las transacciones
  useEffect(() => {
    if (transactions.length > 0) {
      const dynamicCols = generateDynamicColumns(transactions);
      const allColumns = [...commonColumnDefinitions, ...dynamicCols];
      setColumnDefinitions(allColumns);

      // Actualizar el listado de IDs de columnas disponibles
      const allColumnIds = allColumns.map(col => col.id);
      setAvailableColumnIds(allColumnIds);

      // Añadir columnas dinámicas nuevas al listado de columnas visibles si no están ya
      const newColumnIds = dynamicCols.map(col => col.id);
      const newVisibleColumnIds = [...visibleColumns];

      let hasNewColumns = false;
      newColumnIds.forEach(id => {
        if (!visibleColumns.includes(id)) {
          newVisibleColumnIds.push(id);
          hasNewColumns = true;
        }
      });

      if (hasNewColumns) {
        setVisibleColumns(newVisibleColumnIds);
      }
    }
  }, [transactions]);

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getCharges(Number(activeCampus.id), page, parseInt(pagination.perPage.toString()));

      setTransactions(response.data);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
        perPage: parseInt(pagination.perPage.toString())
      });

    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
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
    // Validar que todas las columnas seleccionadas existan en las columnas disponibles
    const validValues = values.filter(value =>
      availableColumnIds.includes(value) || value === 'all'
    );
    setVisibleColumns(validValues);
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

  // Usar las definiciones de columnas para crear las opciones de columnas
  const columnOptions = columnDefinitions
    .filter(col => !col.alwaysVisible) // Excluimos columnas que siempre se muestran
    .map(col => ({ value: col.id, label: col.label }));

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

  // Obtiene las columnas visibles más las que siempre deben mostrarse
  const getVisibleColumns = () => {
    return columnDefinitions.filter(col =>
      visibleColumns.includes(col.id) || col.alwaysVisible
    );
  };

  return (
    <div>
      <Card className="w-full overflow-hidden">
        <CardHeader className='sticky top-0 z-20 bg-card'>
          <div className="flex flex-col space-y-4">
            {/* Primera fila: Search + Botones de acción */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-4">
              <Input
                placeholder="Buscar por nombre completo..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full"
              />
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <AgregarIngreso />
                <Link href="/planteles/cobros/actualizar" className={buttonVariants({ variant: 'default' })}>
                  <span className="hidden sm:inline">Actualizar Folios</span>
                  <span className="sm:hidden">Actualizar</span>
                </Link>
              </div>
            </div>

            {/* Segunda fila: Filtros de métodos de pago */}
            <div className="flex gap-2 w-full overflow-x-auto pb-2">
              <Button
                variant={selectedPaymentMethods.includes('all') ? 'default' : 'outline'}
                onClick={() => setSelectedPaymentMethods(['all'])}
                className="whitespace-nowrap"
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={selectedPaymentMethods.includes('transfer') ? 'default' : 'outline'}
                onClick={() => handlePaymentMethodChange('transfer')}
                className="whitespace-nowrap"
                size="sm"
              >
                Transferencia
              </Button>
              <Button
                variant={selectedPaymentMethods.includes('card') ? 'default' : 'outline'}
                onClick={() => handlePaymentMethodChange('card')}
                className="whitespace-nowrap"
                size="sm"
              >
                Tarjeta
              </Button>
            </div>

            {/* Tercera fila: MultiSelect */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Tabla con contenedor mejorado */}
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando...</div>

          ) : (
            <div className="h-full overflow-x-auto max-w-[80vw]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    {getVisibleColumns().map(column => (
                      <TableHead key={column.id} className="whitespace-nowrap">{column.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        {getVisibleColumns().map(column => (
                          <TableCell key={`${transaction.id}-${column.id}`} className="whitespace-nowrap">
                            {column.render(transaction)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={getVisibleColumns().length} className="text-center py-4">
                        No se encontraron transacciones
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Paginación */}
        <CardFooter>
          <PaginationComponent pagination={pagination} setPagination={setPagination} />
        </CardFooter>
      </Card>
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] h-full overflow-y-auto">
          <img src={selectedImage} alt="Comprobante" className="w-full" />
        </DialogContent>
      </Dialog>
    </div>
  );
}