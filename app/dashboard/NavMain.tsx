'use client';

import { IconCirclePlusFilled, IconMail, type Icon } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { LimelightNav, NavItem } from '@/components/ui/limelight-nav';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [optimisticPath, setOptimisticPath] = useOptimistic(pathname);
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (url: string) => {
    startTransition(() => {
      setOptimisticPath(url);
      router.push(url);
    });
  };

  // Convert items to NavItem format for LimelightNav
  const navItems: NavItem[] = items.map((item, index) => ({
    id: `nav-${index}`,
    icon: item.icon ? <item.icon className="w-5 h-5" /> : <IconCirclePlusFilled className="w-5 h-5" />,
    label: item.title,
    onClick: () => handleNavigation(item.url),
  }));

  // Find the active index based on current path
  const activeIndex = items.findIndex(item => 
    optimisticPath === item.url || (optimisticPath === '/dashboard' && item.url === '/dashboard')
  );

  return (
    <SidebarGroup>
      <SidebarGroupContent
        className="flex flex-col gap-4"
        data-pending={isPending ? '' : undefined}
      >
        {/* Quick create button */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 mb-2 px-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground duration-200 ease-linear flex-1"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* LimelightNav for main navigation */}
        <div className="px-2">
          <LimelightNav
            items={navItems}
            activeIndex={activeIndex >= 0 ? activeIndex : 0}
            className="w-full bg-card/50 dark:bg-card/30 border-border/50 backdrop-blur-sm"
            limelightClassName="bg-primary shadow-[0_0_20px_var(--primary)] dark:shadow-[0_0_25px_var(--primary)]"
            iconContainerClassName="p-3"
            onTabChange={index => {
              if (items[index]) {
                handleNavigation(items[index].url);
              }
            }}
          />
        </div>

      </SidebarGroupContent>
    </SidebarGroup>
  );
}
