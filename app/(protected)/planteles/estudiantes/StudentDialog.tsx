import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentForm } from "./student-form";

export const StudentDialog = ({
  isOpen,
  setIsOpen,
  selectedStudent,
  setSelectedStudent,
  onSubmit,
  municipios,
  prepas,
  promos,
}) => {
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setSelectedStudent(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="lg:min-w-[70rem] max-h-[90vh] overflow-y-hidden">
        <DialogHeader>
          <DialogTitle>
            {selectedStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </DialogTitle>
        </DialogHeader>
        <StudentForm
          student={selectedStudent}
          onSubmit={onSubmit}
          onCancel={() => setIsOpen(false)}
          municipios={municipios}
          prepas={prepas}
          promos={promos}
        />
      </DialogContent>
    </Dialog>
  );
};