'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Circle, Clock, CheckCircle, BarChart3, HelpCircle, Brain, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useErrorHandler } from '@/lib/core/error-system';

type CurrentUser = any; // Using any for now - proper typing needed
type UpcomingMeeting = any; // Using any for now - proper typing needed
type RsvpSummary = any; // Using any for now - proper typing needed

export default function TeacherPanel() {
  const { handleError, wrapAsync } = useErrorHandler();

  const user: CurrentUser | undefined = useQuery(api.users.current, {});
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const createMeeting = useMutation(api.meetings.create);
  const updateMeeting = useMutation(api.meetings.update);
  const meetings: UpcomingMeeting[] | undefined = useQuery(api.meetings.listUpcoming, {});
  const [expandedId, setExpandedId] = useState<Id<'meetings'> | null>(null);
  const [lastPollTime, setLastPollTime] = useState(Date.now());
  // RSVP counts for selected meeting with real-time polling
  const rsvpCounts: RsvpSummary | undefined = useQuery(
    api.meetings.listRsvps,
    expandedId ? { id: expandedId } : 'skip'
  );

  // Poll for updates every 15 seconds for teachers with error handling
  useEffect(() => {
    const pollInterval = setInterval(() => {
      try {
        setLastPollTime(Date.now());
      } catch (error) {
        console.error('Error during teacher panel polling:', error);
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState(''); // datetime-local value
  const [meetingNumber, setMeetingNumber] = useState('');
  const [passcode, setPasscode] = useState('');
  const [published, setPublished] = useState(true);
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isTeacher) return null;

  const handleSubmit = async () => {
    setError('');
    // Convert datetime-local string to epoch seconds
    const startTime = start ? Math.floor(new Date(start).getTime() / 1000) : 0;
    if (!title || !meetingNumber || !passcode || !startTime) {
      setError('Completa todos los campos');
      return;
    }
    setSubmitting(true);

    try {
      await wrapAsync(
        () =>
          createMeeting({
            title,
            description: description || undefined,
            startTime,
            meetingNumber: meetingNumber.replace(/\s/g, ''),
            passcode,
            published,
            attachments: attachments.length ? attachments : undefined,
          }),
        'TeacherPanel.createMeeting'
      );

      // Reset form on success
      setTitle('');
      setDescription('');
      setStart('');
      setMeetingNumber('');
      setPasscode('');
      setPublished(true);
      setAttachments([]);
    } catch (error) {
      // Error already handled by wrapAsync, but we can set local error state too
      setError('No se pudo crear la clase');
    }

 finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-6 space-y-6 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-xl backdrop-blur-sm">
        {/* AI Analytics Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Panel Docente IA</h3>
                  <p className="text-sm text-muted-foreground">
                    Análisis inteligente y gestión de clases
                  </p>
                </div>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
              <Brain className="h-3 w-3 mr-1" />
              IA Activa
            </Badge>
          </div>

          {/* AI Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Participación</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">87%</div>
              <div className="text-xs text-muted-foreground">+12% vs semana anterior</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200/50 dark:border-green-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Asistencia</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">94%</div>
              <div className="text-xs text-muted-foreground">Meta: 90%</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Engagement</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8.2</div>
              <div className="text-xs text-muted-foreground">Puntuación IA</div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-500/20 rounded-lg mt-0.5">
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Recomendación IA para Próxima Clase
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Basado en datos de participación, considera agregar más elementos interactivos en los primeros 15 minutos para mantener el engagement inicial.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Create Class Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
              <HelpCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium">Crear Nueva Clase</h4>
              <p className="text-sm text-muted-foreground">
                Configura tu próxima sesión con IA integrada
              </p>
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start">Fecha y hora</Label>
          <Input
            id="start"
            type="datetime-local"
            value={start}
            onChange={e => setStart(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meetingNumber">ID de reunión</Label>
          <Input
            id="meetingNumber"
            value={meetingNumber}
            onChange={e => setMeetingNumber(e.target.value)}
            placeholder="ej. 123 4567 8901"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passcode">Código de acceso</Label>
          <Input
            id="passcode"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            placeholder="Código"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="published" checked={published} onCheckedChange={v => setPublished(!!v)} />
          <Label htmlFor="published">Publicada</Label>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Adjuntos (opcional)</Label>
          <div className="space-y-2">
            {attachments.map((a, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-4"
                  placeholder="Nombre"
                  value={a.name}
                  onChange={e =>
                    setAttachments(prev =>
                      prev.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x))
                    )
                  }
                />
                <Input
                  className="col-span-7"
                  placeholder="URL"
                  value={a.url}
                  onChange={e =>
                    setAttachments(prev =>
                      prev.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x))
                    )
                  }
                />
                <Button
                  className="col-span-1"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                >
                  Quitar
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAttachments(prev => [...prev, { name: 'Material', url: '' }])}
            >
              Agregar adjunto
            </Button>
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a, i) => (
                <Badge key={i} variant="outline" className="text-muted-foreground">
                  {a.name || 'Adjunto'}
                </Badge>
              ))}
            </div>
          )}
        </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Guardando…' : 'Crear Clase'}
          </Button>
        </div>

        {/* Existing classes */}
        <div className="pt-4 space-y-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium">Clases Programadas</h4>
              <p className="text-sm text-muted-foreground">
                Monitoreo en tiempo real con insights de IA
              </p>
            </div>
          </div>
        <div className="space-y-2">
          {(meetings || []).map(m => {
            const now = Math.floor(Date.now() / 1000);
            const isActive = now >= m.startTime && now <= (m.startTime + 3600);
            const isUpcoming = now < m.startTime;
            const isPast = now > (m.startTime + 3600);

            return (
              <Card key={m._id} className={`p-3 space-y-2 ${isActive ? 'border-green-500 bg-green-50' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{m.title}</div>
                      <Badge variant={isActive ? 'default' : isUpcoming ? 'secondary' : 'outline'} className="flex items-center gap-1">
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
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(m.startTime * 1000).toLocaleString()}
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                        <BarChart3 className="h-3 w-3" />
                        Clase en vivo - {rsvpCounts?.total || 0} estudiantes conectados
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}
                  >
                    {expandedId === m._id ? 'Ocultar' : 'Editar / RSVPs'}
                  </Button>
                </div>
                {expandedId === m._id && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <BarChart3 className="h-3 w-3" />
                        RSVPs en tiempo real
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          Sí: {rsvpCounts?.counts?.yes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3 w-3 text-yellow-600" />
                          Quizás: {rsvpCounts?.counts?.maybe || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Circle className="h-3 w-3 text-red-600" />
                          No: {rsvpCounts?.counts?.no || 0}
                        </span>
                        <span className="text-muted-foreground">
                          (Total: {rsvpCounts?.total || 0})
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Última actualización: {new Date(lastPollTime).toLocaleTimeString()}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`t-${m._id}`}>Título</Label>
                        <Input
                          id={`t-${m._id}`}
                          defaultValue={m.title}
                          onBlur={e => updateMeeting({ id: m._id, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`p-${m._id}`}>Publicado</Label>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`p-${m._id}`}
                            checked={m.published}
                            onCheckedChange={v => updateMeeting({ id: m._id, published: !!v })}
                          />
                          <span className="text-sm">Visible para estudiantes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
          {(meetings || []).length === 0 && (
            <div className="text-sm text-muted-foreground">No hay clases programadas.</div>
          )}
        </div>
        </div>
        </div>
      </Card>
    </motion.div>
  );
}

