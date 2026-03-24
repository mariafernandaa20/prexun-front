'use client';

import React, { useEffect, useState } from 'react';
import { tagsService, Tag } from '@/app/services/tags';
import { useToast } from '@/hooks/use-toast';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    setProcessingTags((prev) => new Set(prev).add(tag.id));
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
        setProcessingTags((prev) => {
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
        await tagsService.attachTagsToStudent(studentId, [
          ...currentTagIds,
          tag.id,
        ]);
      } catch (error) {
        setSelectedTags(previousTags);
        onTagsChange?.(previousTags);
        toast({
          title: 'Error',
          description: 'Error al agregar etiqueta',
          variant: 'destructive',
        });
      } finally {
        setProcessingTags((prev) => {
          const next = new Set(prev);
          next.delete(tag.id);
          return next;
        });
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Etiquetas seleccionadas arriba */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800"
            >
              {/* CORRECCIÓN: !!tag.is_favorite evita que aparezca el 0 */}
              {!!tag.is_favorite && <span className="text-xs">⭐</span>}
              {tag.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleTag(tag);
                }}
                disabled={isLoading || processingTags.has(tag.id)}
                className="ml-1 hover:text-destructive disabled:opacity-50 outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Sin etiquetas asignadas
          </p>
        )}
      </div>

      {/* Selector tipo Combobox */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">
              {selectedTags.length > 0
                ? `${selectedTags.length} seleccionada(s)`
                : 'Seleccionar etiquetas...'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command className="w-full">
            <CommandInput placeholder="Buscar etiqueta..." />
            <CommandList>
              <CommandEmpty>No se encontraron etiquetas.</CommandEmpty>
              <CommandGroup>
                {[...availableTags]
                  .sort((a, b) => {
                    if (a.is_favorite && !b.is_favorite) return -1;
                    if (!a.is_favorite && b.is_favorite) return 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((tag) => {
                    const isSelected = selectedTags.some(
                      (t) => t.id === tag.id
                    );
                    return (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => handleToggleTag(tag)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {/* CORRECCIÓN: !!tag.is_favorite evita que aparezca el 0 */}
                          {!!tag.is_favorite && (
                            <span className="text-amber-500">⭐</span>
                          )}
                          <span>{tag.name}</span>
                        </div>
                        <div
                          className={cn(
                            'ml-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <Check className={cn('h-3 w-3')} />
                        </div>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
