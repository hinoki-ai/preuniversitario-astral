'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Flame, Trophy, Star, Award, Zap } from 'lucide-react';

export function StatsCards() {
  const stats = useQuery(api.userStats.getUserStats);
  const recommendations = useQuery(api.userStats.getRecommendations);

  if (!stats) return <div className="animate-pulse">Loading stats...</div>;

  // Safe property access with default values
  const currentStreak = stats.currentStreak ?? 0;
  const avgScore = stats.avgScore ?? 0;
  const totalPoints = (stats as any).totalPoints ?? 0;
  const level = (stats as any).level ?? 1;
  const experiencePoints = (stats as any).experiencePoints ?? 0;
  const pointsToNextLevel = (stats as any).pointsToNextLevel ?? 100;
  const achievements = (stats as any).achievements ?? [];
  const weeklyGoals = (stats as any).weeklyGoals ?? { quizzesCompleted: 0, quizzesTarget: 5 };

  const performanceLevel = avgScore > 0.8 ? 'Excellent' :
                          avgScore > 0.6 ? 'Good' :
                          avgScore > 0.4 ? 'Average' : 'Needs Improvement';
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
            <CardTitle className="text-sm font-medium">Level & Points</CardTitle>
            <Star className="h-4 w-4 text-golden" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl font-bold">Lv.{level}</div>
              <Badge variant="secondary" className="text-xs">
                {totalPoints} pts
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-golden to-amber progress-bar"
                data-progress-width={`${levelProgress}%`}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pointsToNextLevel} pts to next level
            </p>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Flame className={`h-4 w-4 ${currentStreak > 0 ? 'text-amber' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Record: {stats.longestStreak ?? 0} days
            </p>
            {stats.todayActive && (
              <Badge variant="outline" className="mt-2 text-golden border-golden">
                🔥 Active Today
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length}</div>
            <p className="text-xs text-muted-foreground">
              Badges earned
            </p>
            {achievements.length > 0 && (
              <Badge variant="outline" className="mt-2 text-bronze border-bronze">
                🏆 {achievements[achievements.length - 1]?.title}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyGoals.quizzesCompleted}/{weeklyGoals.quizzesTarget}
            </div>
            <p className="text-xs text-muted-foreground">
              Quizzes this week
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-accent progress-bar"
                data-progress-width={`${Math.min(100, (weeklyGoals.quizzesCompleted / weeklyGoals.quizzesTarget) * 100)}%`}
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
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
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
            <CardTitle className="text-sm font-medium">Practice Tests</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Total completed
            </p>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subject Focus</CardTitle>
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
                {stats.strongSubjects?.length || 0} strong • {stats.weakSubjects?.length || 0} need focus
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Action */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Action</CardTitle>
            <Trophy className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold line-clamp-2">
              {recommendations?.nextAction || 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recommendations?.reason}
            </p>
            {recommendations?.priority && (
              <Badge 
                variant={recommendations.priority === 'high' ? 'destructive' : 'secondary'}
                className="mt-2"
              >
                {recommendations.priority} priority
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}