'use client';

import { useUser } from '@clerk/nextjs';
import Script from 'next/script';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    ZoomMtg: any;
  }
}

const ZOOM_VERSION = '2.13.0'; // adjust in one place if needed

export default function ZoomJoinClient({
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

  const joinMeeting = async () => {
    setError('');
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
    } catch (e: any) {
      setError(e?.message || 'Error al unirse a la reunión');
    } finally {
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

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Unirse a Clase en Vivo (Zoom)</h2>
          <p className="text-sm text-muted-foreground">
            Ingresa el ID y código entregados por el profesor. La videollamada se abrirá aquí mismo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="meetingNumber">ID de reunión</Label>
            <Input
              id="meetingNumber"
              placeholder="e.g. 123 4567 8901"
              value={meetingNumber}
              onChange={e => setMeetingNumber(e.target.value.replace(/\s/g, ''))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passcode">Código de acceso</Label>
            <Input
              id="passcode"
              placeholder="Código"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Tu nombre</Label>
            <Input
              id="displayName"
              placeholder="Nombre"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button onClick={joinMeeting} disabled={loading}>
            {loading ? 'Conectando...' : 'Unirse a la clase'}
          </Button>
        </div>
      </div>

      {/* Zoom SDK attaches its UI to the document; ensure layout has space below header */}
    </div>
  );
}
