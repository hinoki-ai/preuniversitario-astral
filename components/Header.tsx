'use client';

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { GraduationCap, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { SettingsModal } from '@/components/SettingsModal';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useStandardErrorHandling } from '@/lib/core/error-wrapper';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

const navItems = [
  { href: '#features', label: 'Programas' },
  { href: '/media', label: 'Multimedia' },
  { href: '#testimonials', label: 'Testimonios' },
  { href: '#pricing', label: 'Precios' },
  { href: '#contact', label: 'Contacto' },
];

function HeaderLogo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-3 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg sm:h-11 sm:w-11">
        <GraduationCap className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <h1 className="font-serif text-lg font-bold text-foreground sm:text-xl">
          Preuniversitario Astral
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">Excelencia en Educación</p>
      </div>
    </Link>
  );
}

function DesktopNav({ mounted }: { mounted: boolean }) {
  const { isSignedIn } = useUser();

  return (
    <nav className="hidden items-center gap-6 lg:gap-8 md:flex">
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
                  className="border-primary bg-transparent text-primary transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-foreground"
                >
                  Iniciar Sesión
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-accent text-accent-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-accent/90 hover:shadow-accent/25">
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

type NavigationLink = (typeof navItems)[number];

function MobileNav({
  mounted,
  isOpen,
  onOpenChange,
}: {
  mounted: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isSignedIn } = useUser();

  const renderNavLink = (item: NavigationLink) => {
    const baseClasses =
      'flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted hover:text-foreground';

    if (item.href.startsWith('/')) {
      return (
        <SheetClose key={item.href} asChild>
          <Link href={item.href} className={baseClasses}>
            {item.label}
          </Link>
        </SheetClose>
      );
    }

    return (
      <SheetClose key={item.href} asChild>
        <a href={item.href} className={baseClasses}>
          {item.label}
        </a>
      </SheetClose>
    );
  };

  const closeMenu = () => onOpenChange(false);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex h-full w-full max-w-sm flex-col gap-0 p-0"
          id="mobile-navigation"
        >
          <div className="border-b px-5 py-4">
            <HeaderLogo className="gap-3" />
          </div>
          <nav className="flex flex-1 flex-col gap-2 px-3 py-6">
            {navItems.map(renderNavLink)}
          </nav>
          <div className="space-y-3 border-t px-5 py-5">
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">Tema</span>
              <ModeToggle />
            </div>
            {mounted && (
              !isSignedIn ? (
                <div className="grid gap-3">
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={closeMenu}
                    >
                      Iniciar Sesión
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button
                      className="w-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 hover:shadow-accent/25"
                      onClick={closeMenu}
                    >
                      Comenzar Ahora
                    </Button>
                  </SignUpButton>
                </div>
              ) : (
                <div className="grid gap-3">
                  <SettingsModal />
                  <SheetClose asChild>
                    <Link href="/dashboard">
                      <Button className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/25">
                        Panel de Control
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              )
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
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

  const handleMenuToggle = (open: boolean) => {
    safeSyncCall(() => setIsMenuOpen(open), 'toggleMenu');
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 sm:py-3">
          <HeaderLogo />
          <DesktopNav mounted={mounted} />
          <MobileNav mounted={mounted} isOpen={isMenuOpen} onOpenChange={handleMenuToggle} />
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
