'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/auth-store';
import axiosInstance from '@/lib/api/axiosConfig';

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export default function ChangePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const user = useAuthStore((state) => state.user);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast.error('No se encontró la sesión del usuario.');
      return;
    }

    setStatusMessage(null);

    try {
      setIsLoading(true);

      const payload = {
        name: user.name,
        email: user.email,
        role: user.role,
        password: values.password,
      };

      await axiosInstance.put(`/users/${user.id}`, payload);

      toast.success('Contraseña actualizada correctamente.');

      setStatusMessage({
        type: 'success',
        text: '¡Contraseña actualizada correctamente!',
      });
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo actualizar la contraseña.');

      setStatusMessage({
        type: 'error',
        text: 'Error al guardar la contraseña. Intenta de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-md mx-auto shadow-md">
        <CardHeader className="bg-sky-50 dark:bg-slate-900 border-b">
          <CardTitle className="text-xl text-sky-700 dark:text-sky-400">
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Nueva Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Ingresa tu nueva contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Confirmar Contraseña
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>

              {statusMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-center text-sm font-medium ${
                    statusMessage.type === 'success'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
