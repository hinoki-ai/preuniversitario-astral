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
              colorPrimary: '#8b5cf6',
              colorBackground: 'rgba(0, 0, 0, 0.1)',
              colorInputBackground: 'rgba(255, 255, 255, 0.1)',
              colorInputText: '#ffffff',
              colorText: '#ffffff',
              borderRadius: '8px',
            },
            elements: {
              card: 'backdrop-blur-md border border-white/20 shadow-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-300',
              formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
              formFieldInput: 'text-white placeholder:text-gray-400',
              formFieldLabel: 'text-gray-300',
              footerActionLink: 'text-purple-400 hover:text-purple-300',
              socialButtonsBlockButton: 'border-white/20 hover:border-white/40',
              socialButtonsBlockButtonText: 'text-white',
              dividerLine: 'bg-white/20',
              dividerText: 'text-gray-400',
            },
          }}
        />
      </div>
    </div>
  );
}
