'use client';

import { useMutation, useQuery } from 'convex/react';
import {
  Award,
  BadgePercent,
  CheckCircle2,
  Circle,
  Crown,
  Flame,
  Gift,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';

import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

type MissionType = 'quiz_streak' | 'subject_focus' | 'speed_challenge' | 'accuracy_test' | 'exploration';

type MissionReward = {
  points: number;
  bonus?: string;
};

type Mission = {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  difficulty: MissionDifficulty;
  reward: MissionReward;
};

type MissionsData = {
  missions: Mission[];
  completedCount: number;
  streakBonus: number;
  date: string;
};

type MissionStats = {
  currentStreak: number;
  totalMissionsCompleted: number;
  weeklyLeaderboard: Array<{
    userId: string;
    name: string;
    completions: number;
    isCurrentUser?: boolean;
  }>;
  personalStats?: {
    averageDailyCompletions?: number;
  };
};

const difficultyConfig: Record<MissionDifficulty, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  easy: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: Circle,
  },
  medium: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Target,
  },
  hard: {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: Zap,
  },
  legendary: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: Crown,
  },
};

const typeIcons: Record<MissionType, React.ComponentType<{ className?: string }>> = {
  quiz_streak: Target,
  subject_focus: Star,
  speed_challenge: Zap,
  accuracy_test: TrendingUp,
  exploration: Award,
};

export function DailyMissions() {
  const { toast } = useToast();
  const missionsData = useQuery(api.dailyMissions.getTodaysMissions) as MissionsData | undefined;
  const missionStats = useQuery(api.dailyMissions.getMissionStats) as MissionStats | undefined;
  const completeMission = useMutation(api.dailyMissions.completeMission);

  if (!missionsData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-3 rounded bg-muted" />
            <div className="h-3 w-5/6 rounded bg-muted" />
          </div>
        </div>
      </Card>
    );
  }

  const { missions, completedCount, streakBonus } = missionsData;
  const allCompleted = missions.length > 0 && completedCount === missions.length;
  const completionPercentage = missions.length > 0
    ? (completedCount / missions.length) * 100
    : 0;

  const handleCompleteMission = async (missionId: string) => {
    try {
      await completeMission({ missionId });
      toast({
        title: '¡Misión completada! 🎯',
        description: 'Sigue así para mantener tu racha diaria.',
      });
    } catch (error) {
      toast({
        title: 'No se pudo completar la misión',
        description: error instanceof Error ? error.message : 'Inténtalo nuevamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Misiones diarias</CardTitle>
            </div>
            <Badge variant={allCompleted ? 'default' : 'secondary'} className="text-xs">
              {completedCount}/{missions.length} completadas
            </Badge>
          </div>
          <CardDescription>
            Completa desafíos diarios para sumar puntos y mantener tu racha activa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso diario</span>
              <span className="font-medium">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {!allCompleted && (
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Completa todas las misiones</span>
              </div>
              <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-700">
                +{streakBonus} pts
              </Badge>
            </div>
          )}

          {allCompleted && (
            <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-center dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                <Trophy className="h-5 w-5" />
                <span className="font-semibold">¡Todas las misiones completadas!</span>
              </div>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Obtienes {streakBonus} puntos extra. Vuelve mañana para nuevas misiones.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {missions.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onComplete={handleCompleteMission}
          />
        ))}
      </div>

      {missionStats && <MissionStatsCard stats={missionStats} />}
    </div>
  );
}

function MissionCard({
  mission,
  onComplete,
}: {
  mission: Mission;
  onComplete: (missionId: string) => void;
}) {
  const progressPercentage = mission.target > 0 ? (mission.progress / mission.target) * 100 : 0;
  const config = difficultyConfig[mission.difficulty] ?? difficultyConfig.easy;
  const IconComponent = config.icon;
  const TypeIcon = typeIcons[mission.type] ?? BadgePercent;

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        mission.completed && 'ring-2 ring-green-200 dark:ring-green-800',
        config.borderColor,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {mission.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <TypeIcon className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-sm font-medium leading-tight">
                {mission.title}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {mission.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="outline"
              className={cn('text-xs capitalize', config.color, config.bgColor)}
            >
              <IconComponent className="mr-1 h-3 w-3" />
              {mission.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3" />
              {mission.reward.points}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">
              {mission.progress}/{mission.target}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {mission.reward.bonus && (
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <Gift className="h-3 w-3" />
            <span>Bonus: {mission.reward.bonus}</span>
          </div>
        )}

        {mission.completed ? (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            <span className="font-medium">¡Misión completada!</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Faltan {Math.max(0, mission.target - mission.progress)}</span>
            <Button size="sm" variant="secondary" onClick={() => onComplete(mission.id)}>
              Marcar completada
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MissionStatsCard({ stats }: { stats: MissionStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5" />
          Estadísticas de misiones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatChip
            icon={Flame}
            label="Racha actual"
            value={`${stats.currentStreak} días`}
            className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
            iconColor="text-orange-500"
          />
          <StatChip
            icon={CheckCircle2}
            label="Total completadas"
            value={String(stats.totalMissionsCompleted)}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
            iconColor="text-blue-500"
          />
          <StatChip
            icon={TrendingUp}
            label="Promedio diario"
            value={`${stats.personalStats?.averageDailyCompletions?.toFixed(1) ?? '0.0'}`}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
            iconColor="text-purple-500"
          />
          <StatChip
            icon={Award}
            label="Bonus disponible"
            value="Completa todas las misiones"
            className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20"
            iconColor="text-emerald-500"
          />
        </div>

        {stats.weeklyLeaderboard?.length ? (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Trophy className="h-4 w-4" />
              Ranking semanal
            </h4>
            <div className="space-y-2">
              {stats.weeklyLeaderboard.slice(0, 5).map((user, index) => (
                <div
                  key={user.userId}
                  className={cn(
                    'flex items-center justify-between rounded-lg p-2 text-sm',
                    user.isCurrentUser ? 'border border-primary/30 bg-primary/10' : 'bg-muted/50',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        index === 0 && 'bg-yellow-100 text-yellow-800',
                        index === 1 && 'bg-gray-100 text-gray-800',
                        index === 2 && 'bg-orange-100 text-orange-800',
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className={user.isCurrentUser ? 'font-semibold' : undefined}>
                      {user.name}
                      {user.isCurrentUser ? ' (Tú)' : ''}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.completions} misiones
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  className,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
  iconColor?: string;
}) {
  return (
    <div className={cn('rounded-lg p-3 text-center', className)}>
      <div className="mb-2 flex justify-center">
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
