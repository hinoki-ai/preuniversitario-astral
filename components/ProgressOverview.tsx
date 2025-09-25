'use client';

import { useQuery } from 'convex/react';

import { Card } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { useErrorHandler } from '@/lib/core/error-system';

import type { ProgressOverview } from '@/lib/types';

type ProgressOverviewData = ProgressOverview;

export default function ProgressOverview() {
  const { handleError } = useErrorHandler();

  const data: progressoverviewdata | undefined = usequery(api.progress.overview, {});data

  // Handle loading state
  if (data === undefined) {
    return <Card className="p-4">Cargando…</Card>;
  }

  // Handle error state (Convex returns null on error)
  if (data === null) {
    handleError(new Error('Error al cargar el resumen de progreso'), 'ProgressOverview.useQuery');
    return (
      <Card className="p-4 text-center text-destructive">
        Error al cargar el progreso. Por favor, intenta recargar la página.
      </Card>
    );
  }

  try {
    const subjects = Object.keys(data.bySubject || {});

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.length === 0 && (
          <Card className="p-4 text-sm text-muted-foreground">
            Sin actividad en los últimos 7 días.
          </Card>
        )}
        {subjects.map(s => {
          const v = data.bySubject[s];
          if (!v) return null;

          return (
            <Card key={s} className="p-4 space-y-1">
              <div className="font-medium">{s}</div>
              <div className="text-sm text-muted-foreground">
                Lecciones vistas: {v.lessons || 0} · Evaluaciones: {v.quizzes || 0}
              </div>
              <div className="text-sm">
                Promedio evaluaciones: {Math.round((v.avgScore || 0) * 100)}%
              </div>
            </Card>
          );
        })}
      </div>
    );
  } catch (error) {
    handleError(error as Error, 'ProgressOverview.render');
    return (
      <Card className="p-4 text-center text-destructive">
        Error al procesar los datos de progreso.
      </Card>
    );
  }
}
