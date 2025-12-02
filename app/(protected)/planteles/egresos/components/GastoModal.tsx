'use client';
import React, { useEffect, useState } from 'react';
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
import { SignaturePad, SignaturePreview } from '@/components/ui/SignaturePad';
import { QRSignature } from '@/components/QRSignature';

interface GastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGasto?: Gasto | null;
  onSubmit: (data: Gasto) => Promise<void>;
}

export function GastoModal({
  isOpen,
  onClose,
  selectedGasto,
  onSubmit,
}: GastoModalProps) {
  const activeCampus = useActiveCampusStore((state) => state.activeCampus);
  const users = useAuthStore((state) => state.users);
  const user = useAuthStore((state) => state.user);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQRSignature, setShowQRSignature] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<
    Gasto & { image?: File }
  >({
    defaultValues: selectedGasto
      ? {
          id: selectedGasto.id,
          concept: selectedGasto.concept,
          amount: selectedGasto.amount,
          date: selectedGasto.date,
          method: selectedGasto.method,
          denominations: null,
          user_id: selectedGasto.user_id,
          admin_id: selectedGasto.admin_id,
          category: selectedGasto.category,
          campus_id: selectedGasto.campus_id,
          cash_register_id: activeCampus.latest_cash_register.id,
          image: null,
          signature: selectedGasto.signature,
          user: selectedGasto.user,
          admin: selectedGasto.admin,
        }
      : {
          concept: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          method: 'cash',
          denominations: null,
          user_id: undefined,
          admin_id: undefined,
          category: '',
          campus_id: activeCampus?.id ? Number(activeCampus.id) : undefined,
          cash_register_id: activeCampus.latest_cash_register.id,
          image: null,
          signature: null,
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

  const handleSignatureSave = (signatureDataURL: string) => {
    setSignatureUrl(signatureDataURL);
    setValue('signature', signatureDataURL);
  };

  const handleExternalSignatureUpdate = (signature: string) => {
    setSignatureUrl(signature);
    setValue('signature', signature);
    setShowQRSignature(false);
    toast({
      title: 'Firma recibida',
      description: 'La firma externa ha sido recibida exitosamente',
    });
  };

  const handleCloseModal = () => {
    // Limpiar todos los estados locales
    setPreviewUrl(null);
    setSignatureUrl(null);
    setErrors({});
    setSignatureModalOpen(false);
    setShowQRSignature(false);

    // Resetear el formulario al estado inicial
    reset({
      concept: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      denominations: null,
      user_id: undefined,
      admin_id: undefined,
      category: '',
      campus_id: activeCampus?.id ? Number(activeCampus.id) : undefined,
      cash_register_id: activeCampus?.latest_cash_register?.id,
      image: null,
      signature: null,
    });

    onClose();
  };

  const onSubmitForm = async (data: Gasto & { image?: File }) => {
    try {
      await onSubmit({
        ...data,
        signature: signatureUrl,
        denominations: null,
        campus_id: Number(activeCampus.id),
      });
      reset();
      setPreviewUrl(null);
      setSignatureUrl(null);
      setErrors({});
      handleCloseModal();
    } catch (error) {
      toast({
        title: 'Error al enviar el formulario',
        description: error.response?.data?.message || 'Intente nuevamente',
        variant: 'destructive',
      });
      console.error('Error al enviar el formulario:', error);
    }
  };

  useEffect(() => {
    if (selectedGasto) {
      reset({
        id: selectedGasto.id,
        concept: selectedGasto.concept,
        amount: selectedGasto.amount,
        date: selectedGasto.date,
        method: selectedGasto.method,
        denominations: null,
        user_id: selectedGasto.user_id,
        admin_id: selectedGasto.admin_id,
        category: selectedGasto.category,
        campus_id: selectedGasto.campus_id,
        cash_register_id:
          selectedGasto.cash_register_id ||
          activeCampus?.latest_cash_register?.id,
        image: null,
        signature: selectedGasto.signature,
        user: selectedGasto.user,
        admin: selectedGasto.admin,
      });
    } else {
      // Resetear formulario para nuevo gasto
      reset({
        concept: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        method: 'cash',
        denominations: null,
        user_id: undefined,
        admin_id: undefined,
        category: '',
        campus_id: activeCampus?.id ? Number(activeCampus.id) : undefined,
        cash_register_id: activeCampus?.latest_cash_register?.id,
        image: null,
        signature: null,
      });
    }
  }, [selectedGasto, reset, activeCampus]);

  // Efecto para sincronizar estados locales con el gasto seleccionado
  useEffect(() => {
    if (selectedGasto) {
      // Cargar firma si existe
      setSignatureUrl(selectedGasto.signature || null);

      // Cargar imagen si existe y es un string (URL)
      if (selectedGasto.image && typeof selectedGasto.image === 'string') {
        setPreviewUrl(selectedGasto.image);
      } else {
        setPreviewUrl(null);
      }
    } else {
      // Limpiar estados para nuevo gasto
      setSignatureUrl(null);
      setPreviewUrl(null);
      setShowQRSignature(false);
    }
  }, [selectedGasto]);

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="min-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {selectedGasto ? 'Editar Gasto' : 'Nuevo Gasto'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="space-y-4 max-h-[calc(100vh-150px)] grid grid-cols-2 overflow-y-auto gap-2"
        >
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
              value={formData.category.toString()}
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
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
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
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-40 mx-auto"
                  />
                ) : (
                  <div className="text-gray-500">
                    Arrastra una imagen aquí o haz clic para seleccionar
                  </div>
                )}
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Firma Digital</Label>
            {signatureUrl ? (
              // Ya tiene firma - mostrar preview y deshabilitar edición si tiene ID
              <div>
                <SignaturePreview
                  signature={signatureUrl}
                  onRemove={
                    selectedGasto?.id
                      ? undefined
                      : () => {
                          setSignatureUrl(null);
                          setValue('signature', null);
                        }
                  }
                  onEdit={
                    selectedGasto?.id
                      ? undefined
                      : () => setSignatureModalOpen(true)
                  }
                />
                {selectedGasto?.id && (
                  <p className="text-xs text-gray-500 mt-2">
                    La firma no puede ser modificada una vez que el gasto tiene
                    ID
                  </p>
                )}
              </div>
            ) : selectedGasto?.id ? (
              // Tiene ID pero no tiene firma - mostrar opciones de firma
              <div className="space-y-3">
                {showQRSignature ? (
                  <div>
                    <QRSignature
                      gastoId={selectedGasto.id}
                      onSignatureUpdate={handleExternalSignatureUpdate}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQRSignature(false)}
                      className="w-full mt-2"
                    >
                      Cancelar firma externa
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSignatureModalOpen(true)}
                      className="w-full"
                    >
                      Firmar Aquí
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowQRSignature(true)}
                      className="w-full"
                    >
                      Firmar Externamente (QR)
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Nuevo gasto sin ID - solo firma local
              <Button
                type="button"
                variant="outline"
                onClick={() => setSignatureModalOpen(true)}
                className="w-full"
              >
                Agregar Firma Digital
              </Button>
            )}
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
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {selectedGasto ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Modal de Firma */}
      <SignaturePad
        isOpen={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSave={handleSignatureSave}
        title="Agregar Firma Digital"
      />
    </Dialog>
  );
}
