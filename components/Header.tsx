'use client';

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { GraduationCap, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { SettingsModal } from '@/components/SettingsModal';
import { useStandardErrorHandling } from '@/lib/core/error-wrapper';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

const navItems = [
  { href: '#features', label: 'Programas' },
  { href: '/media', label: 'Multimedia' },
  { href: '#testimonials', label: 'Testimonios' },
  { href: '#pricing', label: 'Precios' },
  { href: '#contact', label: 'Contacto' },
];

function HeaderLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
        <GraduationCap className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <h1 className="font-serif text-xl font-bold text-foreground">
          Preuniversitario Astral
        </h1>
        <p className="text-xs text-muted-foreground">Excelencia en Educación</p>
      </div>
    </div>
  );
}

function HeaderNav({ mounted }: { mounted: boolean }) {
  const { isSignedIn } = useUser();

  return (
    <nav className="hidden md:flex items-center gap-8">
      {navItems.map((item) => (
        item.href.startsWith('/') ? (
          <Link
            key={item.href}
            href={item.href}
            className="text-foreground hover:text-accent font-medium hover:scale-105 transition-all duration-200"
          >
            {item.label}
          </Link>
        ) : (
          <a
            key={item.href}
            href={item.href}
            className="text-foreground hover:text-accent font-medium hover:scale-105 transition-all duration-200"
          >
            {item.label}
          </a>
        )
      ))}
      <div className="flex items-center gap-2">
        <ModeToggle />
        {mounted && isSignedIn && <SettingsModal />}
      </div>
      {mounted && (
        <>
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent transition-all duration-200 hover:scale-105"
                >
                  Iniciar Sesión
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-accent/25 transition-all duration-200 hover:scale-105">
                  Comenzar Ahora
                </Button>
              </SignUpButton>
            </>
          ) : (
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:scale-105">
                Panel de Control
              </Button>
            </Link>
          )}
        </>
      )}
    </nav>
  );
}

function HeaderInternal() {
  const { handleError, safeSyncCall } = useStandardErrorHandling('Header');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    safeSyncCall(() => {
      setMounted(true);
    }, 'mount');
  }, [safeSyncCall]);

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <HeaderLogo />
          <HeaderNav mounted={mounted} />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => safeSyncCall(() => setIsMenuOpen(!isMenuOpen), 'toggleMenu')}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <ComponentErrorBoundary context="Header">
      <HeaderInternal />
    </ComponentErrorBoundary>
  );
}
