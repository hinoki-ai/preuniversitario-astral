'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { 
  Trophy, 
  Star, 
  Crown, 
  Flame, 
  Target, 
  Zap, 
  Award, 
  Clock,
  CheckCircle2,
  Lock,
  TrendingUp,
  Book,
  Users,
  Calendar,
  Sparkles,
  Medal,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: string;
  esencia: number;
  category: string;
  tier: string;
  earned: boolean;
  earnedAt?: number;
  prerequisites?: string[];
  subject?: string;
  season?: string;
}

const categoryConfig = {
  streak: {
    name: 'Disciplina Monástica',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
    description: 'Logros por mantener la disciplina guerrera constante'
  },
  performance: {
    name: 'Maestría Arcana',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20',
    description: 'Logros por excelencia mágica y puntuaciones perfectas'
  },
  persistence: {
    name: 'Lealtad Eterna',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    description: 'Logros por completar muchas pruebas y mantener la dedicación'
  },
  efficiency: {
    name: 'Velocidad del Rayo',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
    description: 'Logros por aprendizaje rápido y eficiente'
  },
  mastery: {
    name: 'Dominio Absoluto',
    icon: Book,
    color: 'text-emerald-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20',
    description: 'Logros por dominar materias específicas'
  },
  discipline: {
    name: 'Orden Sagrada',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20',
    description: 'Logros por mejora constante y disciplina inquebrantable'
  },
  milestone: {
    name: 'Conquistas Épicas',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20',
    description: 'Logros por alcanzar niveles importantes y puntos legendarios'
  },
  seasonal: {
    name: 'Ciclos Mágicos',
    icon: Calendar,
    color: 'text-rose-600',
    bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20',
    description: 'Logros de tiempo limitado y eventos estacionales'
  },
  social: {
    name: 'Hermandad Guerrera',
    icon: Users,
    color: 'text-cyan-600',
    bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20',
    description: 'Logros por actividades sociales y competitivas'
  },
  exploration: {
    name: 'Aventuras Legendarias',
    icon: Award,
    color: 'text-teal-600',
    bgColor: 'bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20',
    description: 'Logros por explorar diferentes materias y contenidos'
  },
  resilience: {
    name: 'Corazón de León',
    icon: Medal,
    color: 'text-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20',
    description: 'Logros por levantarte una y otra vez sin rendirte jamás'
  }
};

const tierConfig = {
  bronze: {
    name: 'Bronce',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-300 dark:border-amber-700',
    icon: Medal
  },
  silver: {
    name: 'Plata',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600',
    icon: Award
  },
  gold: {
    name: 'Oro',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    icon: Trophy
  },
  legendary: {
    name: 'Legendario',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-300 dark:border-purple-700',
    icon: Crown
  }
};

