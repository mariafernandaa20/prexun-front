"use client";

import { useEffect, useState } from "react";
import { Campus, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCohorts } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (data: Student) => void;
  onCancel: () => void;
  campusId: string;
}

export function StudentForm({ student, onSubmit, onCancel, campusId }: StudentFormProps) {
  const { toast } = useToast();
  const [cohorts, setCohorts] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Student>({
    id: student?.id || null,
    campus_id: campusId,
    username: student?.username || "",
    firstname: student?.firstname || "",
    lastname: student?.lastname || "",
    email: student?.email || "",
    phone: student?.phone || "",
    type: student?.type || "preparatoria",
    status: student?.status || "active",
  });

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        setIsLoading(true);
        const response = await getCohorts();
        setCohorts(response);
      } catch (error: any) {
        toast({
          title: "Error al cargar cohortes",
          description: error.response?.data?.message || "Intente nuevamente",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCohorts();
  }, [toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email) {
      toast({
        title: "Error de validación",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = 'target' in e 
      ? e.target 
      : e;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          placeholder="Usuario del estudiante"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="firstname">Nombre</Label>
        <Input
          id="firstname"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          required
          placeholder="Nombre completo del estudiante"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastname">Apellido</Label>
        <Input
          id="lastname"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          required
          placeholder="Apellido del estudiante"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* <div className="space-y-2">
        <Label htmlFor="cohort_id">Cohorte</Label>
        <Select
          name="cohort_id"
          value={formData.cohort_id}
          onValueChange={(value) => handleChange({ name: "cohort_id", value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cohorte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">2024-A</SelectItem>
            <SelectItem value="2">2024-B</SelectItem>
          </SelectContent>
        </Select>
      </div> */}
      <div className="space-y-2">
        <Label htmlFor="type">Ingreso</Label>
        <Select
          name="type"
          value={formData.type}
          onValueChange={(value) => 
            handleChange({ 
              name: "type", 
              value: value as 'preparatoria' | 'facultad' 
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar ingreso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preparatoria">Preparatoria</SelectItem>
            <SelectItem value="facultad">Facultad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
} 