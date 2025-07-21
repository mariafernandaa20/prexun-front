
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import React from 'react'
import TransactionDashboard from './components/dashboard';

export default function Page() {
const { activeCampus} = useActiveCampusStore();
  
  if (!activeCampus) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Selecciona un plantel para ver el dashboard</p>
      </div>
    );
  }
  
  return (
    <div>
      <Card>
        <CardHeader className='sticky top-0 z-8 bg-card'>
          <h1 className="text-2xl font-bold">{activeCampus.name}</h1>
        </CardHeader>
        <CardContent>
          <p>Descripción: {activeCampus.description}</p>
        </CardContent>
      </Card>
      <TransactionDashboard activeCampus={activeCampus.id}/>
    </div>
  )
}
