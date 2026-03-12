'use client';

import { useEffect, useState } from 'react';
import { FaGoogle, FaTrash } from 'react-icons/fa6';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import axiosInstance from '@/lib/api/axiosConfig';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface GoogleSession {
  id: number;
  email: string;
  updated_at: string;
}

export default function GoogleAuth() {
  const { activeCampus } = useActiveCampusStore();
  const [sessions, setSessions] = useState<GoogleSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (activeCampus?.id) {
      fetchSessions();
    }
  }, [activeCampus?.id]);

  const fetchSessions = async () => {
    if (!activeCampus?.id) return;
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/campuses/${activeCampus.id}/google-sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error cargando sesiones de Google:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkNewAccount = async () => {
    if (!activeCampus?.id) return;
    setIsLinking(true);
    try {
      const response = await axiosInstance.get(`/google/auth-url?campus_id=${activeCampus.id}`);
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar la URL de vinculación con Google.',
        variant: 'destructive',
      });
      setIsLinking(false);
    }
  };

  const handleUnlink = async (sessionId: number) => {
    try {
      await axiosInstance.delete(`/google-sessions/${sessionId}`);
      toast({ title: 'Cuenta desvinculada exitosamente' });
      fetchSessions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo desvincular la cuenta.',
        variant: 'destructive',
      });
    }
  };

  if (!activeCampus) return null;

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
      ) : (
        sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200 dark:border-green-800"
            title="Sincronización de contactos activa"
          >
            <FaGoogle className="w-3.5 h-3.5" />
            <span className="max-w-[120px] truncate">{session.email}</span>
            <button
              onClick={() => handleUnlink(session.id)}
              className="ml-1 text-green-600 hover:text-red-500 dark:text-green-400 dark:hover:text-red-400 transition-colors"
              title="Desvincular cuenta"
            >
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
        ))
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleLinkNewAccount}
        disabled={isLinking || isLoading}
        className="h-8 shadow-sm flex items-center gap-2"
      >
        {isLinking ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FaGoogle className="w-3.5 h-3.5 text-blue-500" />
        )}
        <span className="hidden sm:inline">Vincular cuenta</span>
      </Button>
    </div>
  );
}
