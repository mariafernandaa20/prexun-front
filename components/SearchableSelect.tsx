import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | null;
  placeholder: string;
  onChange: (value: string | null) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  placeholder,
  onChange,
  searchPlaceholder = 'Buscar...',
  showAllOption = false,
  allOptionLabel = 'Todos',
  disabled = false,
}) => {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  return (
    <Select
      value={value ?? undefined}
      onValueChange={val => onChange(val === 'todos' ? null : val)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <div className="relative">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        {showAllOption && (
          <SelectItem value="todos">{allOptionLabel}</SelectItem>
        )}
        {filteredOptions.length > 0 ? (
          filteredOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))
        ) : (
          <div className="p-2 text-center text-sm text-gray-500">No se encontraron opciones.</div>
        )}
      </SelectContent>
    </Select>
  );
};

export default SearchableSelect;