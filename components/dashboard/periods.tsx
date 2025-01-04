'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  createPeriod,
  deletePeriod,
  getPeriods,
  updatePeriod,
} from '@/lib/api';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Period {
  id: string;
  name: string;
  price: number;
  start_date: string;
  end_date: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  start_date?: string;
  end_date?: string;
}

export function Periods() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<Omit<Period, 'id'>>({
    name: '',
    start_date: '',
    end_date: '',
    price: 0,
  });

  // Validate form data
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
      isValid = false;
    }

    if (!formData.start_date) {
      errors.start_date = 'La fecha de inicio es requerida';
      isValid = false;
    }

    if (!formData.end_date) {
      errors.end_date = 'La fecha de fin es requerida';
      isValid = false;
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        errors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // Load periods
  const fetchPeriods = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPeriods();
      setPeriods(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Error al cargar los períodos. Por favor, intente nuevamente.');
      console.error('Error fetching periods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (currentPeriod) {
        await updatePeriod({
          ...formData,
          id: currentPeriod.id,
        });
      } else {
        await createPeriod(formData as Period);
      }

      setIsOpen(false);
      await fetchPeriods();
      setCurrentPeriod(null);
      setFormData({ name: '', start_date: '', end_date: '', price: 0 });
    } catch (err) {
      setError(
        currentPeriod
          ? 'Error al actualizar el período'
          : 'Error al crear el período'
      );
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete period
  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este período?')) {
      setIsLoading(true);
      setError(null);
      try {
        await deletePeriod(id);
        await fetchPeriods();
      } catch (err) {
        setError('Error al eliminar el período');
        console.error('Error deleting period:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Períodos</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setCurrentPeriod(null);
                  setFormData({
                    name: '',
                    start_date: '',
                    end_date: '',
                    price: 0,
                  });
                  setFormErrors({});
                  setError(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo Período
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentPeriod ? 'Editar Período' : 'Nuevo Período'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Nombre del periodo"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    className={formErrors.price ? 'border-red-500' : ''}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className={formErrors.start_date ? 'border-red-500' : ''}
                  />
                  {formErrors.start_date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.start_date}</p>
                  )}
                </div>
                <div>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className={formErrors.end_date ? 'border-red-500' : ''}
                  />
                  {formErrors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.end_date}</p>
                  )}
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {currentPeriod ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    currentPeriod ? 'Actualizar' : 'Crear'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>{period.name}</TableCell>
                  <TableCell>
                    {format(new Date(period.start_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(period.end_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{period.price}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCurrentPeriod(period);
                        setFormData({
                          name: period.name,
                          start_date: period.start_date,
                          end_date: period.end_date,
                          price: period.price,
                        });
                        setFormErrors({});
                        setError(null);
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDelete(period.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}