"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { buttonVariants } from '../ui/button';
import { dashboard_navigation } from '@/lib/dashboard';

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="hidden lg:block">
      <SidebarHeader>
        Prexun Asesorias
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {dashboard_navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link className={buttonVariants({ variant: "ghost" })} href={item.href}>
                  {item.name}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        Version 0.0.1
      </SidebarFooter>
    </Sidebar>
  )
}

