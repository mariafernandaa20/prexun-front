"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatAPI, ChatSession, ChatMessage } from "@/lib/api/chat";
import { MessageSquare, Phone, Send, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppChatHistory() {
  const [whatsappSessions, setWhatsappSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWhatsAppSessions();
  }, []);

  const loadWhatsAppSessions = async () => {
    setIsLoading(true);
    try {
      const response = await ChatAPI.getConversationsByType('whatsapp_outbound');
      setWhatsappSessions(response.conversations);
    } catch (error) {
      toast.error("Error al cargar el historial de WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionMessages = async (session: ChatSession) => {
    setIsLoading(true);
    try {
      const response = await ChatAPI.getSessionHistory(session.session_id);
      setMessages(response.messages);
      setSelectedSession(session);
    } catch (error) {
      toast.error("Error al cargar los mensajes de WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageTypeIcon = (metadata: any) => {
    if (metadata?.is_template) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    return <Send className="h-4 w-4 text-green-500" />;
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Formatear número de teléfono para mostrar
    if (phoneNumber.startsWith('+52')) {
      return phoneNumber.replace('+52', '+52 ');
    }
    return phoneNumber;
  };

  const extractPhoneFromContent = (content: string) => {
    // Extraer número de teléfono del contenido del mensaje
    const phoneMatch = content.match(/(\+\d{10,15})/);
    return phoneMatch ? phoneMatch[1] : '';
  };

  const formatMessageContent = (content: string, metadata: any) => {
    if (metadata?.is_template && metadata?.template_name) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Plantilla: {metadata.template_name}</span>
          </div>
          <div className="text-sm text-gray-600">
            Enviada a: {formatPhoneNumber(metadata.phone_number)}
          </div>
        </div>
      );
    }

    // Para mensajes de texto, extraer el número y el mensaje
    const parts = content.split(': ');
    if (parts.length >= 2) {
      const phoneNumber = extractPhoneFromContent(parts[0]);
      const actualMessage = parts.slice(1).join(': ');
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span className="font-medium">Mensaje a: {formatPhoneNumber(phoneNumber)}</span>
          </div>
          <div className="text-sm bg-gray-50 p-2 rounded">
            "{actualMessage}"
          </div>
        </div>
      );
    }

    return content;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Historial de WhatsApp
            </CardTitle>
            <Button 
              onClick={loadWhatsAppSessions}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Sesiones de WhatsApp */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Conversaciones Enviadas</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {whatsappSessions.map((session) => (
                    <Card 
                      key={session.session_id}
                      className={`cursor-pointer transition-colors ${
                        selectedSession?.session_id === session.session_id 
                          ? 'bg-green-50 border-green-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => loadSessionMessages(session)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-green-600" />
                            <div>
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                WhatsApp
                              </Badge>
                              <p className="text-sm text-gray-600 mt-1">
                                {session.message_count} mensaje{session.message_count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(session.last_activity).toLocaleDateString()}
                          </span>
                        </div>
                        {session.last_message && (
                          <p className="text-sm text-gray-700 mt-2 truncate">
                            {session.last_message.length > 60 
                              ? `${session.last_message.substring(0, 60)}...` 
                              : session.last_message}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {whatsappSessions.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                      <Phone className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No hay mensajes de WhatsApp enviados</p>
                      <p className="text-sm mt-1">Los mensajes aparecerán aquí cuando envíes por WhatsApp</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Detalles de la Sesión Seleccionada */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                {selectedSession 
                  ? `Detalles de la Sesión (${selectedSession.message_count} mensajes)`
                  : 'Selecciona una conversación'
                }
              </h3>
              
              {selectedSession ? (
                <Card>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-4">
                        {messages.map((message, index) => (
                          <div 
                            key={message.id || index} 
                            className="p-3 bg-white border rounded-lg shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              {getMessageTypeIcon(message.metadata)}
                              <div className="flex-1">
                                {formatMessageContent(message.content, message.metadata)}
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                  <span>
                                    {message.created_at 
                                      ? new Date(message.created_at).toLocaleString()
                                      : new Date().toLocaleString()
                                    }
                                  </span>
                                  {message.metadata?.platform && (
                                    <Badge variant="outline" className="text-xs">
                                      {message.metadata.platform}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p>Selecciona una conversación para ver los detalles</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
