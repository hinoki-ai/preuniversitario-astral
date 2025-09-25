'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { IconDotsVertical } from '@tabler/icons-react';
import { useTheme } from 'next-themes';

import { EnergyOrb } from '@/components/EnergyOrb';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

export function NavUser() {
  const { openUserProfile } = useClerk();
  const { theme } = useTheme();
  const { user: clerkuser } = useUser();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() =>
            openUserProfile({
              appearance: {
                baseTheme: theme === 'dark' ? dark : undefined,
              },
            })
          }
        >
          <EnergyOrb userId={clerkUser?.id || 'anonymous'} size="sm" className="h-8 w-8" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{clerkUser?.fullName}</span>
            <span className="text-muted-foreground truncate text-xs">
              {clerkUser?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
          <IconDotsVertical className="ml-auto size-4" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
