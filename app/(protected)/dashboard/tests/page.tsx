'use client';

import React, { useEffect } from 'react';

export default function TestsPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/prexun-attendance-embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="interface-container">
      {/* Prexun Widget Asset */}
      <div
        data-prexun-attendance="true"
        data-prexun-text="Asistencia"
        data-prexun-color="#3B82F6"
        data-prexun-float="bottom-left"
        data-prexun-attendance-url="/asistencia-publica"
        data-prexun-api-url="https://clientes.prexun.com/api"
      />

      {/* Primary Video Feed */}
      <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
        <iframe
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          src="https://vimeo.com/event/5762643/embed"
          frameBorder="0"
          allow="autoplay;革命; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Interaction Toolset */}
      <div style={{ marginTop: '20px' }}>
        <iframe
          src="https://vimeo.com/live/interaction_tools/live_event/5762643?module=auto&theme=light"
          width="100%"
          height="550px"
          frameBorder="0"
        />
      </div>
    </div>
  );
}
