'use client';

import { SignIn } from '@clerk/nextjs';

import { AuroraBackground } from '@/components/ui/aurora-background';

export default function SignInPage() {
  return (
    <AuroraBackground>
      <SignIn
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: 'hsl(var(--accent))',
            colorBackground: 'rgba(0, 0, 0, 0.1)',
            colorInputBackground: 'rgba(255, 255, 255, 0.1)',
            colorInputText: 'hsl(var(--foreground))',
            colorText: 'hsl(var(--foreground))',
            borderRadius: '8px',
          },
          elements: {
            card: 'backdrop-blur-md border-border/20 shadow-2xl',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
            formFieldInput: 'text-foreground placeholder:text-muted-foreground',
            formFieldLabel: 'text-muted-foreground',
            footerActionLink: 'text-accent hover:text-accent/80',
            socialButtonsBlockButton: 'border-border/20 hover:border-border/40',
            socialButtonsBlockButtonText: 'text-foreground',
            dividerLine: 'bg-border/20',
            dividerText: 'text-muted-foreground',
          },
        }}
      />
    </AuroraBackground>
  );
}
