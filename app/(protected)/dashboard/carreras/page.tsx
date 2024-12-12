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
import {
  getCarreras,
  createCarrera,
  updateCarrera,
  deleteCarrera,
  getFacultades,
} from '@/lib/api';
import type { Carrera, Facultad } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Page() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [newCarrera, setNewCarrera] = useState<Carrera>({
    name: '',
    facultad_id: '',
  });
  const [editingCarrera, setEditingCarrera] = useState<Carrera | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadCarreras();
    loadFacultades();
  }, []);

  const loadCarreras = async () => {
    const data = await getCarreras();
    setCarreras(data);
  };

  const loadFacultades = async () => {
    const data = await getFacultades();
    setFacultades(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCarrera?.id) {
      await updateCarrera(editingCarrera);
    } else {
      await createCarrera(newCarrera);
    }
    setIsDialogOpen(false);
    setNewCarrera({ name: '', facultad_id: '' });
    setEditingCarrera(null);
    loadCarreras();
  };

  const handleEdit = (carrera: Carrera) => {
    setEditingCarrera(carrera);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta carrera?')) {
      await deleteCarrera(id);
      loadCarreras();
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carreras</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Agregar Carrera</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCarrera ? 'Editar Carrera' : 'Agregar Nueva Carrera'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                value={editingCarrera?.facultad_id || newCarrera.facultad_id}
                onValueChange={(value) =>
                  editingCarrera
                    ? setEditingCarrera({
                        ...editingCarrera,
                        facultad_id: value,
                      })
                    : setNewCarrera({ ...newCarrera, facultad_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una facultad" />
                </SelectTrigger>
                <SelectContent>
                  {facultades.map((facultad) => (
                    <SelectItem key={facultad.id} value={facultad.id}>
                      {facultad.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Nombre de la carrera"
                value={editingCarrera?.name || newCarrera.name}
                onChange={(e) =>
                  editingCarrera
                    ? setEditingCarrera({
                        ...editingCarrera,
                        name: e.target.value,
                      })
                    : setNewCarrera({ ...newCarrera, name: e.target.value })
                }
              />

              <Button type="submit">
                {editingCarrera ? 'Actualizar' : 'Crear'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Facultad</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carreras.map((carrera) => (
            <TableRow key={carrera.id}>
              <TableCell>{carrera.name}</TableCell>
              <TableCell>
                {facultades.find((f) => f.id === carrera.facultad_id)?.name}
              </TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" onClick={() => handleEdit(carrera)}>
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(carrera.id)}
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
