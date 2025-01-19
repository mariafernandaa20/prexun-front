
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useActiveCampusStore } from '@/lib/store/plantel-store';
import React from 'react'

export default function Page() {
const { activeCampus} = useActiveCampusStore();
  
  return (
    <div>
      <Card>
        <CardHeader className='sticky top-0 z-10 bg-card'>
          <h1 className="text-2xl font-bold">{activeCampus?.name}</h1>
        </CardHeader>
        <CardContent>
          <p>Descripción: {activeCampus?.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
