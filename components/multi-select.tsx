// components/MultiSelect.tsx
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { X, ChevronsUpDown, Check } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selectedValues: string[]
  onSelectedChange: (selected: string[]) => void
  title: string
}

export function MultiSelect({ 
  options, 
  selectedValues, 
  onSelectedChange,
  title
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (optionValue: string) => {
    const newSelectedValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(value => value !== optionValue)
      : [...selectedValues, optionValue]
    
    onSelectedChange(newSelectedValues)
  }

  const handleRemove = (optionValue: string) => {
    const newSelectedValues = selectedValues.filter(value => value !== optionValue)
    onSelectedChange(newSelectedValues)
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedValues.map(selectedValue => {
          const option = options.find(opt => opt.value === selectedValue)
          return option ? (
            <Badge key={option.value} variant="secondary" className="flex items-center">
              {option.label}
              <X 
                className="ml-2 h-4 w-4 cursor-pointer" 
                onClick={() => handleRemove(option.value)} 
              />
            </Badge>
          ) : null
        })}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {title}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Buscar plantel..." />
            <CommandList>
              <CommandEmpty>No se encontraron planteles</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}