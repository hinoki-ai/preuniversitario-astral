'use client';

import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import {
  Award,
  BadgePercent,
  Book,
  CheckCircle2,
  Circle,
  Crown,
  Flame,
  Gift,
  Sparkles,
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

type MissionDifficulty = 'escudero' | 'guerrero' | 'paladín' | 'leyenda';

type MissionType = 'cadena_guerrera' | 'sabiduría_ancestral' | 'velocidad_relámpago' | 'precisión_letal' | 'exploración_mística';

type MissionReward = {
  esencia: number;
  masteryBonus?: number;
  retentionBonus?: number;
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
  date: number;
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
  escudero: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: Circle,
  },
  guerrero: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Target,
  },
  paladín: {
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    icon: Zap,
  },
  leyenda: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: Crown,
  },
};

const typeIcons: Record<MissionType, React.ComponentType<{ className?: string }>> = {
  cadena_guerrera: Flame,
  sabiduría_ancestral: Book,
  velocidad_relámpago: Zap,
  precisión_letal: Target,
  exploración_mística: Sparkles,
};

export function DailyMissions() {
  const { toast } = useToast();
  const missionsData = useQuery(api.dailyMissions.getTodaysMissions) as unknown as MissionsData | undefined;
  const missionStats = useQuery(api.dailyMissions.getMissionStats) as MissionStats | undefined;
  const updateMissionProgress = useMutation(api.dailyMissions.updateMissionProgress);
  const initializeMissions = useMutation(api.dailyMissions.initializeTodaysMissions);

  // Initialize missions if they don't exist
  React.useEffect(() => {
    if (missionsData === null) {
      initializeMissions();
    }
  }, [missionsData, initializeMissions]);

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
    if (!missionsData) return;

    const mission = missionsData.missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    const remainingProgress = mission.target - mission.progress;

    try {
      await updateMissionProgress({
        missionId,
        progressIncrement: remainingProgress
      });
      toast({
        title: '¡Misión conquistada! ⚔️',
        description: 'Sigue así para mantener tu Racha de Honor.',
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
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Aventuras Legendarias</CardTitle>
            </div>
            <Badge variant={allCompleted ? 'default' : 'secondary'} className="text-xs">
              {completedCount}/{missions.length} conquistadas
            </Badge>
          </div>
          <CardDescription>
            Completa desafíos diarios para ganar Esencia Arcana y mantener tu Cadena de Honor activa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Camino del Héroe</span>
              <span className="font-medium">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {!allCompleted && (
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Conquista todas las aventuras</span>
              </div>
              <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-700">
                +{streakBonus} Esencia
              </Badge>
            </div>
          )}

          {allCompleted && (
            <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-center dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">¡Todas las aventuras conquistadas!</span>
              </div>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Obtienes {streakBonus} Esencia Arcana extra. Regresa mañana para nuevas leyendas.
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
  const config = difficultyConfig[mission.difficulty] ?? difficultyConfig.escudero;
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
              <Sparkles className="h-3 w-3" />
              {mission.reward.esencia}
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

        {(mission.reward.masteryBonus || mission.reward.retentionBonus) && (
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <Gift className="h-3 w-3" />
            <span>Bonus: {mission.reward.masteryBonus || mission.reward.retentionBonus}</span>
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
          <Crown className="h-5 w-5" />
          Crónica de Hazañas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatChip
            icon={Flame}
            label="Racha de Honor"
            value={`${stats.currentStreak} días`}
            className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
            iconColor="text-orange-500"
          />
          <StatChip
            icon={Trophy}
            label="Hazañas Conquistadas"
            value={String(stats.totalMissionsCompleted)}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
            iconColor="text-blue-500"
          />
          <StatChip
            icon={TrendingUp}
            label="Promedio Guerrero"
            value={`${stats.personalStats?.averageDailyCompletions?.toFixed(1) ?? '0.0'}`}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
            iconColor="text-purple-500"
          />
          <StatChip
            icon={Crown}
            label="Bonus Legendario"
            value="Conquista todas las misiones"
            className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20"
            iconColor="text-emerald-500"
          />
        </div>

        {stats.weeklyLeaderboard?.length ? (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Crown className="h-4 w-4" />
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
