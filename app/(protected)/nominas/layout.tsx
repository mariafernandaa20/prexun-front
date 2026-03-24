'use client';
import { NominasSidebar } from '@/components/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAppInit } from '@/hooks/use-app-init';

export default function NominasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Usar el hook personalizado para inicialización
  useAppInit();

  return (
    <SidebarProvider>
      <NominasSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex-1 min-w-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
