"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconMessageCircle,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconSparkles,
  IconBrandOpenai,
} from "@tabler/icons-react"

import { NavDocuments } from "@/app/dashboard/nav-documents"
import { NavMain } from "@/app/dashboard/nav-main"
import { NavSecondary } from "@/app/dashboard/nav-secondary"
import { NavUser } from "@/app/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChatMaxingIconColoured } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

// Estudiante Turista (Free user) navigation data
const freeUserData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Convertirse en Iluminado",
      url: "/dashboard/payment-gated",
      icon: IconSparkles,
    },
    {
      title: "Clases en Vivo (Zoom)",
      url: "/dashboard/payment-gated/zoom",
      icon: IconCamera,
    },
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Ayuda",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Buscar",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Biblioteca Básica",
      url: "#",
      icon: IconDatabase,
    },
  ],
}

// Estudiante Iluminado (Paid user) navigation data
const paidUserData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Características Avanzadas",
      url: "/dashboard/payment-gated",
      icon: IconSparkles,
    },
    {
      title: "Clases en Vivo (Zoom)",
      url: "/dashboard/payment-gated/zoom",
      icon: IconCamera,
    },
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Ayuda",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Buscar",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Biblioteca de Datos",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reportes",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Asistente de Word",
      url: "#",
      icon: IconFileWord,
    },
    {
      name: "Asistente IA",
      url: "#",
      icon: IconBrandOpenai,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()

  // Check if user has free_user plan
  const isFreeUser = user?.publicMetadata?.plan === 'free_user' ||
                    user?.organizationMemberships?.some(membership =>
                      membership.organization.publicMetadata?.plan === 'free_user'
                    )

  // Use appropriate data based on user plan
  const data = isFreeUser ? freeUserData : paidUserData

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <ChatMaxingIconColoured className="!size-6" />
                <span className="text-base font-semibold">Preuniversitario Astral</span>
                <Badge variant="outline" className="text-muted-foreground text-xs">
                  {isFreeUser ? "Estudiante Turista" : "Estudiante Iluminado"}
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
  )
}
