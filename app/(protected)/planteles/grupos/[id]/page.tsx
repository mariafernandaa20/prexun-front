'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axiosInstance from '@/lib/api/axiosConfig';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Loader2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Student {
  id: number | string;
  firstname: string;
  lastname: string;
  email: string;
  matricula: string | null;
  phone?: string;
}

interface Grade {
  student_id: number | string;
  course_name: string;
  grade: number;
  final_grade?: number;
}

interface Group {
  id: number;
  name: string;
  type: string;
  start_time: string;
  end_time: string;
  frequency: string;
}

interface Template {
  id: number;
  name: string;
  meta_id: string;
  parameters?: Array<{ name: string; example: string }>;
  example_message?: string;
  is_active: boolean;
}

export default function GroupGradesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string | number, Grade[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});
  const [languageCode, setLanguageCode] = useState('es');
  const [sendingBulk, setSendingBulk] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, studentsRes, templatesRes] = await Promise.all([
          axiosInstance.get(`/grupos/${params.id}`),
          axiosInstance.get(`/grupos/${params.id}/students`),
          axiosInstance.get('/whatsapp/templates'),
        ]);

        setGroup(groupRes.data);
        setStudents(studentsRes.data);
        
        if (templatesRes.data.success) {
          setTemplates(templatesRes.data.data);
        }

        const gradesData: Record<string | number, Grade[]> = {};
        await Promise.all(
          studentsRes.data.map(async (student: Student) => {
            try {
              const gradesRes = await axiosInstance.get(
                `/students/${student.id}/grades`
              );
              gradesData[student.id] = gradesRes.data;
            } catch (err) {
              gradesData[student.id] = [];
            }
          })
        );

        setGrades(gradesData);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const sendBulkTemplateMessages = async () => {
    if (!selectedTemplate) {
      toast.error('Por favor selecciona una plantilla');
      return;
    }

    const template = templates.find((t) => t.name === selectedTemplate);
    if (!template) {
      toast.error('Plantilla no encontrada');
      return;
    }

    if (template.parameters && template.parameters.length > 0) {
      const missingParams = template.parameters.filter(
        (param) => !templateParams[param.name]?.trim()
      );
      if (missingParams.length > 0) {
        toast.error(
          `Por favor completa todos los parámetros: ${missingParams
            .map((p) => p.name)
            .join(', ')}`
        );
        return;
      }
    }

    const studentsWithPhone = students.filter((s) => s.phone);
    if (studentsWithPhone.length === 0) {
      toast.error('No hay estudiantes con número de teléfono registrado');
      return;
    }

    setSendingBulk(true);

    const parametersArray =
      template.parameters?.map((param) => templateParams[param.name]) || [];

    let successCount = 0;
    let errorCount = 0;

    for (const student of studentsWithPhone) {
      try {
        const response = await axiosInstance.post('/whatsapp/send-template', {
          phone_number: student.phone,
          template_name: selectedTemplate,
          language_code: languageCode,
          ...(parametersArray.length > 0 && { parameters: parametersArray }),
        });

        if (response.data.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        errorCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setSendingBulk(false);
    setDialogOpen(false);

    if (successCount > 0) {
      toast.success(
        `Mensajes enviados: ${successCount} exitosos, ${errorCount} fallidos`
      );
    } else {
      toast.error('No se pudo enviar ningún mensaje');
    }

    setSelectedTemplate('');
    setTemplateParams({});
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!group) {
    return <div className="p-6">Grupo no encontrado</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Calificaciones - {group.name}</h1>
          <p className="text-sm text-muted-foreground">
            Horario: {group.start_time} - {group.end_time}
          </p>
        </div>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No hay estudiantes asignados a este grupo
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Estudiantes y Calificaciones</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar WhatsApp Masivo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Enviar Plantilla de WhatsApp al Grupo</DialogTitle>
                    <DialogDescription>
                      Envía una plantilla de WhatsApp a todos los estudiantes del
                      grupo que tengan número de teléfono registrado (
                      {students.filter((s) => s.phone).length} de {students.length}
                      )
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Alert>
                      <AlertDescription>
                        Los mensajes se enviarán uno por uno con un intervalo de 1
                        segundo para evitar límites de la API.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="template">Plantilla</Label>
                      <Select
                        value={selectedTemplate}
                        onValueChange={(value) => {
                          setSelectedTemplate(value);
                          setTemplateParams({});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una plantilla" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.length > 0 ? (
                            templates
                              .filter((t) => t.is_active)
                              .map((template) => (
                                <SelectItem key={template.id} value={template.name}>
                                  {template.name}
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="" disabled>
                              No hay plantillas disponibles
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTemplate &&
                      templates.find((t) => t.name === selectedTemplate)
                        ?.example_message && (
                        <Alert>
                          <AlertDescription className="text-sm">
                            <strong>Ejemplo de mensaje:</strong>
                            <div className="mt-2 whitespace-pre-wrap">
                              {
                                templates.find((t) => t.name === selectedTemplate)
                                  ?.example_message
                              }
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}

                    {selectedTemplate &&
                      templates.find((t) => t.name === selectedTemplate)
                        ?.parameters &&
                      templates.find((t) => t.name === selectedTemplate)!
                        .parameters!.length > 0 && (
                        <div className="space-y-4 border rounded-lg p-4">
                          <h4 className="font-medium text-sm">
                            Parámetros de la plantilla
                          </h4>
                          {templates
                            .find((t) => t.name === selectedTemplate)!
                            .parameters!.map((param, index) => (
                              <div key={index} className="space-y-2">
                                <Label htmlFor={`param-${index}`}>
                                  {param.name}
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (Ej: {param.example})
                                  </span>
                                </Label>
                                <Input
                                  id={`param-${index}`}
                                  placeholder={param.example}
                                  value={templateParams[param.name] || ''}
                                  onChange={(e) =>
                                    setTemplateParams({
                                      ...templateParams,
                                      [param.name]: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            ))}
                          <p className="text-xs text-muted-foreground">
                            Estos parámetros se aplicarán a todos los estudiantes
                          </p>
                        </div>
                      )}

                    <div className="space-y-2">
                      <Label htmlFor="language">Código de Idioma</Label>
                      <Input
                        id="language"
                        placeholder="es"
                        value={languageCode}
                        onChange={(e) => setLanguageCode(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Código ISO de 2 letras. Ejemplos: es (español), en
                        (inglés)
                      </p>
                    </div>

                    <Button
                      onClick={sendBulkTemplateMessages}
                      disabled={sendingBulk || !selectedTemplate}
                      className="w-full"
                    >
                      {sendingBulk ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Enviando mensajes...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar a {students.filter((s) => s.phone).length}{' '}
                          estudiantes
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cursos</TableHead>
                  <TableHead>Promedio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const studentGrades = grades[student.id] || [];
                  const average =
                    studentGrades.length > 0
                      ? (
                          studentGrades.reduce(
                            (sum, g) => sum + (g.final_grade || g.grade || 0),
                            0
                          ) / studentGrades.length
                        ).toFixed(2)
                      : 'N/A';

                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.matricula || student.id}</TableCell>
                      <TableCell>
                        {student.firstname} {student.lastname}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {studentGrades.length > 0 ? (
                          <div className="space-y-1">
                            {studentGrades.map((grade, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">
                                  {grade.course_name}:
                                </span>{' '}
                                {grade.final_grade || grade.grade || 'N/A'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Sin calificaciones
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">{average}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
