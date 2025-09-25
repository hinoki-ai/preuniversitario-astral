'use client';

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import { GraduationCap, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a simple header during SSR
  if (!mounted) {
    return (
      <header className="fixed top-0 w-full z-50 bg-cream/80 backdrop-blur-md border-b border-sage/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-deep-blue rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-cream" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold text-deep-blue">
                  Preuniversitario Astral
                </h1>
                <p className="text-xs text-sage">Excelencia en Educación</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-deep-blue hover:text-accent transition-colors">
                Programas
              </a>
              <a href="#testimonials" className="text-deep-blue hover:text-accent transition-colors">
                Testimonios
              </a>
              <a href="#pricing" className="text-deep-blue hover:text-accent transition-colors">
                Precios
              </a>
              <a href="#contact" className="text-deep-blue hover:text-accent transition-colors">
                Contacto
              </a>
            </nav>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-cream/80 backdrop-blur-md border-b border-sage/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-deep-blue rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-cream" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-deep-blue">
                Preuniversitario Astral
              </h1>
              <p className="text-xs text-sage">Excelencia en Educación</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-deep-blue hover:text-accent transition-colors">
              Programas
            </a>
            <a href="#testimonials" className="text-deep-blue hover:text-accent transition-colors">
              Testimonios
            </a>
            <a href="#pricing" className="text-deep-blue hover:text-accent transition-colors">
              Precios
            </a>
            <a href="#contact" className="text-deep-blue hover:text-accent transition-colors">
              Contacto
            </a>
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-cream bg-transparent"
                  >
                    Iniciar Sesión
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-accent hover:bg-accent/90 text-cream">
                    Comenzar Ahora
                  </Button>
                </SignUpButton>
              </>
            ) : (
              <Link href="/dashboard">
                <Button className="bg-deep-blue hover:bg-deep-blue/90 text-cream">Panel de Control</Button>
              </Link>
            )}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
