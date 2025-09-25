'use client';

import { useMutation, useQuery } from 'convex/react';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useErrorHandler } from '@/lib/core/error-system';

// Custom hook for robust polling with error handling and retry logic
function usePolling(interval: number = 30000, maxRetries: number = 3) {
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const poll = useCallback(() => {
    if (!isPolling) return;
    setPollCount(prev => prev + 1);
  }, [isPolling]);
  useEffect(() => {
    const pollInterval = setInterval(poll, interval);
    return () => clearInterval(pollInterval);
  }, [poll, interval]);
  const handleError = useCallback((error: Error) => {
    setLastError(error);
    setErrorCount(prev => prev + 1);
    if (errorCount >= maxRetries) {
      setIsPolling(false);
      console.error('Polling stopped due to too many errors:', error);
    }
  }, [errorCount, maxRetries]);
  const resetErrorCount = useCallback(() => {
    setErrorCount(0);
    setLastError(null);
  }, []);
  const startPolling = useCallback(() => {
    setIsPolling(true);
    resetErrorCount();
  }, [resetErrorCount]);
  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);
  return {
    pollCount,
    isPolling,
    errorCount,
    lastError,
    handleError,
    resetErrorCount,
    startPolling,
    stopPolling,
  };
}

type MeetingItem = any; // Using any for now - proper typing needed

type MeetingStatus = any; // Using any for now - proper typing needed

