'use client';

import {
  BadgeCheck,
  Bell,
  Building,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  PieChart,
  Sparkles,
  Lock,
  Wallet,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useNotifications } from '@/hooks/useNotifications';

export function NavUser() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { SAT } = useFeatureFlags();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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
              <div
                className={`h-8 w-8 rounded-lg  ${!SAT ? 'bg-red-500' : 'bg-green-500'}`}
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className=" min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div
                  className={`h-8 w-8 rounded-lg  ${!SAT ? 'bg-red-500' : 'bg-green-500'}`}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuLabel className="my-2 p-0 font-normal">
              <a href="/planteles/" className="flex items-center gap-2">
                <Building className="h-4 w-4 ml-3 mr-2" />
                Planteles
              </a>
            </DropdownMenuLabel>
            {user?.role === 'super_admin' && (
              <>
                <DropdownMenuLabel className="my-2 p-0 font-normal">
                  <a href="/dashboard/" className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 ml-3 mr-2" />
                    Dashboard
                  </a>
                </DropdownMenuLabel>
              </>
            )}

            <div className="flex items-center gap-2 my-2 px-2">
              <div className="h-px bg-gray-300 flex-1" />
              <span className="text-xs font-medium text-muted-foreground">
                Usuario
              </span>
              <div className="h-px bg-gray-300 flex-1" />
            </div>
            <DropdownMenuLabel className="my-2 p-0 font-normal">
              <a href="/nominas/" className="flex items-center gap-2">
                <Wallet className="h-4 w-4 ml-3 mr-2" />
                Nóminas
              </a>
            </DropdownMenuLabel>
            <DropdownMenuLabel className="my-2 p-0 font-normal">
              <a href="/contrasena" className="flex items-center gap-2">
                <Lock className="h-4 w-4 ml-3 mr-2" />
                Perfil
              </a>
            </DropdownMenuLabel>
            <DropdownMenuLabel className="my-2 p-0 font-normal">
              <Link
                href="/nominas/notificaciones"
                className="flex items-center justify-between w-full group"
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 ml-3 mr-2" />
                  Notificaciones
                </div>
                {unreadCount > 0 && (
                  <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm group-hover:bg-red-700 transition-colors">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="hover:cursor-pointer"
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
