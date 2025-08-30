'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { getGoogleContacts, GoogleContact } from '@/lib/googleContacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Search, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactsList() {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const accessToken = useAuthStore((state) => state.accessToken);

  const fetchContacts = async () => {
    if (!accessToken) {
      toast.error('No hay token de acceso disponible');
      return;
    }

    setLoading(true);
    try {
      const googleContacts = await getGoogleContacts(accessToken);
      setContacts(googleContacts);
      toast.success(`Se cargaron ${googleContacts.length} contactos`);
    } catch (error) {
      console.error('Error al obtener contactos:', error);
      toast.error('Error al cargar contactos de Google');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchContacts();
    }
  }, [accessToken]);

  const filteredContacts = contacts.filter(contact => {
    const name = contact.names?.[0]?.displayName || '';
    const email = contact.emailAddresses?.[0]?.value || '';
    const phone = contact.phoneNumbers?.[0]?.value || '';
    
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)
    );
  });

  if (!accessToken) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            Inicia sesión con Google para ver tus contactos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contactos de Google ({filteredContacts.length})
          </CardTitle>
          <Button
            onClick={fetchContacts}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualizar
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {loading && contacts.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando contactos...</span>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            {searchTerm ? 'No se encontraron contactos con ese término' : 'No hay contactos disponibles'}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredContacts.map((contact, index) => (
              <div
                key={contact.resourceName || index}
                className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {contact.names?.[0]?.displayName || 'Sin nombre'}
                    </h3>
                    
                    {contact.emailAddresses && contact.emailAddresses.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">
                          {contact.emailAddresses[0].value}
                        </span>
                      </div>
                    )}
                    
                    {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {contact.phoneNumbers[0].value}
                        </span>
                      </div>
                    )}
                    
                    {contact.phoneNumbers && contact.phoneNumbers.length > 1 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {contact.phoneNumbers[1].value}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
