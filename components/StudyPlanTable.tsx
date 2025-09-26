'use client';

import { useMutation, useQuery } from 'convex/react';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { DataTable, SCHEMA as dataTableSchema } from '@/app/dashboard/DataTable';
import { Card } from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { useErrorHandler } from '@/lib/core/error-system';

// Using demo data types for now - update when proper types are available
type WeeklyPlan = any;
type WeeklyPlanItem = WeeklyPlan extends { items: (infer Item)[] } ? Item : never;
type StudyPlanRow = Omit<WeeklyPlanItem, 'order'>;
type SaveWeeklyPlanArgs = typeof api.studyPlan.saveWeeklyPlan._args;

export default function StudyPlanTable() {
  const { handleError, wrapAsync } = useErrorHandler();
  const [track, setTrack] = useState<string>('medicina');
  const [isSaving, setIsSaving] = useState(false);

  const plan = useQuery(api.studyPlan.getWeeklyPlan, { track });
  const save = useMutation(api.studyPlan.saveWeeklyPlan);

  const items = useMemo(() => {
    if (!plan?.items) return [];

    try {
      return [...plan.items]
        .sort((a, b) => a.order - b.order)
        .map(({ order: _order, ...rest }) => ({
          id: rest.id || Math.random(),
          subject: rest.header || 'Unknown Subject',
          category: rest.type || 'General',
          avgScore: 0,
          scoreDelta: 0,
          hoursThisWeek: 0,
          hoursTarget: 0,
          velocity: 0,
          consistency: 0,
          completionRate: 0,
          nextMilestone: rest.target || '',
          milestoneDate: '',
          focusArea: '',
          risk: (rest.status === 'active' ? 'on-track' : 'attention') as 'on-track' | 'attention' | 'critical',
        }));
    } catch (error) {
      handleError(error as Error, 'StudyPlanTable-data-processing');
      return [];
    }
  }, [plan, handleError]);

  const onReorder = async (next: z.infer<typeof dataTableSchema>[]) => {
    if (!plan) {
      handleError(new Error('No plan data available'), 'StudyPlanTable-onReorder');
      return;
    }

    setIsSaving(true);
    try {
      const withOrder: SaveWeeklyPlanArgs['items'] = next.map((entry, index) => ({
        type: entry.category,
        status: entry.risk === 'on-track' ? 'active' : 'needs-attention',
        target: entry.nextMilestone,
        header: entry.subject,
        limit: `${entry.hoursTarget} hours`,
        reviewer: 'auto-generated',
        id: entry.id,
        order: index,
      }));
      const { weekStart } = plan;
      await wrapAsync(() => save({ track, weekStart, items: withOrder }), 'StudyPlanTable-save');
    } catch (error) {
      handleError(error as Error, 'StudyPlanTable-onReorder');
    }

 finally {
      setIsSaving(false);
    }
  };

  // Handle loading state
  if (plan === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Select defaultValue={track} onValueChange={setTrack}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Seleccionar track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medicina">Medicina</SelectItem>
              <SelectItem value="ingenieria">Ingeniería</SelectItem>
              <SelectItem value="humanista">Humanista</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (plan === null) {
    handleError(new Error('Error al cargar el plan de estudio'), 'StudyPlanTable');
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Select defaultValue={track} onValueChange={setTrack}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Seleccionar track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medicina">Medicina</SelectItem>
              <SelectItem value="ingenieria">Ingeniería</SelectItem>
              <SelectItem value="humanista">Humanista</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="p-4 text-sm text-destructive">
          Error al cargar el plan de estudio. Por favor, intenta recargar la página.
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select defaultValue={track} onValueChange={setTrack} disabled={isSaving}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Seleccionar track" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medicina">Medicina</SelectItem>
            <SelectItem value="ingenieria">Ingeniería</SelectItem>
            <SelectItem value="humanista">Humanista</SelectItem>
          </SelectContent>
        </Select>
        {isSaving && <span className="text-sm text-muted-foreground">Guardando...</span>}
      </div>
      <DataTable data={items} />
    </div>
  );
}
