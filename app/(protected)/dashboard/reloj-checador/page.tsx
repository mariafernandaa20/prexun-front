"use client"
import { Clock, Coffee } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Reloj() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClock = async (type: 'check-in' | 'check-out') => {
    if (!userId) {
      toast.error('Ingrese su ID');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data } = await axios.post(`http://localhost:8000/api/checador/${type}`, {
        user_id: Number(userId)
      });

     //verificacion
      if (data.break_info) {
        toast.success(`Descanso registrado: ${data.break_info.duration_minutes} minutos`);
      } else {
        toast.success(`${type === 'check-in' ? 'Entrada' : 'Salida'} registrada`);
      }
      
      setUserId('');
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleRestDay = async () => {
    if (!userId) {
      toast.error('Ingrese su ID');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data } = await axios.post('http://localhost:8000/api/checador/mark-rest-day', {
        user_id: Number(userId)
        
      });

      toast.success('Día de descanso registrado exitosamente');
      setUserId('');
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al registrar día de descanso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <CardTitle className="text-xl">Reloj Checador</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ID de usuario"
            className="text-center"
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleClock('check-in')}
              disabled={loading || !userId}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? '...' : 'Entrada'}
            </Button>
            
            <Button
              onClick={() => handleClock('check-out')}
              disabled={loading || !userId}
              variant="destructive"
            >
              {loading ? '...' : 'Salida'}
            </Button>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleRestDay}
              disabled={loading || !userId}
              variant="outline"
              className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
            >
              <Coffee className="h-4 w-4 mr-2" />
              {loading ? 'Registrando...' : 'Día de Descanso'}
            </Button>
          </div>

         
          <div className="text-xs text-muted-foreground text-center pt-2 space-y-1">
          </div>
        </CardContent>
      </Card>
    </div>
  );
}