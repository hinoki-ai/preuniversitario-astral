import {
  IconCalendarEvent,
  IconFlame,
  IconSparkles,
  IconTargetArrow,
  IconTrendingUp,
} from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function SectionCards() {
  const dashboardData = useQuery(api.dashboard.metrics);

  // Fallback values while loading
  const studyStreak = dashboardData?.studyStreak ?? 0;
  const nextStreakMilestone = dashboardData?.nextStreakMilestone ?? 7;
  const streakProgress = dashboardData?.streakProgress ?? 0;

  const weeklyGoal = dashboardData?.weeklyGoal ?? { completed: 0, target: 10 };
  const weeklyProgress = Math.min(
    100,
    Math.round((weeklyGoal.completed / weeklyGoal.target) * 100)
  );
  const weeklyHoursRemaining = Math.max(0, weeklyGoal.target - weeklyGoal.completed);

  const averageGrade = dashboardData?.averageGrade ?? 75;
  const averageGradeDelta = dashboardData?.averageGradeDelta ?? 0;
  const consistencyScore = dashboardData?.consistencyScore ?? 75;

  const upcomingExam = dashboardData?.upcomingExam;
  const dueDate = upcomingExam ? new Date(upcomingExam.date) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const now = Date.now();
  const daysUntilDue = upcomingExam?.daysUntil ?? Math.max(
    0,
    Math.ceil((dueDate.getTime() - now) / (1000 * 60 * 60 * 24))
  );
  const dueLabel =
    daysUntilDue === 0
      ? 'Hoy'
      : daysUntilDue === 1
        ? 'Mañana'
        : `En ${daysUntilDue} días`;
  const dueDateLabel = dueDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const examPreparation = upcomingExam?.preparation ?? 65;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Racha de estudio</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {studyStreak} días
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconFlame className="size-3 text-amber" />
              +2 vs. semana pasada
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Objetivo: {nextStreakMilestone} días</span>
            <span>{streakProgress}% hacia la meta</span>
          </div>
          <Progress value={streakProgress} className="h-2" />
        </CardContent>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <IconTrendingUp className="size-4 text-golden" />
            Mantén sesiones cortas hoy
          </div>
          <div className="text-muted-foreground">
            Completa al menos 30 minutos de repaso para extender la racha.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Meta semanal de estudio</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {weeklyGoal.completed.toFixed(1)} / {weeklyGoal.target} h
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTargetArrow className="size-3 text-primary" />
              {weeklyProgress}% completado
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Promedio diario: {(weeklyGoal.completed / 5).toFixed(1)} h</span>
            <span>Restan {weeklyHoursRemaining.toFixed(1)} h</span>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
        </CardContent>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <IconTargetArrow className="size-4 text-primary" />
            Ajusta el plan del viernes
          </div>
          <div className="text-muted-foreground">
            Agenda 45 minutos de Química para cerrar la meta semanal.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Promedio general</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {averageGrade}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconSparkles className="size-3 text-bronze" />
              +{averageGradeDelta.toFixed(1)} pts
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Mejor asignatura</span>
            <span>{dashboardData?.bestSubject?.name ?? 'General'} · {dashboardData?.bestSubject?.score ?? 75}%</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Área a reforzar</span>
            <span className="text-destructive">{dashboardData?.worstSubject?.name ?? 'General'} · {dashboardData?.worstSubject?.score ?? 75}%</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Consistencia semanal</span>
              <span>{consistencyScore}/100</span>
            </div>
            <Progress value={consistencyScore} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <IconTrendingUp className="size-4 text-golden" />
            Refuerza química esta semana
          </div>
          <div className="text-muted-foreground">
            Repite los 2 cuestionarios con puntajes menores a 80%.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Próxima evaluación</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {dueLabel}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconCalendarEvent className="size-3" />
              {dueDateLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm font-medium">{upcomingExam?.title ?? 'Simulacro PAES'}</div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Plan de estudio completado</span>
            <span>{Math.round(examPreparation)}%</span>
          </div>
          <Progress value={examPreparation} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Último puntaje</span>
            <span>{averageGrade}%</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <IconTargetArrow className="size-4 text-primary" />
            Prioridad: {upcomingExam?.subject ?? 'Matemática'}
          </div>
          <div className="text-muted-foreground">
            {upcomingExam?.subject === 'Matemática'
              ? 'Repasa 15 problemas focalizados y agenda un quiz diagnóstico.'
              : 'Continúa con el plan de estudio y práctica regular.'
            }
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
