'use client';

import { IconAlertTriangle } from '@tabler/icons-react';
import { ArrowUpDown, TrendingUp } from 'lucide-react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const SCHEMA = z.object({
  id: z.number(),
  subject: z.string(),
  category: z.string(),
  avgScore: z.number(),
  scoreDelta: z.number(),
  hoursThisWeek: z.number(),
  hoursTarget: z.number(),
  velocity: z.number(),
  consistency: z.number(),
  completionRate: z.number(),
  nextMilestone: z.string(),
  milestoneDate: z.string(),
  focusArea: z.string(),
  risk: z.enum(['on-track', 'attention', 'critical']),
});

type SubjectRow = z.infer<typeof SCHEMA>;

type RiskKey = SubjectRow['risk'];

type CategoryMeta = {
  label: string;
  badgeClass: string;
};

type RiskMeta = {
  label: string;
  badgeClass: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  STEM: {
    label: 'STEM',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-100',
  },
  LENGUAJE: {
    label: 'Lenguaje',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-100',
  },
  HUMANIDADES: {
    label: 'Humanidades',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-100',
  },
  ELECTIVO: {
    label: 'Electivo',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100',
  },
  ENSAYOS: {
    label: 'Ensayos',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-100',
  },
};

const RISK_META: Record<RiskKey, RiskMeta> = {
  'on-track': {
    label: 'En curso',
    badgeClass: 'border-emerald-400 text-emerald-600 dark:border-emerald-500 dark:text-emerald-300',
    description: 'Avance sostenido dentro de lo planificado.',
  },
  attention: {
    label: 'Atención',
    badgeClass: 'border-amber-400 text-amber-600 dark:border-amber-500 dark:text-amber-300',
    description: 'Pequeños desvíos, revisa plan de estudio.',
    icon: IconAlertTriangle,
  },
  critical: {
    label: 'Crítico',
    badgeClass: 'border-red-400 text-red-600 dark:border-red-500 dark:text-red-300',
    description: 'Requiere intervención inmediata.',
    icon: IconAlertTriangle,
  },
};

