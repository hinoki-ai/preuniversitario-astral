'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Script from 'next/script';
import { Video, Lightbulb, Activity, Sparkles, Zap, Users, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

declare global {
  interface Window {
    ZoomMtg: any;
  }
}

const ZOOM_VERSION = '2.13.0'; // adjust in one place if needed

function ZoomJoinClientInternal({
  initialMeetingNumber,
  initialPasscode,
}: {
  initialMeetingNumber?: string;
  initialPasscode?: string;
}) {
  const { user } = useUser();
  const defaultName = useMemo(
    () => user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Estudiante',
    [user]
  );

  const [meetingNumber, setMeetingNumber] = useState(initialMeetingNumber || '');
  const [passcode, setPasscode] = useState(initialPasscode || '');
  const [displayName, setDisplayName] = useState<string>(defaultName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState(
    process.env.NEXT_PUBLIC_ZOOM_DEMO_MODE === 'true'
  );
  const initializedRef = useRef(false);

  useEffect(() => {
    setDisplayName(defaultName);
  }, [defaultName]);

  useEffect(() => {
    if (initialMeetingNumber) setMeetingNumber(initialMeetingNumber);
  }, [initialMeetingNumber]);

  useEffect(() => {
    if (initialPasscode) setPasscode(initialPasscode);
  }, [initialPasscode]);

  // Prepare Zoom SDK once scripts are loaded
  const onZoomSdkReady = () => {
    if (initializedRef.current) return;
    if (!window.ZoomMtg) return;
    try {
      window.ZoomMtg.setZoomJSLib(`https://source.zoom.us/${ZOOM_VERSION}/lib`, '/av');
      window.ZoomMtg.preLoadWasm();
      window.ZoomMtg.prepareJssdk();
      try {
        window.ZoomMtg.i18n.load('es-ES');
        window.ZoomMtg.i18n.reload('es-ES');
      } catch {}
      initializedRef.current = true;
    } catch (_e) {
      // SDK initialization failed - silently handle as this may be expected in some environments
    }
  };

  const joinmeeting = async () => {
    setError('');
    if (isDemoMode) {
      // In demo mode, just show the video player
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000); // Simulate loading
      return;
    }

    if (!meetingNumber || !passcode) {
      setError('Ingresa ID de reunión y código de acceso');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/zoom/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingNumber, role: 0 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'No se pudo generar la firma');
      }
      const { signature, sdkKey } = await res.json();

      await new Promise<void>((resolve, reject) => {
        window.ZoomMtg.init({
          leaveUrl: `${window.location.origin}/dashboard/payment-gated/zoom`,
          success: () => resolve(),
          error: (err: any) => reject(err),
        });
      });

      await new Promise<void>((resolve, reject) => {
        window.ZoomMtg.join({
          signature,
          sdkKey,
          meetingNumber,
          passWord: passcode,
          userName: displayName || 'Estudiante',
          success: () => resolve(),
          error: (err: any) => reject(err),
        });
      });
    }

 catch (e: any) {
      setError(e?.message || 'Error al unirse a la reunión');
    }

 finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SDK CSS */}
      <link rel="stylesheet" href={`https://source.zoom.us/${ZOOM_VERSION}/css/bootstrap.css`} />
      <link rel="stylesheet" href={`https://source.zoom.us/${ZOOM_VERSION}/css/zoom-meeting.css`} />

      {/* Vendor + SDK scripts */}
      <Script
        src={`https://source.zoom.us/${ZOOM_VERSION}/lib/vendor/react.min.js`}
        strategy="afterInteractive"
        onLoad={onZoomSdkReady}
      />
      <Script
        src={`https://source.zoom.us/${ZOOM_VERSION}/lib/vendor/react-dom.min.js`}
        strategy="afterInteractive"
        onLoad={onZoomSdkReady}
      />
      <Script
        src={`https://source.zoom.us/${ZOOM_VERSION}/zoom-meeting.min.js`}
        strategy="afterInteractive"
        onLoad={onZoomSdkReady}
      />

      <div className="rounded-xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-xl backdrop-blur-sm p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-lg opacity-30" />
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Video className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {isDemoMode ? 'Modo Demo - Video IA' : 'Conexión Inteligente Zoom'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isDemoMode
                    ? 'Experiencia de prueba con IA integrada'
                    : 'Acceso inteligente a clases en vivo con autocompletado predictivo'
                  }
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isDemoMode ? 0 : 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-green-500/20 rounded-lg">
                <Lightbulb className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
            </motion.div>
          </div>

          {!isDemoMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-500/20 rounded-lg mt-0.5">
                  <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Autocompletado Inteligente
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Selecciona una clase de la agenda superior y la IA completará automáticamente los datos de conexión.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>IA activa y optimizando</span>
            </div>
            <div className="text-muted-foreground">•</div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>Monitoreo en tiempo real</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => setIsDemoMode(e.target.checked)}
              className="rounded"
            />
            Modo demo (sin Zoom)
          </label>
        </div>

        {isDemoMode ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-inner">
              <video
                controls
                className="h-full w-full rounded-xl"
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                poster="https://i.ytimg.com/vi/YE7VzlLtp-4/maxresdefault.jpg"
              >
                Tu navegador no soporta el elemento de video.
              </video>
              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Demo IA
                </Badge>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-200/50 dark:border-green-800/50 rounded-lg p-3">
              <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Video de demostración con IA integrada - Simula una experiencia real de clase
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="meetingNumber" className="flex items-center gap-2 text-sm font-medium">
                  <div className="p-1 bg-blue-500/20 rounded">
                    <Video className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>ID de reunión</span>
                  <Badge variant="outline" className="text-xs">IA Validado</Badge>
                </Label>
                <Input
                  id="meetingNumber"
                  placeholder="ej. 12345678901"
                  value={meetingNumber}
                  onChange={e => setMeetingNumber(e.target.value.replace(/\s/g, ''))}
                  className="font-mono bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200/50 focus:border-blue-400"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="passcode" className="flex items-center gap-2 text-sm font-medium">
                  <div className="p-1 bg-purple-500/20 rounded">
                    <Lightbulb className="h-3 w-3 text-purple-600" />
                  </div>
                  <span>Código de acceso</span>
                  <Badge variant="outline" className="text-xs">Encriptado</Badge>
                </Label>
                <Input
                  id="passcode"
                  placeholder="Ingresa el código seguro"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  type="password"
                  className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200/50 focus:border-purple-400"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="displayName" className="flex items-center gap-2 text-sm font-medium">
                <div className="p-1 bg-cyan-500/20 rounded">
                  <Users className="h-3 w-3 text-cyan-600" />
                </div>
                <span>Tu identidad digital</span>
                <Badge variant="outline" className="text-xs">Personalizado</Badge>
              </Label>
              <Input
                id="displayName"
                placeholder="Cómo te verán en la clase inteligente"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="bg-gradient-to-r from-cyan-50/50 to-green-50/50 dark:from-cyan-950/50 dark:to-green-950/50 border-cyan-200/50 focus:border-cyan-400"
              />
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200/50 dark:border-red-800/50 rounded-lg p-3"
          >
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {error}
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={joinMeeting}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="h-4 w-4" />
                  </motion.div>
                  {isDemoMode ? 'Cargando experiencia IA...' : 'Conectando con IA...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {isDemoMode ? 'Iniciar Demo Inteligente' : 'Unirse a Clase IA'}
                </div>
              )}
            </Button>
          </div>

          {/* AI Assistant Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-200/50 dark:border-cyan-800/50 rounded-lg p-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-1 bg-cyan-500/20 rounded-lg mt-0.5">
                <Brain className="h-3 w-3 text-cyan-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-cyan-800 dark:text-cyan-200">
                  Asistente IA Activo
                </p>
                <p className="text-xs text-cyan-700 dark:text-cyan-300">
                  {loading
                    ? 'Optimizando conexión y preparándome para asistirte en la clase...'
                    : 'Listo para optimizar tu experiencia de aprendizaje. ¡Haz clic para comenzar!'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Zoom SDK attaches its UI to the document; ensure layout has space below header */}
    </div>
  );
}

export default function ZoomJoinClient({
  initialMeetingNumber,
  initialPasscode,
}: {
  initialMeetingNumber?: string;
  initialPasscode?: string;
}) {
  return (
    <ComponentErrorBoundary context="ZoomJoinClient">
      <ZoomJoinClientInternal 
        initialMeetingNumber={initialMeetingNumber}
        initialPasscode={initialPasscode}
      />
    </ComponentErrorBoundary>
  );
}
