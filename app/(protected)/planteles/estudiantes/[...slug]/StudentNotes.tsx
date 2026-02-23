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


}
