'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip,
  Smile,
  Check,
  CheckCheck
} from 'lucide-react';

// Datos ficticios de contactos
const contacts = [
  {
    id: 1,
    name: 'María González',
    matricula: '2024001',
    lastMessage: 'Profesor, ¿cuándo es el examen?',
    timestamp: '14:30',
    unreadCount: 2,
    avatar: null,
    online: true
  },
  {
    id: 2,
    name: 'Carlos Rodríguez',
    matricula: '2024002',
    lastMessage: 'Gracias por la explicación',
    timestamp: '13:45',
    unreadCount: 0,
    avatar: null,
    online: false
  },
  {
    id: 3,
    name: 'Ana López',
    matricula: '2024003',
    lastMessage: 'No entiendo el ejercicio 5',
    timestamp: '12:20',
    unreadCount: 1,
    avatar: null,
    online: true
  },
  {
    id: 4,
    name: 'José Martínez',
    matricula: '2024004',
    lastMessage: '¿Podrías revisar mi tarea?',
    timestamp: 'Ayer',
    unreadCount: 0,
    avatar: null,
    online: false
  },
  {
    id: 5,
    name: 'Sofía Hernández',
    matricula: '2024005',
    lastMessage: 'Perfecto, muchas gracias',
    timestamp: 'Ayer',
    unreadCount: 0,
    avatar: null,
    online: true
  }
];

// Datos ficticios de mensajes
const messagesData = {
  1: [
    {
      id: 1,
      text: 'Hola profesor, tengo una duda sobre la tarea',
      sender: 'student',
      timestamp: '14:20',
      status: 'read'
    },
    {
      id: 2,
      text: 'Hola María, dime cuál es tu duda',
      sender: 'teacher',
      timestamp: '14:22',
      status: 'read'
    },
    {
      id: 3,
      text: 'Es sobre el ejercicio de matemáticas número 3',
      sender: 'student',
      timestamp: '14:25',
      status: 'read'
    },
    {
      id: 4,
      text: 'Ah sí, ese ejercicio requiere que uses la fórmula cuadrática. ¿Ya la revisaste?',
      sender: 'teacher',
      timestamp: '14:27',
      status: 'read'
    },
    {
      id: 5,
      text: 'Profesor, ¿cuándo es el examen?',
      sender: 'student',
      timestamp: '14:30',
      status: 'delivered'
    }
  ],
  2: [
    {
      id: 1,
      text: 'Profesor, ya terminé la práctica',
      sender: 'student',
      timestamp: '13:40',
      status: 'read'
    },
    {
      id: 2,
      text: 'Excelente Carlos, ¿cómo te fue?',
      sender: 'teacher',
      timestamp: '13:42',
      status: 'read'
    },
    {
      id: 3,
      text: 'Muy bien, me ayudó mucho su explicación de ayer',
      sender: 'student',
      timestamp: '13:43',
      status: 'read'
    },
    {
      id: 4,
      text: 'Gracias por la explicación',
      sender: 'student',
      timestamp: '13:45',
      status: 'read'
    }
  ]
};

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.matricula.includes(searchQuery)
  );

  const currentMessages = messagesData[selectedContact?.id] || [];

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Aquí iría la lógica para enviar el mensaje
      console.log('Enviando mensaje:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar de contactos */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar estudiantes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de contactos */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className={`p-3 mb-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      <span className="text-xs text-gray-500">{contact.timestamp}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {contact.lastMessage}
                      </p>
                      {contact.unreadCount > 0 && (
                        <Badge className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                          {contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-1">
                      Mat: {contact.matricula}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Header del chat */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact.avatar} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedContact.online ? 'En línea' : 'Desconectado'} • Mat: {selectedContact.matricula}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'teacher' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'teacher'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        message.sender === 'teacher' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        <span className="text-xs">{message.timestamp}</span>
                        {message.sender === 'teacher' && (
                          <>
                            {message.status === 'delivered' && <Check className="h-3 w-3" />}
                            {message.status === 'read' && <CheckCheck className="h-3 w-3" />}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input de mensaje */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5 text-gray-400" />
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
                    <Smile className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
                
                <Button 
                  onClick={sendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un chat
              </h3>
              <p className="text-gray-500">
                Elige un estudiante para comenzar a chatear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
