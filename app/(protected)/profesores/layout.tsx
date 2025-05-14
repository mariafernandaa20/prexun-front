"use client";

import { TeacherSidebar } from "./sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ProfesoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <TeacherSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}