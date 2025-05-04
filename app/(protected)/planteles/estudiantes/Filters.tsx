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
  const [grupoSearch, setGrupoSearch] = useState('');

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

  // Filter groups based on search
  const filteredGrupos = grupos.filter(grupo =>
    grupo.name.toLowerCase().includes(grupoSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
        <Input
          placeholder="Buscar por nombre..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="w-full sm:w-[180px] md:w-[200px] xl:w-[250px]"
        />
        <SearchableSelect
          options={periods.map(period => ({ value: period.id, label: period.name }))}
          value={undefined}
          placeholder="Filtrar por periodo"
          onChange={setPeriodFilter}
          searchable={false}
        />
        <SearchableSelect
          options={grupos.map(grupo => ({ value: grupo.id.toString(), label: grupo.name }))}
          value={undefined}
          placeholder="Filtrar por grupo"
          onChange={val => setGrupoFilter(val)}
          searchable={true}
          showAllOption={true}
          allOptionLabel="Todos"
        />
        <button
          onClick={() => setShowAllFilters(!showAllFilters)}
          className="whitespace-nowrap flex items-center gap-1 text-sm md:text-base px-3 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {showAllFilters ? (
            <><ChevronUp className="h-4 w-4" /> Ocultar</>
          ) : (
            <><ChevronDown className="h-4 w-4" /> Mostrar</>
          )}
           más filtros
        </button>
      </div>
      {showAllFilters && (
        <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap gap-2 sm:gap-3 mt-1">
          <Input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full sm:w-[180px] md:w-[200px] xl:w-[250px]"
          />
          <Input
            placeholder="Buscar por teléfono..."
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className="w-full sm:w-[180px] md:w-[200px] xl:w-[250px]"
          />
          <Input
            placeholder="Buscar por matricula..."
            value={matriculaInput}
            onChange={(e) => setMatriculaInput(e.target.value)}
            className="w-full sm:w-[180px] md:w-[200px] xl:w-[250px]"
            type="number"
          />
          <div className="w-full md:w-auto mt-2 md:mt-0">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;