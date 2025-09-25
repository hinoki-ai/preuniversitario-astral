'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { 
  Target, 
  Trophy, 
  Zap, 
  Clock, 
  Star, 
  CheckCircle2, 
  Circle,
  Flame,
  Crown,
  TrendingUp,
  Award,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface mission {
  id: string;
  type: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  reward: {
    points: number;
    bonus?: string;
  };

  difficulty: string;
}

interface missionsdata {
  missions: mission[];
  completedCount: number;
  streakBonus: number;
  date: string;
}

export function DailyMissions() {
  const { toast } = useToast();
  const missionsData = useQuery(api.dailyMissions.getTodaysMissions) as MissionsData | undefined;
  const missionStats = useQuery(api.dailyMissions.getMissionStats);
  
  if (!missionsData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  const { missions, completedCount, streakBonus } = missionsData;

  const allCompleted = completedCount === missions.length;
  const completionPercentage = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;completionPercentagemissions.length0completedCountmissions.length100

  return (
    <div className="space-y-6">
      {/* Daily Missions Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Daily Missions</CardTitle>
            </div>
            <Badge variant={allCompleted ? "default" : "secondary"} className="text-xs">
              {completedCount}/{missions.length} Complete
            </Badge>
          </div>
          <CardDescription>
            Complete daily challenges to earn bonus points and maintain your streak
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily Progress</span>
                <span className="font-medium">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            {/* Streak Bonus Info */}
            {!allCompleted && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Complete All Missions</span>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                  +{streakBonus} pts
                </Badge>
              </div>
            )}

            {/* Completion Celebration */}
            {allCompleted && (
              <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold">All Missions Complete!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    You earned {streakBonus} bonus points! Come back tomorrow for new challenges.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual Missions */}
      <div className="grid gap-4 md:grid-cols-2">
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>

      {/* Mission Stats */}
      {missionStats && (
        <MissionStatsCard stats={missionStats} />
      )}
    </div>
  );
}

function MissionCard({ mission }: { mission: Mission }) {
  const progressPercentage = mission.target > 0 ? (mission.progress / mission.target) * 100 : 0;progressPercentagemission.target0mission.progressmission.target100
  
  const difficultyconfig = {
    easy: { 
      color: 'text-green-600 dark:text-green-400',; 
      bgColor: 'bg-green-50 dark:bg-green-950/20',;
      borderColor: 'border-green-200 dark:border-green-800',;
      icon: circle 
    },
    medium: { 
      color: 'text-blue-600 dark:text-blue-400',; 
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',;
      borderColor: 'border-blue-200 dark:border-blue-800',;
      icon: target 
    },
    hard: { 
      color: 'text-purple-600 dark:text-purple-400',; 
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',;
      borderColor: 'border-purple-200 dark:border-purple-800',;
      icon: zap 
    },
    legendary: { 
      color: 'text-amber-600 dark:text-amber-400',; 
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',;
      borderColor: 'border-amber-200 dark:border-amber-800',;
      icon: crown 
    },
  };

  const config = difficultyConfig[mission.difficulty as keyof typeof difficultyConfig] || difficultyConfig.easy;
  const IconComponent = config.icon;

  const typeicons = {
    quiz_streak: target,;
    subject_focus: star,;
    speed_challenge: zap,;
    accuracy_test: trendingup,;
    exploration: award,
  };

  const TypeIcon = typeIcons[mission.type as keyof typeof typeIcons] || Target;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      mission.completed ? "ring-2 ring-green-200 dark:ring-green-800" : "",
      config.borderColor
    )}>
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
              <CardDescription className="text-xs mt-1">
                {mission.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant="outline" 
              className={cn("text-xs capitalize", config.color, config.bgColor)}
            >
              <IconComponent className="h-3 w-3 mr-1" />
              {mission.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3" />
              {mission.reward.points}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {mission.progress}/{mission.target}
                {mission.type.includes('score') && ' (avg)'}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className={cn(
                "h-2",
                mission.completed && "bg-green-100 dark:bg-green-950"
              )}
            />
          </div>

          {/* Bonus Reward */}
          {mission.reward.bonus && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <Gift className="h-3 w-3" />
              <span>Bonus: {mission.reward.bonus}</span>
            </div>
          )}

          {/* Mission Status */}
          {mission.completed ? (
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              <span className="font-medium">Mission Complete!</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              {mission.target - mission.progress} more to complete
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MissionStatsCard({ stats }: { stats: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Mission Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Current Streak */}
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>

          {/* Total Completed */}
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalMissionsCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Total Completed</div>
          </div>

          {/* Weekly Rank */}
          {stats.weeklyLeaderboard?.length > 0 && (
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                #{stats.weeklyLeaderboard.findIndex((u: any) => u.isCurrentUser) + 1 || '—'}
              </div>
              <div className="text-xs text-muted-foreground">Weekly Rank</div>
            </div>
          )}

          {/* Average Performance */}
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.personalStats?.averageDailyCompletions?.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-muted-foreground">Avg Daily</div>
          </div>
        </div>

        {/* Weekly Leaderboard */}
        {stats.weeklyLeaderboard?.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Weekly Mission Leaders
            </h4>
            <div className="space-y-2">
              {stats.weeklyLeaderboard.slice(0, 5).map((user: any, index: number) => (
                <div 
                  key={user.userId} 
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg text-sm",
                    user.isCurrentUser ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-yellow-100 text-yellow-800" :
                      index === 1 ? "bg-gray-100 text-gray-800" :
                      index === 2 ? "bg-orange-100 text-orange-800" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <span className={user.isCurrentUser ? "font-semibold" : ""}>
                      {user.name}
                      {user.isCurrentUser && " (You)"}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.completions} missions
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}