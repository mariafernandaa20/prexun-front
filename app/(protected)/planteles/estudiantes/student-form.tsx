'use client';

import { useEffect, useState } from 'react';
import { Campus, Cohort, Municipio, Carrera, Period, Student, Prepa, Facultad, Promocion, Grupo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (data: Student) => void;
  onCancel: () => void;
  campusId: string;
  periods: Period[];
  municipios: Municipio[];
  prepas: Prepa[];
  facultades: Facultad[];
  carreras: Carrera[];
  promos: Promocion[];
  grupos: Grupo[];
}

export function StudentForm({
  student,
  onSubmit,
  onCancel,
  campusId,
  periods,
  municipios,
  prepas,
  facultades,
  carreras,
  promos,
  grupos,
}: StudentFormProps) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Student>({
    id: student?.id || null,
    period_id: student?.period_id || '',
    campus_id: campusId,
    promo_id: student?.promo_id || null,
    grupo_id: student?.grupo_id || null,
    firstname: student?.firstname || '',
    lastname: student?.lastname || '',
    email: student?.email || '',
    phone: student?.phone || '',
    prepa_id: student?.prepa_id || '',
    municipio_id: student?.municipio_id || '',
    facultad_id: student?.facultad_id || '',
    carrer_id: student?.carrer_id || '',
    type: student?.type || 'preparatoria',
    status: student?.status || 'Activo',
    tutor_name: student?.tutor_name || '',
    tutor_phone: student?.tutor_phone || '',
    tutor_relationship: student?.tutor_relationship || '',
    average: student?.average || 0,
    attempts: student?.attempts || 'NA',
    score: student?.score || 0,
    health_conditions: student?.health_conditions || '',
    how_found_out: student?.how_found_out || '',
    preferred_communication: student?.preferred_communication || '',
    general_book: student?.general_book || null,
    module_book: student?.module_book || null ,
  });

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        setIsLoading(true);
      } catch (error: any) {
        toast({
          title: 'Error al cargar cohortes',
          description: error.response?.data?.message || 'Intente nuevamente',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCohorts();
  }, [toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstname || !formData.lastname || !formData.phone) {
      toast({
        title: 'Error de validación',
        description: 'Por favor complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;
    console.log(name, value);
    if (name === 'facultad_id') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        carrer_id: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  const filteredCarreras = carreras.filter(
    (carrera) => carrera.facultad_id === (Number(formData.facultad_id) as any)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4  max-h-[calc(100vh-150px)] overflow-y-auto">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estatus</Label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(value) =>
              handleChange({
                name: 'status',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
              <SelectItem value="Baja">Baja</SelectItem>
              <SelectItem value="Suspendido">Suspendido</SelectItem>
              <SelectItem value="Transferido">Transferido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="period_id">Periodo</Label>
          <Select
            name="period_id"
            value={Number(formData.period_id) as any}
            onValueChange={(value) =>
              handleChange({
                name: 'period_id',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el periodo" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo_id">Promoción</Label>
          <Select
            name="promo_id"
            value={Number(formData.promo_id) as any}
            onValueChange={(value) => handleChange({ name: 'promo_id', value: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la promoción" />
            </SelectTrigger>
            <SelectContent>
              {promos.map((promo) => (
                <SelectItem key={promo.id} value={promo.id as any}>
                  {promo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="grupo_id">Grupo</Label>
          <Select
            name="grupo_id"
            value={Number(formData.grupo_id) as any}
            onValueChange={(value) => handleChange({ name: 'grupo_id', value: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el grupo" />
            </SelectTrigger>
            <SelectContent>
              {grupos.map((grupo) => (
                <SelectItem key={grupo.id} value={grupo.id as any}>
                  {grupo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <div className="space-y-2">
          <Label htmlFor="tutor_name">Nombre del tutor</Label>
          <Input
            id="tutor_name"
            name="tutor_name"
            value={formData.tutor_name}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tutor_phone">Teléfono del tutor</Label>
          <Input
            id="tutor_phone"
            name="tutor_phone"
            value={formData.tutor_phone}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tutor_relationship">Relación con el estudiante</Label>
          <Select
            name="tutor_relationship"
            value={formData.tutor_relationship}
            onValueChange={(value) =>
              handleChange({
                name: 'tutor_relationship',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar relación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Padre">Padre</SelectItem>
              <SelectItem value="Madre">Madre</SelectItem>
              <SelectItem value="Tío">Tío</SelectItem>
              <SelectItem value="Tía">Tía</SelectItem>
              <SelectItem value="Hermano">Hermano</SelectItem>
              <SelectItem value="Hermana">Hermana</SelectItem>
              <SelectItem value="Abuelo">Abuelo</SelectItem>
              <SelectItem value="Abuela">Abuela</SelectItem>
              <SelectItem value="Conocido">Conocido</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="municipio_id">Municipio</Label>
          <Select
            name="municipio_id"
            value={Number(formData.municipio_id) as any}
            onValueChange={(value) =>
              handleChange({
                name: 'municipio_id',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar municipio" />
            </SelectTrigger>
            <SelectContent>
              {municipios.map((municipio) => (
                <SelectItem key={municipio.id} value={municipio.id}>
                  {municipio.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                name: 'type',
                value: value as 'preparatoria' | 'facultad',
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

        {formData.type && formData.type === 'facultad' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="facultad_id">Facultad</Label>
              <Select
                name="facultad_id"
                value={Number(formData.facultad_id) as any}
                onValueChange={(value) =>
                  handleChange({
                    name: 'facultad_id',
                    value: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar facultad" />
                </SelectTrigger>
                <SelectContent>
                  {facultades.map((facultad) => (
                    <SelectItem key={facultad.id} value={facultad.id}>
                      {facultad.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrer_id">Carrera</Label>
              <Select
                name="carrer_id"
                value={Number(formData.carrer_id) as any}
                onValueChange={(value) =>
                  handleChange({
                    name: 'carrer_id',
                    value: value,
                  })
                }
                disabled={!formData.facultad_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar carrera" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCarreras.map((carrera) => (
                    <SelectItem key={carrera.id} value={carrera.id}>
                      {carrera.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>

          </>
        )}
        <div className="space-y-2">
          <Label htmlFor="carrer_id">Preparatoria</Label>
          <Select
            name="prepa_id"
            value={Number(formData.prepa_id) as any}
            onValueChange={(value) =>
              handleChange({
                name: 'prepa_id',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar preparatoria" />
            </SelectTrigger>
            <SelectContent>
              {prepas.map((prepa) => (
                <SelectItem key={prepa.id} value={prepa.id}>
                  {prepa.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="average">Promedio</Label>
          <Input
            id="average"
            name="average"
            type="number"
            value={formData.average}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attempts">Intentos</Label>
          <Select
            name="attempts"
            value={formData.attempts}
            onValueChange={(value) =>
              handleChange({
                name: 'attempts',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar número de intentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="NA">NA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="score">Puntaje</Label>
          <Input
            id="score"
            name="score"
            type="number"
            value={formData.score}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="health_conditions">Condiciones de salud</Label>
          <Input
            id="health_conditions"
            name="health_conditions"
            value={formData.health_conditions}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="how_found_out">¿Cómo se enteró de nosotros?</Label>
          <Select
            name="how_found_out"
            value={formData.how_found_out}
            onValueChange={(value) =>
              handleChange({
                name: 'how_found_out',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar medio de comunicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recomendado">Recomendado</SelectItem>
              <SelectItem value="ubicacion">Ubicación</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="youtube">Youtube</SelectItem>
              <SelectItem value="internet">Internet</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_communication">Medio de comunicación preferido</Label>
          <Select
            name="preferred_communication"
            value={formData.preferred_communication}
            onValueChange={(value) =>
              handleChange({
                name: 'preferred_communication',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar medio de comunicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Plantel">Plantel</SelectItem>
              <SelectItem value="Telefono">Teléfono</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="general_book">Libro general</Label>
          <Select
            name="general_book"
            value={formData.general_book}
            onValueChange={(value) =>
              handleChange({
                name: 'general_book',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar medio de comunicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No entregado">No entregado</SelectItem>
              <SelectItem value="En fisico">En fisico</SelectItem>
              <SelectItem value="En línea">En línea</SelectItem>
              <SelectItem value="En línea y en fisico">En línea y en fisico</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.type === 'facultad' && <div className="space-y-2">
          <Label htmlFor="module_book">Libro de módulo</Label>
          <Select
            name="module_book"
            value={formData.module_book}
            onValueChange={(value) =>
              handleChange({
                name: 'module_book',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar medio de comunicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No entregado">No entregado</SelectItem>
              <SelectItem value="En fisico">En fisico</SelectItem>
              <SelectItem value="En línea">En línea</SelectItem>
              <SelectItem value="En línea y en fisico">En línea y en fisico</SelectItem>
            </SelectContent>
          </Select>
        </div>}
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
