'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import {
  IconBrandOpenai,
  IconCamera,
  IconChartBar,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconRefresh,
  IconReport,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTarget as IconTargetAlt,
  type Icon,
} from '@tabler/icons-react';
import Link from 'next/link';
import * as React from 'react';

import { NavDocuments } from '@/app/dashboard/NavDocuments';
import { NavMain } from '@/app/dashboard/NavMain';
import { NavSecondary } from '@/app/dashboard/NavSecondary';
import { NavUser } from '@/app/dashboard/NavUser';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { api } from '@/convex/_generated/api';
import { resolveAccessState } from '@/lib/subscription';

type NavigationItem = {
  title: string;
  url: string;
  icon: Icon;
};

type NavigationDocument = {
  name: string;
  url: string;
  icon: Icon;
};

interface NavigationData {
  navMain: NavigationItem[];
  navSecondary: NavigationItem[];
  documents: NavigationDocument[];
}

// Estudiante Turista (Free user) navigation data - Limited features
const freeUserData: NavigationData = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconTargetAlt,
    },
    {
      title: 'Convertirse en Iluminado',
      url: '/dashboard/payment-gated',
      icon: IconSparkles,
    },
    {
      title: 'Biblioteca',
      url: '/dashboard/biblioteca',
      icon: IconFolder,
    },
    {
      title: 'Plan de Estudio',
      url: '/dashboard/plan',
      icon: IconListDetails,
    },
    {
      title: 'Progreso',
      url: '/dashboard/progreso',
      icon: IconRefresh,
    },
    {
      title: 'Análisis',
      url: '/dashboard/analytics',
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: 'Configuración',
      url: '#',
      icon: IconSettings,
    },
    {
      title: 'Ayuda',
      url: '#',
      icon: IconHelp,
    },
    {
      title: 'Buscar',
      url: '#',
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: 'Biblioteca Básica',
      url: '#',
      icon: IconDatabase,
    },
  ],
};

// Estudiante Iluminado (Paid user) navigation data - Full features
const paidUserData: NavigationData = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconTargetAlt,
    },
    {
      title: 'Asistente IA',
      url: '/dashboard/ai-assistant',
      icon: IconBrandOpenai,
    },
    {
      title: 'Media',
      url: '/dashboard/media',
      icon: IconCamera,
    },
    {
      title: 'Plan de Estudio',
      url: '/dashboard/plan',
      icon: IconListDetails,
    },
    {
      title: 'Diagnóstico',
      url: '/dashboard/diagnostic',
      icon: IconReport,
    },
    {
      title: 'Progreso',
      url: '/dashboard/progreso',
      icon: IconRefresh,
    },
    {
      title: 'Biblioteca',
      url: '/dashboard/biblioteca',
      icon: IconFolder,
    },
    {
      title: 'Análisis',
      url: '/dashboard/analytics',
      icon: IconChartBar,
    },
    {
      title: 'PAES',
      url: '/dashboard/paes',
      icon: IconReport,
    },
  ],
  navSecondary: [
    {
      title: 'Configuración',
      url: '#',
      icon: IconSettings,
    },
    {
      title: 'Ayuda',
      url: '#',
      icon: IconHelp,
    },
    {
      title: 'Buscar',
      url: '#',
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: 'Asistente IA',
      url: '#',
      icon: IconBrandOpenai,
    },
    {
      name: 'Reportes',
      url: '#',
      icon: IconReport,
    },
    {
      name: 'Asistente de Word',
      url: '#',
      icon: IconFileWord,
    },
    {
      name: 'Biblioteca de Datos',
      url: '#',
      icon: IconDatabase,
    },
  ],
};

function AppSidebarInternal({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const meetings = useQuery(api.meetings.listUpcoming, {});

  const publicMetadata = (user?.publicMetadata ?? {}) as Record<string, unknown>;
  const plan = typeof publicMetadata.plan === 'string' ? publicMetadata.plan : undefined;
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
    : 'Estudiante Turista';

  const liveClassesCount =
    meetings?.filter(meeting => {
      const now = Math.floor(Date.now() / 1000);
      return now >= meeting.startTime && now <= meeting.startTime + 3600;
    }).length || 0;

  const data = isFreeUser ? freeUserData : paidUserData;

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
        <div className="flex h-full flex-col">
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

