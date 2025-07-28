"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MainNav } from "@/components/main-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/lib/api/axiosConfig";

const formSchema = z.object({
  firstname: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  campus_id: z.string().min(1, "Selecciona un campus"),
  carrer_id: z.string().optional(),
  facultad_id: z.string().optional(),
  prepa_id: z.string().optional(),
  municipio_id: z.string().optional(),
  tutor_name: z.string().optional(),
  tutor_phone: z.string().optional(),
  tutor_relationship: z.string().optional(),
  average: z.string().optional(),
  health_conditions: z.string().optional(),
  how_found_out: z.string().optional(),
  preferred_communication: z.string().optional(),
});

interface FormData {
  campuses: Array<{ id: number; name: string; city: string; state: string }>;
  carreras: Array<{ id: number; name: string }>;
  facultades: Array<{ id: number; name: string }>;
  prepas: Array<{ id: number; name: string }>;
  municipios: Array<{ id: number; name: string }>;
}

export default function RegistroPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      campus_id: "",
      carrer_id: "none",
      facultad_id: "none",
      prepa_id: "none",
      municipio_id: "none",
      tutor_name: "",
      tutor_phone: "",
      tutor_relationship: "",
      average: "",
      health_conditions: "",
      how_found_out: "",
      preferred_communication: "email",
    },
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axiosInstance.get('/public/students/form-data');
        setFormData(response.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos del formulario",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchFormData();
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      
      // Convert string values to numbers where needed, handle "none" values
      const submitData = {
        ...values,
        campus_id: parseInt(values.campus_id),
        carrer_id: values.carrer_id && values.carrer_id !== "none" ? parseInt(values.carrer_id) : null,
        facultad_id: values.facultad_id && values.facultad_id !== "none" ? parseInt(values.facultad_id) : null,
        prepa_id: values.prepa_id && values.prepa_id !== "none" ? parseInt(values.prepa_id) : null,
        municipio_id: values.municipio_id && values.municipio_id !== "none" ? parseInt(values.municipio_id) : null,
        average: values.average ? parseFloat(values.average) : null,
      };

      const response = await axiosInstance.post('/public/students/register', submitData);

      toast({
        title: "¡Registro exitoso!",
        description: response.data.message,
      });

      // Reset form
      form.reset();
      
      // Redirect to login or success page
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: error.response?.data?.message || "Ocurrió un error al procesar tu registro",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex-1">
        <MainNav />
        <div className="container px-4 flex h-[calc(100vh-80px)] w-screen flex-col items-center justify-center mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando formulario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <MainNav />
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Registro de Estudiante</CardTitle>
            <CardDescription>
              Completa el formulario para solicitar tu inscripción. Tu solicitud será revisada por nuestro equipo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido *</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu apellido" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="tu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono *</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Información del Tutor */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información del Tutor/Responsable</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="tutor_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Tutor</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tutor_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono del Tutor</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tutor_relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parentesco</FormLabel>
                          <FormControl>
                            <Input placeholder="Padre, Madre, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información Adicional</h3>
                  <FormField
                    control={form.control}
                    name="health_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condiciones de Salud</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe cualquier condición médica relevante..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="how_found_out"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Cómo te enteraste de nosotros?</FormLabel>
                        <FormControl>
                          <Input placeholder="Redes sociales, recomendación, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferred_communication"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medio de Comunicación Preferido</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Correo Electrónico</SelectItem>
                            <SelectItem value="phone">Teléfono</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button className="flex-1" type="submit" disabled={isLoading}>
                    {isLoading ? "Procesando..." : "Enviar Solicitud"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push('/login')}
                  >
                    ¿Ya tienes cuenta? Inicia Sesión
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}