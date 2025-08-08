"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatAPI, ChatSession, ChatMessage } from "@/lib/api/chat";
import { MessageSquare, User, FileText, BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";

interface StudentChatManagerProps {
  studentId?: number;
  studentName?: string;
}

export default function StudentChatManager({ studentId, studentName }: StudentChatManagerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStudentSessions();
  }, [studentId]);

  const loadStudentSessions = async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      const response = await ChatAPI.getConversationsByType('student_support');
      // Filtrar por student ID si se proporciona
      const studentSessions = studentId 
        ? response.conversations.filter(session => session.related_id === studentId)
        : response.conversations;
      
      setSessions(studentSessions);
    } catch (error) {
      toast.error("Error al cargar las conversaciones del estudiante");
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
      toast.error("Error al cargar los mensajes de la conversación");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewStudentSession = async () => {
    if (!studentId) {
      toast.error("ID de estudiante requerido");
      return;
    }

    try {
      const response = await ChatAPI.createSession('student_support', studentId);
      toast.success("Nueva conversación creada");
      loadStudentSessions();
    } catch (error) {
      toast.error("Error al crear nueva conversación");
    }
  };

  const getConversationTypeIcon = (type: string) => {
    switch (type) {
      case 'student_support':
        return <User className="h-4 w-4" />;
      case 'test_evaluation':
        return <FileText className="h-4 w-4" />;
      case 'academic_guidance':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getConversationTypeLabel = (type: string) => {
    switch (type) {
      case 'student_support':
        return 'Soporte Estudiante';
      case 'test_evaluation':
        return 'Evaluación de Examen';
      case 'academic_guidance':
        return 'Orientación Académica';
      default:
        return 'General';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Lista de Conversaciones */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              {studentName ? `${studentName} - Conversaciones` : 'Conversaciones de Estudiante'}
            </CardTitle>
            {studentId && (
              <Button size="sm" onClick={createNewStudentSession}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 p-4">
              {sessions.map((session) => (
                <Card 
                  key={session.session_id}
                  className={`cursor-pointer transition-colors ${
                    selectedSession?.session_id === session.session_id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => loadSessionMessages(session)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getConversationTypeIcon(session.conversation_type)}
                        <div>
                          <Badge variant="secondary" className="text-xs">
                            {getConversationTypeLabel(session.conversation_type)}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {session.message_count} mensajes
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(session.last_activity).toLocaleDateString()}
                      </span>
                    </div>
                    {session.last_message && (
                      <p className="text-sm text-gray-700 mt-2 truncate">
                        {session.last_message.length > 50 
                          ? `${session.last_message.substring(0, 50)}...` 
                          : session.last_message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {sessions.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay conversaciones para este estudiante</p>
                  {studentId && (
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={createNewStudentSession}
                    >
                      Crear primera conversación
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Mensajes de la Conversación Seleccionada */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {selectedSession 
              ? `${getConversationTypeLabel(selectedSession.conversation_type)} - ${selectedSession.message_count} mensajes`
              : 'Selecciona una conversación'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSession ? (
            <ScrollArea className="h-[450px]">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={message.id || index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
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
                      <div className="text-sm">
                        {message.content}
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {message.created_at 
                          ? new Date(message.created_at).toLocaleString()
                          : new Date().toLocaleString()
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-[450px] text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Selecciona una conversación para ver los mensajes</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
