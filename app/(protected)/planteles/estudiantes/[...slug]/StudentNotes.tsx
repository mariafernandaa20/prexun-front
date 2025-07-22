'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Note } from '@/lib/types';
import { getStudentNotes, createNote, updateNote, deleteNote } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  studentId: string;
}

export default function StudentNotes({ studentId }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteText, setNoteText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await getStudentNotes(Number(studentId));
      console.log(response)
      setNotes(response.notes || []);
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      toast.error('Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchNotes();
    }
  }, [studentId]);

  const handleCreateNote = async () => {
    if (!noteText.trim()) {
      setErrors({ text: 'El texto de la nota es requerido' });
      return;
    }

    try {
      setLoading(true);
      await createNote({
        student_id: Number(studentId),
        text: noteText.trim(),
      });

      toast.success('Nota creada exitosamente');
      setNoteText('');
      setIsCreateDialogOpen(false);
      setErrors({});
      await fetchNotes();
    } catch (error: any) {
      console.error('Error creating note:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Error al crear la nota');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = async () => {
    if (!selectedNote || !noteText.trim()) {
      setErrors({ text: 'El texto de la nota es requerido' });
      return;
    }

    try {
      setLoading(true);
      await updateNote({
        ...selectedNote,
        text: noteText.trim(),
      });

      toast.success('Nota actualizada exitosamente');
      setNoteText('');
      setSelectedNote(null);
      setIsEditDialogOpen(false);
      setErrors({});
      await fetchNotes();
    } catch (error: any) {
      console.error('Error updating note:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Error al actualizar la nota');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote?.id) return;

    try {
      setLoading(true);
      await deleteNote(selectedNote.id);

      toast.success('Nota eliminada exitosamente');
      setSelectedNote(null);
      setIsDeleteDialogOpen(false);
      await fetchNotes();
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Error al eliminar la nota');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (note: Note) => {
    setSelectedNote(note);
    setNoteText(note.text);
    setErrors({});
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };

  const openCreateDialog = () => {
    setNoteText('');
    setErrors({});
    setIsCreateDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">


      <Card >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notas del Estudiante
            </h3>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Nota
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Nota</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="note-text">Texto de la Nota</Label>
                    <Textarea
                      id="note-text"
                      placeholder="Escribe aquí la nota del estudiante..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={4}
                      className={errors.text ? 'border-red-500' : ''}
                    />
                    {errors.text && (
                      <p className="text-red-500 text-sm">{errors.text}</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateNote} disabled={loading}>
                      {loading ? 'Creando...' : 'Crear Nota'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">


          {loading && notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando notas...</p>
            </div>
          ) : notes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No hay notas registradas para este estudiante
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Nota
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {note.created_at && formatDate(note.created_at)}
                        {note.updated_at && note.updated_at !== note.created_at && (
                          <span className="ml-2">
                            (Editado: {formatDate(note.updated_at)})
                          </span>
                        )}
                      </p>
                      <div className="text-sm text-gray-500">
                        Creado por: {note.user?.name || 'Usuario desconocido'}
                        <span className="ml-2">{formatDate(note.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(note)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(note)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{note.text}</p>
                </div>

              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Nota</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-note-text">Texto de la Nota</Label>
              <Textarea
                id="edit-note-text"
                placeholder="Escribe aquí la nota del estudiante..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                className={errors.text ? 'border-red-500' : ''}
              />
              {errors.text && (
                <p className="text-red-500 text-sm">{errors.text}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button onClick={handleEditNote} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Nota'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La nota será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
