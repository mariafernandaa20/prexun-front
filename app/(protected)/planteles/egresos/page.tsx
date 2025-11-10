'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { Gasto } from '@/lib/types';
import { createGasto, deleteGasto, getGastos } from '@/lib/api';
import { Pencil, Trash, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MultiSelect } from '@/components/multi-select';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { GastoModal } from './components/GastoModal';
import PaginationComponent from '@/components/ui/PaginationComponent';
import { usePagination } from '@/hooks/usePagination';
import { useAuthStore } from '@/lib/store/auth-store';
import { QRSignature } from '@/components/QRSignature';
import { toast } from '@/hooks/use-toast';

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState<Gasto | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredGastos, setFilteredGastos] = useState<Gasto[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [selectedGastoForSignature, setSelectedGastoForSignature] =
    useState<Gasto | null>(null);
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);

  const { pagination, setPagination } = usePagination();
  const { user } = useAuthStore();

  const tableColumns = [
    {
      id: 'folio',
      label: 'Folio',
      render: (gasto: Gasto) =>
        gasto?.folio_prefix?.toString() + gasto?.folio?.toString(),
    },
    {
      id: 'fecha',
      label: 'Fecha',
      render: (gasto: Gasto) =>
        format(new Date(gasto.date), 'dd/MM/yyyy', { locale: es }),
    },
    {
      id: 'empleado',
      label: 'Empleado',
      render: (gasto: Gasto) => gasto?.admin?.name,
    },
    {
      id: 'recibe',
      label: 'Recibe',
      render: (gasto: Gasto) => gasto?.user?.name,
    },
    {
      id: 'concepto',
      label: 'Concepto',
      render: (gasto: Gasto) => gasto.concept,
    },
    {
      id: 'categoria',
      label: 'Categoria',
      render: (gasto: Gasto) => gasto.category,
    },
    {
      id: 'monto',
      label: 'Monto',
      render: (gasto: Gasto) => `$${gasto.amount}`,
    },
    {
      id: 'comprobante',
      label: 'Comprobante',
      render: (gasto: Gasto) =>
        gasto.image ? (
          <div className="flex items-center gap-2">
            <img
              src={gasto.image as string}
              alt="Miniatura"
              className="w-10 h-10 object-cover rounded"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenImage(gasto.image as string)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
          </div>
        ) : null,
    },
    {
      id: 'firma',
      label: 'Firma',
      render: (gasto: Gasto) =>
        gasto.signature ? (
          <div className="flex items-center gap-2">
            {user?.role === 'super_admin' ? (
              <>
                <img
                  src={gasto.signature as string}
                  alt="Firma"
                  className="w-16 h-8 object-contain rounded border"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenImage(gasto.signature as string)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              </>
            ) : (
              <div className="text-center w-full">Firmado</div>
            )}
          </div>
        ) : gasto.id ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenSignatureModal(gasto)}
            className="w-full"
          >
            Firmar
          </Button>
        ) : (
          <span className="text-gray-400 text-sm">Sin ID</span>
        ),
    },
    {
      id: 'acciones',
      label: 'Acciones',
      render: (gasto: Gasto) =>
        user?.role === 'super_admin' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenModal(gasto)}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteGasto(gasto.id)}
            >
              <Trash />
            </Button>
          </>
        ),
    },
  ];

  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'fecha',
    'empleado',
    'recibe',
    'concepto',
    'categoria',
    'monto',
    'comprobante',
    'firma',
    'acciones',
    'folio',
  ]);

  const columnOptions = tableColumns.map((col) => ({
    label: col.label,
    value: col.id,
  }));

  const categories = Array.from(new Set(gastos.map((gasto) => gasto.category)));

  const handleOpenModal = (gasto?: Gasto) => {
    setSelectedGasto(gasto || null);
    console.log(gasto);
    setIsModalOpen(true);
  };

  const handleOpenImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const onSubmit = async (data: Gasto) => {
    await createGasto(data as Gasto & { image?: File });
    setIsModalOpen(false);
    fetchGastos();
  };

  const handleDeleteGasto = async (id: number) => {
    await deleteGasto(id.toString());
    fetchGastos();
  };

  const handleOpenSignatureModal = (gasto: Gasto) => {
    setSelectedGastoForSignature(gasto);
    setSignatureModalOpen(true);
  };

  const handleCloseSignatureModal = () => {
    setSelectedGastoForSignature(null);
    setSignatureModalOpen(false);
  };

  const handleExternalSignatureUpdate = (signature: string) => {
    if (!selectedGastoForSignature) return;

    // Actualizar el gasto en el estado local
    setGastos((prevGastos) =>
      prevGastos.map((gasto) =>
        gasto.id === selectedGastoForSignature.id
          ? { ...gasto, signature }
          : gasto
      )
    );

    setFilteredGastos((prevFiltered) =>
      prevFiltered.map((gasto) =>
        gasto.id === selectedGastoForSignature.id
          ? { ...gasto, signature }
          : gasto
      )
    );

    handleCloseSignatureModal();
    toast({
      title: 'Firma recibida',
      description: 'La firma externa ha sido recibida exitosamente',
    });
  };

  useEffect(() => {
    if (!activeCampus) return;

    fetchGastos();
  }, [activeCampus]);

  const fetchGastos = async () => {
    const response = await getGastos(activeCampus.id);
    setGastos(response);
    setPagination({
      currentPage: response.current_page,
      lastPage: response.last_page,
      total: response.total,
      perPage: parseInt(pagination.perPage.toString()),
    });
    setFilteredGastos(response);
  };

  useEffect(() => {
    let filtered = [...gastos];

    if (startDate && endDate) {
      filtered = filtered.filter((gasto) => {
        const gastoDate = new Date(gasto.date);
        return (
          gastoDate >= new Date(startDate) && gastoDate <= new Date(endDate)
        );
      });
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(
        (gasto) => gasto.category === selectedCategory
      );
    }

    setFilteredGastos(filtered);
  }, [startDate, endDate, selectedCategory, gastos, activeCampus]);

  const handleColumnSelect = (selected: string[]) => {
    setVisibleColumns(selected);
  };

  // Filtrar las columnas que son visibles
  const visibleTableColumns = tableColumns.filter((column) =>
    visibleColumns.includes(column.id)
  );

  return (
    <Card className="w-full">
      <CardHeader className="sticky z-[20] top-0 z-8 bg-card">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gastos del Plantel</h1>
          <div className="flex flex-col lg:flex-row items-center gap-2">
            <div className="flex flex-col">
              <label>Fecha Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label>Fecha Fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label>Categoría</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label>Columnas</label>
              <MultiSelect
                options={columnOptions}
                title="Columnas"
                selectedValues={visibleColumns}
                hiddeBadages
                onSelectedChange={handleColumnSelect}
                placeholder="Seleccionar columnas"
                searchPlaceholder="Buscar columna..."
                emptyMessage="No se encontraron columnas"
              />
            </div>
            {activeCampus?.latest_cash_register ? (
              <Button className="mt-6" onClick={() => handleOpenModal()}>
                Nuevo Egreso
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <div className="max-w-[90vw] mx-auto overflow-hidden">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {visibleTableColumns.map((column) => (
                  <TableHead key={column.id}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGastos.map((gasto) => (
                <TableRow key={gasto.id}>
                  {visibleTableColumns.map((column) => (
                    <TableCell key={`${gasto.id}-${column.id}`}>
                      {column.render(gasto)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </div>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t p-4 gap-2">
        <PaginationComponent
          pagination={pagination}
          setPagination={setPagination}
        />
      </CardFooter>
      {activeCampus?.latest_cash_register ? (
        <GastoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedGasto={selectedGasto}
          onSubmit={onSubmit}
        />
      ) : null}

      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-3xl">
          <img src={selectedImage} alt="Comprobante" className="w-full" />
        </DialogContent>
      </Dialog>

      {/* Modal de Firma Externa */}
      <Dialog
        open={signatureModalOpen}
        onOpenChange={handleCloseSignatureModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Firma Digital - {selectedGastoForSignature?.concept}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Concepto:</strong> {selectedGastoForSignature?.concept}
              </p>
              <p>
                <strong>Monto:</strong> ${selectedGastoForSignature?.amount}
              </p>
              <p>
                <strong>Fecha:</strong>{' '}
                {selectedGastoForSignature?.date
                  ? format(
                      new Date(selectedGastoForSignature.date),
                      'dd/MM/yyyy',
                      { locale: es }
                    )
                  : ''}
              </p>
            </div>
            {selectedGastoForSignature && (
              <QRSignature
                gastoId={selectedGastoForSignature.id}
                onSignatureUpdate={handleExternalSignatureUpdate}
              />
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseSignatureModal}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
