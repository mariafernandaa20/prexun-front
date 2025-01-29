'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/multi-select';
import { Promocion } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
interface PromocionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promocion: Promocion) => void;
  promocion?: Promocion;
}

const TIPOS_PROMOCION = ['Contado', 'Parcialidad'];

const GRUPOS_DISPONIBLES = [
  'COF1',
  'COF2',
  'COF3',
  'COF4',
  'COF5',
  'COF6',
  'COF7',
  'COF8',
  'COF9',
  'COF10',
];

export default function PromocionModal({
  isOpen,
  onClose,
  onSubmit,
  promocion,
}: PromocionModalProps) {
  const [formData, setFormData] = useState<Promocion>({
    name: '',
    type: '',
    regular_cost: 0,
    cost: 0,
    limit_date: '',
    groups: [],
    active: true,
    pagos: [],
  });

  useEffect(() => {
    if (promocion) {
      setFormData({
        ...promocion,
        limit_date: promocion.limit_date.split('T')[0],
      });
    }
  }, [promocion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const updatePago = (index: number, field: 'amount' | 'date' | 'description', value: string | number) => {
    const newPagos = [...formData.pagos];
    if (!newPagos[index]) {
      newPagos[index] = { amount: 0, date: '', description: '' };
    }
    newPagos[index] = {
      ...newPagos[index],
      [field]: field === 'amount' ? parseFloat(value as string) : value,
    };
    setFormData({ ...formData, pagos: newPagos });
  };

  const agregarPago = () => {
    const newPagos = [...formData.pagos, { amount: 0, date: '', description: '' }];
    setFormData({ ...formData, pagos: newPagos });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${formData.type == 'Parcialidad' ? 'sm:max-w-[1000px]' : 'sm:max-w-[700px]'}`}
      >
        <DialogHeader>
          <DialogTitle>
            {promocion ? 'Editar Promoción' : 'Nueva Promoción'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className={`grid gap-4 ${formData.type === 'Parcialidad' ? 'grid-cols-3' : 'grid-cols-2'
            }`}
        >
          <div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex items-top space-x-2 py-4">
              <Label htmlFor="activa">Activa</Label>
              <Checkbox
                id="activa"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked as boolean })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costo_regular">Valor Regular</Label>
              <Input
                id="costo_regular"
                type="number"
                step="100"
                value={formData.regular_cost || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    regular_cost: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costo_neto">Valor Promocional</Label>
              <Input
                id="costo_neto"
                type="number"
                step="100"
                value={formData.cost || 0}
                onChange={(e) =>
                  setFormData({ ...formData, cost: parseFloat(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PROMOCION.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {formData.type === 'Parcialidad' && (
            <div>
              <div className="space-y-2">
                <Label htmlFor="inscripcion">Inscripción</Label>
                <Input
                  id="inscripcion"
                  type="number"
                  step="100"
                  value={formData.pagos[0]?.amount || ''}
                  onChange={(e) => updatePago(0, 'amount', e.target.value)}
                  required
                />
                <Label htmlFor='description'>Descripción</Label>
                <Textarea
                  id='description'
                  value={formData.pagos[0]?.description || ''}
                  onChange={(e) => updatePago(0, 'description', e.target.value)}
                  required
                />
              </div>
              {formData.pagos.slice(1).map((_, index) => (
                <div key={index + 1} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`pago_${index + 1}`}>Pago {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newPagos = [...formData.pagos];
                        newPagos.splice(index + 1, 1);
                        setFormData({ ...formData, pagos: newPagos });
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </Button>


                  </div>
                  <div>
                    <Label htmlFor='description'>Descripción</Label>
                    <Textarea
                      id='description'
                      value={formData.pagos[index + 1]?.description || ''}
                      onChange={(e) => updatePago(index + 1, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    id={`pago_${index + 1}`}
                    type="number"
                    step="100"
                    value={formData.pagos[index + 1]?.amount || ''}
                    onChange={(e) => updatePago(index + 1, 'amount', e.target.value)}
                    required
                  />
                  <Input
                    id={`pago_${index + 1}_date`}
                    type="date"
                    value={formData.pagos[index + 1]?.date || ''}
                    onChange={(e) => updatePago(index + 1, 'date', e.target.value)}
                    required
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={agregarPago}
                className="mt-4"
              >
                Agregar Pago
              </Button>
            </div>
          )}
          <div>
            <div className="space-y-2">
              <Label htmlFor="fecha_limite">Fecha Límite de Aplicación</Label>
              <Input
                id="fecha_limite"
                type="date"
                value={formData.limit_date}
                onChange={(e) =>
                  setFormData({ ...formData, limit_date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Grupos Aplicables</Label>
              <MultiSelect
                options={GRUPOS_DISPONIBLES.map((grupo) => ({
                  label: grupo,
                  value: grupo,
                }))}
                selectedValues={formData.groups}
                onSelectedChange={(selected) =>
                  setFormData({ ...formData, groups: selected })
                }
                title="Grupos"
                placeholder="Selecciona los grupos"
                searchPlaceholder="Buscar grupo..."
                emptyMessage="No se encontraron grupos"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {promocion ? 'Guardar Cambios' : 'Crear Promoción'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
