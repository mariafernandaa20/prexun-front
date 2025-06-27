"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { NavProjects } from "@/components/nav-items";
import { NavUser } from "@/components/nav-user";
import Image from "next/image";
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  CalendarClock,
  ClipboardList
} from "lucide-react";

const teacher_navigation = [
  {
    name: "Dashboard",
    url: "/profesores",
    icon: LayoutDashboard,
  },
  {
    name: "Mis Grupos",
    url: "/profesores/grupos",
    icon: School,
  },
  {
    name: "Lista de Asistencia",
    url: "/profesores/lista-asistencia",
    icon: ClipboardList,
  },
  {
    name: "Calificaciones",
    url: "/profesores/calificaciones",
    icon: GraduationCap,
  },
  {
    name: "Calendario",
    url: "/profesores/calendario",
    icon: CalendarClock,
  }
];

export function TeacherSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <h2 className="text-xl font-bold px-2 py-4 group-data-[collapsible=icon]:hidden text-white">Prexun Asesorías</h2>
        <Image 
          className="group-data-[collapsible=icon]:block hidden py-4" 
          src="/prexun.png" 
          alt="Prexun Logo" 
          width={50} 
          height={50} 
        />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={teacher_navigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}