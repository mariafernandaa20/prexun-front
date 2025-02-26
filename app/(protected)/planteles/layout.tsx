'use client'

import { PlantelSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/store/app-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useEffect } from "react";

export default function Page({ children }: { children: React.ReactNode }) {
  const { initializeApp } = useAuthStore();
  const { fetchCampuses, fetchGroups } = useAppStore();

  useEffect(() => {
    initializeApp();
    fetchCampuses();
    fetchGroups();
  }, []);

  return (
    <SidebarProvider>
      <PlantelSidebar />
      <SidebarInset>
        <div>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
          </header>
          <div className="flex flex-1 flex-col p-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
