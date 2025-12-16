'use client';

import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Button, buttonVariants } from '@/components/ui/button';
import { Student } from '@/lib/types';
import { Pencil, Trash2, Eye, MessageSquare, Calendar } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/lib/types';
import AdeudosModal from '@/components/dashboard/AdeudosModal';
import StudentPeriod from './student-period';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const StudentPeriodDialog = ({ student }: { student: Student }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Ver periodos">
          <Calendar className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <StudentPeriod student={student} />
      </DialogContent>
    </Dialog>
  );
};

interface ColumnDefinition {
  id: string;
  label: string;
  defaultVisible: boolean;
  render: (
    student: Student,
    user?: User | null,
    handleOpenEditModal?: (student: Student) => void,
    handleDeleteForever?: (id: string) => void,
    handleOpenWhatsAppModal?: (student: Student) => void
  ) => React.ReactNode;
}

export const getColumnDefinitions = (
  user: User | null,
  handleOpenEditModal: (student: Student) => void,
  handleDeleteForever: (id: string) => void,
  handleOpenWhatsAppModal: (student: Student) => void
): ColumnDefinition[] => [
  {
    id: 'matricula',
    label: 'Matrícula',
    defaultVisible: false,
    render: (student: Student) => student.id,
  },
  {
    id: 'status',
    label: 'Estatus',
    defaultVisible: true,
    render: (student: Student) => (
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            student.status === 'Activo'
              ? 'bg-green-500'
              : student.status === 'Inactivo'
                ? 'bg-gray-500'
                : student.status === 'Baja'
                  ? 'bg-red-500'
                  : student.status === 'Suspendido'
                    ? 'bg-yellow-500'
                    : student.status === 'Transferido'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
          }`}
        />
        <span>{student.status}</span>
      </div>
    ),
  },
  {
    id: 'created_at',
    label: 'Fecha de Inscripción',
    defaultVisible: false,
    render: (student: Student) =>
      new Date(student.created_at).toLocaleDateString(),
  },
  {
    id: 'firstname',
    label: 'Nombre',
    defaultVisible: true,
    render: (student: Student) => (
      <a href={`/planteles/estudiantes/${student.id}`}>{student.firstname}</a>
    ),
  },
  {
    id: 'lastname',
    label: 'Apellido',
    defaultVisible: true,
    render: (student: Student) => student.lastname,
  },
  {
    id: 'email',
    label: 'Email',
    defaultVisible: true,
    render: (student: Student) => student.email,
  },
  {
    id: 'phone',
    label: 'Teléfono',
    defaultVisible: true,
    render: (student: Student) => student.phone,
  },
  {
    id: 'tags',
    label: 'Etiquetas',
    defaultVisible: true,
    render: (student: Student) => {
      if (!student.tags || student.tags.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {student.tags.map((tag: any) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
            >
              {tag.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: 'type',
    label: 'Curso',
    defaultVisible: false,
    render: (student: Student) => student.type,
  },
  {
    id: 'period',
    label: 'Periodo',
    defaultVisible: false,
    render: (student: Student) => (student.period ? student.period.name : '-'),
  },
  {
    id: 'grupo',
    label: 'Grupo',
    defaultVisible: true,
    render: (student: Student) =>
      student?.period_assignments?.[0]?.grupo?.name
        ? student.period_assignments[0].grupo.name
        : '-',
  },
  {
    id: 'grupo_viejo',
    label: 'Grupo viejo',
    defaultVisible: false,
    render: (student: Student) => (student?.grupo ? student.grupo.name : '-'),
  },
  {
    id: 'carrera',
    label: 'Carrera',
    defaultVisible: false,
    render: (student: Student) =>
      student?.period_assignments?.[0]?.carrera?.name || '-',
  },
  {
    id: 'facultad',
    label: 'Facultad',
    defaultVisible: false,
    render: (student: Student) => student?.facultad?.name || '-',
  },
  {
    id: 'prepa',
    label: 'Preparatoria',
    defaultVisible: false,
    render: (student: Student) => student?.prepa?.name || '-',
  },
  {
    id: 'municipio',
    label: 'Municipio',
    defaultVisible: false,
    render: (student: Student) => student?.municipio?.name || '-',
  },
  {
    id: 'tutor_name',
    label: 'Tutor',
    defaultVisible: false,
    render: (student: Student) => student.tutor_name || '-',
  },
  {
    id: 'tutor_phone',
    label: 'Teléfono del Tutor',
    defaultVisible: false,
    render: (student: Student) => student.tutor_phone || '-',
  },
  {
    id: 'tutor_relationship',
    label: 'Relación con el Tutor',
    defaultVisible: false,
    render: (student: Student) => student.tutor_relationship || '-',
  },
  {
    id: 'health_conditions',
    label: 'Condiciones de Salud',
    defaultVisible: false,
    render: (student: Student) => student.health_conditions || '-',
  },
  {
    id: 'how_found_out',
    label: 'Cómo se Enteró',
    defaultVisible: false,
    render: (student: Student) => student.how_found_out || '-',
  },
  {
    id: 'preferred_communication',
    label: 'Medio de Comunicación',
    defaultVisible: false,
    render: (student: Student) => student.preferred_communication || '-',
  },

  {
    id: 'actions',
    label: 'Acciones',
    defaultVisible: true,
    render: (
      student: Student,
      user?: User | null,
      handleOpenEditModal?: (student: Student) => void,
      handleDeleteForever?: (id: string) => void,
      handleOpenWhatsAppModal?: (student: Student) => void
    ) => (
      <div className="flex gap-2">
        {student?.id && <StudentPeriodDialog student={student} />}

        <AdeudosModal student={student} />
        <Link
          className={buttonVariants({ variant: 'ghost' })}
          href={`/planteles/estudiantes/${student.id}`}
          title="Ver estudiante"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleOpenEditModal && handleOpenEditModal(student)}
          title="Editar estudiante"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        {user?.role === 'super_admin' && (
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            onClick={() =>
              handleDeleteForever && handleDeleteForever(student.id!)
            }
            title="Eliminar estudiante"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
  },
];

export const getColumnOptions = (columnDefinitions: ColumnDefinition[]) => {
  return columnDefinitions.map((col) => ({
    value: col.id,
    label: col.label,
    defaultVisible: col.defaultVisible,
  }));
};
