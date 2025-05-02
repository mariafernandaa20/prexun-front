import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const StudentsTable = ({
  filteredStudents,
  visibleColumnDefs,
  selectedStudents,
  selectAll,
  handleSelectAll,
  handleSelectStudent,
  user,
  handleOpenEditModal,
  handleDeleteForever
}) => {
  return (
    <div className="h-full overflow-x-auto max-w-[80vw]">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectAll && filteredStudents.length > 0}
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
          {filteredStudents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumnDefs.length + 1} className="text-center h-32">
                No se encontraron estudiantes
              </TableCell>
            </TableRow>
          ) : (
            filteredStudents.map((student) => (
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
                    {column.render(student, user, handleOpenEditModal, handleDeleteForever)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};