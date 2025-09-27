'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Flame, Trophy, Star, Award, Zap, Crown, Sparkles } from 'lucide-react';
import { getLevelTitle } from '@/convex/shared';
import { UserStats } from '@/lib/types';

export function StatsCards() {
  const stats = useQuery(api.userStats.getUserStats) as UserStats | undefined;
  const recommendations = useQuery(api.userStats.getRecommendations);

  if (!stats) return <div className="animate-pulse">Cargando estadísticas...</div>;

  // Safe property access with default values
  const currentStreak = stats.currentStreak ?? 0;
  const avgScore = stats.avgScore ?? 0;
  const esenciaArcana = stats.esenciaArcana ?? 0;
  const level = stats.level ?? 1;
  const experiencePoints = stats.experiencePoints ?? 0;
  const pointsToNextLevel = stats.pointsToNextLevel ?? 100;
  const achievements = stats.achievements ?? [];
  const weeklyGoals = stats.weeklyGoals ?? { quizzesCompleted: 0, quizzesTarget: 5, weekStart: 0 };

  // Get medieval level title
  const levelTitle = getLevelTitle(level);

  const performanceLevel = avgScore > 0.8 ? 'Excelente' :
                          avgScore > 0.6 ? 'Bueno' :
                          avgScore > 0.4 ? 'Regular' : 'Necesita Mejorar';
  const performanceColor = avgScore > 0.8 ? 'text-golden' :
                          avgScore > 0.6 ? 'text-accent' :
                          avgScore > 0.4 ? 'text-amber' : 'text-destructive';

  // Calculate level progress percentage
  const levelProgress = pointsToNextLevel > 0
    ? Math.round((experiencePoints / (experiencePoints + pointsToNextLevel)) * 100)
    : 100;

  return (
    <>
      {/* Top Row - Gamification Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        {/* Level & Points */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rango Guerrero</CardTitle>
            <Crown className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl font-bold">{levelTitle.rank}</div>
              <Badge variant="secondary" className="text-xs">
                {esenciaArcana} Esencia
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 progress-bar"
                data-progress-width={`${levelProgress}%`}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pointsToNextLevel} Esencia Arcana para el siguiente rango
            </p>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Racha de Honor</CardTitle>
            <Flame className={`h-4 w-4 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} días</div>
            <p className="text-xs text-muted-foreground">
              Récord: {stats.longestStreak ?? 0} días
            </p>
            {(stats as any).todayActive && (
              <Badge variant="outline" className="mt-2 text-orange-600 border-orange-600">
                ⚔️ Guerrero Activo
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hazañas Legendarias</CardTitle>
            <Award className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length}</div>
            <p className="text-xs text-muted-foreground">
              Emblemas conquistados
            </p>
            {achievements.length > 0 && (
              <Badge variant="outline" className="mt-2 text-amber-600 border-amber-600">
                🏆 {achievements[achievements.length - 1]?.title}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Semanal</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyGoals.quizzesCompleted ?? 0}/{weeklyGoals.quizzesTarget ?? 5}
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluaciones esta semana
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-accent progress-bar"
                data-progress-width={`${Math.min(100, ((weeklyGoals.quizzesCompleted ?? 0) / (weeklyGoals.quizzesTarget ?? 1)) * 100)}%`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Performance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Average Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desempeño</CardTitle>
            <TrendingUp className={`h-4 w-4 ${performanceColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(avgScore * 100)}%
            </div>
            <p className={`text-xs ${performanceColor}`}>
              {performanceLevel}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full progress-bar ${
                  avgScore > 0.8 ? 'bg-golden' :
                  avgScore > 0.6 ? 'bg-accent' :
                  avgScore > 0.4 ? 'bg-amber' : 'bg-destructive'
                }`}
                data-progress-width={`${avgScore * 100}%`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Total Quizzes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluaciones de Práctica</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Total completadas
            </p>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enfoque por Asignatura</CardTitle>
            <Target className="h-4 w-4 text-golden" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {stats.strongSubjects && stats.strongSubjects.length > 0 ? (
                <div className="text-sm font-semibold text-golden">
                  ✅ {stats.strongSubjects[0]}
                </div>
              ) : null}
              {stats.weakSubjects && stats.weakSubjects.length > 0 ? (
                <div className="text-sm font-semibold text-amber">
                  📚 {stats.weakSubjects[0]}
                </div>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {stats.strongSubjects?.length || 0} fuertes • {stats.weakSubjects?.length || 0} necesitan atención
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Action */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Acción</CardTitle>
            <Trophy className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold line-clamp-2">
              {recommendations?.nextAction || 'Cargando...'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recommendations?.reason}
            </p>
            {recommendations?.priority && (
              <Badge
                variant={recommendations.priority === 'high' ? 'destructive' : 'secondary'}
                className="mt-2"
              >
                {recommendations.priority === 'high' ? 'Alta prioridad' : 'Prioridad media'}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}