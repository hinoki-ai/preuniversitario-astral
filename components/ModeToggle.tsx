'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import * as React from 'react';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  variant?: 'default' | 'compact';
  showLabel?: boolean;
  className?: string;
}

export function ModeToggle({
  variant = 'default',
  showLabel = false,
  className
}: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showLabel && (
          <span className="text-sm font-medium text-foreground">
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
        <div className="relative">
          <Switch
            checked={isDark}
            onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
            className="h-6 w-11"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isDark ? (
              <Moon className="h-4 w-4 text-primary-foreground" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Sun className={cn(
        'h-5 w-5 transition-colors',
        isDark ? 'text-muted-foreground' : 'text-amber-500'
      )} />
      <Switch
        checked={isDark}
        onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
        className="h-6 w-12 data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
      />
      <Moon className={cn(
        'h-5 w-5 transition-colors',
        isDark ? 'text-primary-foreground' : 'text-muted-foreground'
      )} />
    </div>
  );
}
