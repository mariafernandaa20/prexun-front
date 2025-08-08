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
  MessageSquare,
  MessageCircle,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavItems } from "@/components/nav-items";
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
import { FaWhatsapp } from "react-icons/fa6";

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
      logo: Building,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: Building,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Building,
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
          icon: School,
        },
        {
          title: "Facultades",
          url: "/dashboard/facultades",
          icon: GraduationCap,
        },
        {
          title: "Carreras",
          url: "/dashboard/carreras",
          icon: BookOpen,
        },
        {
          title: "Módulos",
          url: "/dashboard/modulos",
          icon: Frame,
        },
        {
          title: "Ajustes",
          url: "/dashboard/ajustes",
          icon: Frame,
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Bot,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: Receipt,
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
      name: "Cohortes",
      url: "/dashboard/cohortes",
      icon: GraduationCap,
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
      icon: BaggageClaimIcon,
    },
    {
      name: "Grupos",
      url: "/dashboard/grupos",
      icon: Users,
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
      name: "Instrucciones",
      url: "/chat",
      icon: MessageSquare,
    },
    {
      name: "WhatsApp",
      url: "/dashboard/whatsapp",
      icon: MessageCircle,
    },
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
      icon: Users,
    },
    {
      name: "Ingresos",
      url: "/planteles/ingresos",
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
      icon: CreditCard,
    },
    {
      name: "Grupos",
      url: "/planteles/grupos",
      icon: Users,
    },
    {
      name: "Asistencias",
      url: "/planteles/lista-asistencia",
      icon: BookOpen,
    },
    {
      name: "google",
      url: "/planteles/google",
      icon: FcGoogle as any,
    },
    {
      name: "WhatsApp",
      url: "/planteles/chat",
      icon: FaWhatsapp as any,
    }
  ],
  chatbot_navigation: [
    {
      name: "Chat",
      url: "/chat",
      icon: MessageSquare,
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
        <NavMain title="Configuración" items={data.navMain}/>
        <NavItems projects={data.projects} />
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
        <NavItems projects={data.admin_navigation} />
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
        <NavItems projects={data.plantel_navigation} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggleSidebar />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function ChatSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <h2 className="text-xl font-bold px-2 py-4 group-data-[collapsible=icon]:hidden text-white">Chat Assistant</h2>
        <MessageSquare className="group-data-[collapsible=icon]:block hidden py-4 mx-auto" size={32} />
      </SidebarHeader>
      <SidebarContent>
        <NavItems projects={data.chatbot_navigation} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggleSidebar />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
