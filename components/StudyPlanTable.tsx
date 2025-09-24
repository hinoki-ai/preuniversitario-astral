'use client';

import { useMutation, useQuery } from 'convex/react';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { DataTable, schema as dataTableSchema } from '@/app/dashboard/DataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api as generatedApi } from '@/convex/_generated/api';

export default function StudyPlanTable() {
  const api: any = generatedApi as any;
  const [track, setTrack] = useState<string>('medicina');
  const plan = useQuery(api.studyPlan.getWeeklyPlan, { track }) as any;
  const save = useMutation(api.studyPlan.saveWeeklyPlan);

  const items = useMemo<z.infer<typeof dataTableSchema>[]>(() => {
    const list = plan?.items || [];
    return list
      .sort((a: any, b: any) => a.order - b.order)
      .map((it: any) => ({
        id: it.id,
        header: it.header,
        type: it.type,
        status: it.status,
        target: it.target,
        limit: it.limit,
        reviewer: it.reviewer,
      }));
  }, [plan]);

  const onReorder = async (next: z.infer<typeof dataTableSchema>[]) => {
    if (!plan) return;
    const withOrder = next.map((n, idx) => ({ ...n, order: idx }));
    await save({ track, weekStart: plan.weekStart, items: withOrder as any });
  };

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
      {items ? <DataTable data={items} onReorder={onReorder} /> : null}
    </div>
  );
}
