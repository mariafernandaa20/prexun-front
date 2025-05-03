import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Grupo, Period } from '@/lib/types';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
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
    <div className="flex flex-col gap-4 w-full lg:w-auto">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Buscar por nombre..."
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="w-full lg:w-[200px]"
        />
        <Select
          onValueChange={(value) => setPeriodFilter(value)}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Filtrar por periodo" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.id} value={period.id}>
                {period.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) => setGrupoFilter(value === 'todos' ? null : value)}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Filtrar por grupo" />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <div className="relative">
                <Input
                  placeholder="Buscar grupo..."
                  value={grupoSearch}
                  onChange={(e) => setGrupoSearch(e.target.value)}
                  className="pl-8"
                />
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <SelectItem value="todos">Todos</SelectItem>
            {filteredGrupos.length > 0 ? (
              filteredGrupos.map((grupo, i) => (
                <SelectItem key={i} value={grupo.id.toString()}>{grupo.name}</SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-sm text-gray-500">No se encontraron grupos.</div>
            )}
          </SelectContent>
        </Select>
        <button
          onClick={() => setShowAllFilters(!showAllFilters)}
          className="whitespace-nowrap flex items-center gap-1"
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
        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          <Input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full lg:w-[200px]"
          />
          <Input
            placeholder="Buscar por teléfono..."
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            className="w-full lg:w-[200px]"
          />
          <Input
            placeholder="Buscar por matricula..."
            value={matriculaInput}
            onChange={(e) => setMatriculaInput(e.target.value)}
            className="w-full lg:w-[200px]"
            type="number"
          />
          {children}
        </div>
      )}
    </div>
  );
};

export default Filters;