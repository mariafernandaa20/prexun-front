"use client";

import * as React from "react";
import {
  AudioWaveform,
  BaggageClaimIcon,
  BookOpen,
  Bot,
  Building,
  CalendarClock,
  CreditCard,
  Command,
  Frame,
  GalleryVerticalEnd,
  GraduationCap,
  LayoutDashboard,
  Map,
  PieChart,
  Receipt,
  School,
  Settings2,
  ShoppingBag,
  Users,
  Wallet,
  AlertCircle,
  DollarSign,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggleSidebar } from "./layout/theme-toggle";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { url } from "inspector";
import { FcGoogle } from "react-icons/fc";

// This is sample data.
export const data = {
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
      icon: LayoutDashboard,
    },
    {
      name: "Tarjetas",
      url: "/dashboard/cards",
      icon: CreditCard,
    },
    {
      name: "Estudiantes",
      url: "/dashboard/students",
      icon: GraduationCap,
    },
    {
      name: "Cohortes",
      url: "/dashboard/cohortes",
      icon: Users,
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
    {
      name: "Promociones",
      url: "/dashboard/promos",
      icon: DollarSign,
    },
    {
      name: "Grupos",
      url: "/dashboard/grupos",
      icon: School,
    },
    {
      name: "Semanas Intensivas",
      url: "/dashboard/semanas-intensivas",
      icon: CalendarClock,
    },
    {
      name: "Productos",
      url: "/dashboard/productos",
      icon: ShoppingBag,
    },
    {
      name: "Planteles",
      url: "/planteles",
      icon: Building,
    }
  ],
  plantel_navigation: [
    {
      name: "Dashboard",
      url: "/planteles",
      icon: LayoutDashboard,
    },
    {
      name: "Estudiantes",
      url: "/planteles/estudiantes",
      icon: GraduationCap,
    },
    {
      name: "Pagos",
      url: "/planteles/cobros",
      icon: Receipt,
    },
    {
      name: "Pendientes",
      url: "/planteles/pendientes",
      icon: AlertCircle,
    },
    {
      name: "Egresos",
      url: "/planteles/gastos",
      icon: DollarSign,
    },
    {
      name: "Caja",
      url: "/planteles/caja",
      icon: Wallet,

    },
    {
      name: "google",
      url: "/planteles/google",
      icon: FcGoogle as any,
    }
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
        <NavMain title="Configuración" items={data.navMain}/>
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
        <h2 className="text-xl font-bold px-2 py-4 group-data-[collapsible=icon]:hidden text-white">Prexun Asesorías</h2>
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
        <TeamSwitcher />
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
