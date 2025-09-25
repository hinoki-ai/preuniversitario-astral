'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';
import * as React from 'react';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <nextthemesprovider {...props}>{children}</NextThemesProvider>;
}
