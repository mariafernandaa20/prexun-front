import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Student, User } from "@/lib/types";

interface StudentsTableProps {
  students: Student[];
  visibleColumnDefs: any[];
  selectedStudents: string[];
  selectAll: boolean;
  handleSelectAll: () => void;
  handleSelectStudent: (id: string) => void;
  user: User | null;
  handleOpenEditModal: (student: Student) => void;
  handleDeleteForever: (id: string) => void;
  handleOpenWhatsAppModal?: (student: Student) => void;
}

export const StudentsTable = ({
  students,
  visibleColumnDefs,
  selectedStudents,
  selectAll,
  handleSelectAll,
  handleSelectStudent,
  user,
  handleOpenEditModal,
  handleDeleteForever,
  handleOpenWhatsAppModal
}: StudentsTableProps) => {
  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-card">
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectAll && students.length > 0}
              onCheckedChange={handleSelectAll}
              aria-label="Seleccionar todos"
            />
          </TableHead>
          {visibleColumnDefs.map((column) => (
            <TableHead key={column.id} className="bg-card whitespace-nowrap">
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={visibleColumnDefs.length + 1} className="text-center h-32">
              No se encontraron estudiantes
            </TableCell>
          </TableRow>
        ) : (
          students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="w-12">
                <Checkbox
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => handleSelectStudent(student.id)}
                  aria-label={`Seleccionar ${student.firstname} ${student.lastname}`}
                />
              </TableCell>
              {visibleColumnDefs.map((column) => (
                <TableCell key={`${student.id}-${column.id}`} className="whitespace-nowrap">
                  {column.render(student, user, handleOpenEditModal, handleDeleteForever, handleOpenWhatsAppModal)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};