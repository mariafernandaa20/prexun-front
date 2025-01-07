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
  const [formData, setFormData] = useState<Grupo>({
    name: '',
    type: '',
    plantel_id: 0,
    period_id: 0,
    capacity: 0,
    frequency: [],
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    if (grupo) {
      // Asegurarse de que frequency sea un array
      const frequency = Array.isArray(grupo.frequency) ? grupo.frequency : [];
      setFormData({
        ...grupo,
        frequency,
      });
    } else {
      // Resetear el formulario cuando se cierra
      setFormData({
        name: '',
        type: '',
        plantel_id: 0,
        period_id: 0,
        capacity: 0,
        frequency: [],
        start_time: '',
        end_time: '',
      });
    }
  }, [grupo, isOpen]); // Agregar isOpen como dependencia

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
    onSubmit({
      ...formData,
      start_time: formData.start_time,
      end_time: formData.end_time,
    });
    onClose();
  };

  const handlePeriodChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      period_id: parseInt(value),
    }));
  };

  const handleCampusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      plantel_id: parseInt(value),
    }));
  };

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[700px]`}>
        <DialogHeader>
          <DialogTitle>
            {grupo ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Grupo</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period_id">Periodo</Label>
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
                <Label htmlFor="plantel_id">Campus</Label>
                <Select
                  onValueChange={handleCampusChange}
                  value={formData.plantel_id.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id.toString()}>
                        {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
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
                <Label htmlFor="capacity">Capacidad</Label>
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
                <Label htmlFor="start_time">Hora de Inicio</Label>
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
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
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frecuencia</Label>
            <div className="flex flex-wrap gap-4">
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