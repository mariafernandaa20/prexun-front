'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Search,
  MessageCircle,
  Copy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import axiosInstance from '@/lib/api/axiosConfig';
import { getGrupos, getCampuses, getPeriods } from '@/lib/api';
import { Grupo, Campus, Period } from '@/lib/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import { useUIConfig } from '@/hooks/useUIConfig';

/* ─── Tipos ──────────────────────────────────────────────────────────────── */

interface Student {
  id: number | string;
  firstname: string;
  lastname: string;
  email: string;
  matricula: string | null;
  phone?: string;
  transferred?: boolean;
  transferred_grades?: Grade[];
}

interface Activity {
  name: string;
  grade: string;
  rawgrade?: number | null;
  max_grade?: number | null;
  percentage?: string | null;
}

interface Grade {
  student_id: number | string;
  course_name: string;
  grade: number | string;
  final_grade?: number;
  rawgrade?: number;
  course_fullname?: string;
  name?: string;
  course_id?: number | string;
  activities?: Activity[];
  activities_count?: number;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

/* ─── Templates WhatsApp ─────────────────────────────────────────────────── */

const whatsappTemplates: MessageTemplate[] = [
  {
    id: 'resumen',
    name: 'Resumen general',
    content:
      'Hola {{nombre}}, te compartimos tu avance:\n\n{{calificaciones}}\n\n¡Sigue esforzándote!',
  },
  {
    id: 'seguimiento',
    name: 'Seguimiento académico',
    content:
      'Hola {{nombre}}, este es el seguimiento de tus calificaciones:\n\n{{calificaciones}}\n\nPor favor contáctanos si tienes alguna duda.',
  },
  {
    id: 'felicitacion',
    name: 'Felicitación',
    content:
      'Hola {{nombre}}, ¡excelente trabajo en este periodo!\n\n{{calificaciones}}\n\nEstamos muy orgullosos de tu progreso.',
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function gradeValue(g: Grade): number | null {
  const raw = g.final_grade ?? g.rawgrade ?? g.grade;
  if (raw == null || raw === 'N/A' || raw === '-') return null;
  const n = parseFloat(String(raw));
  return isNaN(n) ? null : n;
}

/** Convierte el nombre de una actividad/materia en un nombre de variable válido.
 *  Ej: "Acción Indirecta 1" → "accion_indirecta_1"
 */
function toVarName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')     // reemplazar caracteres no válidos con _
    .replace(/^_+|_+$/g, '');         // trim de _
}

type EstatusType = 'aprobado' | 'reprobado' | 'alerta' | 'no_presento' | 'pendiente';

function calcEstatus(cal1: number | null, cal2: number | null): EstatusType {
  if (cal1 === null && cal2 === null) return 'no_presento';
  if (cal1 === null || cal2 === null) return 'alerta';
  const prom = (cal1 + cal2) / 2;
  if (prom >= 60) return 'aprobado';
  if (prom < 60) return 'reprobado';
  return 'pendiente';
}

const EstatusBadge = ({ estatus }: { estatus: EstatusType }) => {
  const map: Record<EstatusType, { label: string; cls: string; icon: React.ReactNode }> = {
    aprobado: { label: 'Aprobado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400', icon: <CheckCircle2 className="w-3 h-3" /> },
    reprobado: { label: 'Reprobado', cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400', icon: <XCircle className="w-3 h-3" /> },
    alerta: { label: '⚠ Sin datos', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400', icon: <AlertTriangle className="w-3 h-3" /> },
    no_presento: { label: 'No presentó', cls: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400', icon: <XCircle className="w-3 h-3" /> },
    pendiente: { label: 'Pendiente', cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400', icon: <Clock className="w-3 h-3" /> },
  };
  const { label, cls, icon } = map[estatus];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {icon} {label}
    </span>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
   Componente principal
   ────────────────────────────────────────────────────────────────────────── */

export default function CalificacionesPage() {
  const [isMounted, setIsMounted] = useState(false);

  const [planteles, setPlanteles] = useState<Campus[]>([]);
  const [selectedPlantelId, setSelectedPlantelId] = useState<string>('');
  const [periodos, setPeriodos] = useState<Period[]>([]);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<string>('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [transferredStudents, setTransferredStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string | number, Grade[]>>({});
  const [loadingPlanteles, setLoadingPlanteles] = useState(true);
  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('resumen');
  const [messageDraft, setMessageDraft] = useState<string>('');
  const [syncingMoodle, setSyncingMoodle] = useState(false);
  const [isInitializedData, setIsInitializedData] = useState(false);
  const [showWaPanel, setShowWaPanel] = useState(true);

  // ── Sort ────────────────────────────────────────────────────────────────
  type SortKey = 'lastname' | 'firstname' | 'matricula' | string; // string = colId
  const [sortKey, setSortKey] = useState<SortKey>('lastname');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      // Misma columna → invertir dirección
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      // Nueva columna → ascendente por defecto
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  // ── Export modal ─────────────────────────────────────────────────────────
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportCols, setSelectedExportCols] = useState<Set<string>>(new Set());

  const { user } = useAuthStore();
  const { activeCampus } = useActiveCampusStore();
  const { config: uiConfig } = useUIConfig();
  const { toast } = useToast();

  /* ── Template draft sync ─────────────────────────────────────────────── */
  useEffect(() => {
    const template = whatsappTemplates.find((t) => t.id === selectedTemplateId) || whatsappTemplates[0];
    setMessageDraft(template.content);
  }, [selectedTemplateId]);

  /* ── Inicialización desde localStorage ───────────────────────────────── */
  useEffect(() => {
    if (!isMounted) { setIsMounted(true); return; }

    let plantelId = selectedPlantelId || localStorage.getItem('calificaciones_plantelId') || '';
    let periodoId = selectedPeriodoId || localStorage.getItem('calificaciones_periodoId') || '';
    let grupoId = selectedGrupoId || localStorage.getItem('calificaciones_grupoId') || '';

    if (!plantelId) {
      if (activeCampus?.id) plantelId = activeCampus.id.toString();
      else if (user?.campuses?.length) plantelId = user.campuses[0].id?.toString() || '';
    }

    if (periodos.length > 0) {
      const jun2026 = periodos.find((p) => p.name?.toUpperCase().replace(/\s+/g, '').includes('JUN2026'));
      if (jun2026) periodoId = jun2026.id.toString();
      else if (!periodoId && uiConfig?.default_period_id) periodoId = uiConfig.default_period_id.toString();
    }

    if (plantelId && plantelId !== selectedPlantelId) setSelectedPlantelId(plantelId);
    if (periodoId && periodoId !== selectedPeriodoId) setSelectedPeriodoId(periodoId);
    if (grupoId && grupoId !== selectedGrupoId) setSelectedGrupoId(grupoId);
    if (plantelId && periodoId && !isInitializedData) setIsInitializedData(true);
  }, [isMounted, user, activeCampus, uiConfig, periodos]);

  /* ── Fetch planteles ─────────────────────────────────────────────────── */
  useEffect(() => {
    getCampuses()
      .then(setPlanteles)
      .catch(console.error)
      .finally(() => setLoadingPlanteles(false));
  }, []);

  /* ── Fetch periodos ──────────────────────────────────────────────────── */
  useEffect(() => {
    getPeriods()
      .then(setPeriodos)
      .catch(console.error)
      .finally(() => setLoadingPeriodos(false));
  }, []);

  /* ── Fetch grupos ────────────────────────────────────────────────────── */
  useEffect(() => {
    const params: Record<string, any> = {};
    if (selectedPlantelId) params.plantel_id = selectedPlantelId;
    if (selectedPeriodoId) params.period_id = selectedPeriodoId;
    getGrupos(params)
      .then((res) => { setGrupos(res.sort((a, b) => a.name.localeCompare(b.name))); setIsInitialized(true); })
      .catch(() => setIsInitialized(true));
  }, [selectedPlantelId, selectedPeriodoId]);

  /* ── Persistir selecciones ───────────────────────────────────────────── */
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('calificaciones_plantelId', selectedPlantelId); }, [selectedPlantelId]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('calificaciones_periodoId', selectedPeriodoId); }, [selectedPeriodoId]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('calificaciones_grupoId', selectedGrupoId); }, [selectedGrupoId]);

  /* ── Validar selecciones contra datos disponibles ────────────────────── */
  useEffect(() => {
    if (!isInitialized || loadingPlanteles || loadingPeriodos) return;
    if (selectedPlantelId && !planteles.find((p) => p.id?.toString() === selectedPlantelId)) {
      setSelectedPlantelId(''); localStorage.removeItem('calificaciones_plantelId');
    }
    if (selectedPeriodoId && !periodos.find((p) => p.id === selectedPeriodoId)) {
      setSelectedPeriodoId(''); localStorage.removeItem('calificaciones_periodoId');
    }
    if (selectedGrupoId && !grupos.find((g) => g.id?.toString() === selectedGrupoId)) {
      setSelectedGrupoId(''); localStorage.removeItem('calificaciones_grupoId');
    }
  }, [isInitialized, loadingPlanteles, loadingPeriodos, planteles, periodos, grupos]);

  /* ── Fetch students + grades ─────────────────────────────────────────── */
  useEffect(() => {
    if (!selectedPlantelId || !selectedPeriodoId) return;
    let active = true;

    const fetchGradesInBackground = async (studentsData: Student[], sync: boolean) => {
      if (!studentsData.length) return;
      if (sync) setSyncingMoodle(true);
      try {
        const res = await axiosInstance.post('/students/batch-grades', {
          student_ids: studentsData.map((s) => s.id),
          period_id: selectedPeriodoId,
          sync_moodle: sync,
        });
        if (active && res.data && typeof res.data === 'object') setGrades(res.data);
      } catch (err) {
        console.error('Error batch grades:', err);
        if (active && !sync) setGrades({});
      } finally {
        if (active && sync) setSyncingMoodle(false);
      }
    };

    const fetchStudents = async () => {
      setLoadingEstudiantes(true);
      setStudents([]); setGrades({}); setTransferredStudents([]);
      try {
        const res = await axiosInstance.get(`/student-assignments/students-by-period/${selectedPeriodoId}`, {
          params: { campus_id: selectedPlantelId, grupo: selectedGrupoId || undefined, perPage: 1000 },
        });
        if (!active) return;
        let data: Student[] = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (res.data?.data) data = res.data.data;
        else if (res.data?.students) data = res.data.students;
        setStudents(data);

        // Alumnos transferidos (ya no en el grupo pero con calificaciones)
        const transferred: Student[] = res.data?.transferred_students ?? [];
        setTransferredStudents(transferred);

        // Pre-cargar calificaciones de transferidos desde el JSONB ya incluido
        if (transferred.length > 0) {
          const preloadedGrades: Record<string | number, Grade[]> = {};
          transferred.forEach((s) => {
            if (s.transferred_grades && s.transferred_grades.length > 0) {
              preloadedGrades[s.id] = s.transferred_grades;
            }
          });
          if (Object.keys(preloadedGrades).length > 0) {
            setGrades((prev) => ({ ...prev, ...preloadedGrades }));
          }
        }

        if (data.length > 0) {
          fetchGradesInBackground(data, false).finally(() => { if (active) fetchGradesInBackground(data, true); });
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        if (active) setStudents([]);
      } finally {
        if (active) setLoadingEstudiantes(false);
      }
    };

    (window as any).syncMoodleGrades = () => { if (students.length > 0) fetchGradesInBackground(students, true); };
    fetchStudents();
    return () => { active = false; };
  }, [selectedPlantelId, selectedPeriodoId, selectedGrupoId]);

  /* ── Datos derivados ─────────────────────────────────────────────────── */

  const filteredGrupos = useMemo(() => {
    if (!selectedPlantelId || !selectedPeriodoId) return [];
    return grupos.filter((g) => {
      const matchPeriodo = String(g.period_id) === String(selectedPeriodoId);
      const matchPlantel =
        (g.plantel_id ? String(g.plantel_id) === String(selectedPlantelId) : false) ||
        (Array.isArray(g.campuses) ? g.campuses.some((c) => String(c.id) === String(selectedPlantelId)) : false);

      const groupType = String(g.type || '').toLowerCase();
      const isOnlineGroup =
        groupType.includes('linea') ||
        groupType.includes('línea') ||
        groupType.includes('online');

      return (matchPlantel || isOnlineGroup) && matchPeriodo && (g.active_assignments_count || 0) > 0;
    });
  }, [selectedPlantelId, selectedPeriodoId, grupos]);

  /**
   * Columnas de la matriz:
   * - Si hay actividades en algún curso → expandir actividades individuales agrupadas por curso.
   * - Si no hay actividades → una columna por curso (comportamiento anterior).
   */
  const matrixColumns = useMemo(() => {
    // ─ Paso 1: qué cursos tienen actividades en CUALQUIER alumno, por nombre
    const courseNamesWithActivities = new Set<string>();
    Object.values(grades).forEach((sg) =>
      sg.forEach((g) => {
        if (g.activities && g.activities.length > 0) {
          const courseName = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
          courseNamesWithActivities.add(courseName);
        }
      })
    );

    // Verificar si algún alumno tiene actividades cargadas (usando el tamaño del Set)
    const hasActivities = courseNamesWithActivities.size > 0;

    if (hasActivities) {
      type ActivityCol = { id: string; courseId: string; courseName: string; name: string; isActivity: true };
      type CourseCol = { id: string; courseId: string; courseName: string; name: string; isActivity: false };
      type MatrixCol = ActivityCol | CourseCol;

      const seen = new Map<string, MatrixCol>();
      Object.values(grades).forEach((sg) =>
        sg.forEach((g) => {
          const courseName = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
          if (courseName === 'Curso desconocido') return;

          if (g.activities && g.activities.length > 0) {
            g.activities.forEach((act) => {
              const colId = `${courseName}::${act.name}`;
              if (!seen.has(colId)) {
                // Usamos courseName como el 'id' lógico del curso dentro del col
                seen.set(colId, { id: colId, courseId: courseName, courseName, name: act.name, isActivity: true });
              }
            });
          } else if (!courseNamesWithActivities.has(courseName) && !seen.has(courseName)) {
            // Solo añadir columna genérica si ESTE nombre de curso no tiene ninguna actividad reportada
            seen.set(courseName, { id: courseName, courseId: courseName, courseName, name: courseName, isActivity: false });
          }
        })
      );
      return Array.from(seen.values());
    }

    // Sin actividades en absoluto en el grado: columnas por curso normal (usando el nombre)
    const seen = new Map<string, { id: string; courseId: string; courseName: string; name: string; isActivity: false }>();
    Object.values(grades).forEach((sg) =>
      sg.forEach((g) => {
        const name = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
        if (name !== 'Curso desconocido' && !seen.has(name)) {
          seen.set(name, { id: name, courseId: name, courseName: name, name, isActivity: false });
        }
      })
    );
    return Array.from(seen.values());
  }, [grades]);

  /** Grupos de columnas por curso (para mostrar sub-cabecera agrupada) */
  const columnGroups = useMemo(() => {
    const groups: { courseName: string; count: number }[] = [];
    let prev = '';
    matrixColumns.forEach((col) => {
      if (col.courseName !== prev) {
        groups.push({ courseName: col.courseName, count: 1 });
        prev = col.courseName;
      } else {
        groups[groups.length - 1].count++;
      }
    });
    return groups;
  }, [matrixColumns]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = students.filter((s) =>
      `${s.firstname} ${s.lastname}`.toLowerCase().includes(q) ||
      String(s.matricula || s.id).toLowerCase().includes(q)
    );

    return [...filtered].sort((a, b) => {
      let valA = '';
      let valB = '';
      if (sortKey === 'lastname') { valA = a.lastname; valB = b.lastname; }
      else if (sortKey === 'firstname') { valA = a.firstname; valB = b.firstname; }
      else if (sortKey === 'matricula') { valA = String(a.matricula || a.id); valB = String(b.matricula || b.id); }
      else {
        // columna de calificación: comparar por valor numérico
        const col = matrixColumns.find((c) => c.id === sortKey);
        if (col) {
          const getVal = (s: Student): number => {
            const sg = grades[s.id] || [];
            const gradeByCourseName = new Map<string, Grade>();
            sg.forEach((g) => {
              const cName = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
              if (!gradeByCourseName.has(cName) || (g.activities && g.activities.length > 0)) gradeByCourseName.set(cName, g);
            });
            const g = gradeByCourseName.get(col.courseName);
            if (col.isActivity) {
              const act = g?.activities?.find((a) => a.name === col.name);
              if (!act) return -Infinity;
              const v = act.rawgrade !== null && act.rawgrade !== undefined ? act.rawgrade : parseFloat(act.grade);
              return isNaN(v) ? -Infinity : v;
            }
            return g ? (gradeValue(g) ?? -Infinity) : -Infinity;
          };
          const diff = getVal(a) - getVal(b);
          return sortDir === 'asc' ? diff : -diff;
        }
      }
      const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [students, searchQuery, sortKey, sortDir, grades, matrixColumns]);

  const filteredTransferred = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = transferredStudents.filter((s) =>
      `${s.firstname} ${s.lastname}`.toLowerCase().includes(q) ||
      String(s.matricula || s.id).toLowerCase().includes(q)
    );
    return [...filtered].sort((a, b) => {
      if (sortKey === 'lastname') return sortDir === 'asc' ? a.lastname.localeCompare(b.lastname, 'es') : b.lastname.localeCompare(a.lastname, 'es');
      if (sortKey === 'firstname') return sortDir === 'asc' ? a.firstname.localeCompare(b.firstname, 'es') : b.firstname.localeCompare(a.firstname, 'es');
      return 0;
    });
  }, [transferredStudents, searchQuery, sortKey, sortDir]);

  /* Stats del grupo */
  const stats = useMemo(() => {
    if (!students.length || !Object.keys(grades).length) return null;
    let aprobados = 0, reprobados = 0, alertas = 0, noPresentaron = 0;
    students.forEach((s) => {
      const sg = grades[s.id] || [];
      const vals = sg.map(gradeValue);
      const cal1 = vals[0] ?? null;
      const cal2 = vals[1] ?? null;
      const est = calcEstatus(cal1, cal2);
      if (est === 'aprobado') aprobados++;
      if (est === 'reprobado') reprobados++;
      if (est === 'alerta') alertas++;
      if (est === 'no_presento') noPresentaron++;
    });
    return { aprobados, reprobados, alertas, noPresentaron, total: students.length };
  }, [students, grades]);

  /* ── Export helpers ─────────────────────────────────────────────────── */

  /** Devuelve el valor de una celda para un alumno y una columna de la matriz */
  const getCellValue = useCallback((student: Student, col: typeof matrixColumns[0]): number | null => {
    const sg = grades[student.id] || [];
    const gradeByCourseName = new Map<string, Grade>();
    sg.forEach((g) => {
      const cName = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
      if (!gradeByCourseName.has(cName) || (g.activities && g.activities.length > 0)) gradeByCourseName.set(cName, g);
    });
    const g = gradeByCourseName.get(col.courseName);
    if (col.isActivity) {
      const act = g?.activities?.find((a) => a.name === col.name);
      if (!act) return null;
      const v = act.rawgrade !== null && act.rawgrade !== undefined ? act.rawgrade : parseFloat(act.grade);
      return isNaN(v) ? null : v;
    }
    return g ? gradeValue(g) : null;
  }, [grades]);

  const exportToExcel = useCallback(() => {
    const colsToExport = matrixColumns.filter((col) =>
      selectedExportCols.size === 0 || selectedExportCols.has(col.id)
    );

    const allStudents = [
      ...filteredStudents,
      ...filteredTransferred.map((s) => ({ ...s, _transferred: true })),
    ] as (Student & { _transferred?: boolean })[];

    const rows = allStudents.map((student) => {
      const row: Record<string, string | number> = {
        Apellido: student.lastname,
        Nombre: student.firstname,
        Matrícula: student.matricula || String(student.id),
      };
      if ((student as any)._transferred) row['Estado'] = 'Ya no está en el grupo';
      colsToExport.forEach((col) => {
        const colLabel = col.isActivity ? `${col.courseName} — ${col.name}` : col.courseName;
        const val = getCellValue(student, col);
        row[colLabel] = val !== null ? val : '';
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    const grupoNombre = grupos.find((g) => g.id.toString() === selectedGrupoId)?.name || 'grupo';
    XLSX.utils.book_append_sheet(wb, ws, grupoNombre.substring(0, 31));
    XLSX.writeFile(wb, `calificaciones_${grupoNombre}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setShowExportModal(false);
    toast({ title: 'Exportado', description: `${rows.length} alumnos exportados a Excel.` });
  }, [matrixColumns, selectedExportCols, filteredStudents, filteredTransferred, getCellValue, grupos, selectedGrupoId, toast]);

  /* ── WhatsApp helpers ────────────────────────────────────────────────── */
  const generateMessage = (student: Student) => {
    const sg = grades[student.id] || [];

    // Construir mapa de variable → valor para este alumno
    const vars: Record<string, string> = {};

    sg.forEach((g) => {
      const courseName = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
      if (courseName === 'Curso desconocido') return;
      const v = gradeValue(g);

      if (g.activities && g.activities.length > 0) {
        // Variable por actividad individual
        g.activities.forEach((act) => {
          const actVal = act.rawgrade !== null && act.rawgrade !== undefined
            ? Number(act.rawgrade).toFixed(2)
            : act.grade && act.grade !== '-' && act.grade !== 'N/A' ? act.grade : 'No presentó';
          vars[toVarName(act.name)] = actVal;
        });
        // Variable resumen del curso
        vars[toVarName(courseName)] = v !== null ? Number(v).toFixed(2) : 'No presentó';
      } else {
        vars[toVarName(courseName)] = v !== null ? Number(v).toFixed(2) : 'No presentó';
      }
    });

    // Variable especial {{nombre}}
    vars['nombre'] = `${student.firstname} ${student.lastname}`.trim();

    // Variable legacy {{calificaciones}} — mantener compatibilidad
    const lines: string[] = [];
    sg.forEach((g) => {
      const courseName = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
      if (courseName === 'Curso desconocido') return;
      const v = gradeValue(g);
      if (g.activities && g.activities.length > 0) {
        lines.push(`*${courseName}*`);
        g.activities.forEach((act) => {
          const actVal = act.rawgrade !== null && act.rawgrade !== undefined
            ? Number(act.rawgrade).toFixed(2)
            : act.grade && act.grade !== '-' ? act.grade : 'No presentó';
          lines.push(`  - ${act.name}: ${actVal}`);
        });
        if (v !== null) lines.push(`  → Promedio: ${Number(v).toFixed(2)}`);
      } else {
        lines.push(`- ${courseName}: ${v !== null ? Number(v).toFixed(2) : 'No presentó'}`);
      }
    });
    vars['calificaciones'] = lines.join('\n') || 'Sin calificaciones registradas.';

    // Reemplazar todas las variables {{var}} en el draft
    return messageDraft.replace(/\{\{([^}]+)\}\}/g, (_, key) => vars[key.trim()] ?? `{{${key}}}`);
  };

  const handleCopy = async (student: Student) => {
    try {
      await navigator.clipboard.writeText(generateMessage(student));
      toast({ title: 'Mensaje copiado', description: `Copiado para ${student.firstname}` });
    } catch {
      toast({ title: 'Error', variant: 'destructive', description: 'No se pudo copiar.' });
    }
  };

  const handleSend = (student: Student) => {
    const msg = generateMessage(student);
    const phone = student.phone ? student.phone.replace(/\D/g, '') : '';
    const num = phone.length === 10 ? `52${phone}` : phone;
    window.open(
      num
        ? `https://api.whatsapp.com/send?phone=${num}&text=${encodeURIComponent(msg)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="w-full flex-1 min-w-0 flex flex-col h-full overflow-hidden">

      {/* ══ Barra superior: Título + filtros en una sola línea ══════════════ */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-bold shrink-0 mr-2">Calificaciones</h1>

        {/* Plantel */}
        <Select
          value={selectedPlantelId}
          onValueChange={(v) => {
            setSelectedPlantelId(v);
            setSelectedPeriodoId('');
            setSelectedGrupoId('');
            setStudents([]);
            setGrades({});
          }}
          disabled={loadingPlanteles}
        >
          <SelectTrigger className="h-8 text-sm w-36">
            <SelectValue placeholder="Plantel" />
          </SelectTrigger>
          <SelectContent>
            {planteles.map((p) => (
              <SelectItem key={p.id} value={p.id?.toString() || ''}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Período */}
        <Select
          value={selectedPeriodoId}
          onValueChange={(v) => { setSelectedPeriodoId(v); setSelectedGrupoId(''); setStudents([]); setGrades({}); }}
          disabled={loadingPeriodos || !selectedPlantelId}
        >
          <SelectTrigger className="h-8 text-sm w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {periodos.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Grupo */}
        <Select
          value={selectedGrupoId}
          onValueChange={setSelectedGrupoId}
          disabled={!selectedPlantelId || !selectedPeriodoId}
        >
          <SelectTrigger className="h-8 text-sm w-44">
            <SelectValue placeholder={filteredGrupos.length === 0 ? 'Sin grupos' : 'Grupo'} />
          </SelectTrigger>
          <SelectContent>
            {filteredGrupos.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>
                {g.name} {g.type ? `(${g.type})` : ''} · {g.active_assignments_count || 0} alumnos
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Búsqueda */}
        {selectedGrupoId && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar alumno..."
              className="pl-7 h-8 text-sm w-44"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Acciones de sincronización */}
        {selectedGrupoId && (
          <div className="flex items-center gap-2">
            {syncingMoodle ? (
              <span className="flex items-center text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1.5 rounded-full animate-pulse border">
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Sincronizando…
              </span>
            ) : (
              <button
                onClick={() => {
                  if (typeof (window as any).syncMoodleGrades === 'function') {
                    (window as any).syncMoodleGrades();
                  }
                }}
                className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-2.5 py-1.5 rounded-full border transition-colors"
                title="Sincronizar con Moodle (Forzar actualización)"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Sincronizar
              </button>
            )}
          </div>
        )}

        {/* Botones panel WA + exportar */}
        {selectedGrupoId && Object.keys(grades).length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            {/* Exportar Excel */}
            <button
              onClick={() => {
                // Pre-seleccionar todas las columnas si no hay selección
                if (selectedExportCols.size === 0) {
                  setSelectedExportCols(new Set(matrixColumns.map((c) => c.id)));
                }
                setShowExportModal(true);
              }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Exportar Excel
            </button>

            {/* WhatsApp masivo */}
            <button
              onClick={() => setShowWaPanel((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${showWaPanel
                ? 'bg-[#25D366] text-white border-[#25D366]'
                : 'border-border hover:border-[#25D366] hover:text-[#25D366]'
                }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp masivo
            </button>
          </div>
        )}
      </div>

      {/* ══ Panel de WhatsApp (colapsable, bajo barra) ═══════════════════════ */}
      {showWaPanel && selectedGrupoId && (
        <div className="border-b bg-muted/30 dark:bg-muted/10 px-4 py-3 flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-1/4">
            <p className="text-xs font-medium mb-1 text-muted-foreground">Plantilla</p>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {whatsappTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Variables disponibles */}
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Variables disponibles</p>

              {/* Variables fijas */}
              <VarChip name="nombre" desc="Nombre completo" onInsert={(v) => setMessageDraft((d) => d + v)} />
              <VarChip name="calificaciones" desc="Todas (resumen)" onInsert={(v) => setMessageDraft((d) => d + v)} />

              {/* Variables por actividad/curso */}
              {matrixColumns.length > 0 && (
                <>
                  <p className="text-[10px] text-muted-foreground mt-1 pt-1 border-t">Por actividad:</p>
                  {matrixColumns.map((col) => (
                    <VarChip
                      key={col.id}
                      name={toVarName(col.name)}
                      desc={col.name}
                      onInsert={(v) => setMessageDraft((d) => d + v)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="w-full lg:flex-1">
            <p className="text-xs font-medium mb-1 text-muted-foreground">Borrador del mensaje</p>
            <HighlightedTextarea
              value={messageDraft}
              onChange={setMessageDraft}
            />
          </div>
        </div>
      )}

      {/* ══ Estadísticas rápidas ═══════════════════════════════════════════ */}
      {stats && (
        <div className="px-4 py-2 border-b flex gap-6 text-xs flex-wrap">

          <span className="ml-auto text-muted-foreground">
            <BarChart3 className="inline w-3.5 h-3.5 mr-1" />
            {stats.total} alumnos totales
          </span>
        </div>
      )}

      {/* ══ Estado vacío ════════════════════════════════════════════════════ */}
      {!selectedGrupoId && (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm p-8">
          Selecciona plantel, período y grupo para ver la matriz de calificaciones.
        </div>
      )}

      {selectedGrupoId && loadingEstudiantes && (
        <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          Cargando alumnos…
        </div>
      )}

      {selectedGrupoId && !loadingEstudiantes && students.length === 0 && (
        <div className="p-6">
          <Alert>
            <AlertDescription>
              No hay alumnos inscritos en este grupo.{' '}
              <strong>Grupo ID:</strong> {selectedGrupoId}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* ══ Modal de exportación ══════════════════════════════════════════════ */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-semibold">Exportar a Excel</h2>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-3">Selecciona las columnas que quieres incluir en el archivo. El alumno, nombre y matrícula siempre se incluyen.</p>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSelectedExportCols(new Set(matrixColumns.map((c) => c.id)))}
                className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
              >Seleccionar todo</button>
              <button
                onClick={() => setSelectedExportCols(new Set())}
                className="text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
              >Deseleccionar todo</button>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
              {matrixColumns.map((col) => (
                <label key={col.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedExportCols.has(col.id)}
                    onChange={(e) => {
                      setSelectedExportCols((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(col.id);
                        else next.delete(col.id);
                        return next;
                      });
                    }}
                    className="rounded"
                  />
                  <span className="text-xs flex flex-col">
                    <span className="font-medium">{col.isActivity ? col.name : col.courseName}</span>
                    {col.isActivity && <span className="text-muted-foreground">{col.courseName}</span>}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
              >Cancelar</button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar ({selectedExportCols.size === 0 ? matrixColumns.length : selectedExportCols.size} columnas)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MATRIZ DE CALIFICACIONES ════════════════════════════════════════ */}
      {selectedGrupoId && !loadingEstudiantes && students.length > 0 && (
        <div className="flex-1 overflow-auto relative border rounded-md min-h-0 max-h-[calc(100vh-180px)] scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-[5] bg-background border-b">
              {/* Fila 1: identificadores + grupos de cursos */}
              <tr className="border-b border-muted">
                {/* Columna Alumno: sorteable por apellido / nombre */}
                <th rowSpan={2} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap border-r bg-muted/60 dark:bg-muted/30 sticky left-0 z-10 min-w-[160px]">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleSort('lastname')}
                      className="flex items-center gap-1 text-xs hover:text-foreground transition-colors"
                    >
                      Apellido
                      {sortKey === 'lastname'
                        ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                        : <ChevronsUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                    <button
                      onClick={() => handleSort('firstname')}
                      className="flex items-center gap-1 text-xs hover:text-foreground transition-colors"
                    >
                      Nombre
                      {sortKey === 'firstname'
                        ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                        : <ChevronsUpDown className="w-3 h-3 opacity-40" />}
                    </button>
                  </div>
                </th>
                <th rowSpan={2} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap border-r bg-muted/60 dark:bg-muted/30 w-24">
                  <button
                    onClick={() => handleSort('matricula')}
                    className="flex items-center gap-1 text-xs hover:text-foreground transition-colors"
                  >
                    Matrícula
                    {sortKey === 'matricula'
                      ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                      : <ChevronsUpDown className="w-3 h-3 opacity-40" />}
                  </button>
                </th>

                {/* Grupos de cursos (colspan por cuantas actividades tiene) */}
                {columnGroups.map((grp) => (
                  <th
                    key={grp.courseName}
                    colSpan={grp.count}
                    className="px-2 py-1.5 text-center text-[10px] font-bold text-foreground border-r border-b border-muted bg-muted/40 truncate max-w-[200px]"
                    title={grp.courseName}
                  >
                    {grp.courseName}
                  </th>
                ))}

                <th rowSpan={2} className="px-3 py-2 text-center font-semibold text-muted-foreground whitespace-nowrap min-w-[80px] bg-muted/60 dark:bg-muted/30">
                  Enviar
                </th>
              </tr>

              {/* Fila 2: nombre de cada actividad (sorteable) */}
              <tr>
                {matrixColumns.map((col) => (
                  <th
                    key={col.id}
                    className="px-2 py-1.5 text-center text-[10px] font-medium text-muted-foreground border-r min-w-[80px] bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors select-none"
                    title={`Ordenar por ${col.name}`}
                    onClick={() => handleSort(col.id)}
                  >
                    <span className="flex items-center justify-center gap-0.5">
                      <span className="block truncate max-w-[90px]">{col.name}</span>
                      {sortKey === col.id
                        ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />)
                        : <ChevronsUpDown className="w-3 h-3 shrink-0 opacity-30" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 && filteredTransferred.length === 0 ? (
                <tr>
                  <td colSpan={matrixColumns.length + 3} className="text-center py-12 text-muted-foreground">
                    No se encontraron resultados para &ldquo;{searchQuery}&rdquo;
                  </td>
                </tr>
              ) : (
                <>
                  {filteredStudents.map((student, rowIdx) => {
                    const sg = grades[student.id] || [];

                    // Mapear calificaciones del estudiante por NOMBRE de curso para agrupar visualmente
                    const gradeByCourseName = new Map<string, Grade>();
                    sg.forEach((g) => {
                      const cName = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
                      if (!gradeByCourseName.has(cName) || (g.activities && g.activities.length > 0)) {
                        gradeByCourseName.set(cName, g);
                      }
                    });

                    // Calcular estatus global basado en el promedio de TODAS las calificaciones
                    const allVals = sg.map(gradeValue).filter((v): v is number => v !== null);
                    const promedio = allVals.length > 0 ? allVals.reduce((a, b) => a + b, 0) / allVals.length : null;
                    const estatus: EstatusType =
                      sg.length === 0 ? 'no_presento'
                        : allVals.length === 0 ? 'no_presento'
                          : allVals.length < sg.filter(g => (g.course_name ?? g.name) !== 'Curso desconocido').length ? 'alerta'
                            : promedio! >= 60 ? 'aprobado'
                              : 'reprobado';

                    return (
                      <tr
                        key={student.id}
                        className={`border-b transition-colors hover:bg-muted/30 ${rowIdx % 2 === 0 ? '' : 'bg-muted/10'}`}
                      >
                        {/* Nombre */}
                        <td className="px-3 py-2 font-medium whitespace-nowrap border-r sticky left-0 bg-background z-[4]">
                          {student.lastname} {student.firstname}
                        </td>

                        {/* Matrícula */}
                        <td className="px-3 py-2 text-xs text-muted-foreground border-r whitespace-nowrap">
                          {student.matricula || student.id || '—'}
                        </td>

                        {/* Celda por columna */}
                        {matrixColumns.map((col) => {
                          const g = gradeByCourseName.get(col.courseName);

                          if (col.isActivity) {
                            const act = g?.activities?.find((a) => a.name === col.name);
                            if (!act) {
                              return (
                                <td key={col.id} className="px-2 py-2 border-r text-center">
                                  <CalCell value={null} isEmpty />
                                </td>
                              );
                            }
                            const actVal = act.rawgrade !== null && act.rawgrade !== undefined
                              ? act.rawgrade
                              : act.grade && act.grade !== '-' && act.grade !== 'N/A'
                                ? parseFloat(act.grade)
                                : null;
                            return (
                              <td key={col.id} className="px-2 py-2 border-r text-center">
                                <CalCell value={isNaN(actVal as number) ? null : actVal} />
                              </td>
                            );
                          }

                          if (!g) {
                            return (
                              <td key={col.id} className="px-2 py-2 border-r text-center">
                                <CalCell value={null} isEmpty />
                              </td>
                            );
                          }
                          return (
                            <td key={col.id} className="px-2 py-2 border-r text-center">
                              <CalCell value={gradeValue(g)} />
                            </td>
                          );
                        })}

                        {/* Botones de acción */}
                        <td className="px-3 py-2">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleCopy(student)}
                              title="Copiar mensaje"
                              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSend(student)}
                              title="Enviar WhatsApp"
                              className="p-1.5 rounded hover:bg-[#25D366]/10 transition-colors text-[#25D366]"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* ── Separador de alumnos transferidos ── */}
                  {filteredTransferred.length > 0 && (
                    <tr className="border-b border-red-300 dark:border-red-800">
                      <td
                        colSpan={matrixColumns.length + 3}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Alumnos que ya no están en este grupo — {filteredTransferred.length} {filteredTransferred.length === 1 ? 'alumno' : 'alumnos'}
                        </span>
                      </td>
                    </tr>
                  )}

                  {filteredTransferred.map((student) => {
                    const sg = grades[student.id] || student.transferred_grades || [];

                    const gradeByCourseName = new Map<string, Grade>();
                    sg.forEach((g) => {
                      const cName = g.course_name ?? g.course_fullname ?? g.name ?? 'Materia';
                      if (!gradeByCourseName.has(cName) || (g.activities && g.activities.length > 0)) {
                        gradeByCourseName.set(cName, g);
                      }
                    });

                    return (
                      <tr
                        key={`transferred-${student.id}`}
                        className="border-b border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/30 hover:bg-red-100/70 dark:hover:bg-red-950/50 transition-colors"
                      >
                        {/* Nombre con badge */}
                        <td className="px-3 py-2 font-medium whitespace-nowrap border-r sticky left-0 bg-red-50 dark:bg-red-950/40 z-[4]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-red-900 dark:text-red-200">{student.lastname} {student.firstname}</span>
                            <span className="text-[10px] font-normal text-red-500 dark:text-red-400 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Ya no está en este grupo
                            </span>
                          </div>
                        </td>

                        {/* Matrícula */}
                        <td className="px-3 py-2 text-xs text-red-400 dark:text-red-500 border-r whitespace-nowrap">
                          {student.matricula || student.id || '—'}
                        </td>

                        {/* Celdas de calificación */}
                        {matrixColumns.map((col) => {
                          const g = gradeByCourseName.get(col.courseName);

                          if (col.isActivity) {
                            const act = g?.activities?.find((a) => a.name === col.name);
                            if (!act) {
                              return (
                                <td key={col.id} className="px-2 py-2 border-r text-center">
                                  <CalCell value={null} isEmpty />
                                </td>
                              );
                            }
                            const actVal = act.rawgrade !== null && act.rawgrade !== undefined
                              ? act.rawgrade
                              : act.grade && act.grade !== '-' && act.grade !== 'N/A'
                                ? parseFloat(act.grade)
                                : null;
                            return (
                              <td key={col.id} className="px-2 py-2 border-r text-center">
                                <CalCell value={isNaN(actVal as number) ? null : actVal} />
                              </td>
                            );
                          }

                          if (!g) {
                            return (
                              <td key={col.id} className="px-2 py-2 border-r text-center">
                                <CalCell value={null} isEmpty />
                              </td>
                            );
                          }
                          return (
                            <td key={col.id} className="px-2 py-2 border-r text-center">
                              <CalCell value={gradeValue(g)} />
                            </td>
                          );
                        })}

                        {/* Botones de acción */}
                        <td className="px-3 py-2">
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleCopy(student)}
                              title="Copiar mensaje"
                              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-400 dark:text-red-500"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSend(student)}
                              title="Enviar WhatsApp"
                              className="p-1.5 rounded hover:bg-[#25D366]/10 transition-colors text-[#25D366]"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Componentes auxiliares ─────────────────────────────────────────────── */

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${colorMap[color] || ''}`}>
      <span className="text-lg font-bold leading-none">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function CalCell({
  value,
  isEmpty,
}: {
  value: number | null;
  isEmpty?: boolean;
}) {
  if (isEmpty || value === null) {
    return (
      <span className="inline-flex items-center justify-center w-11 h-7 rounded text-[11px] font-medium bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-500 dark:border-slate-700">
        —
      </span>
    );
  }

  const n = Number(value);
  const cls =
    n >= 60
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400';

  return (
    <span className={`inline-flex items-center justify-center w-11 h-7 rounded text-[11px] font-bold border ${cls}`}>
      {n % 1 === 0 ? n : n.toFixed(1)}
    </span>
  );
}

/** Chip de variable insertable: layout vertical con {{var}} arriba y descripción abajo */
function VarChip({
  name,
  desc,
  onInsert,
}: {
  name: string;
  desc?: string;
  onInsert: (v: string) => void;
}) {
  const varStr = `{{${name}}}`;
  return (
    <button
      type="button"
      onClick={() => onInsert(varStr)}
      title={`Insertar ${varStr}${desc ? ` — ${desc}` : ''}`}
      className="group flex flex-col items-start w-full text-left hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-md px-2 py-1.5 transition-colors border border-transparent hover:border-violet-200 dark:hover:border-violet-800"
    >
      <code className="text-[11px] bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 px-1.5 py-0.5 rounded font-mono group-hover:bg-violet-200 dark:group-hover:bg-violet-800/60 transition-colors">
        {varStr}
      </code>
      {desc && (
        <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{desc}</span>
      )}
    </button>
  );
}

/**
 * Textarea con resaltado de variables {{...}}.
 * Patrón de dos capas: div highlight visible (abajo) + textarea transparente (encima, editable).
 */
function HighlightedTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const toHtml = (text: string) => {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped
      .replace(/\{\{([^}]+)\}\}/g, '<mark class="wa-var">{{$1}}</mark>')
      .replace(/\n/g, '<br />');
  };

  // Estilos compartidos para alinear pixel-perfect div y textarea
  const shared: React.CSSProperties = {
    gridArea: '1 / 1',          // Misma celda del grid → se superponen
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    lineHeight: '1.5rem',
    padding: '0.5rem 0.75rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    minHeight: '250px',
    border: 'none',
    margin: 0,
    borderRadius: '0.375rem',
  };

  return (
    <>
      <style>{`
        .wa-var {
          background: rgba(139, 92, 246, 0.18);
          color: #7c3aed;
          border-radius: 3px;
          padding: 0 3px;
          font-weight: 700;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.82em;
          letter-spacing: -0.01em;
        }
        .dark .wa-var {
          background: rgba(167, 139, 250, 0.25);
          color: #a78bfa;
        }
        .wa-textarea-grid {
          display: grid;
        }
        .wa-textarea-grid textarea::selection {
          background: rgba(139, 92, 246, 0.25);
        }
      `}</style>

      {/* Wrapper con borde y ring de foco */}
      <div className="wa-textarea-grid rounded-md border bg-background focus-within:ring-2 focus-within:ring-violet-400/50 focus-within:border-violet-400 dark:focus-within:ring-violet-600/40 dark:focus-within:border-violet-600 transition-colors overflow-hidden">

        {/* Capa 1 — div de highlight (detrás, z-index menor) */}
        <div
          aria-hidden
          style={{ ...shared, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
          dangerouslySetInnerHTML={{ __html: toHtml(value) + '&nbsp;' }}
        />

        {/* Capa 2 — textarea real (encima, texto transparente, caret visible) */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          style={{
            ...shared,
            zIndex: 1,
            background: 'transparent',
            color: 'transparent',
            // caretColor EXPLÍCITO — no heredar 'transparent'
            caretColor: '#8b5cf6',
            WebkitTextFillColor: 'transparent',
            resize: 'vertical',
            outline: 'none',
            overflow: 'auto',
          }}
        />
      </div>
    </>
  );
}

