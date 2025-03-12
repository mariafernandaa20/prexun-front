'use client';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCampuses } from '@/lib/api'
import axiosInstance from '@/lib/api/axiosConfig'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  campus_id: z.string().min(1, { message: 'Selecciona un plantel' }),
  file: z.instanceof(FileList).refine(files => files.length > 0, {
    message: 'Selecciona un archivo CSV o Excel',
  }),
})

export default function ActualizarFolios() {
  const [campuses, setCampuses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; errors?: string[]; updated?: number; notFound?: number } | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campus_id: '',
    },
  })

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const data = await getCampuses()
        setCampuses(data)
      } catch (error) {
        console.error('Error fetching campuses:', error)
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los planteles',
          variant: 'destructive',
        })
      }
    }

    fetchCampuses()
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    setResult(null)
    
    try {
      const formData = new FormData()
      formData.append('campus_id', values.campus_id)
      formData.append('file', values.file[0])

      const response = await axiosInstance.post('/charges/import-folios', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setResult({
        success: true,
        message: 'Folios actualizados correctamente',
        updated: response.data.updated,
        notFound: response.data.notFound,
        errors: response.data.errors,
      })
    } catch (error: any) {
      console.error('Error updating folios:', error)
      setResult({
        success: false,
        message: error.response?.data?.error || 'Error al actualizar folios',
        errors: error.response?.data?.errors || [],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Actualizar Folios</CardTitle>
          <CardDescription>
            Sube un archivo CSV o Excel con los folios a actualizar. El archivo debe tener el siguiente formato:
            <code className="block mt-2 p-2 bg-gray-100 rounded">
              folio_actual,campus_id,folio_nuevo,fecha_pago(opcional)
            </code>
            <p className="mt-2 text-sm">La fecha de pago debe estar en formato YYYY-MM-DD (ej. 2024-05-15)</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="campus_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plantel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un plantel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campuses.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id.toString()}>
                            {campus.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecciona el plantel al que pertenecen los folios
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Archivo CSV o Excel</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".csv,.txt,.xlsx,.xls"
                        onChange={(e) => onChange(e.target.files)}
                        {...rest}
                      />
                    </FormControl>
                    <FormDescription>
                      Sube un archivo CSV o Excel con los folios a actualizar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Procesando...' : 'Actualizar Folios'}
              </Button>
            </form>
          </Form>

          {result && (
            <div className="mt-6">
              {result.success ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Actualización exitosa</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Se actualizaron {result.updated} folios correctamente.
                    {result.notFound > 0 && (
                      <p>No se encontraron {result.notFound} folios.</p>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {result.message}
                    {result.errors && result.errors.length > 0 && (
                      <ul className="mt-2 list-disc pl-5">
                        {result.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
