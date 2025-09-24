'use client';

import { useMutation, useQuery } from 'convex/react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api as generatedApi } from '@/convex/_generated/api';

type MeetingItem = {
  _id: string;
  title: string;
  description?: string;
  startTime: number;
  published: boolean;
  meetingNumber?: string;
  passcode?: string;
  attachments?: { name: string; url: string }[];
  myRsvp?: 'yes' | 'no' | 'maybe';
};

export default function BasicSchedule({ onPick }: { onPick?: (m: MeetingItem) => void }) {
  const api: any = generatedApi as any;
  const meetings = useQuery(api.meetings.listUpcoming, {});
  const rsvp = useMutation(api.meetings.rsvp);

  const items = useMemo(() => meetings ?? [], [meetings]);

  if (!meetings) {
    return <Card className="p-4">Cargando agenda…</Card>;
  }

  if (items.length === 0) {
    return <Card className="p-4">No hay clases programadas por ahora.</Card>;
  }

  return (
    <div className="space-y-3">
      {items.map(m => {
        const dt = new Date(m.startTime * 1000);
        const canJoin = !!m.meetingNumber && !!m.passcode;
        return (
          <Card key={m._id} className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-medium">{m.title}</div>
                <div className="text-sm text-muted-foreground">{dt.toLocaleString()}</div>
              </div>
              {onPick && (
                <Button
                  variant={canJoin ? 'default' : 'outline'}
                  disabled={!canJoin}
                  onClick={() => onPick(m)}
                >
                  {canJoin ? 'Usar en el formulario' : 'Solo para iluminados'}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground">
                RSVP: {m.myRsvp ?? '—'}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => downloadIcs(m)}>
                Agregar a calendario (ICS)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await rsvp({
                      meetingId: (m as any)._id,
                      status: m.myRsvp === 'yes' ? 'maybe' : 'yes',
                    });
                  } catch {}
                }}
              >
                {m.myRsvp === 'yes' ? 'Cambiar a "quizás"' : 'Confirmar asistencia'}
              </Button>
            </div>
            {m.attachments && m.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {m.attachments.map((a, idx) => (
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

function downloadIcs(m: MeetingItem) {
  const dtStart = new Date(m.startTime * 1000);
  const dtEnd = new Date((m.startTime + 60 * 60) * 1000); // default 1h
  const format = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
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

function escapeText(s: string) {
  return s.replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n');
}
