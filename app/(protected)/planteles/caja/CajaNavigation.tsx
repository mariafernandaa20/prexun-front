'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, History, Calendar } from 'lucide-react';

export default function CajaNavigation() {
  const pathname = usePathname();

  const links = [
    {
      href: '/planteles/caja',
      label: 'Caja Actual',
      icon: Home,
      active: pathname === '/planteles/caja',
    },
    {
      href: '/planteles/caja/historial',
      label: 'Historial',
      icon: History,
      active: pathname === '/planteles/caja/historial',
    },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href}>
            <Button
              variant={link.active ? 'default' : 'outline'}
              size="sm"
              className={cn(!link.active && 'text-muted-foreground')}
            >
              <Icon className="w-4 h-4 mr-2" />
              {link.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
