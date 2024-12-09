"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Student } from "@/lib/types";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, Upload } from "lucide-react";
import { StudentForm } from "./student-form";
import { useActiveCampusStore } from "@/lib/store/plantel-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImportStudent } from "./impoort-student";

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { activeCampus } = useActiveCampusStore();
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await getStudents(activeCampus?.id || "");
      setStudents(data);
    } catch (error: any) {
      toast({
        title: "Error al cargar estudiantes",
        description: error.response?.data?.message || "Intente nuevamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este estudiante?")) return;

    try {
      await deleteStudent(id);
      await fetchStudents();
      toast({ title: "Estudiante eliminado correctamente" });
    } catch (error: any) {
      toast({
        title: "Error al eliminar estudiante",
        description: error.response?.data?.message || "Intente nuevamente",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (formData: Student) => {
    try {
      if (selectedStudent) {
        await updateStudent({ ...formData });
        toast({ title: "Estudiante actualizado correctamente" });
      } else {
        await createStudent({ ...formData });
        toast({ title: "Estudiante creado correctamente" });
      }
      await fetchStudents();
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error al guardar estudiante",
        description: error.response?.data?.message || "Intente nuevamente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estudiantes</h1>
        <div className="flex gap-4">
          <ImportStudent
            fetchStudents={fetchStudents}
            campusId={activeCampus?.id || ""}
          />
          <Button onClick={handleOpenCreateModal}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Estudiante
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Cargando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.username}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.phone}</TableCell>
                <TableCell>{student.type}</TableCell>
                <TableCell className="p-4">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditModal(student)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(student.id!)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? "Editar Estudiante" : "Nuevo Estudiante"}
            </DialogTitle>
          </DialogHeader>
          <StudentForm
            campusId={activeCampus?.id || ""}
            student={selectedStudent}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
