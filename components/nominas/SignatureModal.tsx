'use client';

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Undo, Trash2, CheckCircle2 } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureBase64: string) => void;
  loading?: boolean;
}

export function SignatureModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: SignatureModalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = () => {
    const signature = sigCanvas.current;
    if (!signature || signature.isEmpty()) return;

    try {
      // Intentamos obtener el canvas recortado (sin espacios en blanco)
      // Downgraded to 1.0.6 to fix WEBPACK_IMPORTED_MODULE error
      let canvas = null;
      try {
        canvas = signature.getTrimmedCanvas();
      } catch (trimError) {
        console.warn(
          'getTrimmedCanvas falló, usando canvas completo:',
          trimError
        );
        canvas = signature.getCanvas();
      }

      if (canvas) {
        const base64 = canvas.toDataURL('image/png');
        onConfirm(base64);
      }
    } catch (error) {
      console.error('Error crítico al obtener la imagen de la firma:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Firmar Nómina</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Dibuja tu firma en el recuadro de abajo de forma clara. Esta firma
            se estampará en tu recibo de nómina.
          </p>
          <div className="border rounded-md bg-white p-2">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 450,
                height: 200,
                className: 'signature-canvas w-full h-[200px]',
              }}
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={clear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <p className="text-[10px] text-muted-foreground self-end italic">
              Al confirmar, aceptas que esta es tu firma digital legal.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={loading}>
            {loading ? (
              'Procesando...'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Firma
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
