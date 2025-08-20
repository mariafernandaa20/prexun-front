'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import PromocionModal from './components/PromocionModal';
import { createPromo, getPromos, updatePromo, deletePromo } from '@/lib/api';
import { Promocion } from '@/lib/types';
import { TrashIcon } from 'lucide-react';
import { PencilIcon } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export default function PromocionesPage() {
  const [promocionesActivas, setPromocionesActivas] = useState<Promocion[]>([]);
  const [promocionesInactivas, setPromocionesInactivas] = useState<Promocion[]>(
    []
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [promocionSeleccionada, setPromocionSeleccionada] = useState<
    Promocion | undefined
  >();

  const fetchPromociones = async () => {
    try {
      const data = await getPromos();
      setPromocionesActivas(data.active);
      setPromocionesInactivas(data.inactive);
    } catch (error) {
      console.error('Error al cargar promociones:', error);
    }
  };

  useEffect(() => {
    fetchPromociones();
  }, []);

  const handleSubmitPromocion = async (promocion: Promocion) => {
    try {
      if (promocionSeleccionada?.id) {
        await updatePromo(promocion);
      } else {
        await createPromo(promocion);
      }
      fetchPromociones();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEditarPromocion = (promocion: Promocion) => {
    setPromocionSeleccionada(promocion);
    setModalOpen(true);
  };

  const handleEliminarPromocion = async (id: number) => {
    try {
      await deletePromo(id.toString());
      fetchPromociones();
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
    }
  };

  const TablaPromociones = ({
    promociones,
    titulo,
  }: {
    promociones: Promocion[];
    titulo: string;
  }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{titulo}</h2>
        {titulo === 'Activas' && (
          <Button
            className="bg-blue-600 text-white"
            onClick={() => {
              setPromocionSeleccionada(undefined);
              setModalOpen(true);
            }}
          >
            Añadir
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Costo Promo</TableHead>
            <TableHead>Costo Regular</TableHead>

            <TableHead>Fecha Limite De Aplicación</TableHead>
            <TableHead>Grupos Aplicables</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promociones &&
            promociones.map((promocion) => (
              <TableRow key={promocion.id}>
                <TableCell>{promocion.name}</TableCell>
                <TableCell>{promocion.type}</TableCell>
                <TableCell>${promocion.cost}</TableCell>
                <TableCell>${promocion.regular_cost}</TableCell>
                <TableCell>
                  {formatTime({ time: promocion.limit_date })}
                </TableCell>
                <TableCell>{promocion.groups.join(', ')}</TableCell>
                <TableCell className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditarPromocion(promocion)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      promocion.id && handleEliminarPromocion(promocion.id)
                    }
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="p-4">
        <div className="container mx-auto py-8 space-y-8">
          <h1 className="text-3xl font-bold mb-8">Promociones</h1>

          <TablaPromociones promociones={promocionesActivas} titulo="Activas" />

          <TablaPromociones
            promociones={promocionesInactivas}
            titulo="Inactivas"
          />

          <PromocionModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setPromocionSeleccionada(undefined);
            }}
            onSubmit={handleSubmitPromocion}
            promocion={promocionSeleccionada}
          />
        </div>
      </div>
    </div>
  );
}
