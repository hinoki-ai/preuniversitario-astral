'use client';

import { SignUp } from '@clerk/nextjs';

import AuroraBorealisShader from '@/components/ui/aurora-borealis-shader';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AuroraBorealisShader />
      <div className="relative z-10">
        <SignUp
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
      </div>
    </div>
  );
}
