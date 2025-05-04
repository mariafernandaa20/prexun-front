import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentForm } from "./student-form";

export const StudentDialog = ({
  isOpen,
  setIsOpen,
  selectedStudent,
  onSubmit,
  municipios,
  prepas,
  promos,
}) => {

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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