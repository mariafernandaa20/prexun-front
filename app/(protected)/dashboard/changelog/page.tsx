'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';

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
  id: '2026-05-01-01',
  date: '2026-05-01',
  type: 'fix',
  title: 'Título del cambio',
  description: 'Qué se ajustó y por qué.',
  scope: 'admin',
  filesModified: ['app/(protected)/ruta/page.tsx']
}`;

const changelogItems: ChangelogItem[] = [
  // ── Abril 16, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-04-16-01',
    date: '2026-04-16',
    type: 'improvement',
    title: 'Calificaciones redondeadas sin decimales',
    description:
      'Las calificaciones en la tabla, variables de mensaje y resumen {{calificaciones}} ahora muestran enteros (Math.round) en lugar de dos decimales, para una comunicación más clara con los alumnos.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-04-16-02',
    date: '2026-04-16',
    type: 'fix',
    title: 'Fallback "No presentó" para variables de actividad sin datos',
    description:
      'Si un alumno no tiene una actividad sincronizada desde Moodle, las variables de plantilla ahora muestran "No presentó" en lugar de dejar la variable literal {{variable}} en el mensaje enviado.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-04-16-03',
    date: '2026-04-16',
    type: 'feat',
    title: 'Variables de actividad prefijadas con nombre de materia',
    description:
      'Para evitar colisiones cuando dos materias tienen actividades del mismo nombre, las variables ahora incluyen el prefijo de la materia: {{matematicas_examen_parcial}} en lugar de {{examen_parcial}}.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },

  // ── Abril 15, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-04-15-01',
    date: '2026-04-15',
    type: 'feat',
    title: 'Panel de variables agrupado por materia con cabecera visual',
    description:
      'El panel de variables del WhatsApp agrupa actividades bajo la materia con tarjeta y cabecera, más indent con línea violeta para actividades individuales. El panel es scrolleable cuando hay muchas materias.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-04-15-02',
    date: '2026-04-15',
    type: 'feat',
    title: 'Resaltado en tiempo real de variables {{...}} en borrador',
    description:
      'Al escribir el borrador del mensaje WhatsApp, las variables {{variable}} se resaltan en violeta en tiempo real mediante HighlightedTextarea (CSS Grid de dos capas). Cursor y selección son completamente funcionales.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-04-15-03',
    date: '2026-04-15',
    type: 'improvement',
    title: 'Nombre de alumno con apellido primero y sort corregido',
    description:
      'La matriz muestra "Apellido Nombre". Sort por defecto: apellido ascendente. Se corrigió bug donde el toggle asc/desc no funcionaba por anidar setSortDir dentro del updater de setSortKey.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-04-15-04',
    date: '2026-04-15',
    type: 'fix',
    title: 'Error SQL jsonb_array_length incompatible con MariaDB',
    description:
      'El endpoint de alumnos transferidos usaba sintaxis PostgreSQL (jsonb_array_length/::jsonb) causando SQLSTATE[42000] en MariaDB. Se reemplazó con JSON_LENGTH(), compatible con MySQL 5.7+ y MariaDB 10.2+.',
    scope: 'general',
    filesModified: ['app/Http/Controllers/Api/StudentAssignmentController.php'],
  },
  {
    id: '2026-04-15-05',
    date: '2026-04-15',
    type: 'fix',
    title: 'Actividades de Moodle no se cargaban para cursos sin promedio',
    description:
      'Las actividades solo se consultaban si rawgrade !== null. Se eliminó esa restricción y se añadieron campos rawgrade y max_grade a cada actividad para cálculos numéricos en el frontend.',
    scope: 'general',
    filesModified: ['app/Services/StudentGradesService.php'],
  },

  // ── Abril 13, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-04-13-01',
    date: '2026-04-13',
    type: 'feat',
    title: 'Ordenamiento por columna y exportación a Excel en calificaciones',
    description:
      'Ordenamiento ascendente/descendente por Apellido, Nombre, Matrícula o cualquier columna de calificación. Exportación a Excel (.xlsx) con modal de selección de columnas usando SheetJS.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-04-13-02',
    date: '2026-04-13',
    type: 'feat',
    title: 'Modo mantenimiento con banner configurable',
    description:
      'Los administradores pueden activar modo mantenimiento y editar el mensaje desde configuración. Un banner global (MaintenanceBanner) muestra el aviso a todos los usuarios activos.',
    scope: 'general',
    filesModified: [
      'components/MaintenanceBanner.tsx',
      'app/Http/Controllers/Api/SiteConfigController.php',
    ],
  },
  {
    id: '2026-04-13-03',
    date: '2026-04-13',
    type: 'feat',
    title: 'Rebalanceo automático de cohortes Moodle al actualizar módulos',
    description:
      'Al cambiar los módulos de una carrera, el backend rebalancea automáticamente las cohortes de Moodle para los alumnos afectados.',
    scope: 'general',
    filesModified: ['app/Services/Moodle/MoodleService.php'],
  },

  // ── Abril 10, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-04-10-01',
    date: '2026-04-10',
    type: 'feat',
    title: 'Alumnos transferidos visibles en la matriz de calificaciones',
    description:
      'Se muestran alumnos con asignaciones inactivas (transferidos/dados de baja) al fondo de la tabla con resaltado rojo y badge "Ya no está en este grupo". Sus calificaciones se precargan junto con los activos.',
    scope: 'planteles',
    filesModified: [
      'app/(protected)/planteles/calificaciones/page.tsx',
      'app/Http/Controllers/Api/StudentAssignmentController.php',
    ],
  },

  // ── Abril 7, 2026 ───────────────────────────────────────────────────────
  {
    id: '2026-04-07-01',
    date: '2026-04-07',
    type: 'feat',
    title: 'Botón de sincronización manual con Moodle en calificaciones',
    description:
      'Botón "Sincronizar" en la barra superior de la matriz para forzar actualización de notas desde Moodle en tiempo real, con indicador de carga y toast de confirmación.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-04-07-02',
    date: '2026-04-07',
    type: 'fix',
    title: 'Duplicados en calificaciones al sincronizar con Moodle',
    description:
      'Al mezclar calificaciones de BD y Moodle se generaban registros duplicados por course_id. Se implementó un mapa indexado para garantizar unicidad en el merge.',
    scope: 'general',
    filesModified: ['app/Services/StudentGradesService.php'],
  },
  {
    id: '2026-04-07-03',
    date: '2026-04-07',
    type: 'improvement',
    title: 'Grupos en línea siempre incluidos en filtro de calificaciones',
    description:
      'Los grupos de modalidad en línea ahora aparecen en el selector independientemente del plantel seleccionado, ya que son globales por naturaleza.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },

  // ── Marzo 31, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-03-31-01',
    date: '2026-03-31',
    type: 'improvement',
    title: 'Optimización de generación de columnas de actividades',
    description:
      'Se simplificó la lógica de generación de columnas usando nombres de curso como identificadores primarios y se optimizó la deduplicación de columnas.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-03-31-02',
    date: '2026-03-31',
    type: 'improvement',
    title: 'Formateo de valores en logs de estudiante',
    description:
      'StudentLogs ahora serializa correctamente valores complejos (objetos, arrays) en el historial de cambios, con mejor manejo de campos nulos.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/estudiantes/[...slug]/StudentLogs.tsx'],
  },

  // ── Marzo 30, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-03-30-01',
    date: '2026-03-30',
    type: 'feat',
    title: 'Reemplazo dinámico de variables en plantillas WhatsApp',
    description:
      'El panel de WhatsApp soporta variables dinámicas como {{nombre}}, {{calificaciones}} y {{materia_actividad}} que se reemplazan con datos reales del alumno al copiar o enviar.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-03-30-02',
    date: '2026-03-30',
    type: 'improvement',
    title: 'Refactorización del módulo de calificaciones',
    description:
      'Se modularizó CalificacionesPage extrayendo helpers, badges de estado y gestión de estado optimizada para mejorar mantenibilidad.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-03-30-03',
    date: '2026-03-30',
    type: 'fix',
    title: 'Actividades incluidas correctamente en sync a Moodle',
    description:
      'Al llamar getBatchGrades con syncMoodle=true, las actividades y su conteo ahora se incluyen en el merge, evitando que se perdieran en sincronizaciones subsecuentes.',
    scope: 'general',
    filesModified: ['app/Services/StudentGradesService.php'],
  },

  // ── Marzo 28, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-03-28-01',
    date: '2026-03-28',
    type: 'feat',
    title: 'Almacenamiento persistente de calificaciones (JSONB)',
    description:
      'Las calificaciones sincronizadas desde Moodle se guardan en grades de StudentAssignment (JSONB), reduciendo llamadas a Moodle en cargas subsecuentes.',
    scope: 'general',
    filesModified: [
      'app/Http/Controllers/Api/StudentAssignmentController.php',
      'app/Services/StudentGradesService.php',
    ],
  },
  {
    id: '2026-03-28-02',
    date: '2026-03-28',
    type: 'fix',
    title: 'Cancelación de fetch al desmontar componente de calificaciones',
    description:
      'Se agregó verificación de componente activo para prevenir actualizaciones de estado después del desmontaje al navegar fuera de la pantalla.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },

  // ── Marzo 27, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-03-27-01',
    date: '2026-03-27',
    type: 'feat',
    title: 'Panel WhatsApp con generación y envío de mensajes desde calificaciones',
    description:
      'Panel con plantillas configurables, generación de mensaje por alumno y botones para copiar o abrir en WhatsApp directamente desde la matriz de calificaciones.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-03-27-02',
    date: '2026-03-27',
    type: 'feat',
    title: 'Último acceso a Moodle visible en perfil del alumno',
    description:
      'Se agregó endpoint dedicado en backend y visualización de la última actividad del alumno en Moodle dentro de su ficha de perfil.',
    scope: 'planteles',
    filesModified: [
      'app/(protected)/planteles/estudiantes/[...slug]/page.tsx',
      'app/Http/Controllers/Api/StudentAssignmentController.php',
    ],
  },

  // ── Marzo 24, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-03-24-01',
    date: '2026-03-24',
    type: 'feat',
    title: 'Gestión de plantillas WhatsApp y etiquetas de alumnos',
    description:
      'CRUD completo de plantillas WhatsApp y selector de tags para segmentar envíos por tipo de alumno.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/calificaciones/page.tsx'],
  },
  {
    id: '2026-03-24-02',
    date: '2026-03-24',
    type: 'feat',
    title: 'Endpoint de calificaciones batch sin actividades',
    description:
      'Endpoint para cargar calificaciones en lote con opción de excluir actividades, acelerando la carga inicial de la matriz cuando solo se necesitan promedios.',
    scope: 'general',
    filesModified: ['app/Http/Controllers/Api/StudentGradesController.php'],
  },

  // ── Marzo 18, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-03-18-01',
    date: '2026-03-18',
    type: 'fix',
    title: 'Validación de Moodle ID antes de actualizar cohortes',
    description:
      'Se verifica moodle_id del alumno antes de operaciones de cohorte, previniendo errores 500 silenciosos en sincronización.',
    scope: 'general',
    filesModified: ['app/Http/Controllers/Api/StudentAssignmentController.php'],
  },
  {
    id: '2026-03-18-02',
    date: '2026-03-18',
    type: 'fix',
    title: 'Campo carrera_id corregido en validaciones de asignaciones',
    description:
      'Se corrigieron errores tipográficos en carrera_id en validaciones y consultas, y se normalizó la carga útil de carrera.',
    scope: 'general',
    filesModified: ['app/Http/Controllers/Api/StudentAssignmentController.php'],
  },
  {
    id: '2026-03-18-03',
    date: '2026-03-18',
    type: 'fix',
    title: 'Valor nulo de carrera en formulario de asignación',
    description:
      'Mejor manejo de valor nulo para el campo de carrera en el formulario de asignación, previniendo errores de validación.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/estudiantes/student-form.tsx'],
  },

  // ── Marzo 13, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-03-13-01',
    date: '2026-03-13',
    type: 'feat',
    title: 'Re-sincronización de asignaciones individuales con Moodle',
    description:
      'Endpoint para forzar re-sincronización de una asignación específica con Moodle, útil para corregir inconsistencias sin afectar a todos los alumnos.',
    scope: 'general',
    filesModified: ['app/Http/Controllers/Api/StudentAssignmentController.php'],
  },
  {
    id: '2026-03-13-02',
    date: '2026-03-13',
    type: 'improvement',
    title: 'Renombrado de StudentPeriod a StudentAssignment',
    description:
      'Se renombró el componente StudentPeriod a StudentAssignment para mayor claridad semántica, eliminando el archivo legacy.',
    scope: 'planteles',
    filesModified: ['app/(protected)/planteles/estudiantes/[...slug]/StudentAssignment.tsx'],
  },

  // ── Marzo 11, 2026 ──────────────────────────────────────────────────────
  {
    id: '2026-03-11-01',
    date: '2026-03-11',
    type: 'feat',
    title: 'Integración con Google Contacts',
    description:
      'Sincronización de contactos con Google Contacts mediante OAuth. La lógica de API se movió al backend para seguridad; el frontend maneja solo la UI de autenticación.',
    scope: 'general',
    filesModified: [
      'app/Http/Controllers/Api/GoogleContactsController.php',
      'app/(protected)/dashboard/google-contacts/page.tsx',
    ],
  },
  {
    id: '2026-03-11-02',
    date: '2026-03-11',
    type: 'fix',
    title: 'Manejo de errores en sesión múltiple de Google y URL dinámica',
    description:
      'Corrección de errores al sincronizar con múltiples cuentas Google y URL de redirección dinámica según entorno (local/producción).',
    scope: 'general',
    filesModified: [
      'app/Http/Controllers/Api/GoogleContactsController.php',
      'config/services.php',
    ],
  },

  // ── Marzo 6, 2026 (entradas previas conservadas) ─────────────────────────
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
      'El guardado de asistencia ahora devuelve IDs procesados por alumno y el frontend sincroniza attendanceIds, corrigiendo el error de "asistencia no encontrada" al editar notas.',
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
      'Se ajustó el parseo de fechas para evitar corrimiento al día anterior por conversiones UTC cuando los registros llegan como YYYY-MM-DD o con sufijo de zona horaria.',
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
];

const typeLabel: Record<ChangeType, string> = {
  feat: 'Nuevo',
  fix: 'Corrección',
  improvement: 'Mejora',
};

const typeEmoji: Record<ChangeType, string> = {
  feat: '✨',
  fix: '🔧',
  improvement: '💪',
};

/** Convierte una entrada en texto WhatsApp-Markdown (*negrita* = un asterisco) */
function itemToMarkdown(item: ChangelogItem): string {
  const emoji = typeEmoji[item.type];
  const label = typeLabel[item.type];
  return [
    `${emoji} *${label}* _${item.scope}_`,
    `*${item.title}*`,
    item.description,
  ].join('\n');
}

/** Convierte todas las entradas de un día en un bloque WhatsApp-Markdown */
function dayToMarkdown(date: string, items: ChangelogItem[]): string {
  const header = `*📅 ${date}*`;
  const body = items.map(itemToMarkdown).join('\n\n');
  return `${header}\n\n${body}`;
}

/** Botón de copiar con feedback visual temporal */
function CopyButton({ getText, label = 'Copiar' }: { getText: () => string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  }, [getText]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
        copied
          ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
          : 'border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary'
      }`}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copiado' : label}
    </button>
  );
}

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{dateKey}</CardTitle>
              <CopyButton
                label="Copiar día"
                getText={() => dayToMarkdown(dateKey, groupedByDate[dateKey])}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {groupedByDate[dateKey].map((item) => (
              <div
                key={item.id}
                className="border rounded-md px-3 py-2 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{typeLabel[item.type]}</Badge>
                    <Badge variant="secondary">{item.scope}</Badge>
                  </div>
                  <CopyButton getText={() => itemToMarkdown(item)} />
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
