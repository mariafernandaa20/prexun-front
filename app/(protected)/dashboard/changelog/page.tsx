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
    id: '2026-03-06-01',
    date: '2026-03-06',
    type: 'feat',
    title: 'Autoguardado inmediato al marcar asistencia',
    description:
      'Al marcar o desmarcar checkbox en lista de asistencia se guarda automáticamente en backend por grupo afectado, evitando pérdida de cambios por omisión del botón Guardar.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/lista-asistencia/page.tsx'],
  },
  {
    id: '2026-03-06-02',
    date: '2026-03-06',
    type: 'feat',
    title: 'Acción masiva para marcar inasistencias pendientes',
    description:
      'Se agregó botón para marcar como inasistencia a estudiantes sin registro previo del día y guardar en bloque, con nota automática de inasistencia cuando aplica.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/lista-asistencia/page.tsx'],
  },
  {
    id: '2026-03-06-03',
    date: '2026-03-06',
    type: 'improvement',
    title: 'Indicadores visuales de estado en checkbox de asistencia',
    description:
      'En la columna de asistencia se muestran estados claros por alumno: presente, inasistencia marcada o sin registrar, para reducir ambigüedad operativa.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/lista-asistencia/page.tsx'],
  },
  {
    id: '2026-03-06-04',
    date: '2026-03-06',
    type: 'fix',
    title: 'Corrección de comentarios cuando la asistencia es recién creada',
    description:
      'El guardado de asistencia ahora devuelve IDs procesados por alumno y el frontend sincroniza `attendanceIds`, corrigiendo el error de “asistencia no encontrada” al editar notas.',
    scope: 'planteles',
    filesModified: [
      'app/Http/Controllers/Api/TeacherAttendanceController.php',
      'app/(protected)/planteles/lista-asistencia/page.tsx',
    ],
  },
  {
    id: '2026-03-06-05',
    date: '2026-03-06',
    type: 'fix',
    title: 'Corrección de fecha desplazada en calendario de asistencias',
    description:
      'Se ajustó el parseo de fechas para evitar corrimiento al día anterior por conversiones UTC cuando los registros llegan como `YYYY-MM-DD` o con sufijo de zona horaria.',
    scope: 'planteles',
    filesModified: [
      'app/(protected)/planteles/estudiantes/[...slug]/AttendanceCalendar.tsx',
    ],
  },
  {
    id: '2026-03-06-06',
    date: '2026-03-06',
    type: 'fix',
    title: 'Ajustes visuales de dark mode en edición de asistencia',
    description:
      'Se reemplazaron colores grises fijos por tokens de tema en el modal de edición de asistencia para mantener contraste correcto en modo oscuro.',
    scope: 'planteles',
    filesModified: ['components/EditAttendanceModal.tsx'],
  },
  {
    id: '2026-03-05-01',
    date: '2026-03-05',
    type: 'improvement',
    title: 'Filtros de ingresos con labels descriptivos',
    description:
      'Se añadieron etiquetas visibles sobre los controles de búsqueda, fechas, orden, método y columnas para mejorar legibilidad de filtros en ingresos.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/ingresos/page.tsx'],
  },
  {
    id: '2026-03-05-02',
    date: '2026-03-05',
    type: 'feat',
    title: 'Agrupación visual de ingresos por mes con encabezado',
    description:
      'Al activar agrupación por mes, la tabla separa bloques mensuales y muestra encabezado con mes/año y total de folios del bloque.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/ingresos/page.tsx'],
  },
  {
    id: '2026-03-05-03',
    date: '2026-03-05',
    type: 'fix',
    title: 'Orden de folios por mes de pago y presets de rango',
    description:
      'En ingresos se estabilizó el orden por folio dentro del mes de `payment_date`, se agregaron rangos rápidos (mes actual, 3 meses, últimos 100 folios) y fallback de prefijo para evitar `null` en folio.',
    scope: 'general',
    filesModified: [
      'app/Http/Controllers/Api/TransactionController.php',
      'lib/api.ts',
      'app/(protected)/planteles/ingresos/page.tsx',
    ],
  },
  {
    id: '2026-03-03-06',
    date: '2026-03-03',
    type: 'improvement',
    title: 'Persistencia en lista de asistencia por query params',
    description:
      'Se agregó persistencia de periodo, grupos y día en URL (`p`, `g`, `d`) para recuperar contexto al recargar la página y evitar pérdida de navegación.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/lista-asistencia/page.tsx'],
  },
  {
    id: '2026-03-03-07',
    date: '2026-03-03',
    type: 'fix',
    title: 'Corrección de bucle infinito en lista de asistencia',
    description:
      'Se volvió idempotente la limpieza de estado cuando no hay grupos filtrados para eliminar el error “Maximum update depth exceeded”.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/lista-asistencia/page.tsx'],
  },
  {
    id: '2026-03-03-08',
    date: '2026-03-03',
    type: 'feat',
    title: 'Asistencia pública por WhatsApp con modal embebible',
    description:
      'Se habilitó flujo público para registrar asistencia por WhatsApp/teléfono mediante modal embebible y página pública dedicada.',
    scope: 'general',
    filesModified: [
      'app/asistencia-publica/page.tsx',
      'public/prexun-attendance-embed.js',
      'app/Http/Controllers/Api/PublicAttendanceController.php',
      'routes/api.php',
    ],
  },
  {
    id: '2026-03-03-09',
    date: '2026-03-03',
    type: 'fix',
    title: 'Conectividad del modal de asistencia y compatibilidad iframe',
    description:
      'Se corrigieron problemas de conexión (`http/https`, mixed content) y se ajustaron headers para permitir embed de `/asistencia-publica` en admin/localhost.',
    scope: 'general',
    filesModified: [
      'app/(protected)/dashboard/tests/page.tsx',
      'app/asistencia-publica/page.tsx',
      'next.config.js',
    ],
  },
  {
    id: '2026-03-03-10',
    date: '2026-03-03',
    type: 'fix',
    title: 'Normalización de teléfonos para búsqueda de asistencia',
    description:
      'Se estandarizó almacenamiento y búsqueda por últimos 10 dígitos en backend, y en frontend se restringió captura de teléfono/tutor a números.',
    scope: 'general',
    filesModified: [
      'app/Models/Student.php',
      'app/Http/Controllers/StudentController.php',
      'app/Http/Controllers/Api/PublicAttendanceController.php',
      'app/(protected)/planteles/estudiantes/student-form.tsx',
      'app/(protected)/planteles/estudiantes/Filters.tsx',
    ],
  },
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

  const dateKeys = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a)
  );

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
            <pre className="text-xs whitespace-pre-wrap">
              {changelogTemplate}
            </pre>
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
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
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
