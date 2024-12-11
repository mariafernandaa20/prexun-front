"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Period, Student } from "@/lib/types";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getPeriods,
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
import ChargesForm from "@/components/dashboard/estudiantes/charges-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/multi-select";

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'preparatoria' | 'facultad'>('all');
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const { activeCampus } = useActiveCampusStore();
  const { toast } = useToast();

  const columnOptions = [
    { value: 'username', label: 'Usuario', defaultVisible: true },
    { value: 'created_at', label: 'Fecha de Inscripción', defaultVisible: true },
    { value: 'email', label: 'Email', defaultVisible: true },
    { value: 'phone', label: 'Teléfono', defaultVisible: true },
    { value: 'type', label: 'Curso', defaultVisible: false },
    { value: 'period', label: 'Periodo', defaultVisible: false },
    { value: 'debt', label: 'Debe', defaultVisible: true },
    { value: 'actions', label: 'Acciones', defaultVisible: true }
  ];

  const [visibleColumns, setVisibleColumns] = useState(
    columnOptions.filter(col => col.defaultVisible).map(col => col.value)
  );

  const handleColumnSelect = (selectedColumns: string[]) => {
    setVisibleColumns(selectedColumns);
  };

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
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    const response = await getPeriods();
    setPeriods(response);
  };

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

  const filteredStudents = students.filter(student => {
    const matchesType = typeFilter === 'all' || student.type === typeFilter;
    const matchesName = student.username.toLowerCase().includes(searchName.toLowerCase()) || 
                       student.firstname.toLowerCase().includes(searchName.toLowerCase()) ||
                       student.lastname.toLowerCase().includes(searchName.toLowerCase());
    const matchesDate = !searchDate || new Date(student.created_at).toLocaleDateString().includes(searchDate);
    const matchesPhone = !searchPhone || student.phone.includes(searchPhone);
    
    return matchesType && matchesName && matchesDate && matchesPhone;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estudiantes</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Buscar por nombre..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-[200px]"
          />
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-[200px]"
          />
          <Input
            placeholder="Buscar por teléfono..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-[200px]"
          />
          <Select value={typeFilter} onValueChange={(value: 'all' | 'preparatoria' | 'facultad') => setTypeFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="preparatoria">Preparatoria</SelectItem>
              <SelectItem value="facultad">Facultad</SelectItem>
            </SelectContent>
          </Select>
          <MultiSelect
            options={columnOptions}
            hiddeBadages={true}
            selectedValues={visibleColumns}
            onSelectedChange={handleColumnSelect}
            title="Columnas"
            placeholder="Seleccionar columnas"
            searchPlaceholder="Buscar columna..."
            emptyMessage="No se encontraron columnas"
          />
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
              {visibleColumns.includes('username') && <TableHead>Usuario</TableHead>}
              {visibleColumns.includes('created_at') && <TableHead>Fecha de Inscripción</TableHead>}
              {visibleColumns.includes('email') && <TableHead>Email</TableHead>}
              {visibleColumns.includes('phone') && <TableHead>Teléfono</TableHead>}
              {visibleColumns.includes('type') && <TableHead>Curso</TableHead>}
              {visibleColumns.includes('period') && <TableHead>Periodo</TableHead>}
              {visibleColumns.includes('debt') && <TableHead>Debe</TableHead>}
              {visibleColumns.includes('actions') && <TableHead>Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                {visibleColumns.includes('username') && 
                  <TableCell>{student.firstname} {student.lastname}</TableCell>}
                {visibleColumns.includes('created_at') && 
                  <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>}
                {visibleColumns.includes('email') && 
                  <TableCell>{student.email}</TableCell>}
                {visibleColumns.includes('phone') && 
                  <TableCell>{student.phone}</TableCell>}
                {visibleColumns.includes('type') && 
                  <TableCell>{student.type}</TableCell>}
                {visibleColumns.includes('period') && 
                  <TableCell>{student.period.name}</TableCell>}
                {visibleColumns.includes('debt') && 
                  <TableCell>{student.current_debt}</TableCell>}
                {visibleColumns.includes('actions') && 
                  <TableCell className="p-4">
                    <div className="flex gap-2 justify-end">
                      <ChargesForm student={student} />
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
                  </TableCell>}
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
            periods={periods}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
