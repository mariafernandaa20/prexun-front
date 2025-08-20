import { Card, CardContent, CardHeader } from '@/components/ui/card';
import GoogleAuth from './GoogleAuth';

export default function GooglePage() {
  return (
    <Card>
      <CardHeader>
        <h1 className="font-bold text-2xl">Configurar Cuenta de Google</h1>
      </CardHeader>
      <CardContent>
        <GoogleAuth />
      </CardContent>
    </Card>
  );
}