export default function BasicSchedule({ onPick }: { onPick?: (m: MeetingItem) => void }) {
  const { handleError, wrapAsync } = useErrorHandler();
  const meetings = useQuery(api.meetings.listUpcoming, {});
  const myRsvps = useQuery(api.meetings.listMyRsvps, {});
  const rsvp = useMutation(api.meetings.rsvp);

  const [meetingStatuses, setMeetingStatuses] = useState<Record<string, MeetingStatus>>({});
  const [lastPollTime, setLastPollTime] = useState(Date.now());

  const items = useMemo(() => meetings ?? [], [meetings]);

  // Use robust polling with error handling
  const { pollCount, isPolling, errorCount, lastError, handleError: handlepollingerror, startpolling, stoppollingisPolling,errorCount,lastError,handleError } = usePolling(30000, 3);

  // Poll for meeting status updates with error handling
  useEffect(() => {
    const poll = () => {
      if (!isPolling) return;

      try {
        setLastPollTime(Date.now());
        // The Convex queries will automatically refetch due to the timestamp dependency
      } catch (error) {
        handlePollingError(error as Error);
      }
    };

    const pollInterval = setInterval(poll, 30000);
    return () => clearInterval(pollInterval);
  }, [isPolling, handlePollingError]);

  // Update meeting statuses when RSVPs change
  useEffect(() => {
    if (myRsvps && meetings) {
      try {
        // Create a map of meeting statuses based on current data
        const statusMap: Record<string, MeetingStatus> = {};

        meetings.forEach(meeting => {
          const rsvp = myRsvps.find(r => r.meetingId === meeting._id);
          if (rsvp) {
            statusMap[meeting._id] = {
              id: meeting._id,
              title: meeting.title,
              startTime: meeting.startTime,
              endTime: meeting.startTime + 3600, // Assume 1 hour
              isActive: false, // Will be calculated by actual query
              isUpcoming: false,
              isPast: false,
              rsvpCounts: { yes: 0, no: 0, maybe: 0 },
              totalRsvps: 0,
              myRsvp: rsvp.status as 'yes' | 'no' | 'maybe',
              lastUpdated: rsvp.updatedAt,
            };
          }
        });

        setMeetingStatuses(statusMap);
      } catch (error) {
        handlePollingError(error as Error);
      }
    }
  }, [myRsvps, meetings, handlePollingError]);

  if (!meetings) {
    return <Card className="p-4">Cargando agenda…</Card>;
  }

  if (items.length === 0) {
    return <Card className="p-4">No hay clases programadas por ahora.</Card>;
  }

  // Show polling status and errors
  const showPollingStatus = errorCount > 0 || !isPolling;

  return (
    <div className="space-y-3">
      {/* Polling status indicator */}
      {showPollingStatus && (
        <Card className="p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={errorCount > 0 ? 'destructive' : 'outline'}>
                {errorCount > 0 ? `⚠️ Errores: ${errorCount}` : '✅ Actualizaciones en vivo'}
              </Badge>
              <span className="text-muted-foreground">
                Última actualización: {new Date(lastPollTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex gap-2">
              {!isPolling && (
                <Button size="sm" variant="outline" onClick={startPolling}>
                  ▶️ Reanudar
                </Button>
              )}
              {isPolling && (
                <Button size="sm" variant="outline" onClick={stopPolling}>
                  ⏸️ Pausar
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {items.map((m: MeetingItem) => {
        const dt = new Date(m.startTime * 1000);
        const canJoin = !!m.meetingNumber && !!m.passcode;
        const now = Math.floor(Date.now() / 1000);
        const isActive = now >= m.startTime && now <= (m.startTime + 3600);
        const isUpcoming = now < m.startTime;
        const isPast = now > (m.startTime + 3600);

        const meetingStatus = meetingStatuses[m._id];

        return (
          <Card key={m._id} className={`p-4 flex flex-col gap-3 ${isActive ? 'border-green-500 bg-green-50' : ''}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{m.title}</div>
                  <Badge variant={isActive ? 'default' : isUpcoming ? 'secondary' : 'outline'}>
                    {isActive ? '🔴 EN VIVO' : isUpcoming ? '⏰ Próxima' : '✅ Finalizada'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{dt.toLocaleString()}</div>
                {isActive && (
                  <div className="text-xs text-green-600 font-medium">
                    ¡La clase está en vivo! Únete ahora.
                  </div>
                )}
              </div>
              {onPick && (
                <Button
                  variant={canJoin && isActive ? 'default' : 'outline'}
                  disabled={!canJoin}
                  onClick={() => onPick(m)}
                  className={isActive ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {canJoin ? (isActive ? '🔴 Unirse ahora' : 'Usar en el formulario') : 'Solo para iluminados'}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground">
                RSVP: {m.myRsvp ?? '—'}
              </Badge>
              {meetingStatus && (
                <Badge variant="outline" className="text-muted-foreground">
                  Confirmados: {meetingStatus.rsvpCounts?.yes || 0}
                </Badge>
              )}
              <Button size="sm" variant="outline" onClick={() => downloadIcs(m)}>
                📅 Calendario
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await wrapAsync(
                      () =>
                        rsvp({
                          meetingId: m._id,
                          status: m.myRsvp === 'yes' ? 'maybe' : 'yes',
                        }),
                      'BasicSchedule.rsvp'
                    );
                  } catch (error) {
                    // Error already handled by wrapAsync
                  }
                }}
              >
                {m.myRsvp === 'yes' ? 'Cambiar a "quizás"' : '✅ Confirmar asistencia'}
              </Button>
            </div>
            {m.attachments && m.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {m.attachments.map((a: { name: string; url: string }, idx: number) => (
                  <a
                    key={idx}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                  >
                    {a.name}
                  </a>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function downloadics(m: meetingitem) {
  const dtStart = new Date(m.startTime * 1000);
  const dtEnd = new Date((m.startTime + 60 * 60) * 1000); // default 1h
  const format = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}t${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  };
  const uid = `${m._id}@preuniversitario-astral`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Preuniversitario Astral//Meetings//ES',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${format(new Date())}`,
    `DTSTART:${format(dtStart)}`,
    `DTEND:${format(dtEnd)}`,
    `SUMMARY:${escapeText(m.title)}`,
    m.description ? `DESCRIPTION:${escapeText(m.description)}` : undefined,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${m.title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapetext(s: string) {
  return s.replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
}
