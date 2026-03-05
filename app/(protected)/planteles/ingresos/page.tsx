'use client';
import { useEffect, useMemo, useState } from 'react';

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
  DialogDescription,
  DialogTrigger,
  DialogFooter,
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
import { createCharge, deleteChargeImage, getCards, getCharges, updateCharge } from '@/lib/api';
import { Student, Transaction } from '@/lib/types';
import { MultiSelect } from '@/components/multi-select';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { ChevronLeft, ChevronRight, Eye, Upload, DollarSign, Pencil, Trash2, Camera } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    string[]
  >(['all']);
  const [selectedCard, setSelectedCard] = useState<string>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [searchFolio, setSearchFolio] = useState('');
  const [sortBy, setSortBy] = useState('folio');
  const [sortDirection, setSortDirection] = useState('asc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [rangePreset, setRangePreset] = useState<string>('all');
  const [groupByMonth, setGroupByMonth] = useState(true);
  const [cards, setCards] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'student',
    'amount',
    'paymentMethod',
    'payment_date',
    'notes',
    'paid',
    'actions',
    'folio',
  ]);

  const [availableColumnIds, setAvailableColumnIds] = useState<string[]>([]);
  const { activeCampus } = useActiveCampusStore();
  const { user, grupos, getFilteredGrupos } = useAuthStore();
    const filteredCampusGroups = useMemo(() => {
      const baseGroups = getFilteredGrupos(activeCampus?.id, undefined);

      return [...baseGroups].sort((a: any, b: any) => {
        const nameA = String(a.name || '').toLowerCase();
        const nameB = String(b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }, [getFilteredGrupos, activeCampus?.id, grupos]);

  const { toast } = useToast();

  const { pagination, setPagination } = usePagination();
  const { config: uiConfig } = useUIConfig();

  const [loading, setLoading] = useState(false);


  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [transactionToUpload, setTransactionToUpload] = useState<Transaction | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);


  const handleUploadClick = (transaction: Transaction) => {
    setTransactionToUpload(transaction);
    setSelectedFile(null);
    setUploadModalOpen(true);
  };


  const handleConfirmUpload = async () => {
    if (!selectedFile || !transactionToUpload) return;

    try {
      setUploading(true);

      const payload = {
        id: transactionToUpload.id,
        image: selectedFile
      } as unknown as Transaction;

      await updateCharge(payload);

      toast({ title: 'Éxito', description: 'Comprobante subido correctamente.' });
      setUploadModalOpen(false);
      fetchIngresos(pagination.currentPage);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudo subir.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };


  const commonColumnDefinitions = [
    {
      id: 'actions',
      label: 'Acciones',
      render: (transaction: Transaction) => (
        <div className="flex items-center justify-right gap-2">
          <InvoicePDF icon={true} invoice={transaction} />
          <Link href={`/recibo/${transaction.uuid}`} target="_blank">
            <Eye className="w-4 h-4 mr-2" />
          </Link>
          {(user?.role === 'super_admin' || user?.role === 'contador' || user?.role === 'contadora') && (
            <>
              <EditarFolio
                transaction={transaction}
                onSuccess={() => fetchIngresos(pagination.currentPage)}
              />
            </>
          )}
        </div>
      ),
    },

    {
      id: 'id',
      label: 'ID',
      render: (transaction: Transaction) => transaction.id,
    },

    {
      id: 'student',
      label: 'Estudiante',
      render: (transaction: Transaction) => (
        <a
          className="text-blue-500"
          href={`/planteles/estudiantes/${transaction.student?.id}`}
        >{`${transaction.student?.firstname} ${transaction.student?.lastname}`}</a>
      ),
    },
    {
      id: 'amount',
      label: 'Monto',
      render: (transaction: Transaction) => `$${transaction.amount}`,
    },
    {
      id: 'paymentMethod',
      label: 'Método',
      render: (transaction: Transaction) => {
        if (transaction.payment_method === 'transfer') return 'Transferencia';
        if (transaction.payment_method === 'card') return 'Tarjeta';
        return transaction.payment_method;
      },
    },
    {
      id: 'paid',
      label: 'Pagado',
      render: (transaction: Transaction) => (transaction.paid ? 'Si' : 'No'),
    },
    {
      id: 'comprobante',
      label: 'Comprobante',
      render: (transaction: Transaction) => (
        <div className="flex items-center gap-2">
          {transaction.image ? (
            <>
              <img
                src={transaction.image as string}
                alt="Miniatura"
                className="w-10 h-10 object-cover rounded"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTransaction(transaction);
                  handleOpenImage(transaction.image as string);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
            </>
          ) : (
            <div className="flex w-full items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                title="Subir comprobante"
                onClick={() => handleUploadClick(transaction)}
                className='h-9 w-9 p-0 flex items-center justify-center'
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ),
      alwaysVisible: true,
    },
    {
      id: 'payment_date',
      label: 'Fecha de pago',
      render: (transaction: Transaction) =>
        transaction.payment_date
          ? new Date(transaction.payment_date).toLocaleDateString()
          : '-',
    },
    {
      id: 'date',
      label: 'Fecha',
      render: (transaction: Transaction) =>
        new Date(transaction.created_at).toLocaleDateString(),
    },
    {
      id: 'folio',
      label: 'Folio',
      render: (transaction: Transaction) => {
        if (!transaction.paid) {
          return 'No Pagado';
        }

        const folioNumber =
          transaction.folio ||
          transaction.folio_cash ||
          transaction.folio_transfer ||
          0;

        return (
          transaction.folio_new + ' ' + folioNumber.toString().padStart(4, '0')
        );
      },
    },
    {
      id: 'notes',
      label: 'Notas',
      render: (transaction: Transaction) => transaction.notes,
    },
  ];

  const canDeleteComprobante =
    user?.role === 'super_admin' ||
    user?.role === 'contador' ||
    user?.role === 'contadora';

  const handleDeleteComprobante = async (id?: number) => {
    const targetId = id || selectedTransaction?.id;
    if (!targetId) return;

    if (id) setUploadModalOpen(false);

    if (!canDeleteComprobante) {
      toast({
        title: 'Sin permisos',
        description: 'No tienes permisos para eliminar el comprobante.',
        variant: 'destructive',
      });
      return;
    }
    const ok = window.confirm('¿Seguro que quieres eliminar el comprobante?');
    if (!ok) return;

    try {
      setDeletingImage(true);
      await deleteChargeImage(targetId);

      toast({ title: 'Éxito', description: 'Comprobante eliminado correctamente.' });

      setImageModalOpen(false);
      setSelectedImage('');
      setSelectedTransaction(null);

      fetchIngresos(pagination.currentPage);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'No se pudo eliminar.', variant: 'destructive' });
    } finally {
      setDeletingImage(false);
    }
  };

  const generateDynamicColumns = (transactions: Transaction[]) => {
    if (!transactions.length) return [];

    const sampleTransaction = transactions[0];
    const allKeys = Object.keys(sampleTransaction);

    const knownColumnIds = commonColumnDefinitions.map((col) => col.id);
    const dynamicColumns = allKeys
      .filter(
        (key) =>
          !knownColumnIds.includes(key) &&
          typeof sampleTransaction[key as keyof Transaction] !== 'object' &&
          key !== 'student' &&
          key !== 'image' &&
          key !== 'uuid' &&
          key !== 'created_at' &&
          key !== 'payment_method' &&
          key !== 'student_id' &&
          key !== 'transaction_type' &&
          key !== 'updated_at' &&
          key !== 'campus_id' &&
          key !== 'expiration_date' &&
          key !== 'cash_register_id' &&
          key !== 'card_id' &&
          key !== 'folio_sat' &&
          key !== 'sat'
      )
      .map((key) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        render: (transaction: Transaction) => {
          const value = transaction[key as keyof Transaction];

          if (typeof value === 'boolean') return value ? 'Sí' : 'No';
          if (value instanceof Date) return value.toLocaleDateString();
          if (value === null || value === undefined) return '-';

          return String(value);
        },
      }));

    return dynamicColumns;
  };

  const [columnDefinitions, setColumnDefinitions] = useState<Array<any>>(
    commonColumnDefinitions
  );

  useEffect(() => {
    if (!activeCampus) return;
    fetchIngresos(pagination.currentPage);
  }, [
    activeCampus,
    pagination.currentPage,
    pagination.perPage,
    searchStudent,
    selectedPaymentMethods,
    selectedCard,
    selectedGroupId,
    searchFolio,
    sortBy,
    sortDirection,
    dateFrom,
    dateTo,
    rangePreset,
    groupByMonth,
  ]);

  useEffect(() => {
    const fetchCards = async () => {
      if (!activeCampus) return;
      try {
        const data = await getCards(activeCampus.id);
        setCards(data || []);
      } catch (error) {
        console.error('Error fetching cards:', error);
        setCards([]);
      }
    };
    fetchCards();
  }, [activeCampus]);

  useEffect(() => {
    if (transactions.length > 0) {
      const dynamicCols = generateDynamicColumns(transactions);
      const allColumns = [...commonColumnDefinitions, ...dynamicCols];
      setColumnDefinitions(allColumns);

      const allColumnIds = allColumns.map((col) => col.id);
      setAvailableColumnIds(allColumnIds);

      const newColumnIds = dynamicCols.map((col) => col.id);
      const newVisibleColumnIds = [...visibleColumns];

      let hasNewColumns = false;
      newColumnIds.forEach((id) => {
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
        selectedPaymentMethods.includes('all')
          ? undefined
          : selectedPaymentMethods[0],
        selectedCard === 'all' ? undefined : selectedCard,
        searchFolio,
        sortBy,
        sortDirection,
        dateFrom,
        dateTo,
        groupByMonth,
        selectedGroupId,
        rangePreset
      );

      setTransactions(response.data);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
        perPage: parseInt(pagination.perPage.toString()),
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleColumnSelect = (values: string[]) => {
    const validValues = values.filter(
      (value) => availableColumnIds.includes(value) || value === 'all'
    );
    setVisibleColumns(validValues);
  };

  const handleOpenImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };


  const columnOptions = columnDefinitions
    .filter((col) => !col.alwaysVisible)
    .map((col) => ({ value: col.id, label: col.label }));



  const getVisibleColumns = () => {
    return columnDefinitions.filter(
      (col) => visibleColumns.includes(col.id) || col.alwaysVisible
    );
  };

  const groupedTransactionsByMonth = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat('es-MX', {
      month: 'long',
      year: 'numeric',
    });

    const groups = new Map<string, { label: string; items: Transaction[] }>();

    transactions.forEach((transaction) => {
      const rawDate = transaction.payment_date || transaction.created_at;
      const parsedDate = rawDate ? new Date(rawDate) : null;

      const key = parsedDate
        ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
        : 'sin-fecha';

      const label = parsedDate
        ? monthFormatter.format(parsedDate).replace(/^\w/, (char) => char.toUpperCase())
        : 'Sin fecha';

      if (!groups.has(key)) {
        groups.set(key, { label, items: [] });
      }

      groups.get(key)?.items.push(transaction);
    });

    return Array.from(groups.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([, value]) => value);
  }, [transactions]);

  return (
    <div>
      <Card className="w-full overflow-hidden">
        <CardHeader className="sticky top-0 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Buscar estudiante</Label>
              <Input
                placeholder="Buscar por nombre completo..."
                value={searchStudent}
                onChange={(e) => {
                  setSearchStudent(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Buscar folio</Label>
              <Input
                placeholder="Buscar por Folio"
                value={searchFolio}
                onChange={(e) => {
                  setSearchFolio(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Ordenar por</Label>
              <Select
                value={sortBy}
                onValueChange={(val) => {
                  setSortBy(val);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="folio">Folio</SelectItem>
                  <SelectItem value="created_at">Fecha de creación</SelectItem>
                  <SelectItem value="payment_date">Fecha de pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Dirección</Label>
              <Select
                value={sortDirection}
                onValueChange={(val) => {
                  setSortDirection(val);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Dirección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascendente</SelectItem>
                  <SelectItem value="desc">Descendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Fecha desde</Label>
              <Input
                type="date"
                placeholder="Desde"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Fecha hasta</Label>
              <Input
                type="date"
                placeholder="Hasta"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Rango rápido</Label>
              <Select
                value={rangePreset}
                onValueChange={(value) => {
                  setRangePreset(value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Rango" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo</SelectItem>
                  <SelectItem value="current_month">Este mes</SelectItem>
                  <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                  <SelectItem value="last_100_folios">Últimos 100 folios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Grupo</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grupos</SelectItem>
                  {filteredCampusGroups.map((group: any) => (
                    <SelectItem key={String(group.id)} value={String(group.id)}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="groupByMonth"
                checked={groupByMonth}
                onChange={(e) => {
                  setGroupByMonth(e.target.checked);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
                className="h-4 w-4"
              />
              <Label htmlFor="groupByMonth" className="text-sm cursor-pointer">
                Agrupar por mes
              </Label>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Método de pago</Label>
              <Select
                value={
                  selectedPaymentMethods.includes('all')
                    ? 'all'
                    : selectedPaymentMethods[0]
                }
                onValueChange={(value) => {
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
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
            </div>

            {!selectedPaymentMethods.includes('all') &&
              selectedPaymentMethods[0] === 'card' && (
                <div className="space-y-1">
                  <Label className="text-xs">Tarjeta</Label>
                  <Select
                    value={selectedCard}
                    onValueChange={(val) => {
                      setSelectedCard(val);
                      setPagination(prev => ({ ...prev, currentPage: 1 }));
                    }}
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
                </div>
              )}

            <div className="space-y-1">
              <Label className="text-xs">Columnas visibles</Label>
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

            <AgregarIngreso />
            <Link
              href="/planteles/ingresos/actualizar"
              className={buttonVariants({ variant: 'default', size: 'sm' })}
            >
              <span className="hidden sm:inline">Actualizar Folios</span>
              <span className="sm:hidden">Actualizar</span>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : (
            <div className="relative overflow-x-auto w-full border-b">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    {getVisibleColumns().map((column) => (
                      <TableHead key={column.id} className="whitespace-nowrap">
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    groupByMonth ? (
                      groupedTransactionsByMonth.flatMap((group) => {
                        const monthLabelRow = (
                          <TableRow key={`month-${group.label}`} className="bg-muted/40">
                            <TableCell colSpan={getVisibleColumns().length} className="font-semibold">
                              {group.label}
                            </TableCell>
                          </TableRow>
                        );

                        const rows = group.items.map((transaction) => (
                          <TableRow key={transaction.id}>
                            {getVisibleColumns().map((column) => (
                              <TableCell
                                key={`${transaction.id}-${column.id}`}
                                className="whitespace-nowrap"
                              >
                                {column.render(transaction)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ));

                        return [monthLabelRow, ...rows];
                      })
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          {getVisibleColumns().map((column) => (
                            <TableCell
                              key={`${transaction.id}-${column.id}`}
                              className="whitespace-nowrap"
                            >
                              {column.render(transaction)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )
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
          <PaginationComponent
            pagination={pagination}
            setPagination={setPagination}
          />
        </CardFooter>
      </Card>

      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subir Comprobante</DialogTitle>
            <DialogDescription>
              Selecciona un archivo de imagen para guardar como comprobante.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid w-full items-center gap-4">
              <Label htmlFor="picture">Selecciona el archivo</Label>
              <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                disabled={uploading}
              />
            </div>

            {uploading && (
              <p className="text-center text-sm text-muted-foreground">
                Subiendo archivo...
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadModalOpen(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Guardando...' : 'Subir y Guardar'}
            </Button>
          </DialogFooter>
          {user?.role === 'super_admin' && (
            <div className="py-4 border-t mt-4">
              <h4 className="text-sm font-medium mb-2">Gestión de Comprobante (Solo Admin)</h4>
              {/* Cambia transaction.image por transactionToUpload?.image */}
              {transactionToUpload?.image ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={transactionToUpload.image as string} target="_blank"> <Eye className="w-4 h-4 mr-2" /> Ver </a>
                  </Button>
                  {/* Cambia handleDelete por handleDeleteComprobante(transactionToUpload.id) */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteComprobante(transactionToUpload.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">Sin comprobante</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para ver imagen corregido */}
      <Dialog
        open={imageModalOpen}
        onOpenChange={(open) => {
          setImageModalOpen(open);
          if (!open) {
            setSelectedImage('');
            setSelectedTransaction(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden bg-black/90 border-none [&>button]:text-white [&>button]:top-4 [&>button]:right-4">
          <DialogTitle className="sr-only">Vista previa del comprobante</DialogTitle>
          <DialogDescription className="sr-only">
            Imagen ampliada del comprobante de pago seleccionado
          </DialogDescription>


          <div className="absolute top-4 right-14 z-50 flex items-center gap-2">
            {canDeleteComprobante && (
              <Button
                variant="destructive"
                size="sm"
                className="h-8"
                onClick={() => handleDeleteComprobante(selectedTransaction?.id)}
                disabled={deletingImage || !selectedTransaction}
              >
                {deletingImage ? 'Eliminando...' : 'Eliminar comprobante'}
              </Button>
            )}
          </div>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Comprobante completo"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}