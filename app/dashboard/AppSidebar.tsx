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
} from '@tabler/icons-react';
import Link from 'next/link';
import * as React from 'react';

import { NavDocuments } from '@/app/dashboard/NavDocuments';
import { NavMain } from '@/app/dashboard/NavMain';
import { NavSecondary } from '@/app/dashboard/NavSecondary';
import { NavUser } from '@/app/dashboard/NavUser';
import { Badge } from '@/components/ui/badge';
import { EnergyOrb } from '@/components/EnergyOrb';
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

// Estudiante Turista (Free user) navigation data
const freeUserData = {
  navMain: [
    {
      title: 'Panel de Control',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Convertirse en Iluminado',
      url: '/dashboard/payment-gated',
      icon: IconSparkles,
    },
    {
      title: 'Clases en Vivo (Zoom)',
      url: '/dashboard/payment-gated/zoom',
      icon: IconCamera,
    },
    {
      title: 'Plan de Estudio',
      url: '/dashboard/plan',
      icon: IconListDetails,
    },
    {
      title: 'Simulacros PAES',
      url: '/dashboard/paes',
      icon: IconReport,
    },
    {
      title: 'Repaso Inteligente',
      url: '/dashboard/review',
      icon: IconRefresh,
    },
    {
      title: 'Biblioteca',
      url: '/dashboard/biblioteca',
      icon: IconFolder,
    },
    {
      title: 'Progreso',
      url: '/dashboard/progreso',
      icon: IconChartBar,
    },
    {
      title: 'Analytics Detallados',
      url: '/dashboard/analytics',
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
      name: 'Biblioteca Básica',
      url: '#',
      icon: IconDatabase,
    },
  ],
};

// Estudiante Iluminado (Paid user) navigation data
const paidUserData = {
  navMain: [
    {
      title: 'Panel de Control',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Características Avanzadas',
      url: '/dashboard/payment-gated',
      icon: IconSparkles,
    },
    {
      title: 'Clases en Vivo (Zoom)',
      url: '/dashboard/payment-gated/zoom',
      icon: IconCamera,
    },
    {
      title: 'Plan de Estudio',
      url: '/dashboard/plan',
      icon: IconListDetails,
    },
    {
      title: 'Simulacros PAES',
      url: '/dashboard/paes',
      icon: IconReport,
    },
    {
      title: 'Repaso Inteligente',
      url: '/dashboard/review',
      icon: IconRefresh,
    },
    {
      title: 'Biblioteca',
      url: '/dashboard/biblioteca',
      icon: IconFolder,
    },
    {
      title: 'Progreso',
      url: '/dashboard/progreso',
      icon: IconChartBar,
    },
    {
      title: 'Analytics Detallados',
      url: '/dashboard/analytics',
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
      name: 'Biblioteca de Datos',
      url: '#',
      icon: IconDatabase,
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
      name: 'Asistente IA',
      url: '#',
      icon: IconBrandOpenai,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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

  // Check for live classes
  const liveClassesCount = meetings?.filter(m => {
    const now = Math.floor(Date.now() / 1000);
    return now >= m.startTime && now <= (m.startTime + 3600);
  }).length || 0;

  // Use appropriate data based on user plan
  const data = isFreeUser ? freeUserData : paidUserData;

  return (
    <Sidebar variant="sidebar" collapsible="none" className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-3 hover:bg-sidebar-accent">
              <Link href="/" className="flex items-center gap-3">
                <EnergyOrb size="xl" className="shrink-0" variant="default" userId="astral-brand" />
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
