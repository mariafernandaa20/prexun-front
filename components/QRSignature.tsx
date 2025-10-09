'use client';
import React from 'react';
import QRCode from 'qrcode';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRSignatureProps {
  gastoId: number;
  onSignatureUpdate?: (signature: string) => void;
}

export function QRSignature({ gastoId, onSignatureUpdate }: QRSignatureProps) {
  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [signatureUrl, setSignatureUrl] = useState<string>('');

  useEffect(() => {
    // Generar la URL para firmar externamente
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/firma-externa/${gastoId}`;
    setSignatureUrl(url);

    // Generar el QR
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((dataUrl) => {
        setQrDataURL(dataUrl);
      })
      .catch((err) => {
        console.error('Error generando QR:', err);
      });

    // Escuchar por actualizaciones de firma (polling cada 5 segundos)
    const interval = setInterval(async () => {
      try {
        // Verificar con localStorage (para demo) y también con API real
        const signedData = localStorage.getItem(`gasto-${gastoId}-signed`);
        if (signedData && onSignatureUpdate) {
          const signature = localStorage.getItem(`gasto-${gastoId}-signature`);
          if (signature) {
            onSignatureUpdate(signature);
            localStorage.removeItem(`gasto-${gastoId}-signed`);
            localStorage.removeItem(`gasto-${gastoId}-signature`);
            clearInterval(interval);
            return;
          }
        }

        // También verificar con la API real
        try {
          // Importar la función aquí para evitar problemas de dependencias circulares
          const { checkPublicSignatureStatus } = await import('@/lib/api/gastos-signature');
          const data = await checkPublicSignatureStatus(gastoId);
          if (data.signature && onSignatureUpdate) {
            onSignatureUpdate(data.signature);
            clearInterval(interval);
          }
        } catch (apiError) {
          // No mostrar error si la API no está disponible, solo usar localStorage
          console.log('API no disponible, continuando con localStorage');
        }
      } catch (error) {
        console.error('Error verificando firma:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [gastoId, onSignatureUpdate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(signatureUrl);
    toast({
      title: 'URL copiada',
      description: 'La URL para firmar ha sido copiada al portapapeles',
    });
  };

  const openInNewTab = () => {
    window.open(signatureUrl, '_blank');
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="text-center">
        <h3 className="font-semibold mb-2">Firmar Externamente</h3>
        <p className="text-sm text-gray-600 mb-4">
          Escanea el código QR o usa el enlace para firmar desde otro dispositivo
        </p>
      </div>

      {qrDataURL && (
        <div className="flex justify-center">
          <img src={qrDataURL} alt="QR Code para firmar" className="border rounded" />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar URL
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          La página se actualizará automáticamente cuando se complete la firma
        </p>
      </div>
    </div>
  );
}