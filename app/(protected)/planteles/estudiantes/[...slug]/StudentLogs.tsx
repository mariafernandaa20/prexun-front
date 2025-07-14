import SectionContainer from '@/components/SectionContainer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getStudentEvents } from '@/lib/api';
import React, { useEffect, useState } from 'react'

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

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getStudentEvents(studentId);
        setLogs(response.data);
      } catch (err) {
        setError('Failed to fetch logs');
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [studentId]);

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
                  <td className="border px-4 py-2">{log.user?.name || 'Desconocido'}</td>
                  <td className="border px-4 py-2">{log.description}</td>
                  <td className="border px-4 py-2">
                    {log.changed_fields?.length ? (
                      <ul className="list-disc pl-4">
                        {log.changed_fields.map((field) => (
                          <li key={field}>
                            <span className="font-semibold">{field}:</span>{" "}
                            <span className="text-red-600">{log.data_before?.[field] ?? '—'}</span>{" "}
                            <span className="mx-1">→</span>
                            <span className="text-green-600">{log.data_after?.[field] ?? '—'}</span>
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