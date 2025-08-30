'use client'
import React, { useState } from 'react';
import { SignaturePad, SignaturePreview } from '@/components/ui/SignaturePad';

export default function TestSignature() {
  const [isOpen, setIsOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const handleSave = (signatureData: string) => {
    setSignature(signatureData);
    console.log('Firma guardada:', signatureData.substring(0, 50) + '...');
  };

  const handleRemove = () => {
    setSignature(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba de Firma Digital</h1>
      
      {signature ? (
        <SignaturePreview
          signature={signature}
          onRemove={handleRemove}
          onEdit={() => setIsOpen(true)}
        />
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Agregar Firma
        </button>
      )}

      <SignaturePad
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        title="Firma de Prueba"
      />
    </div>
  );
}
