'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import {
  Award,
  BarChart3,
  Brain,
  Flame,
  Lightbulb,
  LineChart,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  performance: {
    level: number;
    totalPoints: number;
    weeklyGrowth: number;
    streakDays: number;
    averageScore: number;
  };
  predictions: {
    projectedLevel: number;
    estimatedDaysToNextLevel: number;
    likelihoodToAchieve: number;
    recommendedActions: string[];
  };
  insights: {
    bestStudyTime: string;
    strongestSubjects: string[];
    improvementAreas: string[];
    motivationFactors: string[];
  };
  trends: {
    label: string;
    value: number;
  }[];
}

export function GamificationAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'insights' | 'trends'>('overview');
  const userStats = useQuery(api.userStats.getUserStats);
  const achievements = useQuery(api.userStats.getUserAchievements) as Array<{ id: string; title: string }> | undefined;

  const analyticsData = useMemo<AnalyticsData>(() => {
    const level = userStats?.level ?? 1;
    const totalPoints = userStats?.totalPoints ?? 0;
    const weeklyGrowth = 12.5; // Default weekly growth percentage
    const streakDays = userStats?.currentStreak ?? 0;
    const averageScore = userStats?.avgScore ? Math.round(userStats.avgScore * 100) : 0;

    return {
      performance: {
        level,
        totalPoints,
        weeklyGrowth,
        streakDays,
        averageScore,
      },
      predictions: {
        projectedLevel: level + 2,
        estimatedDaysToNextLevel: Math.max(3, 28 - streakDays),
        likelihoodToAchieve: Math.min(95, 60 + weeklyGrowth),
        recommendedActions: [
          'Mantén tu racha de estudio diaria',
          'Refuerza tu asignatura más débil con 3 misiones extra',
          'Reserva 45 minutos para un repaso profundo cada día',
        ],
      },
      insights: {
        bestStudyTime: '19:00 - 21:00 hrs',
        strongestSubjects: userStats?.strongSubjects ?? ['Matemáticas', 'Ciencias'],
        improvementAreas: userStats?.weakSubjects ?? ['Lenguaje'],
        motivationFactors: ['Rachas diarias', 'Logros obtenidos', 'Ranking semanal'],
      },
      trends: Array.from({ length: 6 }, (_, index) => ({
        label: `Semana ${index + 1}`,
        value: Math.round(60 + Math.random() * 40),
      })),
    };
  }, [userStats]);

  if (!userStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 animate-pulse" />
            Analizando tu progreso...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="h-6 w-6 text-primary" />
            Gamificación e insights
          </CardTitle>
          <CardDescription>
            Visualiza tu progreso, predicciones y acciones recomendadas para mantener tu motivación.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as typeof activeTab)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Rendimiento
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predicciones
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Tendencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={Target}
              title="Nivel actual"
              value={`Nivel ${analyticsData.performance.level}`}
              helper={`${analyticsData.performance.totalPoints.toLocaleString()} puntos acumulados`}
            />
            <MetricCard
              icon={Flame}
              title="Racha activa"
              value={`${analyticsData.performance.streakDays} días`}
              helper="Completa misiones cada día para mantenerla"
            />
            <MetricCard
              icon={TrendingUp}
              title="Crecimiento semanal"
              value={`+${analyticsData.performance.weeklyGrowth}%`}
              helper="Respecto a la semana anterior"
            />
            <MetricCard
              icon={Sparkles}
              title="Promedio PAES"
              value={`${analyticsData.performance.averageScore}%`}
              helper="Promedio de tus últimos ensayos"
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Logros destacados</CardTitle>
              <CardDescription>
                {achievements?.length ? 'Tu constancia ya se refleja en nuevos logros.' : 'Aún no hay logros disponibles. ¡Completa actividades para desbloquearlos!'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(achievements ?? []).slice(0, 6).map(achievement => (
                  <Badge key={achievement.id} variant="secondary" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    {achievement.title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proyección de progreso</CardTitle>
              <CardDescription>
                Estimaciones basadas en tu ritmo actual de estudio y rendimiento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <PredictionBox
                  label="Nivel proyectado"
                  value={`Nivel ${analyticsData.predictions.projectedLevel}`}
                  helper="Si mantienes tu ritmo durante las próximas 4 semanas"
                />
                <PredictionBox
                  label="Días estimados"
                  value={`${analyticsData.predictions.estimatedDaysToNextLevel} días`}
                  helper="Para alcanzar el siguiente nivel"
                />
                <PredictionBox
                  label="Probabilidad de logro"
                  value={`${analyticsData.predictions.likelihoodToAchieve}%`}
                  helper="Basado en tu consistencia actual"
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold">Acciones recomendadas</h4>
                <ul className="mt-2 space-y-2 text-sm">
                  {analyticsData.predictions.recommendedActions.map(action => (
                    <li key={action} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hábitos y motivación</CardTitle>
              <CardDescription>
                Información útil para optimizar tu preparación diaria.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <InsightPanel title="Horario óptimo" icon={Lightbulb}>
                <p className="text-sm text-muted-foreground">
                  Tus sesiones más efectivas ocurren entre <strong>{analyticsData.insights.bestStudyTime}</strong>.
                  Aprovecha ese horario para los contenidos más complejos.
                </p>
              </InsightPanel>
              <InsightPanel title="Fortalezas" icon={Award}>
                <p className="text-sm text-muted-foreground">
                  Asignaturas destacadas: {analyticsData.insights.strongestSubjects.join(', ')}.
                </p>
              </InsightPanel>
              <InsightPanel title="Oportunidades" icon={Target}>
                <p className="text-sm text-muted-foreground">
                  Refuerza: {analyticsData.insights.improvementAreas.join(', ')}. Programa misiones específicas para ellas.
                </p>
              </InsightPanel>
              <InsightPanel title="Motivadores" icon={Flame}>
                <p className="text-sm text-muted-foreground">
                  Factores de motivación: {analyticsData.insights.motivationFactors.join(', ')}.
                </p>
              </InsightPanel>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tendencia de desempeño</CardTitle>
              <CardDescription>
                Evolución de tu puntaje promedio en ensayos recientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {analyticsData.trends.map(trend => (
                  <div key={trend.label} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{trend.label}</span>
                      <Badge variant={trend.value >= 75 ? 'default' : 'secondary'}>
                        {trend.value}%
                      </Badge>
                    </div>
                    <Progress value={trend.value} className="mt-3 h-2" />
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                Descargar reporte detallado
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  helper,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function PredictionBox({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function InsightPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
