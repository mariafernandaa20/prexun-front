'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageCircle, Send, CheckCircle, XCircle, Plus, Edit, Trash2, Settings, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';

interface WhatsAppResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

interface WhatsAppStatus {
  configured: boolean;
  phone_number_id: string;
  token: string;
}

interface Template {
  id: number;
  name: string;
  meta_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function WhatsAppPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Simple message form
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Template message form
  const [templatePhoneNumber, setTemplatePhoneNumber] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [languageCode, setLanguageCode] = useState('es');

  // Template management
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateMetaId, setNewTemplateMetaId] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const checkStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await axiosInstance.get('/whatsapp/status');
      setStatus(response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al verificar el estado de WhatsApp';
      toast.error(errorMessage);
    } finally {
      setStatusLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!phoneNumber || !message) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/whatsapp/send-message', {
        phone_number: phoneNumber,
        message: message,
      });

      if (response.data.success) {
        toast.success('Mensaje enviado exitosamente');
        setPhoneNumber('');
        setMessage('');
      } else {
        toast.error(response.data.message || 'Error al enviar el mensaje');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      const errors = error.response?.data?.errors;

      if (errors) {
        // Show validation errors
        Object.values(errors).flat().forEach((err: any) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendTemplateMessage = async () => {
    if (!templatePhoneNumber || !templateName) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/whatsapp/send-template', {
        phone_number: templatePhoneNumber,
        template_name: templateName,
        language_code: languageCode,
      });

      if (response.data.success) {
        toast.success('Mensaje de plantilla enviado exitosamente');
        setTemplatePhoneNumber('');
        setTemplateName('');
      } else {
        toast.error(response.data.message || 'Error al enviar el mensaje de plantilla');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      const errors = error.response?.data?.errors;

      if (errors) {
        // Show validation errors
        Object.values(errors).flat().forEach((err: any) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Template management functions
  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await axiosInstance.get('/whatsapp/templates');
      if (response.data.success) {
        setTemplates(response.data.data);
      } else {
        toast.error('Error al cargar las plantillas');
      }
    } catch (error: any) {
      toast.error('Error al cargar las plantillas');
    } finally {
      setTemplatesLoading(false);
    }
  };

  const createTemplate = async () => {
    if (!newTemplateName || !newTemplateMetaId) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await axiosInstance.post('/whatsapp/templates', {
        name: newTemplateName,
        meta_id: newTemplateMetaId,
        is_active: true
      });

      if (response.data.success) {
        toast.success('Plantilla creada exitosamente');
        setNewTemplateName('');
        setNewTemplateMetaId('');
        fetchTemplates();
      } else {
        toast.error(response.data.message || 'Error al crear la plantilla');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      const errors = error.response?.data?.errors;

      if (errors) {
        Object.values(errors).flat().forEach((err: any) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const updateTemplate = async () => {
    if (!editingTemplate || !editingTemplate.name || !editingTemplate.meta_id) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await axiosInstance.put(`/whatsapp/templates/${editingTemplate.id}`, {
        name: editingTemplate.name,
        meta_id: editingTemplate.meta_id,
        is_active: editingTemplate.is_active
      });

      if (response.data.success) {
        toast.success('Plantilla actualizada exitosamente');
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        toast.error(response.data.message || 'Error al actualizar la plantilla');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      const errors = error.response?.data?.errors;

      if (errors) {
        Object.values(errors).flat().forEach((err: any) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/whatsapp/templates/${id}`);

      if (response.data.success) {
        toast.success('Plantilla eliminada exitosamente');
        fetchTemplates();
      } else {
        toast.error(response.data.message || 'Error al eliminar la plantilla');
      }
    } catch (error: any) {
      toast.error('Error al eliminar la plantilla');
    }
  };

  useEffect(() => {
    checkStatus();
    fetchTemplates();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de WhatsApp</h1>
        <p className="text-muted-foreground">
          Envía mensajes de WhatsApp a través de la API de Meta Business
        </p>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Estado de Configuración
          </CardTitle>
          <CardDescription>
            Verifica si WhatsApp está configurado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={checkStatus}
              disabled={statusLoading}
              variant="outline"
            >
              {statusLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Verificar Estado
            </Button>

            {status && (
              <div className="flex items-center gap-2">
                {status.configured ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Configurado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>No configurado</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {status && (
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium">Token: </span>
                <span className={status.token === 'Configured' ? 'text-green-600' : 'text-red-600'}>
                  {status.token}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Phone Number ID: </span>
                <span className={status.phone_number_id === 'Configured' ? 'text-green-600' : 'text-red-600'}>
                  {status.phone_number_id}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Sending Tabs */}
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simple">Mensaje Simple</TabsTrigger>
          <TabsTrigger value="template">Mensaje de Plantilla</TabsTrigger>
          <TabsTrigger value="manage">Gestionar Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="simple">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensaje Simple</CardTitle>
              <CardDescription>
                Envía un mensaje de texto simple a un contacto existente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+52XXXXXXXXXX (incluye código de país)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: +[código país][número]. Ejemplo: +525512345678
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  placeholder="Escribe tu mensaje aquí..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                onClick={sendMessage}
                disabled={loading || !phoneNumber || !message}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Mensaje
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensaje de Plantilla</CardTitle>
              <CardDescription>
                Envía un mensaje de plantilla aprobado a un nuevo contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Los mensajes de plantilla son necesarios para contactar nuevos usuarios que no han iniciado una conversación contigo.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="template-phone">Número de Teléfono</Label>
                <Input
                  id="template-phone"
                  placeholder="+52XXXXXXXXXX (incluye código de país)"
                  value={templatePhoneNumber}
                  onChange={(e) => setTemplatePhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: +[código país][número]. Ejemplo: +525512345678
                </p>
              </div>
              {
                templates && templates.length > 0 &&
                (
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Plantilla</Label>
                    <Select value={templateName} onValueChange={setTemplateName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.length > 0 ? (
                          templates.map((template) => (
                            <SelectItem key={template.id} value={template.name}>
                              {template.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            {templatesLoading ? 'Cargando...' : 'No hay plantillas disponibles'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Selecciona una plantilla de la lista. Si no ves plantillas, ve a la pestaña "Gestionar Plantillas".
                    </p>
                  </div>
                )
              }


              <div className="space-y-2">
                <Label htmlFor="language">Código de Idioma</Label>
                <Input
                  id="language"
                  placeholder="es"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Código ISO de 2 letras. Ejemplos: es (español), en (inglés)
                </p>
              </div>

              <Button
                onClick={sendTemplateMessage}
                disabled={loading || !templatePhoneNumber || !templateName}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Plantilla
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gestionar Plantillas
              </CardTitle>
              <CardDescription>
                Administra las plantillas de WhatsApp disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Load Templates Button */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={fetchTemplates}
                  disabled={templatesLoading}
                  variant="outline"
                >
                  {templatesLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Cargar Plantillas
                </Button>
                <span className="text-sm text-muted-foreground">
                  {templates.length} plantilla(s) cargada(s)
                </span>
              </div>

              {/* Create New Template */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Nueva Plantilla
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-template-name">Nombre de la Plantilla</Label>
                    <Input
                      id="new-template-name"
                      placeholder="Ej: Bienvenida"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-template-meta-id">ID de Meta</Label>
                    <Input
                      id="new-template-meta-id"
                      placeholder="Ej: welcome_template_001"
                      value={newTemplateMetaId}
                      onChange={(e) => setNewTemplateMetaId(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={createTemplate}
                  disabled={!newTemplateName || !newTemplateMetaId}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Plantilla
                </Button>
              </div>

              {/* Templates List */}
              {templates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Plantillas Existentes</h3>
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-4">
                        {editingTemplate?.id === template.id ? (
                          // Edit mode
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                  value={editingTemplate.name}
                                  onChange={(e) => setEditingTemplate({
                                    ...editingTemplate,
                                    name: e.target.value
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>ID de Meta</Label>
                                <Input
                                  value={editingTemplate.meta_id}
                                  onChange={(e) => setEditingTemplate({
                                    ...editingTemplate,
                                    meta_id: e.target.value
                                  })}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={updateTemplate} size="sm">
                                Guardar
                              </Button>
                              <Button
                                onClick={() => setEditingTemplate(null)}
                                variant="outline"
                                size="sm"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {template.meta_id}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Estado: {template.is_active ? 'Activa' : 'Inactiva'}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setEditingTemplate(template)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => deleteTemplate(template.id)}
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {templates.length === 0 && !templatesLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay plantillas cargadas. Haz clic en "Cargar Plantillas" para ver las disponibles.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}