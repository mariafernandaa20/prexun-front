'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useWhatsAppChat } from '@/hooks/useWhatsAppChat';
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

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    conversations,
    selectedConversation,
    messages,
    newMessage,
    setNewMessage,
    selectedPhoneNumber,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    selectConversation,
    sendMessage,
    deleteConversation,
    refreshConversations,
    refreshMessages,
  } = useWhatsAppChat();

  // Funciones auxiliares
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    try {
      await sendMessage();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
      console.error(error);
    }
  };

  const handleDeleteConversation = async (phoneNumber: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return;
    }

    try {
      await deleteConversation(phoneNumber);
      toast.success('Conversación eliminada');
    } catch (error) {
      toast.error('Error al eliminar la conversación');
    }
  };

  const handleSelectConversation = (conversation: any) => {
    selectConversation(conversation.phone_number);
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

  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.contact_info?.display_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.phone_number.includes(searchQuery)
  );

  if (isLoadingConversations) {
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
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshConversations}
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              {isLoadingConversations && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  <span>Actualizando...</span>
                </div>
              )}
            </div>
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
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.phone_number}
                className={`p-3 mb-2 cursor-pointer hover:bg-accent transition-colors ${
                  selectedPhoneNumber === conversation.phone_number
                    ? 'bg-accent border-primary'
                    : ''
                }`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {conversation?.contact_info?.name
                          ?.charAt(0)
                          ?.toUpperCase() || conversation?.contact_info?.display_name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          'W'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground truncate">
                        {conversation?.name ||
                          conversation.phone_number}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {conversation.last_message &&
                            formatDate(conversation.last_message.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation.phone_number);
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-100"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message &&
                        conversation.last_message.content &&
                        conversation.last_message.content.length > 50
                          ? `${conversation.last_message.content.substring(0, 50)}...`
                          : conversation.last_message?.content ||
                            'Sin mensajes'}
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

            {filteredConversations.length === 0 && (
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
                      {selectedConversation?.contact_info?.display_name
                        ?.charAt(0)
                        ?.toUpperCase() || 'W'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {selectedConversation?.name ||
                        selectedConversation?.phone_number}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation?.phone_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDeleteConversation(
                        selectedConversation?.phone_number
                      )
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
                {isLoadingMessages && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Cargando mensajes...</span>
                  </div>
                ) : (
                  messages?.map((message) => (
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
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert ">
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
                  )) || []
                )}

                {isSending && (
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
                  onClick={handleSendMessage}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
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
