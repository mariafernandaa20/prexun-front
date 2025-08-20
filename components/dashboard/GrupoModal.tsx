'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Campus, Grupo, Period } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MultiSelect } from '../multi-select';
import { getCampuses } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface GrupoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (grupo: Grupo) => void;
  grupo?: Grupo;
  periods: Period[];
  campuses: Campus[];
}

export default function GrupoModal({
  isOpen,
  onClose,
  onSubmit,
  grupo,
  periods,
  campuses,
}: GrupoModalProps) {
  const [formData, setFormData] = useState<Grupo & { campuses: string[] }>({
    name: '',
    type: '',
    plantel_id: 0,
    period_id: 0,
    capacity: 0,
    frequency: [],
    start_time: null,
    end_time: null,
    start_date: null,
    end_date: null,
    campuses: [],
    moodle_id: null,
  });

  useEffect(() => {
    if (grupo) {
      const frequency = Array.isArray(grupo.frequency) ? grupo.frequency : [];
      const campusIds = grupo.campuses
        ? grupo.campuses
            .map((campus) =>
              typeof campus === 'string' ? campus : campus.id?.toString() || ''
            )
            .filter((id) => id !== '')
        : [];

      setFormData({
        ...grupo,
        frequency,
        campuses: campusIds,
      });
    } else {
      setFormData({
        name: '',
        type: '',
        plantel_id: 0,
        period_id: 0,
        capacity: 0,
        frequency: [],
        start_time: null,
        end_time: null,
        start_date: null,
        end_date: null,
        campuses: [],
        moodle_id: null,
      });
    }
  }, [grupo, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'start_time' || name === 'end_time') {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (value && !timeRegex.test(value)) {
        return;
      }
    }

    if (name === 'capacity') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleFrequencyChange = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      frequency: prev.frequency.includes(day)
        ? prev.frequency.filter((d) => d !== day)
        : [...prev.frequency, day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type || formData.capacity <= 0) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }
    }
    const formatTime = (time: string) => {
      if (!time) return null;
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    };

    onSubmit({
      ...formData,
      start_time: formatTime(formData.start_time),
      end_time: formatTime(formData.end_time),
    });
    onClose();
  };

  const handlePeriodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      period_id: parseInt(value),
    }));
  };

  const handleCampusChange = (selectedCampuses: string[]) => {
    setFormData((prev) => ({
      ...prev,
      campuses: selectedCampuses,
    }));
  };

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent className={`sm:max-w-[700px]`}>
        <DialogHeader>
          <DialogTitle>
            {grupo ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
          </DialogTitle>
        </DialogHeader>
        <div className="text-neutral-700 dark:text-neutral-300">
          <span className="text-red-500">*</span> Campos requeridos
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="space-y-2">
                <Label htmlFor="period_id">
                  <span className="text-red-500">*</span> Periodo
                </Label>
                <Select
                  onValueChange={handlePeriodChange}
                  value={formData.period_id.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id.toString()}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  <span className="text-red-500">*</span> Nombre del Grupo
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label>
                  <span className="text-red-500">*</span> Planteles
                </Label>
                <MultiSelect
                  options={campuses.map((campus) => ({
                    value: campus.id.toString(),
                    label: campus.name,
                  }))}
                  selectedValues={formData?.campuses || []}
                  onSelectedChange={handleCampusChange}
                  title="Planteles"
                  placeholder="Seleccionar planteles"
                  searchPlaceholder="Buscar plantel..."
                  emptyMessage="No se encontraron planteles"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">
                  <span className="text-red-500">*</span> Tipo
                </Label>
                <Select onValueChange={handleTypeChange} value={formData.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                    <SelectItem value="Hibrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <Label htmlFor="capacity">
                  <span className="text-red-500">*</span> Capacidad
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha de Inicio</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de Fin</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Hora de Inicio</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Hora de Fin</Label>
                <Input
                  id="end_time"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frecuencia</Label>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={formData.frequency.includes(day)}
                    onCheckedChange={() => handleFrequencyChange(day)}
                  />
                  <Label htmlFor={day}>{day}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {grupo ? 'Guardar Cambios' : 'Crear Grupo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
