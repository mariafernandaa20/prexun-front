"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Building,
  CalendarClock,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThemeToggleSidebar } from "./layout/theme-toggle";
import Image from "next/image";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Variables",
      url: "#",
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: "Municipios",
          url: "/dashboard/municipios",
          icon: Map,
        },
        {
          title: "Preparatorias",
          url: "/dashboard/preparatorias",
          icon: BookOpen,
        },
        {
          title: "Facultades",
          url: "/dashboard/facultades",
          icon: BookOpen,
        },
        {
          title: "Carreras",
          url: "/dashboard/carreras",
          icon: BookOpen,
        },
        {
          title: "Módulos",
          url: "/dashboard/modulos",
          icon: BookOpen,
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
  admin_navigation: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
    },
    {
      name: "Planteles",
      url: "/dashboard/planteles",
      icon: Building,
    },
    {
      name: "Usuarios",
      url: "/dashboard/usuarios",
      icon: Users,
    },
    {
      name: "Periodos",
      url: "/dashboard/periodos",
      icon: CalendarClock,
    },
  ],
  plantel_navigation: [
    {
      name: "Dashboard",
      url: "/planteles",
      icon: PieChart,
    },
    {
      name: "Cobros",
      url: "/planteles/cobros",
      icon: PieChart,
    },
    {
      name: "Estudiantes",
      url: "/planteles/estudiantes",
      icon: Users,
    },
    {
      name: "Periodos",
      url: "/planteles/periodos",
      icon: CalendarClock,
    },
    {
      name: "Coherts",
      url: "/planteles/coherts",
      icon: BookOpen,
    },
 
  ],
};

export function TemplateSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain title="Configuración" items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <h2 className="text-xl font-bold px-2 py-4 group-data-[collapsible=icon]:hidden">Prexun Asesorías</h2>
        <Image className="group-data-[collapsible=icon]:block hidden py-4 " src="/prexun.png" alt="Prexun Logo" width={50} height={50} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.admin_navigation} />
        <NavMain title="Configuración" items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggleSidebar />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
export function PlantelSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher/>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.plantel_navigation} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggleSidebar />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
