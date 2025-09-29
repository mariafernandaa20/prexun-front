'use client'
import React from 'react'
import { useCaja } from './useCaja';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function CajaStatus() {
  const { caja, loading } = useCaja();

  if (loading) {
    return <Badge variant="outline">Cargando...</Badge>;
  }

  if (!caja) {
    return <Link href={`/planteles/caja`}><Badge variant="destructive">Sin caja activa</Badge></Link>;
  }

  const formatAmount = (amount: string | null) => {
    if (!amount) return '$0';
    return `$${parseFloat(amount).toFixed(0)}`;
  };

  return (
    <Link href={`/planteles/caja`} className="flex items-center gap-2">
      <Badge 
        variant={caja.status === 'abierta' ? 'default' : 'secondary'}
        className="flex items-center gap-1"
      >
        <DollarSign className="w-3 h-3" />
        Caja #{caja.id} - {caja.status}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {formatAmount(caja?.final_amount?.toString() || caja?.initial_amount?.toString())}
      </span>
    </Link>
  );
}