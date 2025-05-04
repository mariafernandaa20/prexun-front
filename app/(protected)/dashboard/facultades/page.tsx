'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Facultad } from '@/lib/types';
import { getFacultades, createFacultad, updateFacultad, deleteFacultad } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function FacultadesPage() {
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [newFacultad, setNewFacultad] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadFacultades();
  }, []);

  const loadFacultades = async () => {
    try {
      const data = await getFacultades();
      setFacultades(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las facultades"
      });
    }
  };

  const handleCreate = async () => {
    if (!newFacultad.trim()) return;
    
    try {
      await createFacultad({ name: newFacultad });
      setNewFacultad('');
      loadFacultades();
      toast({
        title: "Éxito",
        description: "Facultad creada correctamente"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la facultad"
      });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    
    try {
      await updateFacultad({ id, name: editingName });
      setEditingId(null);
      loadFacultades();
      toast({
        title: "Éxito",
        description: "Facultad actualizada correctamente"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la facultad"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta facultad?')) return;
    
    try {
      await deleteFacultad(id);
      loadFacultades();
      toast({
        title: "Éxito",
        description: "Facultad eliminada correctamente"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la facultad"
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Facultades</h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Nueva facultad"
          value={newFacultad}
          onChange={(e) => setNewFacultad(e.target.value)}
        />
        <Button onClick={handleCreate}>Agregar</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facultades.map((facultad) => (
            <TableRow key={facultad.id}>
              <TableCell>
                {editingId === facultad.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                ) : (
                  facultad.name
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === facultad.id ? (
                  <Button onClick={() => handleUpdate(facultad.id!)}>
                    Guardar
                  </Button>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingId(facultad.id!);
                        setEditingName(facultad.name);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(facultad.id!)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
