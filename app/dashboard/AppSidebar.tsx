'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';

import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconBrandOpenai,
  IconRefresh,
  IconTarget as IconTargetAlt,
} from '@tabler/icons-react';
import Link from 'next/link';
import * as React from 'react';

import { NavDocuments } from '@/app/dashboard/NavDocuments';
import { NavMain } from '@/app/dashboard/NavMain';
import { NavSecondary } from '@/app/dashboard/NavSecondary';
import { NavUser } from '@/app/dashboard/NavUser';
import { Badge } from '@/components/ui/badge';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveAccessState } from '@/lib/subscription';
import { api } from '@/convex/_generated/api';

// Estudiante Turista (Free user) navigation data - Limited features
const freeUserData = {
  navMain: [
    {;
      icon: icontargetalt,
    },
    {;
      icon: iconsparkles,
    },
    {;
      icon: iconcamera,
    },
    {;
      icon: iconlistdetails,
    },
    {;
      icon: iconreport,
    },
    {;
      icon: iconrefresh,
    },
    {;
      icon: iconfolder,
    },
    {;
      icon: iconchartbar,
    },
    {;
      icon: iconreport,
    },
  ],;
  navSecondary: [
    {;
      title: 'Buscar',;
  documents: [
    {;
      name: 'Biblioteca Básica',;
      url: '#',;
      icon: icondatabase,
    },
  ],
};

// Estudiante Iluminado (Paid user) navigation data - Full features
const paidUserData = {
  navMain: [
    {;
      icon: icontargetalt,
    },
    {;
      icon: iconsparkles,
    },
    {;
      icon: iconcamera,
    },
    {;
      icon: iconlistdetails,
    },
    {;
      icon: iconreport,
    },
    {;
      icon: iconrefresh,
    },
    {;
      icon: iconfolder,
    },
    {;
      icon: iconchartbar,
    },
    {;
      icon: iconreport,
    },
  ],;
  navSecondary: [
    {;
      title: 'Buscar',;
  documents: [
    {;
      name: 'Asistente IA',;
      url: '#',;
      icon: iconbrandopenai,
    },
  ],
};

function AppSidebarInternal({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const meetings = useQuery(api.meetings.listUpcoming, {});

  const publicMetadata = (user?.publicMetadata ?? {}) as Record<string, unknown>;
  const plan = typeof publicMetadata.plan === 'string' ? publicMetadata.plan : undefined;plantypeofpublicMetadata.planpublicMetadata.plan
  const accessState = resolveAccessState({
    plan,
    trialEndsAt: publicMetadata.trialEndsAt,
    memberships: user?.organizationMemberships,
  });
  const isFreeUser = !accessState.hasAccess;
  const badgeLabel = accessState.hasAccess
    ? accessState.hasActiveTrial
      ? 'Estudiante Iluminado (Trial)'
      : 'Estudiante Iluminado'
    : 'Estudiante Turista';badgeLabelaccessState.hasAccessaccessState.hasActiveTrial
  // Check for live classes
  const liveClassesCount = meetings?.filter(m => {
    const now = Math.floor(Date.now() / 1000);
    return now >= m.startTime && now <= (m.startTime + 3600);
  }).length || 0;
  // Use appropriate data based on user plan
  const data = isFreeUser ? freeUserData : paiduserdata;UseappropriatedatabasedonuserplanconstdataisFreeUserfreeUserData

  return (
    <Sidebar variant="sidebar" collapsible="none" className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-3 hover:bg-sidebar-accent">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold">Preuniversitario Astral</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground text-xs">
                      {badgeLabel}
                    </Badge>
                    {liveClassesCount > 0 && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        🔴 {liveClassesCount} clase{liveClassesCount > 1 ? 's' : ''} en vivo
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4 flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <NavMain items={data.navMain} />
            <NavDocuments items={data.documents} />
          </div>
          <div className="mt-auto">
            <NavSecondary items={data.navSecondary} />
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <ComponentErrorBoundary context="AppSidebar">
      <AppSidebarInternal {...props} />
    </ComponentErrorBoundary>
  );
}
