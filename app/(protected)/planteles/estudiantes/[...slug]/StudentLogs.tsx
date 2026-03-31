import SectionContainer from '@/components/SectionContainer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  getStudentEvents,
  getGrupos,
  getCampuses,
  getSemanas,
  getPeriods,
  getCarreras,
  getPromos,
  getMunicipios,
  getFacultades,
  getPrepas,
} from '@/lib/api';
import {
  Grupo,
  Campus,
  SemanaIntensiva, // Assuming this is exported or I'll use any if not
  Period,
  Carrera,
  Promocion,
  Municipio,
  Facultad,
  Prepa,
} from '@/lib/types';
import React, { useEffect, useState } from 'react';

interface LogEntry {
  id: string;
  created_at: string;
  event_type: string;
  description: string;
  user?: { name: string };
  changed_fields?: string[];
  data_before?: Record<string, any>;
  data_after?: Record<string, any>;
}

interface Props {
  studentId: string;
}

export default function StudentLogs({ studentId }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metadata tables for resolving IDs
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [semanas, setSemanas] = useState<SemanaIntensiva[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [promos, setPromos] = useState<Promocion[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [facultades, setFacultades] = useState<Facultad[]>([]);
  const [prepas, setPrepas] = useState<Prepa[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Run all promises in parallel
        const [
          eventsRes,
          groupsRes,
          campusesRes,
          semanasRes,
          periodsRes,
          carrerasRes,
          promosRes,
          municipiosRes,
          facultadesRes,
          prepasRes,
        ] = await Promise.all([
          getStudentEvents(studentId),
          getGrupos(),
          getCampuses(),
          getSemanas(),
          getPeriods(),
          getCarreras(),
          getPromos(),
          getMunicipios(),
          getFacultades(),
          getPrepas(),
        ]);

        setLogs(eventsRes.data || []);
        setGroups(groupsRes || []);
        setCampuses(campusesRes || []);
        setSemanas(
          Array.isArray(semanasRes) ? semanasRes : semanasRes.data || []
        );
        setPeriods(periodsRes || []);
        setCarreras(carrerasRes || []);
        setPromos(promosRes || []);
        setMunicipios(municipiosRes || []);
        setFacultades(facultadesRes || []);
        setPrepas(prepasRes || []);
      } catch (err) {
        setError('Failed to fetch logs or metadata');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const formatValue = (field: string, value: any): string => {
    if (value === null || value === undefined || value === '') return '—';

    // Helper to find name safely
    const findName = (list: any[], id: any) => {
      const item = list.find((i) => String(i.id) === String(id));
      return item ? item.name : String(id);
    };

    // Helper: serializa cualquier valor complejo a string legible
    const serialize = (v: any): string => {
      if (v === null || v === undefined) return '—';
      if (typeof v === 'boolean') return v ? 'Sí' : 'No';
      if (typeof v === 'string' || typeof v === 'number') return String(v);
      try {
        const json = JSON.stringify(v, null, 0);
        return json.length > 120 ? json.slice(0, 117) + '…' : json;
      } catch {
        return '[Objeto]';
      }
    };

    switch (field) {
      case 'grupo_id':
      case 'group_id':
        return findName(groups, value);
      case 'campus_id':
        return findName(campuses, value);
      case 'semana_intensiva_id':
        return findName(semanas, value);
      case 'period_id':
        return findName(periods, value);
      case 'carrer_id':
      case 'career_id':
        return findName(carreras, value);
      case 'promo_id':
        return findName(promos, value);
      case 'municipio_id':
        return findName(municipios, value);
      case 'facultad_id':
        return findName(facultades, value);
      case 'prepa_id':
        return findName(prepas, value);
      case 'grades': {
        // Mostrar resumen de calificaciones: "7 materias"
        const count = Array.isArray(value) ? value.length : '?';
        return `${count} materia(s) en registro`;
      }
      case 'is_active':
      case 'book_delivered':
        return value ? 'Sí' : 'No';
      default:
        return serialize(value);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Logs</h2>
      </CardHeader>
      <CardContent>
        <SectionContainer>
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Evento</th>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Cambios</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="border px-4 py-2">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">{log.event_type}</td>
                  <td className="border px-4 py-2">
                    {log.user?.name || 'Desconocido'}
                  </td>
                  <td className="border px-4 py-2">{log.description}</td>
                  <td className="border px-4 py-2">
                    {log.changed_fields?.length ? (
                      <ul className="list-disc pl-4">
                        {log.changed_fields.map((field) => (
                          <li key={field}>
                            <span className="font-semibold">{field}:</span>{' '}
                            <span className="text-red-500 dark:text-red-400">
                              {formatValue(field, log.data_before?.[field])}
                            </span>{' '}
                            <span className="mx-1">→</span>
                            <span className="text-green-600 dark:text-green-400">
                              {formatValue(field, log.data_after?.[field])}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionContainer>
      </CardContent>
    </Card>
  );
}
