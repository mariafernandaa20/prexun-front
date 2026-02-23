import React, { useState, useEffect } from 'react';
import SearchableSelect from '@/components/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Grupo, Period } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { syncStudentModules } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import { tagsService, Tag } from '@/app/services/tags';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { MultiSelect } from '@/components/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersProps {
  setBookDeliveryTypeFilter?: (value: string | null) => void;
  bookDeliveryTypeFilter?: string | null;
  setBookDeliveredFilter?: (value: string | null) => void;
  bookDeliveredFilter?: string | null;
  setPeriodFilter: (value: string) => void;
  periodFilter: any;
  setAssignedPeriodFilter: (value: string) => void;
  assignedPeriodFilter: any;
  setGrupoFilter: (value: string | null) => void;
  setSemanaIntensivaFilter: (value: string | null) => void;
  setCarreraFilter?: (value: string | null) => void;
  carreraFilter?: string | null;
  setFacultadFilter?: (value: string | null) => void;
  facultadFilter?: string | null;
  setModuloFilter?: (value: string | null) => void;
  moduloFilter?: string | null;
  setSearchFirstname: (value: string) => void;
  setSearchLastname: (value: string) => void;
  setSearchEmail: (value: string) => void;
  setSearchDate: (value: string) => void;
  setSearchPhone: (value: string) => void;
  setSearchMatricula: (value: number | null) => void;
  assignedGrupoFilter: string[];
  setAssignedGrupoFilter: (value: string[]) => void;
  children?: React.ReactNode;
  setTagFilter?: (value: string | null) => void;
  grupoFilter: string | null;
  tagFilter?: string | null;
  setBookModulosFilter?: (value: string | null) => void;
  bookModulosFilter?: string | null;
  setBookGeneralFilter?: (value: string | null) => void;
  bookGeneralFilter?: string | null;
}

