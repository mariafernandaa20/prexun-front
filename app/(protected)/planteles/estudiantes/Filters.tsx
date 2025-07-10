import React, { useState, useEffect } from 'react';
import SearchableSelect from '@/components/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Grupo, Period } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { syncStudentModules } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';



interface FiltersProps {
  setPeriodFilter: (value: string) => void;
  periodFilter: any;
  setAssignedPeriodFilter: (value: string) => void;
  assignedPeriodFilter: any;
  setGrupoFilter: (value: string | null) => void;
  setSemanaIntensivaFilter: (value: string | null) => void;
  setSearchName: (value: string) => void;
  setSearchDate: (value: string) => void;
  setSearchPhone: (value: string) => void;
  setSearchMatricula: (value: number | null) => void;
  children?: React.ReactNode;
}

const Filters: React.FC<FiltersProps> = ({
  setPeriodFilter,
  periodFilter,
  setAssignedPeriodFilter,
  assignedPeriodFilter,
  setGrupoFilter,
  setSemanaIntensivaFilter,
  setSearchName,
  setSearchDate,
  setSearchPhone,
  setSearchMatricula,
  children
}) => {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [matriculaInput, setMatriculaInput] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  const { periods, grupos, carreras, facultades, semanasIntensivas } = useAuthStore();


  const debouncedName = useDebounce(nameInput, 500);
  const debouncedDate = useDebounce(dateInput, 500);
  const debouncedPhone = useDebounce(phoneInput, 500);
  const debouncedMatricula = useDebounce(matriculaInput, 500);

  useEffect(() => {
    setSearchName(debouncedName);
  }, [debouncedName, setSearchName]);

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
      <div className="space-y-2">          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
        <Input
          placeholder="Buscar por nombre..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="w-full"
        />
        <SearchableSelect
          options={periods.map(period => ({ value: period.id, label: period.name }))}
          value={periodFilter}
          placeholder="Filtrar por periodo (Viejo)"
          onChange={setPeriodFilter}
          showAllOption={true}
          allOptionLabel="Todos"
        />
        <SearchableSelect
          options={periods.map(period => ({ value: period.id, label: period.name }))}
          value={assignedPeriodFilter}
          placeholder="Filtrar por periodo (Nuevo)"
          onChange={setAssignedPeriodFilter}
          showAllOption={true}
          allOptionLabel="Todos"
        />
        <SearchableSelect
          options={grupos.filter(grupo => !periodFilter || grupo.period_id.toString() === periodFilter.toString()).map(grupo => ({ value: grupo.id.toString(), label: grupo.name }))}
          value={undefined}
          placeholder="Filtrar por grupo"
          onChange={val => setGrupoFilter(val)}
          showAllOption={true}
          allOptionLabel="Todos"
        />
        <SearchableSelect
          options={semanasIntensivas.filter(semana => !periodFilter || semana.period_id.toString() === periodFilter.toString()).map(semana => ({ value: semana.id.toString(), label: semana.name }))}
          value={undefined}
          placeholder="Filtrar por semana intensiva"
          onChange={val => setSemanaIntensivaFilter(val)}
          showAllOption={true}
          allOptionLabel="Todos"
        />
        <>{children && children}</>
      </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAllFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">

            <Input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full"
            />
            <Input
              placeholder="Buscar por teléfono..."
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full"
            />
            <Input
              placeholder="Buscar por matricula..."
              value={matriculaInput}
              onChange={(e) => setMatriculaInput(e.target.value)}
              className="w-full"
              type="number"
            />
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  setIsSyncing(true);
                  await syncStudentModules();
                  toast({ title: 'Sincronización de módulos completada correctamente' });
                } catch (error: any) {
                  toast({
                    title: 'Error al sincronizar módulos',
                    description: error.response?.data?.message || 'Intente nuevamente',
                    variant: 'destructive',
                  });
                } finally {
                  setIsSyncing(false);
                }
              }}
              disabled={isSyncing}
              title='Sincronizar Módulos'
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Módulos'}
            </Button>
          </div>
        </div>

      </div>
      <div className="flex justify-start">
        <button
          onClick={() => setShowAllFilters(!showAllFilters)}
          className="flex items-center gap-1 text-sm px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-expanded={showAllFilters}
          aria-label={showAllFilters ? "Ocultar filtros adicionales" : "Mostrar filtros adicionales"}
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