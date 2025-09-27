'use client';

import { usePathname } from 'next/navigation';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AudioControls } from '@/components/AudioControls';
import { ModeToggle } from '@/components/ModeToggle';
import { useAudioConsent } from '@/hooks/use-audio-consent';

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
  const { preferences, isLoaded } = useAudioConsent();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="size-8 -ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-[orientation=vertical]:h-4" />
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      {/* Theme Toggle - only show in dashboard */}
      <div className="flex items-center gap-2 pr-4">
        <ModeToggle variant="compact" showLabel={false} />
      </div>

      {/* Audio Controls - only show in dashboard if music is enabled and user has consented */}
      {isLoaded && preferences.musicEnabled && preferences.hasConsented && (
        <AudioControls />
      )}
    </header>
  );
}
