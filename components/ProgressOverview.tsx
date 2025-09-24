'use client';

import { useQuery } from 'convex/react';

import { Card } from '@/components/ui/card';
import { api as generatedApi } from '@/convex/_generated/api';

export default function ProgressOverview() {
  const api: any = generatedApi as any;
  const data = useQuery(api.progress.overview, {}) as any;
  if (!data) return <Card className="p-4">Cargando…</Card>;
  const subjects = Object.keys(data.bySubject);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {subjects.length === 0 && (
        <Card className="p-4 text-sm text-muted-foreground">
          Sin actividad en los últimos 7 días.
        </Card>
      )}
      {subjects.map(s => {
        const v = data.bySubject[s];
        return (
          <Card key={s} className="p-4 space-y-1">
            <div className="font-medium">{s}</div>
            <div className="text-sm text-muted-foreground">
              Lecciones vistas: {v.lessons} · Quizzes: {v.quizzes}
            </div>
            <div className="text-sm">Promedio quizzes: {Math.round(v.avgScore * 100)}%</div>
          </Card>
        );
      })}
    </div>
  );
}
