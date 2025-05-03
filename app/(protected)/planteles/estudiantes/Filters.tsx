import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/multi-select';
import { Grupo, Period } from '@/lib/types';

interface FiltersProps {
  periods: Period[];
  grupos: Grupo[];
  visibleColumns: string[];
  setPeriodFilter: (value: string) => void;
  setGrupoFilter: (value: string | null) => void;
  setSearchName: (value: string) => void;
  setSearchDate: (value: string) => void;
  setSearchPhone: (value: string) => void;
  setSearchMatricula: (value: number | null) => void;
  handleColumnSelect: (selectedColumns: string[]) => void;
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

  return (
    <div className="flex flex-col gap-4 w-full lg:w-auto">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Buscar por nombre..."
          onChange={(e) => setSearchName(e.target.value)}
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
          onValueChange={(value) => setGrupoFilter(value)}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Filtrar por grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>Todos</SelectItem>
            {grupos.map((grupo, i) => (
              <SelectItem key={i} value={grupo.id.toString()}>{grupo.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={() => setShowAllFilters(!showAllFilters)}
          className="whitespace-nowrap"
        >
          Mostrar filtros
        </button>
      </div>
      {showAllFilters && (
        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          <Input
            type="date"
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full lg:w-[200px]"
          />
          <Input
            placeholder="Buscar por teléfono..."
            onChange={(e) => setSearchPhone(e.target.value)}
            className="w-full lg:w-[200px]"
          />
          <Input
            placeholder="Buscar por matricula..."
            onChange={(e) => setSearchMatricula(e.target.value ? Number(e.target.value) : null)}
            className="w-full lg:w-[200px]"
          />
            {children}
        </div>
      )}
    </div>
  );
};

export default Filters;