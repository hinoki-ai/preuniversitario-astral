'use client';

import { usePathname } from 'next/navigation';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

function getPageTitle(pathname: string): string {
  // Handle exact matches first
  switch (pathname) {
    case '/dashboard/progreso':
      return 'Progreso';
    default:
      return 'Page';
  }
}

export function SiteHeader() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="size-8 -ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-[orientation=vertical]:h-4" />
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
    </header>
  );
}
