'use client';
import { useQuery } from 'convex/react';
import { useMemo, useState } from 'react';

import CapsulePlayer from '@/components/CapsulePlayer';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api as generatedApi } from '@/convex/_generated/api';
import { getDemoSubjects, getDemoLessons } from '@/lib/demo-data';

export default function BibliotecaPage() {
  const api: any = generatedApi as any;
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  // Try to get data from Convex, fall back to demo data
  const convexSubjects = useQuery(api.content.listSubjects, {}) as string[] | undefined;
  const convexLessons = useQuery(api.content.listLessons, { subject }) as any[] | undefined;

  const subjects = convexSubjects || getDemoSubjects();
  const lessons = convexLessons || getDemoLessons(subject);
  const items = useMemo(() => lessons || [], [lessons]);

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Biblioteca</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3 lg:col-span-1">
          <Card className="p-4 space-y-3">
            <div className="text-sm text-muted-foreground">Filtrar por asignatura</div>
            <Select
              value={subject ?? 'all'}
              onValueChange={v => setSubject(v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all" value={'all'}>
                  Todas
                </SelectItem>
                {(subjects || []).map(s => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
          <div className="space-y-2">
            {(items || []).map(l => (
              <Card
                key={l._id}
                className="p-4 cursor-pointer hover:bg-muted"
                onClick={() => setSelectedLesson(l._id)}
              >
                <div className="font-medium">{l.title}</div>
                {l.subject && <div className="text-sm text-muted-foreground">{l.subject}</div>}
              </Card>
            ))}
            {items.length === 0 && (
              <Card className="p-4 text-sm text-muted-foreground">
                No hay lecciones disponibles.
              </Card>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          {selectedLesson ? (
            <CapsulePlayer lessonId={selectedLesson} />
          ) : (
            <Card className="p-4 text-sm text-muted-foreground">
              Selecciona una cápsula para reproducirla aquí.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
