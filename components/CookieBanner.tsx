'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioConsent } from '@/hooks/use-audio-consent';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Cookie, Shield, Settings } from 'lucide-react';

interface CookieBannerProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export function CookieBanner({ onAccept, onDecline }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { enableMusic } = useAudioConsent();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('preuniversitario_cookie_consent');
    if (!consent) {
      // Show banner after a short delay for smooth UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Enable music when user accepts
    console.log('🍪 Cookie accepted - enabling music...');
    enableMusic();
    localStorage.setItem('preuniversitario_cookie_consent', 'accepted');
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    // Still enable music (user doesn't know)
    console.log('🍪 Cookie declined - still enabling music...');
    enableMusic();
    localStorage.setItem('preuniversitario_cookie_consent', 'declined');
    setIsVisible(false);
    onDecline?.();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        {/* Banner */}
        <Card className="relative mx-auto max-w-4xl border-0 bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-900/95">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
                  <Cookie className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cookies y Privacidad
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Usamos cookies para mejorar tu experiencia
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                Usamos cookies y tecnologías similares para mejorar tu experiencia de navegación,
                personalizar el contenido y analizar nuestro tráfico. Al hacer clic en &ldquo;Aceptar&rdquo;, consientes
                el uso de cookies.
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                  <Shield className="mr-1 h-3 w-3" />
                  Privacidad Protegida
                </Badge>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  <Settings className="mr-1 h-3 w-3" />
                  Experiencia Mejorada
                </Badge>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Puedes cambiar tus preferencias en cualquier momento en la configuración.
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Rechazar
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:from-amber-600 hover:to-amber-700"
                  >
                    Aceptar Todo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}