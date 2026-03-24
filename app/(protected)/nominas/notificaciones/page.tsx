'use client';

import React from 'react';
import SectionContainer from '@/components/SectionContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Check,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  Trash2,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllRead } =
    useNotifications();

  if (loading && notifications.length === 0) {
    return (
      <SectionContainer>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-muted-foreground">Cargando notificaciones...</p>
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Centro de Notificaciones</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona tus alertas y avisos del sistema.
          </p>
        </div>

        {notifications.length > 0 && notifications.some((n) => !n.is_read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead()}
            className="flex gap-2"
          >
            <Check className="h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="grid gap-4 max-w-4xl">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed rounded-xl">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              No tienes notificaciones por ahora.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${!notification.is_read ? 'border-l-4 border-l-blue-600 bg-blue-50/30 dark:bg-blue-900/20' : 'bg-card'}`}
            >
              <CardContent className="p-0">
                <div className="flex items-start gap-4 p-5">
                  <div
                    className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${!notification.is_read ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}
                  >
                    {notification.path?.includes('nomina') ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`font-semibold text-sm ${!notification.is_read ? 'text-blue-900 dark:text-blue-100' : 'text-foreground'}`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <Badge
                          variant="default"
                          className="bg-blue-600 text-[10px] h-4"
                        >
                          NUEVA
                        </Badge>
                      )}
                    </div>

                    <p
                      className={`text-sm mb-3 line-clamp-2 ${!notification.is_read ? 'text-blue-800 dark:text-blue-200' : 'text-muted-foreground'}`}
                    >
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.created_at).toLocaleString()}
                      </span>

                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[11px] hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Marcar leída
                          </Button>
                        )}

                        {notification.path && (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-[11px]"
                            asChild
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Link href={notification.path}>
                              {notification.path.includes('nomina')
                                ? 'Ver Nómina'
                                : 'Ver detalle'}
                              <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </SectionContainer>
  );
}
