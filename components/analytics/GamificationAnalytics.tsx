'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

import { 
  TrendingUp, 
  Target, 
  Brain,
  Calendar,
  Clock,
  Star,
  Trophy,
  Flame,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Award,
  Users,
  BookOpen,
  Timer,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface analyticsdata {
  performance: {
    currentLevel: number;
    totalPoints: number;
    weeklyGrowth: number;
    streakDays: number;
    averageScore: number;
    improvementRate: number;
  };
  predictions: {
    projectedLevel: number;
    estimatedTimeToNext: number;
    likelihoodToAchieve: number;
    recommendedActions: string[];
  };
  insights: {
    bestStudyTime: string;
    optimalSessionLength: number;
    strongestSubjects: string[];
    improvementAreas: string[];
    motivationFactors: string[];
  };
  trends: {
    daily: Array<{ date: string; points: number; score: number; }>;
    weekly: Array<{ week: string; level: number; achievements: number; }>;
    monthly: Array<{ month: string; growth: number; consistency: number; }>;
  };
}

export function GamificationAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // In a real implementation, these would come from actual API calls
  const userStats = useQuery(api.userStats.getUserStats);
  const achievements = useQuery(api.userStats.getUserAchievements);
  
  // Mock analytics data (replace with real API calls)
  const analyticsData: AnalyticsData = {
    performance: {
      currentLevel: userstats?.level || 1,;
      totalPoints: userstats?.totalpoints || 0,;
      weeklyGrowth: 12.5,;
      streakDays: userstats?.currentstreak || 0,;
      averageScore: userstats?.avgscore ? userstats.avgscore *; 100 : 0,;
      improvementRate: 8.3,
    },
    predictions: {
      projectedLevel: (userstats?.level || 1) + 2,;
      estimatedTimeToNext: 14,;
      likelihoodToAchieve: 78,;
      recommendedActions: [
        'Focus on mathematics to improve weakest subject',
        'Maintain daily study streak for bonus multipliers',
        'Complete 3 more daily missions this week',
        'Try speed challenges to earn efficiency badges'
      ],
    },
    insights: {
      bestStudyTime: '7:00 PM - 9:00 PM',;
      optimalSessionLength: 45,;
      strongestSubjects: ['Ciencias', 'Matemáticas'],;
      improvementAreas: ['Lenguaje', 'Historia'],;
      motivationFactors: ['Daily streaks', 'Achievement unlocks', 'Leaderboard ranking'],
    },
    trends: {
      daily: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        points: Math.floor(Math.random() * 100) + 50,
        score: Math.floor(Math.random() * 40) + 60,
      })).reverse(),;
      weekly: Array.from({ length: 4 }, (_, i) => ({
        week: `Week ${4 - i}`,
        level: Math.max(1, (userStats?.level || 1) - i),
        achievements: Math.floor(Math.random() * 3) + 1,
      })).reverse(),;
      monthly: Array.from({ length: 6 }, (_, i) => ({
        month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en', { month: 'short' }),
        growth: Math.floor(Math.random() * 20) + 5,
        consistency: Math.floor(Math.random() * 30) + 60,
      })).reverse(),
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Gamification Analytics
          </CardTitle>
          <CardDescription>
            Advanced insights into your learning progress and gamification performance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Optimize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab data={analyticsData} />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictionsTab data={analyticsData} />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsTab data={analyticsData} />
        </TabsContent>

        <TabsContent value="trends">
          <TrendsTab data={analyticsData} />
        </TabsContent>

        <TabsContent value="optimization">
          <OptimizationTab data={analyticsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              Level {data.performance.currentLevel}
            </div>
            <div className="text-sm text-muted-foreground mb-3">Current Level</div>
            <div className="flex items-center justify-center gap-1 text-green-600">
              <ArrowUp className="h-4 w-4" />
              <span className="text-sm">+{data.performance.weeklyGrowth}% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-amber-600 mb-2">
              {data.performance.totalPoints.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mb-3">Total Points</div>
            <div className="flex items-center justify-center gap-1 text-green-600">
              <Star className="h-4 w-4" />
              <span className="text-sm">Top 15% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2 flex items-center justify-center gap-1">
              <Flame className="h-6 w-6" />
              {data.performance.streakDays}
            </div>
            <div className="text-sm text-muted-foreground mb-3">Day Streak</div>
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <Target className="h-4 w-4" />
              <span className="text-sm">Goal: 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {Math.round(data.performance.averageScore)}%
            </div>
            <div className="text-sm text-muted-foreground mb-3">Average Score</div>
            <div className="flex items-center justify-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">+{data.performance.improvementRate}% improved</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span>Level {data.performance.currentLevel} → {data.performance.currentLevel + 1}</span>
            </div>
            <Progress value={65} className="h-3" />
            <div className="text-xs text-muted-foreground">
              350 more XP needed to reach next level
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Quiz Goals
              </div>
              <Progress value={80} className="h-2" />
              <div className="text-xs text-muted-foreground">4 of 5 completed</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Timer className="h-4 w-4 text-purple-600" />
                Study Time
              </div>
              <Progress value={60} className="h-2" />
              <div className="text-xs text-muted-foreground">3h of 5h completed</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Award className="h-4 w-4 text-green-600" />
                Achievements
              </div>
              <Progress value={90} className="h-2" />
              <div className="text-xs text-muted-foreground">9 of 10 unlocked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: '🔥 Week Streak', description: 'Studied for 7 days in a row', time: '2 hours ago', points: 50 },
              { title: '⭐ High Achiever', description: 'Maintained 80%+ average', time: '1 day ago', points: 100 },
              { title: '🎯 Quiz Machine', description: 'Completed 50 practice quizzes', time: '3 days ago', points: 125 },
            ].map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium text-sm">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  <div className="text-xs text-muted-foreground">{achievement.time}</div>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  +{achievement.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PredictionsTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Prediction Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Predictions
          </CardTitle>
          <CardDescription>
            Based on your current performance and study patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                Level {data.predictions.projectedLevel}
              </div>
              <div className="text-sm text-muted-foreground">
                Projected Level in 30 days
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {data.predictions.estimatedTimeToNext} days
              </div>
              <div className="text-sm text-muted-foreground">
                Until next level
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {data.predictions.likelihoodToAchieve}%
              </div>
              <div className="text-sm text-muted-foreground">
                Success likelihood
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommended Actions
          </CardTitle>
          <CardDescription>
            Personalized suggestions to optimize your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.predictions.recommendedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{action}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      High Impact
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Expected: +50 XP
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            30-Day Progress Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock forecast chart representation */}
            <div className="h-40 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <LineChart className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Interactive forecast chart would go here</div>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">+2.5</div>
                <div className="text-xs text-muted-foreground">Expected Level Gain</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">+1,250</div>
                <div className="text-xs text-muted-foreground">Projected Points</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">8</div>
                <div className="text-xs text-muted-foreground">New Achievements</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InsightsTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Study Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Study Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-blue-600" />
                Optimal Study Time
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="font-semibold text-blue-700 dark:text-blue-300">
                  {data.insights.bestStudyTime}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Your peak performance window
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Timer className="h-4 w-4 text-purple-600" />
                Session Length
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="font-semibold text-purple-700 dark:text-purple-300">
                  {data.insights.optimalSessionLength} minutes
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Recommended session duration
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Strongest Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.insights.strongestSubjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <span className="font-medium text-green-700 dark:text-green-300">{subject}</span>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  {85 + index * 3}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Improvement Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.insights.improvementAreas.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <span className="font-medium text-orange-700 dark:text-orange-300">{subject}</span>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  {65 - index * 5}%
                </Badge>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-3">
              <Target className="h-4 w-4 mr-2" />
              Get Study Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Motivation Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            What Motivates You
          </CardTitle>
          <CardDescription>
            Based on your engagement patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {data.insights.motivationFactors.map((factor, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg">
                <div className="text-2xl mb-2">
                  {index === 0 ? '🔥' : index === 1 ? '🏆' : '📊'}
                </div>
                <div className="font-medium text-sm">{factor}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {90 - index * 10}% engagement boost
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendsTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Trends Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Daily Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.trends.daily.slice(-3).map((day, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{day.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{day.points} pts</span>
                    <span className={cn(
                      "text-xs",
                      day.score >= 80 ? "text-green-600" : 
                      day.score >= 60 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {day.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Weekly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.trends.weekly.slice(-3).map((week, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{week.week}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Lv.{week.level}</span>
                    <Badge variant="outline" className="text-xs">
                      {week.achievements} new
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Monthly Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.trends.monthly.slice(-3).map((month, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{month.month}</span>
                    <span className="font-medium">{month.consistency}%</span>
                  </div>
                  <Progress value={month.consistency} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mock chart representation */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <div className="text-lg font-medium">Interactive Trend Charts</div>
              <div className="text-sm">Points, Streaks, Achievements over time</div>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">+23%</div>
              <div className="text-xs text-muted-foreground">Points Growth</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">+15%</div>
              <div className="text-xs text-muted-foreground">Score Improvement</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">+8</div>
              <div className="text-xs text-muted-foreground">New Achievements</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">12 days</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OptimizationTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Optimization
          </CardTitle>
          <CardDescription>
            Actionable strategies to maximize your gamification benefits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              category: 'Study Schedule',
              recommendation: 'Shift study time to 7-9 PM for 15% better retention',
              impact: 'High',
              effort: 'Low',
              icon: Calendar,
            },
            {
              category: 'Session Length',
              recommendation: 'Break 90-minute sessions into 45-minute chunks with breaks',
              impact: 'Medium',
              effort: 'Low',
              icon: Clock,
            },
            {
              category: 'Subject Focus',
              recommendation: 'Spend 20% more time on Lenguaje to balance skill development',
              impact: 'High',
              effort: 'Medium',
              icon: BookOpen,
            },
            {
              category: 'Streak Maintenance',
              recommendation: 'Set daily reminders at 6 PM to maintain consistency',
              impact: 'Medium',
              effort: 'Low',
              icon: Flame,
            },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm mb-1">{item.category}</div>
                <div className="text-sm text-muted-foreground mb-2">{item.recommendation}</div>
                <div className="flex gap-2">
                  <Badge variant={item.impact === 'High' ? 'default' : 'outline'} className="text-xs">
                    {item.impact} Impact
                  </Badge>
                  <Badge variant={item.effort === 'Low' ? 'default' : 'outline'} className="text-xs">
                    {item.effort} Effort
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Apply
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Goal Setting Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Smart Goal Setting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="font-medium text-sm">Suggested Weekly Goals</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Complete 6 quizzes</span>
                  <Badge variant="outline" className="text-xs">Achievable</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Study 4 hours</span>
                  <Badge variant="outline" className="text-xs">Stretch</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Maintain streak</span>
                  <Badge variant="outline" className="text-xs">Critical</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="font-medium text-sm">Monthly Objectives</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Reach Level {data.performance.currentLevel + 1}</span>
                  <Badge variant="outline" className="text-xs">78% likely</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Earn 5 new badges</span>
                  <Badge variant="outline" className="text-xs">65% likely</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">Top 10 leaderboard</span>
                  <Badge variant="outline" className="text-xs">45% likely</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Efficiency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">92%</div>
              <div className="text-sm text-muted-foreground mb-1">Time Efficiency</div>
              <div className="text-xs text-green-600">Excellent</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">7.2</div>
              <div className="text-sm text-muted-foreground mb-1">Points per Minute</div>
              <div className="text-xs text-blue-600">Above Average</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">3.4x</div>
              <div className="text-sm text-muted-foreground mb-1">Streak Multiplier</div>
              <div className="text-xs text-purple-600">Keep Going!</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}