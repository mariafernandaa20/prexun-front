import { useState } from "react";
import { School } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PlantelFormProps = {
  school: School;
  onSave: (school: School) => void;
  onCancel: () => void;
};

export function PlantelForm({ school, onSave, onCancel }: PlantelFormProps) {
  const [formData, setFormData] = useState(school);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "studentCount" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del Plantel</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="administrator">Administrador</Label>
        <Input
          id="administrator"
          name="administrator"
          value={formData.administrator}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="location">Ubicación</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="studentCount">Número de Estudiantes</Label>
        <Input
          id="studentCount"
          name="studentCount"
          type="number"
          value={formData.studentCount}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

