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
import { RefreshCw, Plus, Edit, Trash2, Power, PowerOff, Send, RotateCcw, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import OpenAI from "openai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/auth-store";

interface Context {
  id: number;
  name: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export default function InstruccionesPage() {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newContextName, setNewContextName] = useState("");
  const [newContextInstructions, setNewContextInstructions] = useState("");
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useAuthStore();

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);

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
      setShowCreateModal(false);
      loadContexts();
      toast.success("Instrucción creada exitosamente");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al crear la instrucción";
      toast.error(message);
    }
  };

  const handleUpdate = async () => {
    if (!editingContext || !editingContext.name.trim() || !editingContext.instructions.trim()) {
      toast.error("Nombre e instrucciones son requeridos");
      return;
    }

    try {
      await axiosInstance.put(`/contexts/${editingContext.id}`, {
        name: editingContext.name,
        instructions: editingContext.instructions
      });
      setEditingContext(null);
      setShowEditModal(false);
      loadContexts();
      toast.success("Instrucción actualizada exitosamente");
    } catch (error: any) {
      const message = error.response?.data?.message || "Error al actualizar la instrucción";
      toast.error(message);
    }
  };

  const openEditModal = (context: Context) => {
    setEditingContext(context);
    setShowEditModal(true);
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

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoadingChat(true);

    try {
      const activeContexts = contexts.filter(c => c.is_active);
      let systemMessage = "Eres un asistente útil.";

      if (activeContexts.length > 0) {
        const combinedInstructions = activeContexts
          .map(context => `${context.name}: ${context.instructions}`)
          .join('\n\n');
        systemMessage = `Eres un asistente útil. Sigue todas estas instrucciones al mismo tiempo:\n\n${combinedInstructions}`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          { role: "user", content: currentMessage }
        ],
        max_tokens: 500
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: completion.choices[0]?.message?.content || "No pude generar una respuesta.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Error al enviar mensaje a OpenAI");
      console.error(error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentMessage("");
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

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
        {/* Chat Section */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            {
              user?.role === 'super_admin' &&
              <a href="/dashboard" className="flex  items-center text-sm text-blue-600 hover:underline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </a>
            }
            <h2 className="text-xl font-bold">Probar Instrucciones</h2>
            <Button onClick={resetChat} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Instrucciones Activas (se usan automáticamente):</label>
            <div className="p-3 border rounded-md bg-gray-50 min-h-[60px]">
              {contexts.filter(c => c.is_active).length > 0 ? (
                <div className="space-y-2">
                  {contexts.filter(c => c.is_active).map(context => (
                    <div key={context.id} className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {context.name}
                      </Badge>
                      <span className="text-xs text-gray-600 truncate">
                        {context.instructions.length > 50
                          ? `${context.instructions.substring(0, 50)}...`
                          : context.instructions}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay instrucciones activas. Activa algunas instrucciones para que se usen automáticamente.</p>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <Card className="flex-1 flex flex-col max-h-[calc(100vh-20rem)]">
            <CardContent className="flex-1 flex flex-col p-4 h-full">
              <ScrollArea className="flex-1 mb-4 max-h-[calc(100vh-25rem)] overflow-y-auto">
                <div className="space-y-4 pr-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                        }`}>
                        <div className="text-sm prose prose-sm max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoadingChat && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe tu mensaje..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoadingChat && sendMessage()}
                  disabled={isLoadingChat}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoadingChat || !currentMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Management Section */}
        <div className="flex flex-col max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestión de Instrucciones</h1>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Instrucción
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Instrucción</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
                      rows={8}
                      className="min-h-[200px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreate}>Crear</Button>
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="flex-1">
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-25rem)] overflow-y-auto">
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
                          {context.name}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={context.instructions}>
                            {context.instructions.length > 100
                              ? `${context.instructions.substring(0, 100)}...`
                              : context.instructions}
                          </div>
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
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(context)}
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {contexts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay instrucciones. Crea la primera instrucción para comenzar.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Instrucción</DialogTitle>
          </DialogHeader>
          {editingContext && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={editingContext.name}
                  onChange={(e) =>
                    setEditingContext({ ...editingContext, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Instrucciones</label>
                <Textarea
                  value={editingContext.instructions}
                  onChange={(e) =>
                    setEditingContext({ ...editingContext, instructions: e.target.value })
                  }
                  rows={8}
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate}>Guardar</Button>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}