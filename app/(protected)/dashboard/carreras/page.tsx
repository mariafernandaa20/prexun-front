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
  const [selectedCarrera, setSelectedCarrera] = useState<Carrera | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadCarreras();
    loadFacultades();
  }, []);



  const loadFacultades = async () => {
    try {
      const data = await getFacultades();
      setFacultades(data);
    } catch (error) {
      console.error('Error loading facultades:', error);
    }
  };

  const loadCarreras = async () => {
    try {
      const data = await getCarreras();
      setCarreras(data);
    } catch (error) {
      console.error('Error loading carreras:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedCarrera?.id) {
        await updateCarrera(selectedCarrera);
      } else {
        await createCarrera(selectedCarrera);
      }
      setIsDialogOpen(false);
      setSelectedCarrera(null);
      loadCarreras();
    } catch (error) {
      console.error('Error submitting carrera:', error);
    }
  };

  const handleEdit = (carrera: Carrera) => {
    setSelectedCarrera({ ...carrera });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta carrera?')) {
      try {
        await deleteCarrera(id);
        loadCarreras();
      } catch (error) {
        console.error('Error deleting carrera:', error);
      }
    }
  };

  const handleFacultadChange = (value: string) => {
    setSelectedCarrera((prev) => prev ? { ...prev, facultad_id: value } : null);
  };

  const handleNameChange = (value: string) => {
    setSelectedCarrera((prev) => prev ? { ...prev, name: value } : null);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carreras</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedCarrera({ name: '', facultad_id: '' })}>
              Agregar Carrera
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCarrera ? 'Editar Carrera' : 'Agregar Nueva Carrera'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                value={Number(selectedCarrera?.facultad_id) as any}
                onValueChange={handleFacultadChange}
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
                value={selectedCarrera?.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
              />

              <Button type="submit">
                {selectedCarrera ? 'Actualizar' : 'Crear'}
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