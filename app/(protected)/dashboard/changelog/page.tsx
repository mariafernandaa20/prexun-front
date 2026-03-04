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
  filesModified: string[];
}

const changelogGuidelines = [
  'Agregar nuevas entradas al inicio del arreglo `changelogItems`.',
  'Usar fecha en formato `YYYY-MM-DD`.',
  'Título corto: qué cambió en una línea.',
  'Descripción breve: impacto funcional y contexto del cambio.',
  'Incluir `filesModified` con los archivos tocados por el cambio.',
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
  scope: 'admin',
  filesModified: ['app/(protected)/ruta/page.tsx']
}`;

const changelogItems: ChangelogItem[] = [
  {
    id: '2026-03-03-01',
    date: '2026-03-03',
    type: 'improvement',
    title: 'Lista de asistencia mixta ordenada global por apellido',
    description:
      'En selección múltiple de grupos, se eliminó la segregación por aulas y se ordena el listado completo de alumnos por apellido A-Z.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/lista-asistencia/page.tsx'],
  },
  {
    id: '2026-03-03-02',
    date: '2026-03-03',
    type: 'fix',
    title: 'Ingresos con orden de folio descendente funcional',
    description:
      'Se corrigió la lógica de ordenamiento para folios usando orden numérico real y fallback consistente entre folio, folio_cash, folio_transfer y folio_card.',
    scope: 'general',
    filesModified: ['app/Http/Controllers/Api/TransactionController.php'],
  },
  {
    id: '2026-03-03-03',
    date: '2026-03-03',
    type: 'fix',
    title: 'Filtro de grupos en ingresos por plantel/contexto activo',
    description:
      'El selector de grupos en ingresos ahora muestra solo grupos del plantel activo y envía el filtro al backend para restringir resultados.',
    scope: 'planteles',
    filesModified: [
      'app/(protected)/planteles/ingresos/page.tsx',
      'lib/api.ts',
      'app/Http/Controllers/Api/TransactionController.php',
    ],
  },
  {
    id: '2026-03-03-04',
    date: '2026-03-03',
    type: 'fix',
    title: 'Normalización de fechas a zona horaria CDMX en asistencia',
    description:
      'Se eliminó la dependencia de toISOString para fechas de asistencia y se estandarizó America/Mexico_City para evitar desfases de día.',
    scope: 'planteles',
    filesModified: [
      'app/(protected)/planteles/lista-asistencia/page.tsx',
      'app/(protected)/planteles/tomar-asistencia/page.tsx',
      'app/(protected)/planteles/reportes-asistencia/page.tsx',
    ],
  },
  {
    id: '2026-03-03-05',
    date: '2026-03-03',
    type: 'improvement',
    title: 'Limpieza de visualización de alumnos en reportes',
    description:
      'Se depuró el listado de alumnos en reportes: deduplicado, filtrado básico de registros inválidos y orden por apellido para reducir ruido visual.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/reportes-asistencia/page.tsx'],
  },
  {
    id: '2026-02-28-01',
    date: '2026-02-28',
    type: 'fix',
    title: 'Autosave al cambiar día en asistencias',
    description:
      'En lista de asistencias, ahora se guarda automáticamente antes de cambiar de fecha. Si falla el guardado, no cambia de día para evitar pérdida de datos.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/lista-asistencia/page.tsx'],
  },
  {
    id: '2026-02-28-02',
    date: '2026-02-28',
    type: 'feat',
    title: 'Selección de cámara en escáner QR',
    description:
      'En tomar asistencia se agregó selector de cámara frontal/trasera y selección por dispositivo (deviceId), con cierre seguro de stream al cambiar.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/tomar-asistencia/page.tsx'],
  },
  {
    id: '2026-02-28-03',
    date: '2026-02-28',
    type: 'feat',
    title: 'Mensajes WhatsApp en modo masivo',
    description:
      'En calificaciones del estudiante se agregó modo para generar/copiar mensajes de todos los cursos en un solo bloque, además del modo individual.',
    scope: 'planteles',
    filesModified: ['components/students/StudentGrades.tsx'],
  },
  {
    id: '2026-02-28-04',
    date: '2026-02-28',
    type: 'improvement',
    title: 'Plantillas WhatsApp sin texto de relleno',
    description:
      'Cuando un curso no tiene actividades, se omite el bloque de actividades en el mensaje para evitar frases como “Sin actividad”.',
    scope: 'planteles',
    filesModified: ['components/students/StudentGrades.tsx'],
  },
  {
    id: '2026-02-27-01',
    date: '2026-02-27',
    type: 'fix',
    title: 'Grupos filtrados por asignación (método nuevo)',
    description:
      'Se centralizó el filtrado para usar asignaciones vigentes por plantel/periodo y limitar grupos globales a modalidad en línea.',
    scope: 'planteles',
    filesModified: ['lib/store/auth-store.ts'],
  },
  {
    id: '2026-02-27-02',
    date: '2026-02-27',
    type: 'fix',
    title: 'Periodo por defecto desde configuración global',
    description:
      'Asistencias y reportes ahora inicializan periodo con default_period_id de configuración global, con fallback al periodo actual por fechas.',
    scope: 'planteles',
    filesModified: [
      'app/(protected)/planteles/lista-asistencia/page.tsx',
      'app/(protected)/planteles/reportes-asistencia/page.tsx',
    ],
  },
  {
    id: '2026-02-27-03',
    date: '2026-02-27',
    type: 'fix',
    title: 'Endpoint de alumnos por grupo solo con asignaciones',
    description:
      'En backend, getStudents de grupos quedó únicamente con student_assignments activas (sin fallback legacy por grupo_id directo).',
    scope: 'general',
    filesModified: ['app/Http/Controllers/Api/GrupoController.php'],
  },
  {
    id: '2026-02-27-04',
    date: '2026-02-27',
    type: 'improvement',
    title: 'Asistencias con autosave por grupo y periodo',
    description:
      'Al cambiar grupo o periodo se guarda automáticamente la captura pendiente antes de navegar, evitando pérdida de cambios por omisión del botón Guardar.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/lista-asistencia/page.tsx'],
  },
  {
    id: '2026-02-26-01',
    date: '2026-02-26',
    type: 'improvement',
    title: 'Vista lateral para grupos en planteles',
    description:
      'Se cambió la vista de grupos a lista vertical izquierda con panel de detalle a la derecha para facilitar lectura rápida.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/grupos/page.tsx'],
  },
  {
    id: '2026-02-26-02',
    date: '2026-02-26',
    type: 'feat',
    title: 'Ordenamiento de grupos',
    description:
      'Se agregó ordenamiento por alfabético (default), cupo disponible, capacidad e inscritos en la lista de grupos.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/grupos/page.tsx'],
  },
  {
    id: '2026-02-26-03',
    date: '2026-02-26',
    type: 'fix',
    title: 'Conteo de inscritos y cupo calculado en frontend',
    description:
      'El total de inscritos y disponibles se calcula con alumnos reales por grupo para evitar inconsistencias del backend.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/grupos/page.tsx'],
  },
  {
    id: '2026-02-26-04',
    date: '2026-02-26',
    type: 'fix',
    title: 'Filtrado de grupos por plantel y periodo actual',
    description:
      'La vista de grupos ahora muestra solo grupos del plantel activo y del periodo actual; los globales solo si son en línea.',
    scope: 'planteles',
    filesModified: [
      'app/(protected)/planteles/grupos/page.tsx',
      'lib/store/auth-store.ts',
    ],
  },
  {
    id: '2026-02-26-05',
    date: '2026-02-26',
    type: 'fix',
    title: 'Estabilidad en lista de asistencias',
    description:
      'Se unificó el flujo de carga de alumnos y asistencia para evitar estados pisados y errores por efectos duplicados.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/lista-asistencia/page.tsx'],
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
                <p className="text-xs text-muted-foreground">
                  Archivos: {item.filesModified.join(', ')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
