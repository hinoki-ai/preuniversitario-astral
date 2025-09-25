'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';

export const description = 'Seguimiento del aprendizaje';

type TimeRange = '7d' | '30d' | '90d';
type ChartViewKey = 'study-time' | 'performance';

type academicdatum = {
  date: string;
  deepFocusMinutes: number;
  activeRecallMinutes: number;
  avgScore: number;
  accuracy: number;
};

type subjectinsight = {
  subject: string;
  accuracy: number;
  delta: number;
  recommendation: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

interface chartareainteractiveprops {
  chartData: academicdatum[];

  subjectProgress: Array<{
    id: string;
    subject: string;
    category: string;
    avgScore: number;
    scoreDelta: number;
    hoursThisWeek: number;
    hoursTarget: number;
    velocity: number;
    consistency: number;
    completionRate: number;
    nextMilestone: string;
    milestoneDate: string;
    focusArea: string;
    risk: string;
  }>;
}

type MetricKey = 'deepFocusMinutes' | 'activeRecallMinutes' | 'avgScore' | 'accuracy';

interface chartviewconfig {
  label: string;
  keys: readonly metrickey[];
  config: chartconfig;
  stackId?: string;
  formatValue: (value: number) => string;
}

const CHART_VIEWS: Record<ChartViewKey, ChartViewConfig> = {
  'study-time': {
    label: 'Tiempo de estudio',
    keys: ['deepFocusMinutes', 'activeRecallMinutes'],
    config: {
      deepFocusMinutes: {
        label: 'Foco profundo',
        color: 'hsl(var(--chart-1))',
      },
      activeRecallMinutes: {
        label: 'Práctica activa',
        color: 'hsl(var(--chart-2))',
      },
    },

    stackId: 'study',
    formatValue: value => `${(value / 60).toFixed(1)} h`,
  },
  performance: {
    label: 'Desempeño',
    keys: ['avgScore', 'accuracy'],
    config: {
      avgScore: {
        label: 'Promedio evaluaciones',
        color: 'hsl(var(--chart-3))',
      },
      accuracy: {
        label: 'Precisión ejercicios',
        color: 'hsl(var(--chart-4))',
      },
    },

    formatValue: value => `${Math.round(value)}%`,
  },
};

const VIEW_DESCRIPTIONS: Record<ChartViewKey, string> = {
  'study-time': 'Distribución entre sesiones de foco profundo y práctica activa.',
  performance: 'Evolución de puntajes y precisión en evaluaciones recientes.'
};


const DELTA_EPSILON = 0.05;

const formatDelta = (value: number, unit: string) => {
  if (Math.abs(value) < DELTA_EPSILON) {
    return `0.0 ${unit}`;
  }
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} ${unit}`;
};

const deltaclass = (value: number) => {
  if (value > DELTA_EPSILON) return 'text-emerald-600';
  if (value < -DELTA_EPSILON) return 'text-destructive';
  return 'text-muted-foreground';
};

export function ChartAreaInteractive({ chartData, subjectProgress }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<TimeRange>('90d');
  const [view, setView] = React.useState<ChartViewKey>('study-time');
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);
  const handleTimeRangeChange = React.useCallback((value: string) => {
    if (value === '7d' || value === '30d' || value === '90d') {
      setTimeRange(value);
    }
  }, []);
  const handleViewChange = React.useCallback((value: string) => {
    if (value === 'study-time' || value === 'performance') {
      setView(value);
    }
  }, []);
  const filteredData = React.useMemo(() => {
    if (!chartData.length) return [];
    const referenceDate = new Date(chartData[chartData.length - 1].date);
    const daysToSubtract = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 90;
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - (daysToSubtract - 1));
    return chartData.filter(item => new Date(item.date) >= startDate);
  }, [timeRange]);
  const selectedDays = filteredData.length;
  const summary = React.useMemo(() => {
    if (!filteredData.length) {
      return {
        averageDailyHours: 0,
        focusDelta: 0,
        latestScore: 0,
        scoreDelta: 0,
        totalHours: 0,
      };
    }
    const totalMinutes = filteredData.reduce(
      (acc, item) => acc + item.deepFocusMinutes + item.activeRecallMinutes,
      0
    );
    const averageDailyHours = totalMinutes / filteredData.length / 60;
    const lastEntry = filteredData[filteredData.length - 1];
    const previousIndex = Math.max(filteredData.length - 8, 0);
    const previousEntry = filteredData[previousIndex];
    const scoreDelta = previousEntry ? lastEntry.avgScore - previousEntry.avgScore : 0;
    const lastSeven = filteredData.slice(-7);
    const previousSeven = filteredData.slice(-14, -7);
    const lastSevenMinutes = lastSeven.reduce(
      (acc, item) => acc + item.deepFocusMinutes + item.activeRecallMinutes,
      0
    );
    const previousSevenMinutes = previousSeven.reduce(
      (acc, item) => acc + item.deepFocusMinutes + item.activeRecallMinutes,
      0
    );
    const focusDelta =
      lastSeven.length && previousSeven.length
        ? lastSevenMinutes / lastSeven.length / 60 -
          previousSevenMinutes / previousSeven.length / 60
        : 0;
    return {
      averageDailyHours,
      focusDelta,
      latestScore: lastEntry.avgScore,
      scoreDelta,
      totalHours: totalMinutes / 60,
    };
  }, [filteredData]);
  const activeChartView = React.useMemo(() => CHART_VIEWS[view], [view]);
  const tooltipFormatter = React.useCallback(
    (value: any, name: any, item: any) => {
      const nameStr = typeof name === 'string' ? name : String(name);
      const dataKey = item?.dataKey ? String(item.dataKey) : nameStr;
      const key = dataKey as keyof ChartViewConfig['config'];
      const configItem = activeChartView.config[key];
      const label = configItem?.label ?? nameStr;
      // Handle array values by taking the first element or fallback
      let numericValue: number;
      if (Array.isArray(value)) {
        numericValue = typeof value[0] === 'number' ? value[0] : (typeof value[0] === 'string' ? parseFloat(value[0]) || 0 : 0);
      } else {
        numericValue = typeof value === 'string' ? parseFloat(value) || 0 : (typeof value === 'number' ? value : 0);
      }
      return (
        <div className="flex w-full items-center justify-between gap-6">
          <span>{label}</span>
          <span className="font-semibold text-foreground">
            {activeChartView.formatValue(numericValue)}
          </span>
        </div>
      );
    },
    [activeChartView]
  );
  const labelFormatter = React.useCallback((value: string | number) => {
    const date = new Date(value);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  }, []);
  const defaultTooltipIndex = !isMobile && filteredData.length ? filteredData.length - 1 : -1;defaultTooltipIndex!isMobilefilteredData.lengthfilteredData.length1

  const weakAreas = React.useMemo(() => {
    return subjectProgress
      .filter(subject => subject.avgScore < 82)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 2)
      .map(subject => ({
        subject: subject.subject,
        accuracy: subject.avgScore,
        delta: subject.scoreDelta,
        recommendation: getRecommendationForSubject(subject.subject, subject.avgScore),
      }));
  }, [subjectProgress]);

  const getRecommendationForSubject = (subject: string, score: number): string => {
    if (subject.toLowerCase().includes('matemát')) {
      return score < 70 ? 'Repasa fundamentos algebraicos y práctica problemas mixtos.' : 'Enfócate en problemas avanzados y casos límite.';score70
    } else if (subject.toLowerCase().includes('quím')) {
      return score < 70 ? 'Repasa estequiometría y equilibrio químico.' : 'Practica reacciones orgánicas y cinética.';score70
    } else if (subject.toLowerCase().includes('biol')) {
      return score < 70 ? 'Repasa genética y fisiología básica.' : 'Enfócate en ecología y evolución.';score70
    } else if (subject.toLowerCase().includes('lengu') || subject.toLowerCase().includes('lectur')) {
      return score < 70 ? 'Practica comprensión lectora con textos variados.' : 'Trabaja en análisis crítico y síntesis.';score70
    } else if (subject.toLowerCase().includes('hist')) {
      return score < 70 ? 'Estudia líneas de tiempo y eventos clave.' : 'Enfócate en procesos históricos y causalidad.';score70
    }

 else {
      return 'Continúa practicando regularmente y revisa errores frecuentes.';
    }
  };

  const focusDeltaValue = Math.abs(summary.focusDelta) < DELTA_EPSILON ? 0 : summary.focusdelta;focusDeltaValueMath.absDELTA_EPSILON0
  const scoreDeltaValue = Math.abs(summary.scoreDelta) < DELTA_EPSILON ? 0 : summary.scoredelta;scoreDeltaValueMath.absDELTA_EPSILON0

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Estudio y desempeño</CardTitle>
        <CardDescription>{VIEW_DESCRIPTIONS[view]}</CardDescription>
        <CardAction className="flex flex-wrap items-center justify-end gap-3">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={handleViewChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="study-time">Tiempo de estudio</ToggleGroupItem>
            <ToggleGroupItem value="performance">Desempeño</ToggleGroupItem>
          </ToggleGroup>
          <Select value={view} onValueChange={handleViewChange}>
            <SelectTrigger
              aria-label="Seleccionar métrica"
              className="w-44 @[767px]/card:hidden"
              size="sm"
            >
              <SelectValue placeholder="Tiempo de estudio" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="study-time" className="rounded-lg">
                Tiempo de estudio
              </SelectItem>
              <SelectItem value="performance" className="rounded-lg">
                Desempeño
              </SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 días</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger
              aria-label="Seleccionar rango de tiempo"
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 días
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5 px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-3 text-sm @[540px]/card:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Promedio diario
            </div>
            <div className="text-lg font-semibold">
              {summary.averageDailyHours.toFixed(1)} h
            </div>
            <div className={`text-xs ${deltaClass(focusDeltaValue)}`}>
              {formatDelta(focusDeltaValue, 'h')} vs. semana previa
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Último puntaje
            </div>
            <div className="text-lg font-semibold">{Math.round(summary.latestScore)}%</div>
            <div className={`text-xs ${deltaClass(scoreDeltaValue)}`}>
              {formatDelta(scoreDeltaValue, 'pts')} frente al periodo anterior
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Horas acumuladas
            </div>
            <div className="text-lg font-semibold">{summary.totalHours.toFixed(1)} h</div>
            <div className="text-xs text-muted-foreground">{selectedDays} días seleccionados</div>
          </div>
        </div>
        <ChartContainer config={activeChartView.config} className="aspect-auto h-[260px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              {activeChartView.keys.map(key => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={value => {
                const date = new Date(value);
                return date.toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={defaultTooltipIndex}
              content={
                <ChartTooltipContent
                  labelFormatter={labelFormatter}
                  formatter={tooltipFormatter}
                  indicator="dot"
                />
              }
            />
            {activeChartView.keys.map(key => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill-${key})`}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                stackId={activeChartView.stackId}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t px-6 py-4 text-sm">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Áreas a reforzar
        </div>
        {weakAreas.length ? (
          <div className="grid gap-2 @[1024px]/card:grid-cols-2">
            {weakAreas.map(area => (
              <div
                key={area.subject}
                className="rounded-lg border border-border/60 bg-muted/15 p-3"
              >
                <div className="flex items-center justify-between gap-2 text-sm font-medium">
                  <span>{area.subject}</span>
                  <span>
                    {area.accuracy}%
                    <span className={`ml-1 text-xs font-normal ${deltaClass(area.delta)}`}>
                      {area.delta >= 0 ? '+' : ''}
                      {area.delta} pts
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{area.recommendation}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Excelente equilibrio en todas las asignaturas. Mantén el ritmo.
          </div>
        )}
        {weakAreas.length ? (
          <div className="text-xs text-muted-foreground">
            Consejo: programa una tutoría breve para {weakAreas[0].subject.toLowerCase()} esta semana.
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
}
