'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface AttendanceResponse {
  success: boolean;
  message: string;
  already_registered?: boolean;
  student?: {
    name: string;
    matricula: string;
    phone?: string;
  };
}

export default function PublicAttendancePage() {
  const searchParams = useSearchParams();

  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AttendanceResponse | null>(null);
  const [error, setError] = useState<string>('');

  const apiBase = useMemo(() => {
    const paramApi = searchParams.get('apiUrl');
    if (paramApi) return paramApi.replace(/\/$/, '');

    const envApi = process.env.NEXT_PUBLIC_API_URL;
    if (envApi) return envApi.replace(/\/$/, '');

    return '';
  }, [searchParams]);

  const campusId = searchParams.get('campusId');

  const normalizePhone = (value: string) => value.replace(/[^0-9]/g, '');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setResponse(null);

    const normalized = normalizePhone(whatsapp);
    if (normalized.length < 10) {
      setError('Ingresa un WhatsApp válido de al menos 10 dígitos.');
      return;
    }

    if (!apiBase) {
      setError('No se encontró la URL de API. Configura apiUrl en el script embebido.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: Record<string, string | number> = {
        whatsapp: normalized,
        phone: normalized,
      };

      if (campusId) {
        payload.campus_id = Number(campusId);
      }

      const apiResponse = await fetch(`${apiBase}/public/asistencia/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await apiResponse.json()) as AttendanceResponse;

      if (!apiResponse.ok || !data.success) {
        setError(data.message || 'No se pudo registrar la asistencia.');
        return;
      }

      setResponse(data);
      setWhatsapp('');
    } catch {
      setError('Error de conexión al registrar asistencia.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f6f8',
        padding: 16,
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          padding: 20,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Asistencia</h1>
        <p style={{ marginTop: 6, marginBottom: 16, color: '#4b5563', fontSize: 14 }}>
          Ingresa tu WhatsApp para validar y registrar asistencia.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder="WhatsApp"
            inputMode="numeric"
            autoComplete="tel"
            style={{
              height: 44,
              borderRadius: 8,
              border: '1px solid #d1d5db',
              padding: '0 12px',
              fontSize: 16,
            }}
          />

          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: 44,
              borderRadius: 8,
              border: 'none',
              background: '#1d4ed8',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Validando...' : 'Registrar asistencia'}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: 14,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              borderRadius: 8,
              padding: 10,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {response?.success && (
          <div
            style={{
              marginTop: 14,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              borderRadius: 8,
              padding: 10,
              fontSize: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <strong>{response.already_registered ? 'Asistencia ya registrada' : 'Asistencia registrada'}</strong>
            <span>{response.message}</span>
            {response.student && (
              <span>
                {response.student.name} · {response.student.matricula}
              </span>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
