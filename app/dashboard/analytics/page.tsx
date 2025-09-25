'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Clock, 
  Award, 
  Users, 
  BookOpen,
  Zap
} from 'lucide-react';

export default function AnalyticsPage() {
  const stats = useQuery(api.userStats.getUserStats);
  const userHistory = useQuery(api.mockExams.getUserMockExamHistory);
  const achievements = useQuery(api.userStats.getUserAchievements);
  const leaderboard = useQuery(api.userStats.getLeaderboard, { limit: 5 });
  const dashboardData = useQuery(api.dashboard.metrics);

  if (!stats || !dashboardData) {
    return <div className="animate-pulse p-6">Loading comprehensive analytics...</div>;
  }

  const subjectStats = dashboardData.subjectProgress || [];
  const chartData = dashboardData.chartData || [];

  // Calculate performance trends
  const recentScores = stats.recentPerformance?.slice(0, 10) || [];
  const averageRecentScore = recentScores.length > 0 
    ? recentScores.reduce((sum, perf) => sum + perf.score, 0) / recentScores.length 
    : 0;

  const performanceTrend = averageRecentScore > stats.avgScore ? 'improving' : 
                          averageRecentScore < stats.avgScore ? 'declining' : 'stable';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analysis of your PAES preparation progress
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">By Subject</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className={`h-4 w-4 ${
                  performanceTrend === 'improving' ? 'text-green-500' :
                  performanceTrend === 'declining' ? 'text-red-500' : 'text-blue-500'
                }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.avgScore || 0) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {performanceTrend === 'improving' ? '↗️ Improving' :
                   performanceTrend === 'declining' ? '↘️ Needs attention' : '→ Stable'}
                </p>
                <div className="mt-2">
                  <Badge variant={
                    performanceTrend === 'improving' ? 'default' :
                    performanceTrend === 'declining' ? 'destructive' : 'secondary'
                  }>
                    Recent: {Math.round(averageRecentScore * 100)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Consistency</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.consistencyScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Consistency rating
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500 progress-bar"
                    style={{
                      '--progress-width': `${dashboardData.consistencyScore}%`
                    } as React.CSSProperties}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Subject</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(dashboardData.bestSubject?.score || 0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.bestSubject?.name || 'N/A'}
                </p>
                <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                  ⭐ Strength
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Focus Area</CardTitle>
                <BookOpen className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(dashboardData.worstSubject?.score || 0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.worstSubject?.name || 'N/A'}
                </p>
                <Badge variant="outline" className="mt-2 text-orange-600 border-orange-600">
                  📚 Improve
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Study Activity (Last 30 Days)</CardTitle>
              <CardDescription>
                Daily study time and performance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization would be implemented here</p>
                  <p className="text-sm">Using recharts or similar library</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance Breakdown</CardTitle>
              <CardDescription>
                Detailed analysis by subject area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectStats.map((subject) => (
                  <div key={subject.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{subject.subject}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant={subject.risk === 'critical' ? 'destructive' : 
                                      subject.risk === 'attention' ? 'secondary' : 'default'}>
                          {subject.avgScore}%
                        </Badge>
                        <Badge variant="outline">
                          {subject.scoreDelta > 0 ? '↗️' : subject.scoreDelta < 0 ? '↘️' : '→'} 
                          {Math.abs(subject.scoreDelta)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <div className="font-medium">{subject.category}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">This Week:</span>
                        <div className="font-medium">{subject.hoursThisWeek}h</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Consistency:</span>
                        <div className="font-medium">{subject.consistency}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Goal:</span>
                        <div className="font-medium text-xs">{subject.nextMilestone}</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className={`h-2 rounded-full progress-bar ${
                          subject.avgScore >= 80 ? 'bg-green-500' :
                          subject.avgScore >= 70 ? 'bg-blue-500' :
                          subject.avgScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{
                          '--progress-width': `${subject.avgScore}%`
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Mock Exam History */}
            <Card>
              <CardHeader>
                <CardTitle>Mock Exam Performance</CardTitle>
                <CardDescription>
                  Your recent mock exam results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userHistory?.summary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{userHistory.summary.totalAttempts}</div>
                        <div className="text-sm text-muted-foreground">Total Attempts</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{userHistory.summary.averageScore}%</div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Best Score:</span>
                        <span className="font-semibold">{userHistory.summary.bestScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Trend:</span>
                        <span className={`font-semibold ${
                          userHistory.summary.improvementTrend > 0 ? 'text-green-600' :
                          userHistory.summary.improvementTrend < 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {userHistory.summary.improvementTrend > 0 ? '↗️' :
                           userHistory.summary.improvementTrend < 0 ? '↘️' : '→'} 
                          {Math.abs(userHistory.summary.improvementTrend)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No mock exams completed yet</p>
                    <p className="text-sm">Take your first mock exam to see performance data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Study Time Analysis</CardTitle>
                <CardDescription>
                  Time distribution and efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{dashboardData.weeklyGoal?.completed || 0}h</div>
                      <div className="text-sm text-muted-foreground">This Week</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{dashboardData.weeklyGoal?.target || 0}h</div>
                      <div className="text-sm text-muted-foreground">Weekly Goal</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 progress-bar"
                      style={{
                        '--progress-width': `${Math.min(100, ((dashboardData.weeklyGoal?.completed || 0) / (dashboardData.weeklyGoal?.target || 1)) * 100)}%`
                      } as React.CSSProperties}
                    />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round(((dashboardData.weeklyGoal?.completed || 0) / (dashboardData.weeklyGoal?.target || 1)) * 100)}% of weekly goal completed
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Gallery</CardTitle>
              <CardDescription>
                Your earned badges and progress milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements && achievements.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`p-4 border rounded-lg ${
                        achievement.earned ? 'bg-muted border-primary' : 'opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-gray-200'
                        }`}>
                          {achievement.iconType === 'streak' && '🔥'}
                          {achievement.iconType === 'score' && '⭐'}
                          {achievement.iconType === 'completion' && '🎯'}
                          {achievement.iconType === 'speed' && '⚡'}
                          {achievement.iconType === 'consistency' && '📈'}
                        </div>
                        <div>
                          <div className="font-semibold">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground">{achievement.points} pts</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && achievement.earnedAt && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Earned {new Date(achievement.earnedAt * 1000).toLocaleDateString()}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Loading achievements...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Leaderboard</CardTitle>
              <CardDescription>
                See how you compare with other students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((student, index) => (
                    <div key={student.userId} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' : 'bg-muted'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold">{student.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          Level {student.level} • {student.totalPoints} points
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{student.avgScore}%</div>
                        <div className="text-sm text-muted-foreground">
                          {student.currentStreak} day streak
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Loading leaderboard...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}