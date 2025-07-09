'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, ExternalLink } from 'lucide-react';
import { Campus, Cohort, Municipio, Carrera, Period, Student, Prepa, Facultad, Promocion, Grupo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addContactToGoogle } from '@/lib/googleContacts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { checkStudentExists } from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import SearchableSelect from '@/components/SearchableSelect';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import StudentPeriod from './student-period';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (data: Student) => void;
  onCancel: () => void;
  municipios: Municipio[];
  prepas: Prepa[];
  promos: Promocion[];
}

export function StudentForm({
  student,
  onSubmit,
  onCancel,
  municipios,
  prepas,
  promos,
}: StudentFormProps) {
  const { toast } = useToast();
  const { activeCampus } = useActiveCampusStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [existingStudent, setExistingStudent] = useState<any>(null);
  const [showExistingStudentAlert, setShowExistingStudentAlert] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { periods, grupos, carreras, facultades, semanasIntensivas, campuses } = useAuthStore();

  const [formData, setFormData] = useState<Student>({
    id: student?.id || null,
    period_id: student?.period_id || null,
    campus_id: activeCampus?.id || null,
    promo_id: null,
    grupo_id: student?.grupo_id || null,
    firstname: student?.firstname || '',
    lastname: student?.lastname || '',
    email: student?.email || '',
    phone: student?.phone || '',
    prepa_id: student?.prepa_id || '',
    municipio_id: student?.municipio_id || '',
    facultad_id: student?.facultad_id || '',
    carrer_id: student?.carrer_id || null,
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
    general_book: student?.general_book || 'No entregado',
    module_book: student?.module_book || 'No entregado',
    semana_intensiva_id: student?.semana_intensiva_id || null,
  });

  // Debounce email to avoid excessive API calls
  const debouncedEmail = useDebounce(formData.email, 500);

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

  // Check for existing student when email changes (with debounce)
  useEffect(() => {
    if (!student?.id && debouncedEmail) {
      checkIfStudentExists(debouncedEmail);
    } else if (!debouncedEmail) {
      setShowExistingStudentAlert(false);
      setExistingStudent(null);
    }
  }, [debouncedEmail, student?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstname || !formData.lastname || !formData.phone) {
      toast({
        title: 'Error de validación',
        description: 'Por favor complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Error de validación',
        description: 'Por favor ingrese un correo electrónico válido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingButton(true);

    try {
      await onSubmit(formData);

      const accessToken = useAuthStore(state => state.accessToken);

      if (accessToken) {
        try {
          const grupo = grupos.find(g => g.id === Number(formData.grupo_id));
          const studentName = `${grupo?.name || ''} ${formData.lastname} ${formData.firstname}`.trim();

          await addContactToGoogle(accessToken, {
            name: studentName,
            email: formData.email,
            phone: formData.phone,
            secondaryPhone: formData.tutor_phone || undefined
          });

          toast({
            title: 'Estudiante sincronizado con Google Contacts',
            description: `${studentName} fue añadido a tus contactos`,
          });
        } catch (err) {
          toast({
            title: 'Error al sincronizar con Google Contacts',
            description: 'El estudiante fue guardado pero no se pudo añadir a tus contactos',
            variant: 'warning',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error.message || 'Error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingButton(false);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => {
    const { name, value } = 'target' in e ? e.target : e;

    if (name === 'facultad_id') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        carrer_id: null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Function to check if student exists when email changes
  const checkIfStudentExists = async (email: string) => {
    if (!email || email === student?.email) {
      setShowExistingStudentAlert(false);
      setExistingStudent(null);
      return;
    }

    // Validate email format first
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) return;

    try {
      setIsCheckingEmail(true);
      const result = await checkStudentExists(email);

      if (result.exists) {
        setExistingStudent(result.student);
        setShowExistingStudentAlert(true);
      } else {
        setShowExistingStudentAlert(false);
        setExistingStudent(null);
      }
    } catch (error) {
      console.error('Error checking if student exists:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

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

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  const filteredCarreras = carreras.filter(
    (carrera) => carrera.facultad_id === (Number(formData.facultad_id) as any)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col max-h-[80vh] w-full overflow-y-auto">

      {/* Alert for existing student */}
      {showExistingStudentAlert && existingStudent && (
        <Alert className="border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">
            ¡Estudiante existente encontrado!
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-3">
              Ya existe un estudiante con el email <strong>{existingStudent.email}</strong>:
            </p>
            <div className="bg-white p-3 rounded border border-amber-200 mb-3">
              <p><strong>Nombre:</strong> {existingStudent.firstname} {existingStudent.lastname}</p>
              <p><strong>ID:</strong> {existingStudent.id}</p>
              <p><strong>Teléfono:</strong> {existingStudent.phone || 'No registrado'}</p>
              <p><strong>Campus:</strong> {existingStudent.campus?.name || 'No asignado'}</p>
              <p><strong>Estado:</strong> {existingStudent.status}</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => router.push(`/planteles/estudiantes/${existingStudent.id}`)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <User className="h-4 w-4 mr-1" />
                Ver estudiante existente
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowExistingStudentAlert(false)}
                className="border-amber-500 text-amber-700 hover:bg-amber-100"
              >
                Continuar de todos modos
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-2 mx-auto overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="email">
            Correo electrónico
            {isCheckingEmail && (
              <span className="ml-2 text-xs text-gray-500">
                (Verificando...)
              </span>
            )}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="correo@ejemplo.com"
            disabled={!!student?.id}
          />
          {!student?.id && (
            <p className="text-xs text-gray-500 mt-1">
              Se verificará automáticamente si ya existe un estudiante con este email
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="period_id">Periodo</Label>
          <Select
            name="period_id"
            value={formData.period_id?.toString() || 'none'}
            onValueChange={(value) =>
              handleChange({
                name: 'period_id',
                value: value === 'none' ? null : value,
              })
            }
            disabled={!!student?.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el periodo (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin período</SelectItem>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grupo_id">Grupo</Label>
          <SearchableSelect
            disabled={!!student?.id}
            options={grupos.map(grupo => ({ value: (grupo.id).toString(), label: grupo.name }))}
            value={formData.grupo_id?.toString() || ''}
            placeholder="Grupo (opcional)"
            onChange={(value) => handleChange({ name: 'grupo_id', value: value || null })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="semana_intensiva_id">Grupo de Semanas Intensivas</Label>
          <Select
            name="semana_intensiva_id"
            value={formData?.semana_intensiva_id ? formData?.semana_intensiva_id.toString() : 'none'}
            onValueChange={(value) => handleChange({ name: 'semana_intensiva_id', value: value === 'none' ? null : value })}
            disabled={!!student?.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona la semana intensiva (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin semana intensiva</SelectItem>
              {semanasIntensivas && semanasIntensivas.map((semana) => (
                <SelectItem key={semana.id} value={semana.id.toString()}>
                  {semana.name} - {semana.students_count}/{semana.capacity}
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
            disabled={!!student?.id}
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
            disabled={!!student?.id}
            placeholder="Apellido del estudiante"
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
            disabled={!!student?.id}
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
          <Label htmlFor="prepa_id">Preparatoria</Label>
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

        <div className="space-y-2">
          <Label htmlFor="status">Campus</Label>
          <Select
            name="campus_id"
            value={formData.campus_id.toString()}
            disabled={!!student?.id}
            onValueChange={(value) =>
              handleChange({
                name: 'campus_id',
                value: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el estatus" />
            </SelectTrigger>
            <SelectContent>
              {
                campuses.map((campus) => <SelectItem value={(campus.id).toString()}>{campus.name}</SelectItem>)
              }
            </SelectContent>
          </Select>
        </div>
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
      </div>

      {student?.id && <StudentPeriod student={student} />}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoadingButton}>{isLoadingButton ? 'Guardando...' : 'Guardar'}</Button>
      </div>
    </form>
  );
}