'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MessageSquare, Bot, User } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'chatbot') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'chatbot') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bot className="mx-auto mb-4 text-red-500" size={64} />
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Restringido</h1>
          <p className="text-gray-600">Esta página solo está disponible para usuarios con rol de chatbot.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Chat Assistant</h1>
        </div>
        <p className="text-gray-600">Sistema de asistencia y comunicación</p>
      </div>

      <div className="grid gap-6">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Información del Usuario</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Nombre</p>
              <p className="text-blue-900 font-semibold">{user.name}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Rol</p>
              <p className="text-green-900 font-semibold capitalize">{user.role}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Email</p>
              <p className="text-purple-900 font-semibold">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Chat Interface Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold">Interfaz de Chat</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 mb-2">Interfaz de chat en desarrollo</p>
            <p className="text-sm text-gray-500">
              Aquí se implementará la funcionalidad completa del sistema de chat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}