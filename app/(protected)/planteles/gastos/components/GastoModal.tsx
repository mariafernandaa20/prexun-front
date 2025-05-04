'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Gasto } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface GastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasto?: Gasto | null;
  onSubmit: (data: Gasto) => Promise<void>;
}

export function GastoModal({
  isOpen,
  onClose,
  gasto,
  onSubmit,
}: GastoModalProps) {
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);
  const users = useAuthStore((state) => state.users);
  const user = useAuthStore((state) => state.user);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, handleSubmit, reset, setValue, watch } = useForm<Gasto & { image?: File }>({
    defaultValues: gasto ? {
      id: gasto.id,
      concept: gasto.concept,
      amount: gasto.amount,
      date: gasto.date,
      method: gasto.method,
      denominations: null,
      user_id: gasto.user_id,
      admin_id: gasto.admin_id,
      category: gasto.category,
      campus_id: gasto.campus_id,
      cash_register_id: activeCampus.latest_cash_register.id,
      image: null,
      user: gasto.user,
      admin: gasto.admin
    } : {
      concept: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'Efectivo',
      denominations: null,
      user_id: undefined, 
      admin_id: undefined,
      category: '',
      campus_id: activeCampus?.id ? Number(activeCampus.id) : undefined,
      cash_register_id: activeCampus.latest_cash_register.id,
      image: null,
    },
  });

  const formData = watch();

  const handleChange = (e: { name: keyof Gasto; value: any }) => {
    setValue(e.name, e.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onSubmitForm = async (data: Gasto & { image?: File }) => {
    try {
      await onSubmit({
        ...data,
        denominations: null,
        campus_id: Number(activeCampus.id),
      });
      reset();
      setPreviewUrl(null);
      setErrors({});
      onClose();
    } catch (error) {
      toast({
        title: 'Error al enviar el formulario',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive'
      })
      console.error('Error al enviar el formulario:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='min-w-[800px]'>
        <DialogHeader>
          <DialogTitle>{gasto ? 'Editar Gasto' : 'Nuevo Gasto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 max-h-[calc(100vh-150px)] grid grid-cols-2 overflow-y-auto gap-2">
          <div className="space-y-2">
            <Label htmlFor="admin_id">Administrador</Label>
            <Select
              value={formData.admin_id?.toString()}
              onValueChange={(value) =>
                handleChange({
                  name: 'admin_id',
                  value: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar administrador" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id?.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label>Categoria</label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                handleChange({
                  name: 'category',
                  value: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Limpieza">Limpieza</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="Nomina">Nomina</SelectItem>
                <SelectItem value="Arrendamiento">Arrendamiento</SelectItem>
                <SelectItem value="Proveedores">Proveedores</SelectItem>
                <SelectItem value="Informatica">Informatica</SelectItem>
                <SelectItem value="Servicios">Servicios</SelectItem>
                <SelectItem value="Otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label>Concepto</label>
            <Input {...register('concept', { required: true })} />
          </div>
          <div>
            <label>Monto</label>
            <Input
              type="number"
              step="0.01"
              {...register('amount', { required: true, min: 0 })}
            />
          </div>
          <div>
            <label>Metodo de pago</label>
            <Select
              value={formData.method}
              onValueChange={(value) =>
                handleChange({
                  name: 'method',
                  value: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar metodo de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label>Fecha</label>
            <Input type="date" {...register('date', { required: true })} />
          </div>
          <div>
            <label>Comprobante</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className='hidden'
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto" />
                ) : (
                  <div className="text-gray-500">
                    Arrastra una imagen aquí o haz clic para seleccionar
                  </div>
                )}
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user_id">Usuario</Label>
            <Select
              value={formData.user_id?.toString()}
              onValueChange={(value) =>
                handleChange({
                  name: 'user_id',
                  value: Number(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id?.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{gasto ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
