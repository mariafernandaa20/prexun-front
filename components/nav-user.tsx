"use client";

import {
  BadgeCheck,
  Bell,
  Building,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  PieChart,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function NavUser() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { isMobile } = useSidebar();


  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.name} alt={user?.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className=" min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.name} alt={user?.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {user?.role === 'super_admin' && (
              <>
                <DropdownMenuLabel className="my-2 p-0 font-normal">
                  <Link href="/dashboard/" className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 ml-3 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuLabel>
                <DropdownMenuLabel className="my-2 p-0 font-normal">
                <Link href="/planteles/" className="flex items-center gap-2">
                      <Building className="h-4 w-4 ml-3 mr-2" />
                      Planteles
                    </Link>
                </DropdownMenuLabel>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="hover:cursor-pointer">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
