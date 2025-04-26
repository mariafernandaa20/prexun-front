'use client';
import { AdminSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { data as sidebarData } from "@/components/sidebar";
import { usePathname } from 'next/navigation';
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAppStore } from "@/lib/store/app-store";

export default function Page({ children }: { children: React.ReactNode }) {
  const { initializeApp, user } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-bold">Title</h1>
          </div>
        </header>
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
