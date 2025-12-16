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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Send,
  RotateCcw,
  ArrowLeft,
  ImagePlus,
  X,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/store/auth-store';
import WhatsAppChatHistory from '@/components/chat/WhatsAppChatHistory';

interface Context {
  id: number;
  name: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
}

interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  created_at?: string;
  images?: string[];
  metadata?: any;
}

export default function InstruccionesPage() {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newContextName, setNewContextName] = useState('');
  const [newContextInstructions, setNewContextInstructions] = useState('');
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    loadContexts();
    loadStudents();
    if (activeStudentId) {
      loadChatHistory();
    }
  }, [activeStudentId]);

  const loadStudents = async () => {
    try {
      const response = await axiosInstance.get('/students');
      setStudents(response.data.data || response.data);
      if (response.data.data?.length > 0 && !activeStudentId) {
        setActiveStudentId(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Error al cargar estudiantes');
    }
  };

  const loadContexts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/contexts?all=true');
      setContexts(response.data.data);
    } catch (error) {
      toast.error('Error al cargar las instrucciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newContextName.trim() || !newContextInstructions.trim()) {
      toast.error('Nombre e instrucciones son requeridos');
      return;
    }

    try {
      await axiosInstance.post('/contexts', {
        name: newContextName,
        instructions: newContextInstructions,
      });
      setNewContextName('');
      setNewContextInstructions('');
      setShowCreateModal(false);
      loadContexts();
      toast.success('Instrucción creada exitosamente');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al crear la instrucción';
      toast.error(message);
    }
  };

  const handleUpdate = async () => {
    if (
      !editingContext ||
      !editingContext.name.trim() ||
      !editingContext.instructions.trim()
    ) {
      toast.error('Nombre e instrucciones son requeridos');
      return;
    }

    try {
      await axiosInstance.put(`/contexts/${editingContext.id}`, {
        name: editingContext.name,
        instructions: editingContext.instructions,
      });
      setEditingContext(null);
      setShowEditModal(false);
      loadContexts();
      toast.success('Instrucción actualizada exitosamente');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al actualizar la instrucción';
      toast.error(message);
    }
  };

  const openEditModal = (context: Context) => {
    setEditingContext(context);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta instrucción?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/contexts/${id}`);
      loadContexts();
      toast.success('Instrucción eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la instrucción');
    }
  };

  const handleToggleActive = async (context: Context) => {
    try {
      if (context.is_active) {
        await axiosInstance.post(`/contexts/${context.id}/deactivate`);
        toast.success('Instrucción desactivada');
      } else {
        await axiosInstance.post(`/contexts/${context.id}/activate`);
        toast.success('Instrucción activada');
      }
      loadContexts();
    } catch (error) {
      toast.error('Error al cambiar el estado de la instrucción');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sendMessage = async () => {
    if (
      (!currentMessage.trim() && selectedImages.length === 0) ||
      isLoadingChat ||
      !activeStudentId
    )
      return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage || '[Imagen enviada]',
      timestamp: new Date(),
      images: imagePreviewUrls.length > 0 ? [...imagePreviewUrls] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoadingChat(true);

    try {
      const formData = new FormData();
      formData.append('student_id', activeStudentId.toString());
      formData.append('role', 'user');
      formData.append('mensaje', messageToSend);
      formData.append('nombre', user?.name || 'Usuario');

      if (selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await axiosInstance.post('/mensajes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessages((prev) => 
        prev.map((msg, index) => 
          index === prev.length - 1 
            ? { 
                ...msg, 
                id: response.data.mensaje?.id,
                created_at: response.data.mensaje?.created_at,
                timestamp: new Date(response.data.mensaje?.created_at || Date.now())
              }
            : msg
        )
      );

      if (response.data.response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
      console.error(error);
    } finally {
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setIsLoadingChat(false);
    }
  };

  const resetChat = async () => {
    if (!activeStudentId) {
      toast.error('No hay estudiante seleccionado');
      return;
    }

    try {
      await axiosInstance.delete(`/mensajes?student_id=${activeStudentId}`);
      setMessages([]);
      setCurrentMessage('');
      setSelectedImages([]);
      setImagePreviewUrls([]);
      toast.success('Chat reiniciado');
    } catch (error) {
      toast.error('Error al reiniciar el chat');
    }
  };

  const loadChatHistory = async () => {
    if (!activeStudentId) return;
    
    try {
      const response = await axiosInstance.get(`/mensajes?student_id=${activeStudentId}`);
      const history = response.data.data?.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.mensaje,
        timestamp: new Date(msg.created_at),
        created_at: msg.created_at,
        images: msg.images,
      })) || [];
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Error al cargar historial del chat');
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...imageFiles]);

      imageFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviewUrls((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
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
      <div className="flex justify-between items-center mb-6">
        {user?.role === 'super_admin' && (
          <a
            href="/dashboard"
            className="flex items-center text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </a>
        )}
        <h1 className="text-2xl font-bold">Sistema de Chat</h1>
        <div></div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Estudiante Activo:</label>
        <select
          value={activeStudentId || ''}
          onChange={(e) => setActiveStudentId(Number(e.target.value))}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar estudiante...</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.nombre} {student.apellido_paterno} - ID: {student.id}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="instructions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat & Instrucciones
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Historial WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Probar Instrucciones</h2>
                <div className="flex gap-2">
                  {activeStudentId && (
                    <span className="text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded">
                      Estudiante ID: {activeStudentId}
                    </span>
                  )}
                  <Button 
                    onClick={resetChat} 
                    variant="outline" 
                    size="sm"
                    disabled={!activeStudentId}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {!activeStudentId && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    Por favor selecciona un estudiante para comenzar el chat.
                  </p>
                </div>
              )}

              <Card className="flex-1 flex flex-col max-h-[calc(100vh-20rem)]">
                <CardContent className="flex-1 flex flex-col p-4 h-full">
                  <ScrollArea className="flex-1 mb-4 max-h-[calc(100vh-25rem)] overflow-y-auto">
                    <div className="space-y-4 pr-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                              }`}
                          >
                            {message.images && message.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {message.images.map((imageUrl, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={imageUrl}
                                    alt={`Imagen ${imgIndex + 1}`}
                                    className="max-w-48 max-h-48 object-cover rounded-lg border"
                                  />
                                ))}
                              </div>
                            )}
                            <div className="text-sm prose prose-sm max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp
                                ? message.timestamp.toLocaleTimeString()
                                : new Date().toLocaleTimeString()}
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

                  {imagePreviewUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder={activeStudentId ? "Escribe tu mensaje..." : "Selecciona un estudiante primero..."}
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === 'Enter' && !isLoadingChat && activeStudentId && sendMessage()
                        }
                        disabled={isLoadingChat || !activeStudentId}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById('image-upload')?.click()
                        }
                        disabled={isLoadingChat || !activeStudentId}
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={
                        isLoadingChat ||
                        !activeStudentId ||
                        (!currentMessage.trim() && selectedImages.length === 0)
                      }
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Instrucciones</h1>
                <Dialog
                  open={showCreateModal}
                  onOpenChange={setShowCreateModal}
                >
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
                        <label className="text-sm font-medium">
                          Instrucciones
                        </label>
                        <Textarea
                          placeholder="Escribe las instrucciones para ChatGPT..."
                          value={newContextInstructions}
                          onChange={(e) =>
                            setNewContextInstructions(e.target.value)
                          }
                          rows={8}
                          className="min-h-[200px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreate}>Crear</Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateModal(false)}
                        >
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
                        {contexts &&
                          contexts.map((context) => (
                            <TableRow key={context.id}>
                              <TableCell className="font-medium">
                                {context.name}
                              </TableCell>
                              <TableCell className="max-w-md">
                                <div
                                  className="truncate"
                                  title={context.instructions}
                                >
                                  {context.instructions.length > 100
                                    ? `${context.instructions.substring(0, 100)}...`
                                    : context.instructions}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    context.is_active ? 'default' : 'secondary'
                                  }
                                  className={
                                    context.is_active
                                      ? 'bg-green-100 text-green-800'
                                      : ''
                                  }
                                >
                                  {context.is_active ? 'Activo' : 'Inactivo'}
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
                                    variant="outline"
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <WhatsAppChatHistory />
        </TabsContent>
      </Tabs>

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
                    setEditingContext({
                      ...editingContext,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Instrucciones</label>
                <Textarea
                  value={editingContext.instructions}
                  onChange={(e) =>
                    setEditingContext({
                      ...editingContext,
                      instructions: e.target.value,
                    })
                  }
                  rows={8}
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate}>Guardar</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
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
