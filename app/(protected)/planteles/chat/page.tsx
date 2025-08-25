'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axiosInstance from '@/lib/api/axiosConfig';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ChatMessage {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  metadata?: any;
  created_at: string;
  user?: User;
}

interface ChatConversation {
  phone_number: string;
  message_count: number;
  received_count: number;
  sent_count: number;
  last_message_time: string;
  last_message: {
    id: number;
    content: string;
    direction: 'sent' | 'received';
    message_type: string;
    created_at: string;
  } | null;
  contact_info: {
    name?: string;
    display_name: string;
    avatar?: string;
    is_student: boolean;
    student_id?: number;
  };
  messages?: WhatsAppMessage[];
}

interface WhatsAppMessage {
  id: number;
  mensaje: string;
  phone_number: string;
  direction: 'sent' | 'received';
  message_type: string;
  created_at: string;
  user_id?: number;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  useEffect(() => {
    loadAllChats();
  }, []);

  const loadAllChats = async () => {
    setIsLoading(true);
    try {
      // Intentar primero las conversaciones híbridas de WhatsApp
      const response = await axiosInstance.get('/whatsapp/chat/conversations');
      setConversations(response.data.data.conversations || []);
    } catch (error) {
      // Fallback a conversaciones normales de WhatsApp si las híbridas fallan
      try {
        const fallbackResponse = await axiosInstance.get('/whatsapp/conversations');
        setConversations(fallbackResponse.data.data.conversations || []);
      } catch (fallbackError) {
        toast.error('Error al cargar las conversaciones');
        console.error('Error loading conversations:', error, fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationHistory = async (phoneNumber: string) => {
    try {
      // Intentar primero el endpoint híbrido
      let response;
      try {
        response = await axiosInstance.get(`/whatsapp/chat/history/${encodeURIComponent(phoneNumber)}`);
      } catch (error) {
        // Fallback al endpoint original
        response = await axiosInstance.get(`/whatsapp/conversation`, {
          params: { phone_number: phoneNumber }
        });
      }
      
      const messages = response.data.messages || response.data.data?.messages || [];

      setConversations((prev) =>
        prev.map((conv) =>
          conv.phone_number === phoneNumber ? { ...conv, messages } : conv
        )
      );
    } catch (error) {
      toast.error('Error al cargar el historial');
      console.error(error);
    }
  };

  const clearConversation = async (phoneNumber: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/whatsapp/conversation`, {
        data: { phone_number: phoneNumber }
      });
      await loadAllChats();
      if (selectedConversation?.phone_number === phoneNumber) {
        setSelectedConversation(null);
      }
      toast.success('Conversación eliminada');
    } catch (error) {
      toast.error('Error al eliminar la conversación');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoadingChat || !selectedConversation) return;

    setIsLoadingChat(true);
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      const response = await axiosInstance.post('/whatsapp/send-message', {
        phone_number: selectedConversation.phone_number,
        message: messageToSend
      });

      await loadConversationHistory(selectedConversation.phone_number);
      await loadAllChats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
      console.error(error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectConversation = async (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    if (!conversation.messages || conversation.messages.length === 0) {
      await loadConversationHistory(conversation.phone_number);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hoy';
    } else if (diffDays === 2) {
      return 'Ayer';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando conversaciones...</span>
      </div>
    );
  }
  
  return (
    <div
      className="flex bg-background"
      style={{ height: 'calc(100vh - 100px)' }}
    >
      {/* Sidebar de contactos */}
      <div className="w-1/3 bg-card border-r border-border flex flex-col">
        {/* Header del sidebar */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-foreground">
              Todos los Chats
            </h1>
            <Button variant="ghost" size="icon" onClick={loadAllChats}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de contactos */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.phone_number}
                className={`p-3 mb-2 cursor-pointer hover:bg-accent transition-colors ${
                  selectedConversation?.phone_number === conversation.phone_number
                    ? 'bg-accent border-primary'
                    : ''
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {conversation?.contact_info?.display_name?.charAt(0)?.toUpperCase() || 'W'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground truncate">
                        {conversation?.contact_info?.display_name || conversation.phone_number}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                           {conversation.last_message && formatDate(conversation.last_message.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearConversation(conversation.phone_number);
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                         {conversation.last_message && conversation.last_message.content && conversation.last_message.content.length > 50 
                          ? `${conversation.last_message.content.substring(0, 50)}...`
                          : conversation.last_message?.content || 'Sin mensajes'
                        } 
                      </p>
                     {conversation.received_count > 0 && (
                        <Badge className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                          {conversation.received_count}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {conversation.phone_number}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            
            {conversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay conversaciones disponibles
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header del chat */}
            <div className="bg-card border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedConversation?.contact_info?.display_name?.charAt(0)?.toUpperCase() || 'W'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {selectedConversation.contact_info?.display_name || selectedConversation.phone_number}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.phone_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      clearConversation(selectedConversation.phone_number)
                    }
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4 bg-muted/50">
              <div className="space-y-4">
                {selectedConversation.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'sent'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-card-foreground border border-border'
                      }`}
                    >
                      <div className="text-sm prose prose-sm max-w-none">
                        <ReactMarkdown>{message.mensaje}</ReactMarkdown>
                      </div>
                      <div
                        className={`flex items-center justify-end mt-1 space-x-1 ${
                          message.direction === 'sent'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <span className="text-xs">
                          {new Date(message.created_at).toLocaleTimeString(
                            'es-ES',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )) || []}

                {isLoadingChat && (
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input de mensaje */}
            <div className="bg-card border-t border-border p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>

                <div className="flex-1 relative">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>

                <Button
                  onClick={sendMessage}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!newMessage.trim() || isLoadingChat}
                >
                  {isLoadingChat ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Selecciona una conversación
              </h3>
              <p className="text-muted-foreground">
                Elige una conversación para ver los mensajes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
