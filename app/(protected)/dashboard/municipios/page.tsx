'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { getMunicipios, createMunicipio, updateMunicipio, deleteMunicipio } from '@/lib/api';
import type { Municipio } from '@/lib/types';

export default function Page() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [newMunicipio, setNewMunicipio] = useState<Municipio>({ name: '' });
  const [editingMunicipio, setEditingMunicipio] = useState<Municipio | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadMunicipios();
  }, []);

  const loadMunicipios = async () => {
    const data = await getMunicipios();
    setMunicipios(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMunicipio?.id) {
      await updateMunicipio(editingMunicipio);
    } else {
      await createMunicipio(newMunicipio);
    }
    setIsDialogOpen(false);
    setNewMunicipio({ name: '' });
    setEditingMunicipio(null);
    loadMunicipios();
  };

  const handleEdit = (municipio: Municipio) => {
    setEditingMunicipio(municipio);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este municipio?')) {
      await deleteMunicipio(id);
      loadMunicipios();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Municipios</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Agregar Municipio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMunicipio ? 'Editar Municipio' : 'Agregar Municipio'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nombre del municipio"
                value={editingMunicipio ? editingMunicipio.name : newMunicipio.name}
                onChange={(e) =>
                  editingMunicipio
                    ? setEditingMunicipio({ ...editingMunicipio, name: e.target.value })
                    : setNewMunicipio({ ...newMunicipio, name: e.target.value })
                }
              />
              <Button type="submit">
                {editingMunicipio ? 'Actualizar' : 'Agregar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {municipios.map((municipio) => (
            <TableRow key={municipio.id}>
              <TableCell>{municipio.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" onClick={() => handleEdit(municipio)}>
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => municipio.id && handleDelete(municipio.id)}
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
