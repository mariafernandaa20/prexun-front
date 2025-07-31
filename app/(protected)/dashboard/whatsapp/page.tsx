'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageCircle, Send, CheckCircle, XCircle } from 'lucide-react';
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Mensaje Simple</TabsTrigger>
          <TabsTrigger value="template">Mensaje de Plantilla</TabsTrigger>
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
              
              <div className="space-y-2">
                <Label htmlFor="template-name">Nombre de la Plantilla</Label>
                <Input
                  id="template-name"
                  placeholder="hello_world"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Solo letras minúsculas, números y guiones bajos. Debe estar aprobada en Meta Business.
                </p>
              </div>
              
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
      </Tabs>
    </div>
  );
}