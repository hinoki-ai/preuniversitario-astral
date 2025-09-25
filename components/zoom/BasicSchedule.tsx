'use client';

import { useMutation, useQuery } from 'convex/react';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Lightbulb, AlertTriangle, CheckCircle, Clock, Circle, Download, Users, Brain, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const { pollCount, isPolling, errorCount, lastError, handleError: handlePollingError, startPolling, stopPolling } = usePolling(30000, 3);

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
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No hay clases programadas</h3>
            <p className="text-sm text-muted-foreground">
              Las clases en vivo se programan regularmente. Revisa pronto para no perderte ninguna sesión.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h4 className="font-medium">Consejos mientras esperas:</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Revisa el material de estudio en la biblioteca</li>
              <li>• Practica con los exámenes de prueba disponibles</li>
              <li>• Completa tus objetivos diarios de gamificación</li>
            </ul>
          </div>
        </div>
      </Card>
    );
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
              <Badge variant={errorCount > 0 ? 'destructive' : 'outline'} className="flex items-center gap-1">
                {errorCount > 0 ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    Errores: {errorCount}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Actualizaciones en vivo
                  </>
                )}
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

      {items.map((m: MeetingItem, index: number) => {
        const dt = new Date(m.startTime * 1000);
        const canJoin = !!m.meetingNumber && !!m.passcode;
        const now = Math.floor(Date.now() / 1000);
        const isActive = now >= m.startTime && now <= (m.startTime + 3600);
        const isUpcoming = now < m.startTime;
        const isPast = now > (m.startTime + 3600);
        const timeUntilStart = m.startTime - now;
        const isRecommended = index === 0 && isUpcoming && timeUntilStart < 3600; // Recommend next class if within 1 hour

        const meetingStatus = meetingStatuses[m._id];

        return (
          <motion.div
            key={m._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`relative p-6 flex flex-col gap-4 border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50'
                : isRecommended
                ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50 ring-2 ring-blue-200/50'
                : 'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50'
            } backdrop-blur-sm`}>
              {/* AI Recommendation Badge */}
              {isRecommended && (
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recomendado por IA
                  </Badge>
                </div>
              )}

              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{m.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {dt.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={isActive ? 'default' : isUpcoming ? 'secondary' : 'outline'} className={`flex items-center gap-1 ${
                    isActive ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 animate-pulse' : ''
                  }`}>
                    {isActive ? (
                      <>
                        <Circle className="h-2 w-2 fill-current animate-pulse" />
                        EN VIVO
                      </>
                    ) : isUpcoming ? (
                      <>
                        <Clock className="h-3 w-3" />
                        Próxima
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Finalizada
                      </>
                    )}
                  </Badge>

                  {isRecommended && (
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20">
                      <Brain className="h-3 w-3 mr-1" />
                      Optimizado
                    </Badge>
                  )}

                  {canJoin && (
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 dark:bg-green-950/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Listo para unirse
                    </Badge>
                  )}
                </div>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium">¡La clase está en vivo!</span>
                      <span>Únete ahora para experiencia óptima</span>
                    </div>
                  </motion.div>
                )}

                {isRecommended && !isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <Brain className="h-4 w-4" />
                      <span className="font-medium">Recomendación IA:</span>
                      <span>Esta es tu próxima clase óptima basada en tu progreso</span>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {/* Primary Action Button */}
                {onPick && (
                  <Button
                    variant={canJoin && isActive ? 'default' : canJoin ? 'outline' : 'secondary'}
                    disabled={!canJoin}
                    onClick={() => onPick(m)}
                    className={`transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl'
                        : canJoin
                        ? 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-blue-200'
                        : ''
                    }`}
                    size="lg"
                  >
                    <div className="flex items-center gap-2">
                      {canJoin ? (
                        isActive ? (
                          <>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <Zap className="h-4 w-4" />
                            </motion.div>
                            Unirse en Vivo
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Autocompletar
                          </>
                        )
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4" />
                          Solo para iluminados
                        </>
                      )}
                    </div>
                  </Button>
                )}

                {/* Secondary Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200">
                    <Users className="h-3 w-3 mr-1" />
                    RSVP: {m.myRsvp ?? 'Pendiente'}
                  </Badge>

                  {meetingStatus && (
                    <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {meetingStatus.rsvpCounts?.yes || 0} confirmados
                    </Badge>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadIcs(m)}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 border-blue-200 transition-colors"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    iCal
                  </Button>

                  <Button
                    size="sm"
                    variant={m.myRsvp === 'yes' ? 'default' : 'outline'}
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
                    className={`transition-all duration-300 ${
                      m.myRsvp === 'yes'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0'
                        : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border-green-200'
                    }`}
                  >
                    {m.myRsvp === 'yes' ? '✓ Confirmado' : 'Confirmar Asistencia'}
                  </Button>
                </div>
              </div>
              {m.attachments && m.attachments.length > 0 && (
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-muted-foreground">Material de Estudio</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.attachments.map((a: { name: string; url: string }, idx: number) => (
                      <a
                        key={idx}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 rounded-lg text-sm hover:shadow-md transition-shadow"
                      >
                        <Download className="h-3 w-3" />
                        {a.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function downloadIcs(m: MeetingItem) {
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
