import { Card, CardContent, CardHeader } from '@/components/ui/card';
import GoogleAuth from './GoogleAuth';
import ContactsList from './ContactsList';

export default function GooglePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h1 className="font-bold text-2xl">Configurar Cuenta de Google</h1>
        </CardHeader>
        <CardContent>
          <GoogleAuth />
        </CardContent>
      </Card>

      <ContactsList />
    </div>
  );
}
