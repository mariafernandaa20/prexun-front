'use client';
import React, { useEffect, useState } from 'react';
import { tagsService, Tag } from '@/app/services/tags';
import { useToast } from '@/hooks/use-toast';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

interface StudentTagsSelectorProps {
  studentId: number;
  initialTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
}

export function StudentTagsSelector({
  studentId,
  initialTags = [],
  onTagsChange,
}: StudentTagsSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [processingTags, setProcessingTags] = useState<Set<number>>(new Set());
  const { activeCampus } = useActiveCampusStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableTags();
  }, [activeCampus?.id]);

  useEffect(() => {
    setSelectedTags(initialTags);
  }, [initialTags]);

  const fetchAvailableTags = async () => {
    if (!activeCampus?.id) return;

    try {
      const tags = await tagsService.getTags(activeCampus.id);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
    }
  };

  const handleToggleTag = async (tag: Tag) => {
    if (processingTags.has(tag.id) || isLoading) return;
    
    setProcessingTags(prev => new Set(prev).add(tag.id));
    const isSelected = selectedTags.some((t) => t.id === tag.id);
    const previousTags = [...selectedTags];
    
    if (isSelected) {
      const newTags = selectedTags.filter((t) => t.id !== tag.id);
      setSelectedTags(newTags);
      onTagsChange?.(newTags);
      
      try {
        await tagsService.detachTagFromStudent(studentId, tag.id);
      } catch (error) {
        setSelectedTags(previousTags);
        onTagsChange?.(previousTags);
        toast({
          title: 'Error',
          description: 'Error al remover etiqueta',
          variant: 'destructive',
        });
      } finally {
        setProcessingTags(prev => {
          const next = new Set(prev);
          next.delete(tag.id);
          return next;
        });
      }
    } else {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      onTagsChange?.(newTags);
      
      try {
        const currentTagIds = selectedTags.map((t) => t.id);
        await tagsService.attachTagsToStudent(studentId, [...currentTagIds, tag.id]);
      } catch (error) {
        setSelectedTags(previousTags);
        onTagsChange?.(previousTags);
        toast({
          title: 'Error',
          description: 'Error al agregar etiqueta',
          variant: 'destructive',
        });
      } finally {
        setProcessingTags(prev => {
          const next = new Set(prev);
          next.delete(tag.id);
          return next;
        });
      }
    }
  };

  const handleRemoveTag = async (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    if (processingTags.has(tag.id) || isLoading) return;
    
    setProcessingTags(prev => new Set(prev).add(tag.id));
    const previousTags = [...selectedTags];
    const newTags = selectedTags.filter((t) => t.id !== tag.id);
    setSelectedTags(newTags);
    onTagsChange?.(newTags);
    
    try {
      await tagsService.detachTagFromStudent(studentId, tag.id);
    } catch (error) {
      setSelectedTags(previousTags);
      onTagsChange?.(previousTags);
      toast({
        title: 'Error',
        description: 'Error al remover etiqueta',
        variant: 'destructive',
      });
    } finally {
      setProcessingTags(prev => {
        const next = new Set(prev);
        next.delete(tag.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="gap-1">
            {tag.name}
            <button
              type="button"
              onClick={(e) => handleRemoveTag(tag, e)}
              disabled={isLoading || processingTags.has(tag.id)}
              className="ml-1 hover:text-destructive disabled:opacity-50"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Etiquetas disponibles</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 text-xs"
          >
            {isOpen ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
        
        {isOpen && (
          <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
            {availableTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay etiquetas disponibles
              </p>
            ) : (
              <div className="space-y-2">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.some((t) => t.id === tag.id);
                  const isProcessing = processingTags.has(tag.id);
                  return (
                    <div
                      key={tag.id}
                      className={`flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => !isProcessing && handleToggleTag(tag)}
                    >
                      <Checkbox checked={isSelected} disabled={isProcessing} />
                      <label className="text-sm cursor-pointer flex-1">
                        {tag.name}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
