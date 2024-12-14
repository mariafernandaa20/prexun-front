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
  getModules,
} from '@/lib/api';
import type { Carrera, Facultad, Modulo } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/multi-select';

export default function Page() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [selectedCarrera, setSelectedCarrera] = useState<Carrera | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [selectedModulos, setSelectedModulos] = useState<string[]>([]);

  useEffect(() => {
    loadCarreras();
    loadFacultades();
    loadModulos();
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

  const loadModulos = async () => {
    try {
      const data = await getModules();
      setModulos(data);
    } catch (error) {
      console.error('Error loading modulos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const carreraData = {
        ...selectedCarrera,
        modulo_ids: selectedModulos,
      };
      if (selectedCarrera?.id) {
        await updateCarrera(carreraData);
      } else {
        await createCarrera(carreraData);
      }
      setIsDialogOpen(false);
      setSelectedCarrera(null);
      setSelectedModulos([]);
      loadCarreras();
    } catch (error) {
      console.error('Error submitting carrera:', error);
    }
  };

  const handleEdit = (carrera: Carrera) => {
    setSelectedCarrera({ ...carrera });
    setSelectedModulos(carrera.modulos?.map(m => m.id) ||  []);
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

  const handleModuloChange = (selectedIds: string[]) => {
    setSelectedModulos(selectedIds);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carreras</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedCarrera({ name: '', facultad_id: '' });
              setSelectedModulos([]);
            }}>
              Agregar Carrera
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCarrera?.id ? 'Editar Carrera' : 'Agregar Nueva Carrera'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                value={Number(selectedCarrera?.facultad_id) as any || ''}
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
              <MultiSelect
                options={modulos.map((modulo) => ({
                  value: modulo.id,
                  label: modulo.name,
                }))}
                selectedValues={selectedModulos}
                onSelectedChange={handleModuloChange}
                title="Módulos"
                placeholder="Seleccionar módulos"
                searchPlaceholder="Buscar módulo..."
                emptyMessage="No se encontraron módulos"
              />

              <Button type="submit">
                {selectedCarrera?.id ? 'Actualizar' : 'Crear'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {facultades.map((facultad) => {
        const carrerasFacultad = carreras.filter(
          (carrera) => carrera.facultad_id === facultad.id
        );

        return (
          <div key={facultad.id} className="mb-8 w-full">
            <h2 className="text-xl font-semibold mb-4">{facultad.name}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Módulos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carrerasFacultad.map((carrera) => (
                  <TableRow key={carrera.id}>
                    <TableCell>{carrera.name}</TableCell>
                    <TableCell>
                      {carrera.modulos?.map(modulo => modulo.name).join(', ') || 'Sin módulos'}
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
                {carrerasFacultad.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No hay carreras registradas para esta facultad
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}