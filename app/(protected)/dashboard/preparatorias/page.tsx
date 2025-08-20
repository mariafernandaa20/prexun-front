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
import { getPrepas, createPrepa, updatePrepa, deletePrepa } from '@/lib/api';
import type { Prepa } from '@/lib/types';

export default function Page() {
  const [prepas, setPrepas] = useState<Prepa[]>([]);
  const [newPrepa, setNewPrepa] = useState<Prepa>({ name: '' });
  const [editingPrepa, setEditingPrepa] = useState<Prepa | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadPrepas();
  }, []);

  const loadPrepas = async () => {
    const data = await getPrepas();
    setPrepas(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrepa?.id) {
      await updatePrepa(editingPrepa);
    } else {
      await createPrepa(newPrepa);
    }
    setIsDialogOpen(false);
    setNewPrepa({ name: '' });
    setEditingPrepa(null);
    loadPrepas();
  };

  const handleEdit = (prepa: Prepa) => {
    setEditingPrepa(prepa);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta preparatoria?')) {
      await deletePrepa(id);
      loadPrepas();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Preparatorias</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPrepa(null);
                setNewPrepa({ name: '' });
              }}
            >
              Agregar Preparatoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPrepa ? 'Editar Preparatoria' : 'Nueva Preparatoria'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nombre de la preparatoria"
                value={editingPrepa ? editingPrepa.name : newPrepa.name}
                onChange={(e) => {
                  if (editingPrepa) {
                    setEditingPrepa({ ...editingPrepa, name: e.target.value });
                  } else {
                    setNewPrepa({ ...newPrepa, name: e.target.value });
                  }
                }}
              />
              <Button type="submit">
                {editingPrepa ? 'Actualizar' : 'Crear'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prepas.map((prepa) => (
            <TableRow key={prepa.id}>
              <TableCell>{prepa.id}</TableCell>
              <TableCell>{prepa.name}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => handleEdit(prepa)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => prepa.id && handleDelete(prepa.id)}
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
