'use client';
import type React from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface aurorabackgroundprops extends react.HTMLProps<HTMLDivElement> {
  children: reactnode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          'relative flex flex-col h-[100vh] items-center justify-center bg-cream text-deep-blue transition-bg',
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
            [--white-gradient:repeating-linear-gradient(100deg,var(--cream)_0%,var(--cream)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--cream)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--deep-blue)_0%,var(--deep-blue)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--deep-blue)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--accent)_10%,var(--sage)_15%,var(--accent)_20%,var(--deep-blue)_25%,var(--accent)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-30 will-change-transform`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
