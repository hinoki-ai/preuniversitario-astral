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
  Zap,
  AlertTriangle
} from 'lucide-react';
import { PaymentGate } from '@/components/PaymentGate';

export default function AnalyticsPage() {
  const stats = useQuery(api.userStats.getUserStats);
  const userHistory = useQuery(api.mockExams.getUserMockExamHistory);
  const achievements = useQuery(api.userStats.getUserAchievements);
  const leaderboard = useQuery(api.userStats.getLeaderboard, { limit: 5 });
  const dashboardData = useQuery(api.dashboard.metrics);
  const predictiveData = useQuery(api.dashboard.predictiveAnalytics);

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Avanzados</h1>
      </div>
      
      <PaymentGate 
        feature="Analytics Avanzados"
        description="Obtén insights detallados sobre tu progreso y rendimiento académico"
        premiumFeatures={[
          "Análisis detallado por materia y competencia",
          "Predicciones de rendimiento PAES",
          "Seguimiento de tendencias de aprendizaje", 
          "Comparación con otros estudiantes",
          "Recomendaciones personalizadas de estudio",
          "Reportes exportables en PDF"
        ]}
        showPreview={true}
      >
        <AnalyticsContent stats={stats} dashboardData={dashboardData} predictiveData={null} />
      </PaymentGate>
    </div>
  );
}

