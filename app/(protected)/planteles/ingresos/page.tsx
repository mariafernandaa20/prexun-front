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
import { useUIConfig } from '@/hooks/useUIConfig';

export default function CobrosPage() {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['all']);
  const [selectedCard, setSelectedCard] = useState<string>('all');
  const [cards, setCards] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['student', 'amount', 'paymentMethod', 'payment_date', 'notes', 'paid', 'actions', 'folio']);

  const [availableColumnIds, setAvailableColumnIds] = useState<string[]>([]);
  const { activeCampus } = useActiveCampusStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const { pagination, setPagination } = usePagination();
  const { config: uiConfig } = useUIConfig();


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
      alwaysVisible: true
    },
    {
      id: 'actions',
      label: 'Acciones',
      render: (transaction: Transaction) => (
        <div className="flex items-center justify-right gap-2">
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
              onSuccess={() => fetchIngresos(pagination.currentPage)}
            />
          }
        </div>
      )
    },
  ];

  const generateDynamicColumns = (transactions: Transaction[]) => {
    if (!transactions.length) return [];

    const sampleTransaction = transactions[0];
    const allKeys = Object.keys(sampleTransaction);

    const knownColumnIds = commonColumnDefinitions.map(col => col.id);
    const dynamicColumns = allKeys
      .filter(key =>
        !knownColumnIds.includes(key) &&
        typeof sampleTransaction[key as keyof Transaction] !== 'object' &&
        key !== 'student' &&
        key !== 'image' &&
        key !== 'uuid' &&
        key !== 'created_at' &&
        key !== 'payment_method'
      )
      .map(key => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        render: (transaction: Transaction) => {
          const value = transaction[key as keyof Transaction];

          if (typeof value === 'boolean') return value ? 'Sí' : 'No';
          if (value instanceof Date) return value.toLocaleDateString();
          if (value === null || value === undefined) return '-';

          return String(value);
        }
      }));

    return dynamicColumns;
  };

  const [columnDefinitions, setColumnDefinitions] = useState<Array<any>>(commonColumnDefinitions);

  useEffect(() => {
    if (!activeCampus) return;
    fetchIngresos(pagination.currentPage);
  }, [activeCampus, pagination.currentPage, pagination.perPage, searchStudent, selectedPaymentMethods, selectedCard]);

  useEffect(() => {
    const fetchCards = async () => {
      if (!activeCampus) return;
      try {
        const response = await axios.get('/cards', {
          params: { campus_id: activeCampus.id }
        });
        setCards(response.data || []);
      } catch (error) {
        console.error('Error fetching cards:', error);
      }
    };
    fetchCards();
  }, [activeCampus]);

  useEffect(() => {
    if (transactions.length > 0) {
      const dynamicCols = generateDynamicColumns(transactions);
      const allColumns = [...commonColumnDefinitions, ...dynamicCols];
      setColumnDefinitions(allColumns);

      const allColumnIds = allColumns.map(col => col.id);
      setAvailableColumnIds(allColumnIds);

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

  const fetchIngresos = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getCharges(
        Number(activeCampus.id), 
        page, 
        parseInt(pagination.perPage.toString()),
        searchStudent,
        selectedPaymentMethods.includes('all') ? undefined : selectedPaymentMethods[0],
        selectedCard === 'all' ? undefined : selectedCard
      );

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

  const handleColumnSelect = (values: string[]) => {
    const validValues = values.filter(value =>
      availableColumnIds.includes(value) || value === 'all'
    );
    setVisibleColumns(validValues);
  };

  const handleOpenImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const columnOptions = columnDefinitions
    .filter(col => !col.alwaysVisible)
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

  const getVisibleColumns = () => {
    return columnDefinitions.filter(col =>
      visibleColumns.includes(col.id) || col.alwaysVisible
    );
  };

  return (
    <div>
      <Card className="w-full overflow-hidden">
        <CardHeader className='sticky top-0 z-20 bg-card'>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">

            <Input
              placeholder="Buscar por nombre completo..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full"
            />

            <Select
              value={selectedPaymentMethods.includes('all') ? 'all' : selectedPaymentMethods[0]}
              onValueChange={(value) => {
                if (value === 'all') {
                  setSelectedPaymentMethods(['all']);
                  setSelectedCard('all');
                } else {
                  setSelectedPaymentMethods([value]);
                  if (value !== 'card') {
                    setSelectedCard('all');
                  }
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {uiConfig?.payment_methods_enabled?.includes('transfer') && (
                  <SelectItem value="transfer">Transferencia</SelectItem>
                )}
                {uiConfig?.payment_methods_enabled?.includes('card') && (
                  <SelectItem value="card">Tarjeta</SelectItem>
                )}
                {uiConfig?.payment_methods_enabled?.includes('cash') && (
                  <SelectItem value="cash">Efectivo</SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Selector de tarjetas - solo aparece cuando el método es "Tarjeta" */}
            {!selectedPaymentMethods.includes('all') && selectedPaymentMethods[0] === 'card' && (
              <Select
                value={selectedCard}
                onValueChange={setSelectedCard}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las tarjetas</SelectItem>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id.toString()}>
                      {card.number} - {card.bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

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

            <AgregarIngreso />
            <Link href="/planteles/ingresos/actualizar" className={buttonVariants({ variant: 'default', size: 'sm' })}>
              <span className="hidden sm:inline">Actualizar Folios</span>
              <span className="sm:hidden">Actualizar</span>
            </Link>
          </div>
        </CardHeader>

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
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
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
                      <TableCell colSpan={getVisibleColumns().length}>
                        No se encontraron transacciones
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

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