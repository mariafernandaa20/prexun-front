'use client';
import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataURL: string) => void;
  title?: string;
}

export function SignaturePadModal({
  isOpen,
  onClose,
  onSave,
  title = 'Firma Digital',
}: SignaturePadModalProps) {
  const sigCanvasRef = useRef<SignaturePad>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setIsEmpty(true);
    }
  };

  const saveSignature = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const signatureDataURL = sigCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL('image/png');
      onSave(signatureDataURL);
      onClose();
      clearSignature();
    }
  };

  const handleBeginStroke = () => {
    setIsEmpty(false);
  };

  const handleClose = () => {
    clearSignature();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <SignaturePad
              ref={sigCanvasRef}
              canvasProps={{
                width: 600,
                height: 300,
                className: 'signature-canvas w-full h-full bg-white',
              }}
              onBegin={handleBeginStroke}
              backgroundColor="white"
              penColor="black"
            />
          </div>
          <div className="flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={clearSignature}
              disabled={isEmpty}
            >
              Limpiar
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={saveSignature}
                disabled={isEmpty}
              >
                Guardar Firma
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SignatureDisplayProps {
  signatureUrl?: string;
  onOpenModal: () => void;
  showButton?: boolean;
  className?: string;
}

export function SignatureDisplay({
  signatureUrl,
  onOpenModal,
  showButton = true,
  className = '',
}: SignatureDisplayProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {signatureUrl ? (
        <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
          <img
            src={signatureUrl}
            alt="Firma"
            className="max-h-32 mx-auto block"
          />
        </div>
      ) : (
        showButton && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">No hay firma</p>
          </div>
        )
      )}
      {showButton && (
        <Button
          type="button"
          variant="outline"
          onClick={onOpenModal}
          className="w-full"
        >
          {signatureUrl ? 'Cambiar Firma' : 'Agregar Firma'}
        </Button>
      )}
    </div>
  );
}
