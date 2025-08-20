'use client';

import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { siteConfig } from '@/lib/site';
import { useAuthStore } from '@/lib/store/auth-store';
import { Campus } from '@/lib/types';
import { useActiveCampusStore } from '@/lib/store/plantel-store';

export function TeamSwitcher() {
  const { user } = useAuthStore();
  const { isMobile } = useSidebar();
  const { activeCampus, setActiveCampus } = useActiveCampusStore();

  React.useEffect(() => {
    if (!activeCampus && user?.campuses && user.campuses.length > 0) {
      setActiveCampus(user.campuses[0]);
    }
  }, [user?.campuses, activeCampus, setActiveCampus]);

  const handleCampusChange = (campus: Campus) => {
    setActiveCampus(campus);
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
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-white">
                  {activeCampus?.name || siteConfig.name}
                </span>
                {activeCampus && (
                  <span className="truncate text-xs text-muted-foreground text-white">
                    {activeCampus.code}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Planteles
            </DropdownMenuLabel>
            {user?.campuses?.map((campus, index) => (
              <DropdownMenuItem
                key={campus.id}
                onClick={() => handleCampusChange(campus)}
                className="gap-2 p-2"
              >
                {campus.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
