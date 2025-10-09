import React, { useState } from 'react';
import {
  bulkDeleteStudents,
  deleteStudent,
  bulkUpdateSemanaIntensiva,
  bulkMarkAsActive,
  bulkMarkAsInactive,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button, buttonVariants } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import SendTemplateDialog from './SendTemplateDialog';

interface BulkActionsProps {
  selectedStudents: string[];
  fetchStudents: () => Promise<void>;
  setSelectedStudents: React.Dispatch<React.SetStateAction<string[]>>;
  setIsBulkActionLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedStudents,
  fetchStudents,
  setSelectedStudents,
  setIsBulkActionLoading,
}) => {
  const { toast } = useToast();
  const [selectedSemanaIntensiva, setSelectedSemanaIntensiva] =
    useState<string>('');
  const { semanasIntensivas } = useAuthStore();

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (
      !confirm(
        `¿Está seguro de eliminar ${selectedStudents.length} estudiante(s)?`
      )
    )
      return;

    try {
      setIsBulkActionLoading(true);
      for (const id of selectedStudents) {
        await deleteStudent(id);
      }

      await fetchStudents();
      setSelectedStudents([]);
      toast({
        title: 'Acción completada',
        description: `${selectedStudents.length} estudiante(s) eliminados correctamente`,
      });
    } catch (error: any) {
      toast({
        title: 'Error al eliminar estudiantes',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDeleteForever = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (
      !confirm(
        `¿Está seguro de eliminar permanentemente ${selectedStudents.length} estudiante(s)? Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      setIsBulkActionLoading(true);
      await bulkDeleteStudents(selectedStudents, true);
      await fetchStudents();
      setSelectedStudents([]);
      toast({
        title: 'Acción completada',
        description: `${selectedStudents.length} estudiante(s) eliminados permanentemente`,
      });
    } catch (error: any) {
      toast({
        title: 'Error al eliminar estudiantes',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };
  const handleBulkAssignSemanaIntensiva = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedSemanaIntensiva) {
      toast({
        title: 'Error',
        description: 'Seleccione una semana intensiva',
        variant: 'destructive',
      });
      return;
    }

    if (
      !confirm(
        `¿Está seguro de asignar ${selectedStudents.length} estudiante(s) a la semana intensiva seleccionada?`
      )
    )
      return;

    try {
      setIsBulkActionLoading(true);
      const response = await bulkUpdateSemanaIntensiva(
        selectedStudents,
        selectedSemanaIntensiva
      );
      await fetchStudents();
      setSelectedStudents([]);
      toast({
        title: 'Acción completada',
        description: `${selectedStudents.length} estudiante(s) asignados a la semana intensiva correctamente`,
      });
    } catch (error: any) {
      toast({
        title: 'Error al asignar estudiantes a semana intensiva',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkMarkAsActive = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (
      !confirm(
        `¿Está seguro de marcar como activos ${selectedStudents.length} estudiante(s)?`
      )
    )
      return;

    try {
      setIsBulkActionLoading(true);
      await bulkMarkAsActive(selectedStudents);
      await fetchStudents();
      setSelectedStudents([]);
      toast({
        title: 'Acción completada',
        description: `${selectedStudents.length} estudiante(s) marcados como activos correctamente`,
      });
    } catch (error: any) {
      toast({
        title: 'Error al marcar estudiantes como activos',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkMarkAsInactive = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (
      !confirm(
        `¿Está seguro de marcar como inactivos ${selectedStudents.length} estudiante(s)?`
      )
    )
      return;

    try {
      setIsBulkActionLoading(true);
      await bulkMarkAsInactive(selectedStudents);
      await fetchStudents();
      setSelectedStudents([]);
      toast({
        title: 'Acción completada',
        description: `${selectedStudents.length} estudiante(s) marcados como inactivos correctamente`,
      });
    } catch (error: any) {
      toast({
        title: 'Error al marcar estudiantes como inactivos',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
      <div className="flex gap-2">
        <Button
          className="w-full"
          variant="destructive"
          onClick={handleBulkDelete}
          title="Eliminar seleccionados"
          disabled={selectedStudents.length === 0}
        >
          <Trash />
        </Button>
        <Button
          className="w-full"
          variant="destructive"
          onClick={handleBulkDeleteForever}
          disabled={selectedStudents.length === 0}
          title="Eliminar permanentemente"
        >
          <Trash />
        </Button>
      </div>
      <div className="col-span-2 gap-4 flex items-center">
        <select
          className={buttonVariants({ variant: 'secondary' })}
          value={selectedSemanaIntensiva}
          onChange={(e) => setSelectedSemanaIntensiva(e.target.value)}
        >
          <option value="">Seleccionar semana intensiva</option>
          {semanasIntensivas.map((semana) => (
            <option key={semana.id} value={semana.id}>
              {semana.name}
            </option>
          ))}
        </select>
        <Button
          className="w-full"
          onClick={handleBulkAssignSemanaIntensiva}
          disabled={!selectedSemanaIntensiva || selectedStudents.length === 0}
        >
          Asignar a semana intensiva
        </Button>
      </div>
      <Button
        disabled={selectedStudents.length === 0}
        onClick={handleBulkMarkAsActive}
      >
        Marcar como Activo
      </Button>
      <Button
        disabled={selectedStudents.length === 0}
        onClick={handleBulkMarkAsInactive}
      >
        Marcar como Inactivo
      </Button>

      <SendTemplateDialog
        selectedStudents={selectedStudents}
        setIsBulkActionLoading={setIsBulkActionLoading}
      />
    </div>
  );
};

export default BulkActions;
