"use client";

import { useState, useEffect } from "react";
import { getModules, createModule, updateModule, deleteModule } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Modulo {
  id: string;
  name: string;
  moodle_id: string;
}

export default function ModuloPage() {
  const [modules, setModules] = useState<Modulo[]>([]);
  const [newModuleName, setNewModuleName] = useState("");
  const [editingModule, setEditingModule] = useState<Modulo | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const data = await getModules();
      setModules(data);
    } catch (error) {
      toast.error("Error al cargar los módulos");
    }
  };

  const handleCreate = async () => {
    if (!newModuleName.trim()) return;
    try {
      await createModule({ name: newModuleName });
      setNewModuleName("");
      loadModules();
      toast.success("Módulo creado exitosamente");
    } catch (error) {
      toast.error("Error al crear el módulo");
    }
  };

  const handleUpdate = async (module: Modulo) => {
    try {
      await updateModule(module);
      setEditingModule(null);
      loadModules();
      toast.success("Módulo actualizado exitosamente");
    } catch (error) {
      toast.error("Error al actualizar el módulo");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteModule(id);
      loadModules();
      toast.success("Módulo eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar el módulo");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Gestión de Módulos</h1>
      
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Nombre del nuevo módulo"
          value={newModuleName}
          onChange={(e) => setNewModuleName(e.target.value)}
        />
        <Button onClick={handleCreate}>Crear Módulo</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Moodle ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => (
            <TableRow key={module.id}>
              <TableCell>{module.id}</TableCell>
              <TableCell>{module.moodle_id}</TableCell>
              <TableCell>
                {editingModule?.id === module.id ? (
                  <Input
                    value={editingModule.name}
                    onChange={(e) =>
                      setEditingModule({ ...editingModule, name: e.target.value })
                    }
                  />
                ) : (
                  module.name
                )}
              </TableCell>
              <TableCell>
                {editingModule?.id === module.id ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdate(editingModule)}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingModule(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingModule(module)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(module.id)}
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
