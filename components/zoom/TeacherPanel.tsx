'use client';

import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api as generatedApi } from '@/convex/_generated/api';

export default function TeacherPanel() {
  const api: any = generatedApi as any;
  const user = useQuery(api.users.current, {});
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const createMeeting = useMutation(api.meetings.create);
  const updateMeeting = useMutation(api.meetings.update);
  const meetings = useQuery(api.meetings.listUpcoming, {}) as any[] | undefined;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // RSVP counts for selected meeting
  const rsvpCounts = useQuery(
    api.meetings.listRsvps,
    expandedId ? { id: expandedId as any } : 'skip'
  ) as any;

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
      await createMeeting({
        title,
        description: description || undefined,
        startTime,
        meetingNumber: meetingNumber.replace(/\s/g, ''),
        passcode,
        published,
        attachments: attachments.length ? attachments : undefined,
      });
      // Reset
      setTitle('');
      setDescription('');
      setStart('');
      setMeetingNumber('');
      setPasscode('');
      setPublished(true);
      setAttachments([]);
    } catch (e: any) {
      setError(e?.message || 'No se pudo crear la clase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div>
        <div className="text-base font-semibold">Panel Docente</div>
        <div className="text-sm text-muted-foreground">
          Crea una clase e ingresa un Meeting ID y Passcode de Zoom.
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
          <Label htmlFor="meetingNumber">Meeting ID</Label>
          <Input
            id="meetingNumber"
            value={meetingNumber}
            onChange={e => setMeetingNumber(e.target.value)}
            placeholder="123 4567 8901"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passcode">Passcode</Label>
          <Input id="passcode" value={passcode} onChange={e => setPasscode(e.target.value)} />
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
      <div className="pt-2 space-y-3">
        <div className="text-base font-semibold">Clases Programadas</div>
        <div className="space-y-2">
          {(meetings || []).map(m => (
            <Card key={m._id} className="p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(m.startTime * 1000).toLocaleString()}
                  </div>
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
                    RSVPs — Sí: {rsvpCounts?.counts?.yes || 0} · Quizás:{' '}
                    {rsvpCounts?.counts?.maybe || 0} · No: {rsvpCounts?.counts?.no || 0} (Total:{' '}
                    {rsvpCounts?.total || 0})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor={`t-${m._id}`}>Título</Label>
                      <Input
                        id={`t-${m._id}`}
                        defaultValue={m.title}
                        onBlur={e => updateMeeting({ id: m._id as any, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`p-${m._id}`}>Publicado</Label>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`p-${m._id}`}
                          checked={m.published}
                          onCheckedChange={v => updateMeeting({ id: m._id as any, published: !!v })}
                        />
                        <span className="text-sm">Visible para estudiantes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {(meetings || []).length === 0 && (
            <div className="text-sm text-muted-foreground">No hay clases programadas.</div>
          )}
        </div>
      </div>
    </Card>
  );
}
