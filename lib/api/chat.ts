import axiosInstance from './axiosConfig';

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  created_at?: string;
  images?: string[];
  metadata?: any;
  conversation_type?: string;
  related_id?: number;
  session_id?: string;
}

export interface ChatSession {
  session_id: string;
  conversation_type: string;
  related_id?: number;
  message_count: number;
  last_message?: string;
  last_activity: string;
}

export interface SendMessageRequest {
  message: string;
  images?: File[];
  conversation_type?: 'general' | 'student_support' | 'test_evaluation' | 'academic_guidance' | 'whatsapp_outbound' | 'whatsapp_inbound';
  related_id?: number;
  session_id?: string;
  include_history?: boolean;
}

export interface SendMessageResponse {
  success: boolean;
  response: string;
  session_id: string;
  data: {
    user_message: ChatMessage;
    assistant_message: ChatMessage;
    conversation_id: number;
    session_id: string;
    conversation_type: string;
  };
}

export class ChatAPI {
  /**
   * Enviar mensaje al chat
   */
  static async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const formData = new FormData();
    formData.append('message', request.message);
    
    if (request.images && request.images.length > 0) {
      request.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }
    
    if (request.conversation_type) {
      formData.append('conversation_type', request.conversation_type);
    }
    
    if (request.related_id) {
      formData.append('related_id', request.related_id.toString());
    }
    
    if (request.session_id) {
      formData.append('session_id', request.session_id);
    }
    
    if (request.include_history !== undefined) {
      formData.append('include_history', request.include_history.toString());
    }

    const response = await axiosInstance.post('/chat/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Obtener historial de mensajes general
   */
  static async getHistory(limit?: number): Promise<{ success: boolean; messages: ChatMessage[] }> {
    const params = limit ? { limit } : {};
    const response = await axiosInstance.get('/chat/history', { params });
    return response.data;
  }

  /**
   * Obtener todas las sesiones del usuario
   */
  static async getUserSessions(): Promise<{ success: boolean; sessions: ChatSession[] }> {
    const response = await axiosInstance.get('/chat/sessions');
    return response.data;
  }

  /**
   * Crear nueva sesión de chat
   */
  static async createSession(
    conversationType: 'general' | 'student_support' | 'test_evaluation' | 'academic_guidance' | 'whatsapp_outbound' | 'whatsapp_inbound',
    relatedId?: number,
    title?: string
  ): Promise<{ success: boolean; session_id: string; conversation_type: string; related_id?: number }> {
    const response = await axiosInstance.post('/chat/sessions', {
      conversation_type: conversationType,
      related_id: relatedId,
      title
    });
    return response.data;
  }

  /**
   * Obtener historial de una sesión específica
   */
  static async getSessionHistory(sessionId: string): Promise<{ success: boolean; messages: ChatMessage[]; session_id: string }> {
    const response = await axiosInstance.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Obtener conversaciones por tipo
   */
  static async getConversationsByType(type: string): Promise<{ success: boolean; conversations: ChatSession[]; type: string }> {
    const response = await axiosInstance.get(`/chat/conversations/type/${type}`);
    return response.data;
  }

  /**
   * Limpiar historial
   */
  static async clearHistory(): Promise<{ success: boolean; message: string }> {
    const response = await axiosInstance.delete('/chat/history');
    return response.data;
  }
}
