'use client';
import React, { useEffect, useState } from 'react';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { tagsService, Tag } from '@/app/services/tags';
import { useToast } from '@/hooks/use-toast';
import SectionContainer from '@/components/SectionContainer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import TagDialog from './TagDialog';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const { activeCampus } = useActiveCampusStore();
  const { toast } = useToast();

  const fetchTags = async () => {
    if (!activeCampus?.id) return;
    
    setIsLoading(true);
    try {
      const data = await tagsService.getTags(activeCampus.id);
      setTags(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar las etiquetas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [activeCampus?.id]);

  const handleCreate = () => {
    setSelectedTag(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`¿Eliminar la etiqueta "${tag.name}"?`)) return;

    try {
      await tagsService.deleteTag(tag.id);
      toast({
        title: 'Éxito',
        description: 'Etiqueta eliminada correctamente',
      });
      fetchTags();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar la etiqueta',
        variant: 'destructive',
      });
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchTags();
  };

  return (
    <SectionContainer>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Etiquetas</CardTitle>
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Etiqueta
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay etiquetas creadas
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tag)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tag)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TagDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        tag={selectedTag}
        campusId={activeCampus?.id}
        onSuccess={handleSuccess}
      />
    </SectionContainer>
  );
}
