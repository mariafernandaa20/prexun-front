'use client';

import { PlantelSidebar } from '@/components/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAppInit } from '@/hooks/use-app-init';
import { useUIConfig } from '@/hooks/useUIConfig';
import GoogleAuth from './google/GoogleAuth';

export default function Page({ children }: { children: React.ReactNode }) {
  useUIConfig();
  useAppInit();
  return (
    <SidebarProvider>
      <PlantelSidebar />
      <SidebarInset>
        <div>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center justify-between gap-2 px-4 w-full">
              <div className="flex items-center">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
              </div>
              <GoogleAuth />
            </div>
          </header>
          <div className="flex flex-1 flex-col p-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
