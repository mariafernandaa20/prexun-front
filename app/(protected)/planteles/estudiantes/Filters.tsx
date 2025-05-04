import React, { useState, useEffect } from 'react';
import SearchableSelect from '@/components/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Grupo, Period } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';



interface FiltersProps {
  periods: Period[];
  grupos: Grupo[];
  setPeriodFilter: (value: string) => void;
  setGrupoFilter: (value: string | null) => void;
  setSearchName: (value: string) => void;
  setSearchDate: (value: string) => void;
  setSearchPhone: (value: string) => void;
  setSearchMatricula: (value: number | null) => void;
  children?: React.ReactNode;
}

const Filters: React.FC<FiltersProps> = ({
  periods,
  grupos,
  setPeriodFilter,
  setGrupoFilter,
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
    <div className="flex flex-col gap-2 w-full max-w-[800px]">
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Input
            placeholder="Buscar por nombre..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full"
          />
          <SearchableSelect
            options={periods.map(period => ({ value: period.id, label: period.name }))}
            value={undefined}
            placeholder="Filtrar por periodo"
            onChange={setPeriodFilter}
          />
          <SearchableSelect
            options={grupos.map(grupo => ({ value: grupo.id.toString(), label: grupo.name }))}
            value={undefined}
            placeholder="Filtrar por grupo"
            onChange={val => setGrupoFilter(val)}
            showAllOption={true}
            allOptionLabel="Todos"
          />
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAllFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 transform transition-transform duration-300 ease-in-out">
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
          </div>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAllFilters && children ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {children && (
            <div className="flex justify-end mt-2">
              {children}
            </div>
          )}
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