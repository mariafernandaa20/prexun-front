import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Campus } from "@/lib/types";

type PlantelFormProps = {
  campus: Campus;
  onSave: (campus: Campus) => void;
  onCancel: () => void;
};

export function PlantelForm({ campus, onSave, onCancel }: PlantelFormProps) {
  const [formData, setFormData] = useState(campus);

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
          value={formData.address}
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

