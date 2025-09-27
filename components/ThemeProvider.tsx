'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';
import { usePathname } from 'next/navigation';
import * as React from 'react';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  // Force dark theme for homepage and other non-dashboard routes
  const themeProps: ThemeProviderProps = isDashboard
    ? { ...props } // Dashboard can have theme switching
    : {
        ...props,
        defaultTheme: "dark",
        enableSystem: false,
        disableTransitionOnChange: true
      };

  return <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>;
}
