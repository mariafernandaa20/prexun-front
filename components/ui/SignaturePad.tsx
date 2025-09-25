'use client';
import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  title?: string;
}

interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ isOpen, onClose, onSave, title = 'Agregar Firma' }, ref) => {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
      },
      isEmpty: () => {
        return sigCanvas.current?.isEmpty() ?? true;
      },
      toDataURL: () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
          try {
            const canvas = sigCanvas.current.getCanvas();
            const watermarkedCanvas = addWatermark(canvas);
            const trimmedCanvas = trimCanvas(watermarkedCanvas);
            return trimmedCanvas.toDataURL('image/png');
          } catch (error) {
            console.error('Error al obtener la firma:', error);
            return '';
          }
        }
        return '';
      },
    }));

    const handleClear = () => {
      sigCanvas.current?.clear();
      setIsEmpty(true);
    };

    const addWatermark = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
      const watermarkCanvas = document.createElement('canvas');
      watermarkCanvas.width = canvas.width;
      watermarkCanvas.height = canvas.height;
      const ctx = watermarkCanvas.getContext('2d');

      if (!ctx) return canvas;

      // Dibujar el canvas original
      ctx.drawImage(canvas, 0, 0);

      // Configurar la marca de agua
      ctx.save();
      ctx.globalAlpha = 0.1; // Transparencia sutil
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Rotar texto para diagonal
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 6); // -30 grados

      // Dibujar "PREXUN" en el centro
      ctx.fillText('PREXUN', 0, 0);
      ctx.restore();

      return watermarkCanvas;
    };

    const trimCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return canvas;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let top = canvas.height,
        bottom = 0,
        left = canvas.width,
        right = 0;

      // Find the bounds of non-transparent pixels
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const alpha = data[(y * canvas.width + x) * 4 + 3];
          if (alpha > 0) {
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
            left = Math.min(left, x);
            right = Math.max(right, x);
          }
        }
      }

      // Add some padding
      const padding = 10;
      top = Math.max(0, top - padding);
      bottom = Math.min(canvas.height, bottom + padding);
      left = Math.max(0, left - padding);
      right = Math.min(canvas.width, right + padding);

      const trimmedWidth = right - left;
      const trimmedHeight = bottom - top;

      if (trimmedWidth <= 0 || trimmedHeight <= 0) return canvas;

      // Create new canvas with trimmed size
      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = trimmedWidth;
      trimmedCanvas.height = trimmedHeight;
      const trimmedCtx = trimmedCanvas.getContext('2d');

      if (trimmedCtx) {
        trimmedCtx.fillStyle = 'white';
        trimmedCtx.fillRect(0, 0, trimmedWidth, trimmedHeight);
        trimmedCtx.drawImage(
          canvas,
          left,
          top,
          trimmedWidth,
          trimmedHeight,
          0,
          0,
          trimmedWidth,
          trimmedHeight
        );
      }

      return trimmedCanvas;
    };

  const handleSave = () => {
    if (sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      const watermarkedCanvas = addWatermark(canvas);
      const trimmedCanvas = trimCanvas(watermarkedCanvas);
      const signatureData = trimmedCanvas.toDataURL('image/png');
      
      if (onSave) {
        onSave(signatureData);
      }
      
      onClose();
      sigCanvas.current.clear();
    }
  };    const handleBegin = () => {
      setIsEmpty(false);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  className: 'w-full h-48 border rounded',
                  style: { background: 'white' },
                }}
                onBegin={handleBegin}
              />
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 text-center">
                Dibuja tu firma en el área de arriba
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isEmpty}
              >
                Limpiar
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={isEmpty}>
                Guardar Firma
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

// Componente para mostrar la vista previa de la firma
interface SignaturePreviewProps {
  signature: string | null;
  onRemove: () => void;
  onEdit: () => void;
}

export const SignaturePreview: React.FC<SignaturePreviewProps> = ({
  signature,
  onRemove,
  onEdit,
}) => {
  if (!signature) return null;

  return (
    <div className="space-y-2">
      <div className="border rounded-lg p-3 bg-gray-50">
        <img
          src={signature}
          alt="Firma"
          className="max-w-full h-20 mx-auto object-contain"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="flex-1"
        >
          Editar Firma
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="flex-1"
        >
          Eliminar Firma
        </Button>
      </div>
    </div>
  );
};