export function AchievementsGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  
  const achievements = useQuery(api.userStats.getUserAchievements) as Achievement[] | undefined;
  
  if (!achievements) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  // Calculate statistics
  const totalAchievements = achievements.length;
  const earnedAchievements = achievements.filter(a => a.earned).length;
  const totalEsencia = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.esencia, 0);
  const completionPercentage = totalAchievements > 0 ? (earnedAchievements / totalAchievements) * 100 : 0;

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (selectedTier !== 'all' && achievement.tier !== selectedTier) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-600" />
                Galería de Hazañas Legendarias
              </CardTitle>
              <CardDescription className="mt-1">
                Sigue tu camino guerrero y celebra tus conquistas épicas
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{earnedAchievements}/{totalAchievements}</div>
              <div className="text-sm text-muted-foreground">Hazañas</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {/* Completion Rate */}
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {Math.round(completionPercentage)}%
              </div>
              <div className="text-xs text-muted-foreground">Tasa de Conquista</div>
            </div>

            {/* Total Esencia */}
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                {totalEsencia.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Esencia Arcana</div>
            </div>

            {/* Recent Achievement */}
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {achievements.filter(a => a.earned && a.earnedAt && a.earnedAt > Date.now() / 1000 - 86400).length}
              </div>
              <div className="text-xs text-muted-foreground">Hoy</div>
            </div>

            {/* Rarest Achievement */}
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {achievements.filter(a => a.tier === 'legendary' && a.earned).length}
              </div>
              <div className="text-xs text-muted-foreground">Legendarios</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Camino del Guerrero</span>
              <span className="font-medium">{earnedAchievements} de {totalAchievements} hazañas</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="flex items-center gap-1"
                  >
                    <config.icon className="h-3 w-3" />
                    {config.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tier Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rango</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTier === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTier('all')}
                >
                  All Tiers
                </Button>
                {Object.entries(tierConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedTier === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTier(key)}
                    className="flex items-center gap-1"
                  >
                    <config.icon className="h-3 w-3" />
                    {config.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Vista de Galería</TabsTrigger>
          <TabsTrigger value="categories">Por Categoría</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => {
            const config = categoryConfig[category as keyof typeof categoryConfig];
            if (!config) return null;

            const earnedInCategory = categoryAchievements.filter(a => a.earned).length;
            
            return (
              <Card key={category} className={config.bgColor}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-800")}>
                        <config.icon className={cn("h-5 w-5", config.color)} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.name}</CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80">
                      {earnedInCategory}/{categoryAchievements.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {categoryAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} compact />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AchievementCard({ achievement, compact = false }: { achievement: Achievement; compact?: boolean }) {
  const categoryConfigItem = categoryConfig[achievement.category as keyof typeof categoryConfig];
  const tierConfigItem = tierConfig[achievement.tier as keyof typeof tierConfig];
  
  const canEarn = !achievement.prerequisites || achievement.prerequisites.length === 0 || 
                  achievement.prerequisites.every(prereq => 
                    // In a real implementation, you'd check if prerequisites are met
                    true
                  );

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      achievement.earned 
        ? "ring-2 ring-green-200 dark:ring-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
        : canEarn 
          ? "hover:ring-2 hover:ring-primary/20" 
          : "opacity-60",
      compact && "h-full"
    )}>
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Achievement Icon */}
            <div className={cn(
              "p-2 rounded-lg flex-shrink-0",
              achievement.earned 
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : canEarn
                  ? categoryConfigItem?.bgColor || "bg-muted"
                  : "bg-muted text-muted-foreground"
            )}>
              {achievement.earned ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : !canEarn ? (
                <Lock className="h-5 w-5" />
              ) : (
                <Trophy className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className={cn(
                "text-sm font-semibold leading-tight",
                compact && "text-xs"
              )}>
                {achievement.title}
              </CardTitle>
              <CardDescription className={cn(
                "text-xs mt-1 line-clamp-2",
                compact && "text-xs"
              )}>
                {achievement.description}
              </CardDescription>
            </div>
          </div>

          {/* Tier Badge */}
          {tierConfigItem && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs flex-shrink-0",
                tierConfigItem.color,
                tierConfigItem.bgColor,
                tierConfigItem.borderColor
              )}
            >
              <tierConfigItem.icon className="h-3 w-3 mr-1" />
              {tierConfigItem.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={cn("pt-0", compact && "pt-0")}>
        <div className="space-y-3">
          {/* Points and Category */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-3 w-3" />
                <span className="font-medium">{achievement.esencia} Esencia</span>
              </div>
              {categoryConfigItem && (
                <div className={cn("flex items-center gap-1", categoryConfigItem.color)}>
                  <categoryConfigItem.icon className="h-3 w-3" />
                  <span>{categoryConfigItem.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Subject Badge */}
          {achievement.subject && (
            <Badge variant="outline" className="text-xs">
              <Book className="h-3 w-3 mr-1" />
              {achievement.subject}
            </Badge>
          )}

          {/* Earned Date */}
          {achievement.earned && achievement.earnedAt && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>
                Earned {new Date(achievement.earnedAt * 1000).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Prerequisites */}
          {!achievement.earned && achievement.prerequisites && achievement.prerequisites.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <Lock className="h-3 w-3 inline mr-1" />
              Requires: {achievement.prerequisites.join(', ')}
            </div>
          )}

          {/* Seasonal Info */}

          {achievement.season && (
            <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
              <Calendar className="h-3 w-3" />
              <span>Seasonal Event</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}