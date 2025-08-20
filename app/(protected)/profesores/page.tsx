'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/lib/api/axiosConfig';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Student {
  id: number;
  name: string;
  email: string;
}

interface Grupo {
  id: number;
  name: string;
  students?: Student[];
}

export default function ProfesoresPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  useEffect(() => {
    fetchGruposProfesor();
  }, []);

  const fetchGruposProfesor = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/teacher/${user?.id}/groups`);
      setGrupos(response.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los grupos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentsForGroup = async (grupoId: number) => {
    try {
      const response = await axiosInstance.get(`/grupos/${grupoId}/students`);
      const grupoIndex = grupos.findIndex((g) => g.id === grupoId);
      if (grupoIndex !== -1) {
        const updatedGrupos = [...grupos];
        updatedGrupos[grupoIndex] = {
          ...updatedGrupos[grupoIndex],
          students: response.data,
        };
        setGrupos(updatedGrupos);
        return response.data;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mis Grupos</h1>
    </div>
  );
}