const Filters: React.FC<FiltersProps> = ({
  setPeriodFilter,

  periodFilter,
  setAssignedPeriodFilter,
  assignedPeriodFilter,
  setGrupoFilter,
  setSemanaIntensivaFilter,
  setCarreraFilter,
  carreraFilter,

  setFacultadFilter,
  facultadFilter,
  setModuloFilter,
  moduloFilter,
  setSearchFirstname,
  setSearchLastname,
  setSearchEmail,
  setSearchDate,
  setSearchPhone,
  setSearchMatricula,
  assignedGrupoFilter,
  setAssignedGrupoFilter,
  setBookDeliveryTypeFilter,
  bookDeliveryTypeFilter,
  setBookDeliveredFilter,
  bookDeliveredFilter,
  children,
  setTagFilter,
  tagFilter,
  grupoFilter,
  setBookModulosFilter,
  bookModulosFilter,
  setBookGeneralFilter,
  bookGeneralFilter,
}) => {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [firstnameInput, setFirstnameInput] = useState('');
  const [bookDelivered, setBookDelivered] = useState<string | null>(null);
  const [bookModulos, setBookModulos] = useState<string | null>(null);
  const [bookGeneral, setBookGeneral] = useState<string | null>(null);

  // Sincroniza el filtro con el estado externo
  useEffect(() => {
    if (setBookModulosFilter) {
      setBookModulosFilter(bookModulos || null);
    }
  }, [bookModulos, setBookModulosFilter]);

  useEffect(() => {
    if (setBookGeneralFilter) {
      setBookGeneralFilter(bookGeneral || null);
    }
  }, [bookGeneral, setBookGeneralFilter]);
  useEffect(() => {
    if (setBookDeliveredFilter) {
      setBookDeliveredFilter(bookDelivered || null);
    }
  }, [bookDelivered, setBookDeliveredFilter]);
  const [lastnameInput, setLastnameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [matriculaInput, setMatriculaInput] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  const { periods, grupos, carreras, facultades, modulos, semanasIntensivas } =
    useAuthStore();

  const debouncedFirstname = useDebounce(firstnameInput, 500);
  const debouncedLastname = useDebounce(lastnameInput, 500);
  const debouncedEmail = useDebounce(emailInput, 500);
  const debouncedDate = useDebounce(dateInput, 500);
  const debouncedPhone = useDebounce(phoneInput, 500);
  const debouncedMatricula = useDebounce(matriculaInput, 500);
  const [tags, setTags] = useState<Tag[]>([]);
  const { activeCampus } = useActiveCampusStore();

  useEffect(() => {
    const fetchTags = async () => {
      if (!activeCampus?.id) return;
      try {
        const data = await tagsService.getTags(activeCampus.id);
        setTags(data);
      } catch (error) {
        console.error('Error fetching tags', error);
      }
    };
    fetchTags();
  }, [activeCampus?.id]);


  useEffect(() => {
    setSearchFirstname(debouncedFirstname);
  }, [debouncedFirstname, setSearchFirstname]);

  useEffect(() => {
    setSearchLastname(debouncedLastname);
  }, [debouncedLastname, setSearchLastname]);

  useEffect(() => {
    setSearchEmail(debouncedEmail);
  }, [debouncedEmail, setSearchEmail]);

  useEffect(() => {
    setSearchDate(debouncedDate);
  }, [debouncedDate, setSearchDate]);

  useEffect(() => {
    setSearchPhone(debouncedPhone);
  }, [debouncedPhone, setSearchPhone]);

  useEffect(() => {
    setSearchMatricula(debouncedMatricula ? Number(debouncedMatricula) : null);
  }, [debouncedMatricula, setSearchMatricula]);

  return (
    <div className="flex flex-col gap-2 w-full max-w-[1/2]">
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 items-end">
          <div className="flex flex-col gap-1">
            <span className="text-sm ml-1 dark:text-white">Apellido</span>
            <Input
              placeholder="Buscar por apellido..."
              value={lastnameInput}
              onChange={(e) => setLastnameInput(e.target.value)}
              className="w-full text-gray-500 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-400/60"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm ml-1 dark:text-white">Etiquetas</span>
            <SearchableSelect
              options={[...tags]
                .sort((a, b) => {
                  if (a.is_favorite && !b.is_favorite) return -1;
                  if (!a.is_favorite && b.is_favorite) return 1;
                  return a.name.localeCompare(b.name);
                })
                .map((tag) => ({
                  value: tag.id?.toString() || '',
                  label: `${tag.is_favorite ? '⭐ ' : ''}${tag.name}`,
                }))}
              value={tagFilter}
              placeholder="Etiqueta"
              onChange={(val) => setTagFilter?.(val)}
              showAllOption={true}
              allOptionLabel="Etiquetas"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm ml-1 dark:text-white">Correo</span>
            <Input
              placeholder="Buscar por correo..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full text-gray-500 placeholder:text-gray-500 dark:text-gray-400 dark:placeholder:text-gray-400/60"
              type="email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm ml-1 dark:text-white">Libro General</span>
            <SearchableSelect
              options={[
                { value: 'no entregado', label: 'No entregado' },
                { value: 'paqueteria', label: 'Paquetería' },
                { value: 'en fisico', label: 'En físico' },
                { value: 'digital', label: 'Digital' },
              ]}
              value={bookGeneral}
              placeholder="Libro General"
              onChange={(val) => setBookGeneral(val)}
              showAllOption={true}
              allOptionLabel="Libro General"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm ml-1 dark:text-white">Libro Módulos</span>
            <SearchableSelect
              options={[

                { value: 'no entregado', label: 'No entregado' },
                { value: 'paqueteria', label: 'Paquetería' },
                { value: 'en fisico', label: 'En físico' },
                { value: 'digital', label: 'Digital' },
              ]}
              value={bookModulos}
              placeholder="Libro Módulos"
              onChange={(val) => setBookModulos(val)}
              showAllOption={true}
              allOptionLabel="Libro Módulos"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm ml-1 dark:text-white">Periodo</span>
            <SearchableSelect
              options={periods.map((period) => ({
                value: period.id,
                label: period.name,
              }))}
              value={assignedPeriodFilter}
              placeholder="Periodo (Nuevo)"
              onChange={setAssignedPeriodFilter}
              showAllOption={true}
              allOptionLabel="Todos"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm ml-1 dark:text-white">Grupos</span>
            <MultiSelect
              className="w-full"
              options={grupos
                .filter(
                  (grupo) =>
                    !assignedPeriodFilter ||
                    grupo.period_id.toString() === assignedPeriodFilter.toString()
                )
                .map((grupo) => ({
                  value: grupo.id.toString(),
                  label: grupo.name,
                }))}
              selectedValues={assignedGrupoFilter}
              onSelectedChange={(val) => setAssignedGrupoFilter(val)}
              placeholder="Seleccionar grupos"
              title="Grupos"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm ml-1 dark:text-white">Semana intensiva</span>
            <SearchableSelect
              options={semanasIntensivas
                .filter(
                  (semana) =>
                    !periodFilter ||
                    semana.period_id.toString() === periodFilter.toString()
                )
                .map((semana) => ({
                  value: semana.id.toString(),
                  label: semana.name,
                }))}
              value={undefined}
              placeholder="Semana intensiva"
              onChange={(val) => setSemanaIntensivaFilter(val)}
              showAllOption={true}
              allOptionLabel="Todos"
            />
          </div>

          <>{children && children}</>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${showAllFilters ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 py-2">
            <div className="flex flex-col gap-1">
              <span className="text-sm ml-1 dark:text-white">Nombre</span>
              <Input
                placeholder="Nombre..."
                value={firstnameInput}
                onChange={(e) => setFirstnameInput(e.target.value)}
                className="w-full text-gray-500 dark:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm ml-1 dark:text-white">
                Fecha de inscripción
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-between text-left h-10 px-3',
                      !dateInput && 'text-muted-foreground'
                    )}
                  >
                    {dateInput ? (
                      format(new Date(dateInput + 'T00:00:00'), 'PPP', {
                        locale: es,
                      })
                    ) : (
                      <span>dd/mm/aaaa</span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      dateInput ? new Date(dateInput + 'T00:00:00') : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setDateInput(format(date, 'yyyy-MM-dd'));
                      } else {
                        setDateInput('');
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm ml-1 dark:text-white">Teléfono</span>
              <Input
                placeholder="Teléfono..."
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full text-gray-500 dark:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm ml-1 dark:text-white">Matrícula</span>
              <Input
                placeholder="Matrícula..."
                value={matriculaInput}
                onChange={(e) => setMatriculaInput(e.target.value)}
                className="w-full text-gray-500 dark:text-gray-400"
                type="number"
              />
            </div>



            <div className="flex flex-col gap-1">
              <span className="text-sm ml-1 dark:text-white">Carrera</span>
              <SearchableSelect
                options={[...carreras]
                  .sort((a, b) => (a.orden ?? 999999) - (b.orden ?? 999999))
                  .map((carrera) => ({
                    value: carrera.id?.toString() || '',
                    label: carrera.name,
                  }))}
                value={carreraFilter}
                placeholder="Carrera"
                onChange={(val) => setCarreraFilter?.(val)}
                showAllOption={true}
                allOptionLabel="Todas"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm ml-1 dark:text-white">Facultad</span>
              <SearchableSelect
                options={facultades.map((facultad) => ({
                  value: facultad.id?.toString() || '',
                  label: facultad.name,
                }))}
                value={facultadFilter}
                placeholder="Facultad"
                onChange={(val) => setFacultadFilter?.(val)}
                showAllOption={true}
                allOptionLabel="Todas"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm ml-1 dark:text-white">Módulo</span>
              <SearchableSelect
                options={modulos.map((modulo) => ({
                  value: modulo.id?.toString() || '',
                  label: modulo.name || '',
                }))}
                value={undefined}
                placeholder="Módulo"
                onChange={(val) => setModuloFilter?.(val)}
                showAllOption={true}
                allOptionLabel="Todos"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-start">
        <button
          onClick={() => setShowAllFilters(!showAllFilters)}
          className="flex items-center gap-1 text-sm px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-expanded={showAllFilters}
          aria-label={
            showAllFilters
              ? 'Ocultar filtros adicionales'
              : 'Mostrar filtros adicionales'
          }
        >
          {showAllFilters ? (
            <>
              <span className="hidden sm:inline">Menos filtros</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Más filtros</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Filters;
