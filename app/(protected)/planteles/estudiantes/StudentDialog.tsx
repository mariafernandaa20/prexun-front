import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentForm } from "./student-form";
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { useAuthStore } from "@/lib/store/auth-store";

export const StudentDialog = ({
  isOpen,
  setIsOpen,
  selectedStudent,
  onSubmit,
  municipios,
  prepas,
  promos,
}) => {
  const { activeCampus } = useActiveCampusStore();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="lg:min-w-[60rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </DialogTitle>
        </DialogHeader>
        <StudentForm
          campusId={activeCampus?.id}
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