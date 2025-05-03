import React from 'react';
import { bulkDeleteStudents, deleteStudent } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Seleccione al menos un estudiante',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`¿Está seguro de eliminar ${selectedStudents.length} estudiante(s)?`)) return;

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

    if (!confirm(`¿Está seguro de eliminar permanentemente ${selectedStudents.length} estudiante(s)? Esta acción no se puede deshacer.`)) return;

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

  return (
    <div className="flex gap-2">
      <button onClick={handleBulkDelete} disabled={selectedStudents.length === 0}>
        Eliminar seleccionados
      </button>
      <button onClick={handleBulkDeleteForever} disabled={selectedStudents.length === 0}>
        Eliminar permanentemente
      </button>
    </div>
  );
};

export default BulkActions;