function AnalyticsContent({ stats, dashboardData, predictiveData }: { stats: any, dashboardData: any, predictiveData: any }) {
  if (!stats || !dashboardData) {
    return <div className="animate-pulse p-6">Cargando análisis completos...</div>;
  }

  const subjectStats = dashboardData.subjectProgress || [];
  const chartData = dashboardData.chartData || [];

  // Calculate performance trends
  const recentScores = stats.recentPerformance?.slice(0, 10) || [];
  const averageRecentScore = recentScores.length > 0
    ? recentScores.reduce((sum: number, perf: any) => sum + perf.score, 0) / recentScores.length
    : 0;
  const performanceTrend = averageRecentScore > stats.avgScore ? 'improving' :
                          averageRecentScore < stats.avgScore ? 'declining' : 'stable'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Análisis</h1>
          <p className="text-muted-foreground mt-1">
            Análisis completo de tu progreso de preparación PAES
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="subjects">Por Asignatura</TabsTrigger>
          <TabsTrigger value="performance">Desempeño</TabsTrigger>
          <TabsTrigger value="predictive">Predictivo</TabsTrigger>
          <TabsTrigger value="achievements">Logros</TabsTrigger>
          <TabsTrigger value="leaderboard">Tablón de Héroes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
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
                  {performanceTrend === 'improving' ? '↗️ Mejorando' :
                   performanceTrend === 'declining' ? '↘️ Necesita atención' : '→ Estable'}
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
                <CardTitle className="text-sm font-medium">Consistencia de Estudio</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.consistencyScore}%</div>
                <p className="text-xs text-muted-foreground">
                  Calificación de consistencia
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    data-progress-width={`${dashboardData.consistencyScore}%`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mejor Asignatura</CardTitle>
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
                <CardTitle className="text-sm font-medium">Área de Enfoque</CardTitle>
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
          <CardTitle>Actividad de Estudio (Últimos 30 Días)</CardTitle>
          <CardDescription>
            Seguimiento diario del tiempo de estudio y rendimiento
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
              <CardTitle>Análisis de Desempeño por Asignatura</CardTitle>
              <CardDescription>
                Análisis detallado por área temática
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectStats.map((subject: any) => (
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
                        <span className="text-muted-foreground">Categoría:</span>
                        <div className="font-medium">{subject.category}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Esta Semana:</span>
                        <div className="font-medium">{subject.hoursThisWeek}h</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Consistencia:</span>
                        <div className="font-medium">{subject.consistency}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Próxima Meta:</span>
                        <div className="font-medium text-xs">{subject.nextMilestone}</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className={`h-2 rounded-full ${
                          subject.avgScore >= 80 ? 'bg-green-500' :
                          subject.avgScore >= 70 ? 'bg-blue-500' :
                          subject.avgScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        data-progress-width={`${subject.avgScore}%`}
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
                <CardTitle>Desempeño en Simulacros</CardTitle>
                <CardDescription>
                  Tus resultados recientes en simulacros
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.summary ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{dashboardData.summary.totalAttempts}</div>
                        <div className="text-sm text-muted-foreground">Intentos Totales</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{dashboardData.summary.averageScore}%</div>
                        <div className="text-sm text-muted-foreground">Puntaje Promedio</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mejor Puntaje:</span>
                        <span className="font-semibold">{dashboardData.summary.bestScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tendencia:</span>
                        <span className={`font-semibold ${
                          dashboardData.summary.improvementTrend > 0 ? 'text-green-600' :
                          dashboardData.summary.improvementTrend < 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {dashboardData.summary.improvementTrend > 0 ? '↗️' :
                           dashboardData.summary.improvementTrend < 0 ? '↘️' : '→'} 
                          {Math.abs(dashboardData.summary.improvementTrend)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aún no has completado simulacros</p>
                    <p className="text-sm">Realiza tu primer simulacro para ver datos de desempeño</p>
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
                        <div className="text-sm text-muted-foreground">Esta Semana</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{dashboardData.weeklyGoal?.target || 0}h</div>
                      <div className="text-sm text-muted-foreground">Meta Semanal</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                      data-progress-width={`${Math.min(100, ((dashboardData.weeklyGoal?.completed || 0) / (dashboardData.weeklyGoal?.target || 1)) * 100)}%`}
                    />
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round(((dashboardData.weeklyGoal?.completed || 0) / (dashboardData.weeklyGoal?.target || 1)) * 100)}% de la meta semanal completada
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <div className="grid gap-6">
            {/* Predicted PAES Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Puntaje PAES Predicho
                </CardTitle>
                <CardDescription>
                  Predicción impulsada por IA basada en tu rendimiento actual y tendencias de aprendizaje
                </CardDescription>
              </CardHeader>
              <CardContent>
                {predictiveData ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary mb-2">
                        {predictiveData.predictedPaesScore}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Puntaje PAES Predicho • Confianza: {
                          predictiveData.confidenceLevel === 'high' ? 'Alta' :
                          predictiveData.confidenceLevel === 'medium' ? 'Media' : 'Baja'
                        }
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tendencia de Desempeño:</span>
                          <Badge variant={
                            predictiveData.performanceTrend?.overall === 'improving' ? 'default' :
                            predictiveData.performanceTrend?.overall === 'declining' ? 'destructive' : 'secondary'
                          }>
                            {predictiveData.performanceTrend?.overall === 'improving' ? '↗️ Mejorando' :
                             predictiveData.performanceTrend?.overall === 'declining' ? '↘️ Declinando' : '→ Estable'}
                          </Badge>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Tiempo hasta 750+:</span>
                          <span className="font-semibold">
                            {predictiveData.timelinePrediction?.weeksNeeded || 'N/A'} semanas
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span>Proyección 1 Mes:</span>
                          <span className="font-semibold">
                            {predictiveData.timelinePrediction?.projectedScore || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Recomendaciones de Estudio:</div>
                        <div className="text-sm text-muted-foreground">
                          Tiempo de estudio diario: {predictiveData.studyRecommendations?.dailyStudyTime || 90} min
                        </div>
                        {predictiveData.studyRecommendations?.focusSubjects?.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Asignaturas de enfoque:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {predictiveData.studyRecommendations.focusSubjects.map((subject: string) => (
                                <Badge key={subject} variant="outline" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Cargando análisis predictivos...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Improvement Areas */}
            {predictiveData?.improvementAreas && predictiveData.improvementAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Áreas de Mejora
                  </CardTitle>
                  <CardDescription>
                    Áreas prioritarias que necesitan tu atención
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {predictiveData.improvementAreas.map((area: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          area.priority === 'high' ? 'bg-red-500' :
                          area.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium">{area.subject}</div>
                          <div className="text-sm text-muted-foreground">{area.issue}</div>
                          <div className="text-sm text-primary mt-1">{area.recommendation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths and Risk Factors */}
            <div className="grid gap-6 md:grid-cols-2">
              {predictiveData?.strengths && predictiveData.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Award className="w-5 h-5" />
                      Your Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {predictiveData.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {predictiveData?.riskFactors && predictiveData.riskFactors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="w-5 h-5" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {predictiveData.riskFactors.map((risk: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Galería de Logros</CardTitle>
              <CardDescription>
                  Tus logros obtenidos y hitos de progreso
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.achievements && dashboardData.achievements.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dashboardData.achievements.map((achievement: any) => (
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
                            Obtenido {new Date(achievement.earnedAt * 1000).toLocaleDateString()}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Cargando logros...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tablón de los Héroes</CardTitle>
              <CardDescription>
                Ve cómo te comparas con otros guerreros del saber
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.leaderboard && dashboardData.leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.leaderboard.map((student: any, index: number) => (
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
                          Rango {student.level} • {student.esenciaArcana} Esencia Arcana
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold">{student.avgScore}%</div>
                        <div className="text-sm text-muted-foreground">
                          {student.currentStreak} días de honor
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Cargando tablón de héroes...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}