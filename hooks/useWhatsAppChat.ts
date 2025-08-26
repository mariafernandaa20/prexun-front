import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import axiosInstance from '@/lib/api/axiosConfig';

// Interfaces
export interface WhatsAppMessage {
  id: number;
  mensaje: string;
  phone_number: string;
  direction: 'sent' | 'received';
  message_type: string;
  created_at: string;
  user_id?: number;
}

export interface ChatConversation {
  phone_number: string;
  message_count: number;
  received_count: number;
  sent_count: number;
  last_message_time: string;
  user: any[];
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

// Fetchers
const conversationsFetcher = async () => {
  try {
    const response = await axiosInstance.get('/whatsapp/chat/conversations');
    return response.data.data.conversations || [];
  } catch (error) {
    // Fallback al endpoint original
    const fallbackResponse = await axiosInstance.get('/whatsapp/conversations');
    return fallbackResponse.data.data.conversations || [];
  }
};

const messagesFetcher = async (phoneNumber: string) => {
  if (!phoneNumber) return [];
  
  try {
    const response = await axiosInstance.get(`/whatsapp/chat/history/${encodeURIComponent(phoneNumber)}`);
    return response.data.messages || response.data.data?.messages || [];
  } catch (error) {
    // Fallback al endpoint original
    const fallbackResponse = await axiosInstance.get(`/whatsapp/conversation`, {
      params: { phone_number: phoneNumber }
    });
    return fallbackResponse.data.messages || fallbackResponse.data.data?.messages || [];
  }
};

// Hook para obtener todas las conversaciones
export function useConversations(refreshInterval: number = 5000) {
  const { data, error, isLoading, mutate: mutateConversations } = useSWR(
    'whatsapp-conversations',
    conversationsFetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    conversations: data || [],
    isLoading,
    isError: error,
    mutate: mutateConversations,
  };
}

// Hook para obtener mensajes de una conversación específica
export function useMessages(phoneNumber: string | null, refreshInterval: number = 3000) {
  const { data, error, isLoading, mutate: mutateMessages } = useSWR(
    phoneNumber ? `whatsapp-messages-${phoneNumber}` : null,
    () => phoneNumber ? messagesFetcher(phoneNumber) : [],
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 1000,
    }
  );

  return {
    messages: data || [],
    isLoading,
    isError: error,
    mutate: mutateMessages,
  };
}

// Funciones para enviar mensajes y revalidar datos
export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    const response = await axiosInstance.post('/whatsapp/chat/send', {
      phone_number: phoneNumber,
      message: message
    });

    await mutate(`whatsapp-messages-${phoneNumber}`);
    
    await mutate('whatsapp-conversations');

    return response;
  } catch (error) {
    throw error;
  }
}

// Función para eliminar conversación
export async function deleteWhatsAppConversation(phoneNumber: string) {
  try {
    const response = await axiosInstance.delete(`/whatsapp/chat/history/${encodeURIComponent(phoneNumber)}`);
    
    // Revalidar las conversaciones
    await mutate('whatsapp-conversations');
    
    // Limpiar los mensajes de esta conversación del cache
    await mutate(`whatsapp-messages-${phoneNumber}`, [], false);

    return response;
  } catch (error) {
    throw error;
  }
}

// Hook personalizado para funcionalidad completa del chat
export function useWhatsAppChat() {
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Usar los hooks individuales
  const { conversations, isLoading: isLoadingConversations, mutate: mutateConversations } = useConversations();
  const { messages, isLoading: isLoadingMessages, mutate: mutateMessages } = useMessages(selectedPhoneNumber);

  // Función para seleccionar conversación
  const selectConversation = (phoneNumber: string) => {
    setSelectedPhoneNumber(phoneNumber);
  };

  // Función para enviar mensaje
  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !selectedPhoneNumber) return;

    setIsSending(true);
    const messageToSend = newMessage;
    setNewMessage('');

    try {
      await sendWhatsAppMessage(selectedPhoneNumber, messageToSend);
    } catch (error: any) {
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  // Función para eliminar conversación
  const deleteConversation = async (phoneNumber: string) => {
    try {
      await deleteWhatsAppConversation(phoneNumber);
      
      // Si la conversación eliminada era la seleccionada, limpiar selección
      if (selectedPhoneNumber === phoneNumber) {
        setSelectedPhoneNumber(null);
      }
    } catch (error) {
      throw error;
    }
  };

  // Encontrar la conversación seleccionada
  const selectedConversation = selectedPhoneNumber 
    ? conversations.find(conv => conv.phone_number === selectedPhoneNumber) || null
    : null;

  return {
    // Estado
    conversations,
    selectedConversation,
    messages,
    newMessage,
    setNewMessage,
    selectedPhoneNumber,
    
    // Estados de carga
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    
    // Funciones
    selectConversation,
    sendMessage,
    deleteConversation,
    
    // Funciones de revalidación manual
    refreshConversations: mutateConversations,
    refreshMessages: mutateMessages,
  };
}
