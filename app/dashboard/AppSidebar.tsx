'use client';

import { useUser } from '@clerk/nextjs';
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
} from '@tabler/icons-react';
import Link from 'next/link';
import * as React from 'react';

import { NavDocuments } from '@/app/dashboard/NavDocuments';
import { NavMain } from '@/app/dashboard/NavMain';
import { NavSecondary } from '@/app/dashboard/NavSecondary';
import { NavUser } from '@/app/dashboard/NavUser';
import { ChatMaxingIconColored } from '@/components/Logo';
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

// Estudiante Turista (Free user) navigation data
const freeUserData = {
  navMain: [
    {
      title: 'Dashboard',
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
      title: 'Biblioteca',
      url: '/dashboard/biblioteca',
      icon: IconFolder,
    },
    {
      title: 'Progreso',
      url: '/dashboard/progreso',
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

// Estudiante Iluminado (Paid user) navigation data
const paidUserData = {
  navMain: [
    {
      title: 'Dashboard',
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
      title: 'Biblioteca',
      url: '/dashboard/biblioteca',
      icon: IconFolder,
    },
    {
      title: 'Progreso',
      url: '/dashboard/progreso',
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

  // Determine access label: consider active trial as paid-equivalent
  const isFreeUser = (() => {
    const plan = (user?.publicMetadata as any)?.plan as string | undefined;
    const trialRaw = (user?.publicMetadata as any)?.trialEndsAt as any;
    let trialEndsAt: number | undefined;
    if (typeof trialRaw === 'number') trialEndsAt = trialRaw;
    else if (typeof trialRaw === 'string') {
      const n = Number(trialRaw);
      if (!Number.isNaN(n) && n > 1000000000) trialEndsAt = n;
      else {
        const d = new Date(trialRaw);
        if (!isNaN(d.getTime())) trialEndsAt = Math.floor(d.getTime() / 1000);
      }
    }
    const now = Math.floor(Date.now() / 1000);
    const trialActive =
      plan === 'trial_user' && typeof trialEndsAt === 'number' && trialEndsAt > now;
    if (trialActive) return false;
    if (plan === 'free_user') return true;
    // If any org explicitly marks free_user, treat as free; otherwise assume paid
    const orgIsFree = (user?.organizationMemberships || []).some(
      (m: any) => (m.organization.publicMetadata as any)?.plan === 'free_user'
    );
    return orgIsFree;
  })();

  // Use appropriate data based on user plan
  const data = isFreeUser ? freeUserData : paidUserData;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <ChatMaxingIconColored className="!size-6" />
                <span className="text-base font-semibold">Preuniversitario Astral</span>
                <Badge variant="outline" className="text-muted-foreground text-xs">
                  {isFreeUser ? 'Estudiante Turista' : 'Estudiante Iluminado'}
                </Badge>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
