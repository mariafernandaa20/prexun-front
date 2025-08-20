'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
}: DatePickerWithRangeProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd/MM/yyyy', { locale: es })} -{' '}
                  {format(date.to, 'dd/MM/yyyy', { locale: es })}
                </>
              ) : (
                format(date.from, 'dd/MM/yyyy', { locale: es })
              )
            ) : (
              <span>Selecciona un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={es}
            // Puedes agregar más configuraciones aquí
            disabled={{ after: new Date() }} // Deshabilita fechas futuras
          />
          <div className="p-3 border-t border-border">
            {/* Botones de acceso rápido */}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date();
                  onDateChange({
                    from: today,
                    to: today,
                  });
                }}
              >
                Hoy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date();
                  const weekAgo = addDays(today, -7);
                  onDateChange({
                    from: weekAgo,
                    to: today,
                  });
                }}
              >
                Última semana
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1,
                    today.getDate()
                  );
                  onDateChange({
                    from: monthAgo,
                    to: today,
                  });
                }}
              >
                Último mes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const today = new Date();
                  const yearAgo = new Date(
                    today.getFullYear() - 1,
                    today.getMonth(),
                    today.getDate()
                  );
                  onDateChange({
                    from: yearAgo,
                    to: today,
                  });
                }}
              >
                Último año
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