const formatDelta = (value: number, decimals = 1) => {
  const rounded = Number(value.toFixed(decimals));
  if (Math.abs(rounded) < 0.05) return '0.0';
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toFixed(decimals)}`;
};

const columns: ColumnDef<SubjectRow>[] = [
  {
    accessorKey: 'subject',
    header: 'Asignatura',
    cell: ({ row }) => {
      const subject = row.original.subject;
      const category = row.original.category;
      const categoryMeta = CATEGORY_META[category as keyof typeof CATEGORY_META];

      return (
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={categoryMeta?.badgeClass}>
            {categoryMeta?.label}
          </Badge>
          <div>
            <div className="font-medium">{subject}</div>
            <div className="text-sm text-muted-foreground">{row.original.focusArea}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'avgScore',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { avgScore, scoreDelta } = row.original;
      const deltaClass = scoreDelta >= 0 ? 'text-emerald-600' : 'text-destructive';

      return (
        <div className="space-y-1 text-right">
          <div className="text-base font-semibold">{avgScore}%</div>
          <div className={`flex items-center justify-end gap-1 text-xs ${deltaClass}`}>
            <TrendingUp className="h-3 w-3" />
            {formatDelta(scoreDelta)} pts
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'velocity',
    header: 'Ritmo',
    cell: ({ row }) => {
      const velocity = row.original.velocity;
      const tone = velocity > 0.8 ? 'text-emerald-600' : velocity <= 0.4 ? 'text-destructive' : 'text-muted-foreground';

      return (
        <div className="space-y-1 text-sm">
          <div className={`font-medium ${tone}`}>{formatDelta(velocity)} pts/sem</div>
          <div className="text-xs text-muted-foreground">Ritmo de mejora</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'nextMilestone',
    header: 'Próximo hito',
    cell: ({ row }) => {
      const { nextMilestone, milestoneDate, focusArea } = row.original;
      const dueDate = new Date(milestoneDate);
      const now = Date.now();
      const days = Math.ceil((dueDate.getTime() - now) / (1000 * 60 * 60 * 24));
      const dueLabel =
        days <= 0 ? 'Hoy' : days === 1 ? 'Mañana' : days <= 7 ? `En ${days} días` : dueDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

      return (
        <div className="space-y-1 text-sm">
          <div className="font-medium">{nextMilestone}</div>
          <div className="text-xs text-muted-foreground">{dueLabel}</div>
          <div className="text-xs text-muted-foreground">Enfoque: {focusArea}</div>
        </div>
      );
    },
    enableSorting: false,
  },
];

export function DataTable({ data: initialData }: { data: SubjectRow[] }) {
  const parsedData = React.useMemo(() => SCHEMA.array().parse(initialData), [initialData]);
  const categories = React.useMemo(
    () => Array.from(new Set(parsedData.map(item => item.category))).sort(),
    [parsedData]
  );

  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('todos');
  const [riskFilter, setRiskFilter] = React.useState<string>('todos');
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'avgScore', desc: true },
  ]);

  const filteredData = React.useMemo(() => {
    return parsedData.filter(item => {
      const matchesSearch = search
        ? item.subject.toLowerCase().includes(search.toLowerCase()) ||
          item.focusArea.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesCategory = categoryFilter === 'todos' ? true : item.category === categoryFilter;
      const matchesRisk =
        riskFilter === 'todos' ? true : riskFilter === 'atencion' ? item.risk === 'attention' : riskFilter === 'critico' ? item.risk === 'critical' : item.risk === 'on-track';

      return matchesSearch && matchesCategory && matchesRisk;
    });
  }, [parsedData, search, categoryFilter, riskFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const stats = React.useMemo(() => {
    if (!filteredData.length) {
      return {
        avgScore: 0,
        weeklyHours: 0,
        momentum: 0,
        flaggedSubjects: [] as string[],
      };
    }

    const avgScore = filteredData.reduce((acc, item) => acc + item.avgScore, 0) / filteredData.length;
    const weeklyHours = filteredData.reduce((acc, item) => acc + item.hoursThisWeek, 0);
    const momentum =
      filteredData.reduce((acc, item) => acc + item.velocity, 0) / filteredData.length;
    const flaggedSubjects = filteredData
      .filter(item => item.risk !== 'on-track')
      .slice(0, 2)
      .map(item => item.subject);

    return { avgScore, weeklyHours, momentum, flaggedSubjects };
  }, [filteredData]);

  const totalSubjects = parsedData.length;

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 lg:px-6">
      <div className="grid gap-3 text-sm @[900px]:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Promedio general
          </div>
          <div className="text-2xl font-semibold">{stats.avgScore.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">
            Basado en {filteredData.length || 0} asignatura(s) visibles
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Horas semanales acumuladas
          </div>
          <div className="text-2xl font-semibold">{stats.weeklyHours.toFixed(1)} h</div>
          <div className="text-xs text-muted-foreground">
            Incluye sesiones completadas esta semana
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Momentum de aprendizaje
          </div>
          <div className="text-2xl font-semibold">{formatDelta(stats.momentum, 2)} pts/sem</div>
          <div className="text-xs text-muted-foreground">
            Asignaturas prioritarias: {stats.flaggedSubjects.join(', ') || 'sin alertas'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Buscar asignatura o enfoque..."
          className="w-full sm:w-72"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todas las áreas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las áreas</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {CATEGORY_META[category]?.label ?? category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="on-track">En curso</SelectItem>
              <SelectItem value="atencion">Atención</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-xs uppercase tracking-wide text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="text-sm">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No hay resultados para los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Mostrando {filteredData.length} de {totalSubjects} asignaturas.
        </span>
        <Button variant="outline" size="sm">
          Descargar reporte
        </Button>
      </div>
    </div>
  );
}
