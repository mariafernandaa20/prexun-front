'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ChangeType = 'feat' | 'fix' | 'improvement';

interface ChangelogItem {
  id: string;
  date: string;
  type: ChangeType;
  title: string;
  description: string;
  scope: 'admin' | 'planteles' | 'general';
}

const changelogGuidelines = [
  'Agregar nuevas entradas al inicio del arreglo `changelogItems`.',
  'Usar fecha en formato `YYYY-MM-DD`.',
  'Título corto: qué cambió en una línea.',
  'Descripción breve: impacto funcional y contexto del cambio.',
  'Seleccionar `type`: `feat` (nuevo), `fix` (corrección), `improvement` (mejora).',
  'Seleccionar `scope`: `admin`, `planteles` o `general`.',
  'Si un cambio depende de otro, incluirlo en la descripción para conservar contexto.',
];

const changelogTemplate = `{
  id: '2026-02-26-06',
  date: '2026-02-26',
  type: 'fix',
  title: 'Título del cambio',
  description: 'Qué se ajustó y por qué.',
  scope: 'admin'
}`;

const changelogItems: ChangelogItem[] = [
  {
    id: '2026-02-28-01',
    date: '2026-02-28',
    type: 'fix',
    title: 'Autosave al cambiar día en asistencias',
    description:
      'En lista de asistencias, ahora se guarda automáticamente antes de cambiar de fecha. Si falla el guardado, no cambia de día para evitar pérdida de datos.',
    scope: 'planteles',
  },
  {
    id: '2026-02-28-02',
    date: '2026-02-28',
    type: 'feat',
    title: 'Selección de cámara en escáner QR',
    description:
      'En tomar asistencia se agregó selector de cámara frontal/trasera y selección por dispositivo (deviceId), con cierre seguro de stream al cambiar.',
    scope: 'planteles',
  },
  {
    id: '2026-02-28-03',
    date: '2026-02-28',
    type: 'feat',
    title: 'Mensajes WhatsApp en modo masivo',
    description:
      'En calificaciones del estudiante se agregó modo para generar/copiar mensajes de todos los cursos en un solo bloque, además del modo individual.',
    scope: 'planteles',
  },
  {
    id: '2026-02-28-04',
    date: '2026-02-28',
    type: 'improvement',
    title: 'Plantillas WhatsApp sin texto de relleno',
    description:
      'Cuando un curso no tiene actividades, se omite el bloque de actividades en el mensaje para evitar frases como “Sin actividad”.',
    scope: 'planteles',
  },
  {
    id: '2026-02-27-01',
    date: '2026-02-27',
    type: 'fix',
    title: 'Grupos filtrados por asignación (método nuevo)',
    description:
      'Se centralizó el filtrado para usar asignaciones vigentes por plantel/periodo y limitar grupos globales a modalidad en línea.',
    scope: 'planteles',
  },
  {
    id: '2026-02-27-02',
    date: '2026-02-27',
    type: 'fix',
    title: 'Periodo por defecto desde configuración global',
    description:
      'Asistencias y reportes ahora inicializan periodo con default_period_id de configuración global, con fallback al periodo actual por fechas.',
    scope: 'planteles',
  },
  {
    id: '2026-02-27-03',
    date: '2026-02-27',
    type: 'fix',
    title: 'Endpoint de alumnos por grupo solo con asignaciones',
    description:
      'En backend, getStudents de grupos quedó únicamente con student_assignments activas (sin fallback legacy por grupo_id directo).',
    scope: 'general',
  },
  {
    id: '2026-02-27-04',
    date: '2026-02-27',
    type: 'improvement',
    title: 'Asistencias con autosave por grupo y periodo',
    description:
      'Al cambiar grupo o periodo se guarda automáticamente la captura pendiente antes de navegar, evitando pérdida de cambios por omisión del botón Guardar.',
    scope: 'planteles',
  },
  {
    id: '2026-02-26-01',
    date: '2026-02-26',
    type: 'improvement',
    title: 'Vista lateral para grupos en planteles',
    description:
      'Se cambió la vista de grupos a lista vertical izquierda con panel de detalle a la derecha para facilitar lectura rápida.',
    scope: 'planteles',
  },
  {
    id: '2026-02-26-02',
    date: '2026-02-26',
    type: 'feat',
    title: 'Ordenamiento de grupos',
    description:
      'Se agregó ordenamiento por alfabético (default), cupo disponible, capacidad e inscritos en la lista de grupos.',
    scope: 'planteles',
  },
  {
    id: '2026-02-26-03',
    date: '2026-02-26',
    type: 'fix',
    title: 'Conteo de inscritos y cupo calculado en frontend',
    description:
      'El total de inscritos y disponibles se calcula con alumnos reales por grupo para evitar inconsistencias del backend.',
    scope: 'planteles',
  },
  {
    id: '2026-02-26-04',
    date: '2026-02-26',
    type: 'fix',
    title: 'Filtrado de grupos por plantel y periodo actual',
    description:
      'La vista de grupos ahora muestra solo grupos del plantel activo y del periodo actual; los globales solo si son en línea.',
    scope: 'planteles',
  },
  {
    id: '2026-02-26-05',
    date: '2026-02-26',
    type: 'fix',
    title: 'Estabilidad en lista de asistencias',
    description:
      'Se unificó el flujo de carga de alumnos y asistencia para evitar estados pisados y errores por efectos duplicados.',
    scope: 'planteles',
  },
];

const typeLabel: Record<ChangeType, string> = {
  feat: 'Nuevo',
  fix: 'Corrección',
  improvement: 'Mejora',
};

export default function AdminChangelogPage() {
  const itemsSorted = useMemo(() => {
    return [...changelogItems].sort((a, b) => b.date.localeCompare(a.date));
  }, []);

  const groupedByDate = useMemo(() => {
    return itemsSorted.reduce(
      (acc, item) => {
        if (!acc[item.date]) acc[item.date] = [];
        acc[item.date].push(item);
        return acc;
      },
      {} as Record<string, ChangelogItem[]>
    );
  }, [itemsSorted]);

  const dateKeys = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Changelog</h1>
        <p className="text-sm text-muted-foreground">
          Historial de actualizaciones del sistema ordenado por fecha.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instrucciones de uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            {changelogGuidelines.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="border rounded-md p-3 bg-muted/30">
            <p className="text-sm font-medium mb-2">Plantilla sugerida</p>
            <pre className="text-xs whitespace-pre-wrap">{changelogTemplate}</pre>
          </div>
        </CardContent>
      </Card>

      {dateKeys.map((dateKey) => (
        <Card key={dateKey}>
          <CardHeader>
            <CardTitle className="text-base">{dateKey}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupedByDate[dateKey].map((item) => (
              <div
                key={item.id}
                className="border rounded-md px-3 py-2 flex flex-col gap-1"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{typeLabel[item.type]}</Badge>
                  <Badge variant="secondary">{item.scope}</Badge>
                </div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
