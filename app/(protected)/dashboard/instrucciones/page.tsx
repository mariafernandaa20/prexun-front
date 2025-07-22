"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axiosInstance from "@/lib/api/axiosConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";

interface Context {
  id: number;
  name: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function InstruccionesPage() {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newContextName, setNewContextName] = useState("");
  const [newContextInstructions, setNewContextInstructions] = useState("");
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadContexts();
  }, []);

  const loadContexts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/contexts');
      setContexts(response.data.data);
    } catch (error) {
      toast.error("Error al cargar las instrucciones");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newContextName.trim() || !newContextInstructions.trim()) {
      toast.error("Nombre e instrucciones son requeridos");
      return;
    }
    
    try {
      await axiosInstance.post('/contexts', {
        name: newContextName,
        instructions: newContextInstructions
      });
      setNewContextName("");
      setNewContextInstructions("");
      setShowCreateForm(false);
      loadContexts();
      toast.success("Instrucción creada exitosamente");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al crear la instrucción";
      toast.error(message);
    }
  };

  const handleUpdate = async (context: Context) => {
    if (!context.name.trim() || !context.instructions.trim()) {
      toast.error("Nombre e instrucciones son requeridos");
      return;
    }
    
    try {
      await axiosInstance.put(`/contexts/${context.id}`, {
        name: context.name,
        instructions: context.instructions
      });
      setEditingContext(null);
      loadContexts();
      toast.success("Instrucción actualizada exitosamente");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al actualizar la instrucción";
      toast.error(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta instrucción?")) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/contexts/${id}`);
      loadContexts();
      toast.success("Instrucción eliminada exitosamente");
    } catch (error) {
      toast.error("Error al eliminar la instrucción");
    }
  };

  const handleToggleActive = async (context: Context) => {
    try {
      if (context.is_active) {
        await axiosInstance.post(`/contexts/${context.id}/deactivate`);
        toast.success("Instrucción desactivada");
      } else {
        await axiosInstance.post(`/contexts/${context.id}/activate`);
        toast.success("Instrucción activada");
      }
      loadContexts();
    } catch (error) {
      toast.error("Error al cambiar el estado de la instrucción");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando instrucciones...</span>
        </div>
      </div>
    );
  }

  console.log(contexts)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Instrucciones</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Instrucción
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Crear Nueva Instrucción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                placeholder="Nombre de la instrucción"
                value={newContextName}
                onChange={(e) => setNewContextName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Instrucciones</label>
              <Textarea
                placeholder="Escribe las instrucciones para ChatGPT..."
                value={newContextInstructions}
                onChange={(e) => setNewContextInstructions(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Crear</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Instrucciones</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contexts && contexts.map((context) => (
                <TableRow key={context.id}>
                  <TableCell className="font-medium">
                    {editingContext?.id === context.id ? (
                      <Input
                        value={editingContext.name}
                        onChange={(e) =>
                          setEditingContext({ ...editingContext, name: e.target.value })
                        }
                      />
                    ) : (
                      context.name
                    )}
                  </TableCell>
                  <TableCell className="max-w-md">
                    {editingContext?.id === context.id ? (
                      <Textarea
                        value={editingContext.instructions}
                        onChange={(e) =>
                          setEditingContext({ ...editingContext, instructions: e.target.value })
                        }
                        rows={3}
                      />
                    ) : (
                      <div className="truncate" title={context.instructions}>
                        {context.instructions.length > 100
                          ? `${context.instructions.substring(0, 100)}...`
                          : context.instructions}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={context.is_active ? "default" : "secondary"}
                      className={context.is_active ? "bg-green-100 text-green-800" : ""}
                    >
                      {context.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(context.created_at)}
                  </TableCell>
                  <TableCell>
                    {editingContext?.id === context.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(editingContext)}
                        >
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingContext(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingContext(context)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(context)}
                        >
                          {context.is_active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(context.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {contexts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay instrucciones creadas. Crea la primera instrucción para comenzar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}