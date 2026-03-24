'use client';
import { NominasSidebar } from '@/components/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAppInit } from '@/hooks/use-app-init';

export default function ContrasenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAppInit();
  return (
    <SidebarProvider>
      <NominasSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 min-w-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
