import { query, QueryCtx } from './_generated/server';
import { Id } from './_generated/dataModel';

export const metrics = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');

    const now = Math.floor(Date.now() / 1000);
    const oneDay = 24 * 3600;
    const sevenDays = 7 * oneDay;
    const thirtyDays = 30 * oneDay;
    const ninetyDays = 90 * oneDay;

    // Calculate study streak
    const streakData = await calculateStudyStreak(ctx, user._id, now);

    // Calculate weekly progress
    const weeklyData = await calculateWeeklyProgress(ctx, user._id, now);

    // Calculate performance metrics
    const performanceData = await calculatePerformanceMetrics(ctx, user._id, now);

    // Get upcoming exams (next quiz or milestone)
    const upcomingExam = await getUpcomingExam(ctx, user._id, now);

    // Get subject progress data
    const subjectProgress = await getSubjectProgress(ctx, user._id, now);

    // Get chart data for the last 90 days
    const chartData = await getChartData(ctx, user._id, now - ninetyDays, now);

    return {
      studyStreak: streakData.streak,
      streakProgress: streakData.progress,
      nextStreakMilestone: streakData.nextMilestone,
      weeklyGoal: weeklyData,
      averageGrade: performanceData.averageGrade,
      averageGradeDelta: performanceData.averageGradeDelta,
      consistencyScore: performanceData.consistencyScore,
      bestSubject: performanceData.bestSubject,
      worstSubject: performanceData.worstSubject,
      upcomingExam,
      subjectProgress,
      chartData,
    };
  },
});

async function calculatestudystreak(ctx: queryctx, userid: id<'users'>, now: number) {
  // Get all progress events from the last 60 days to calculate streak
  const sixtyDaysAgo = now - 60 * 24 * 3600;
  const events = await ctx.db
    .query('progressEvents')
    .withIndex('byUserCreatedAt', (q: any) => q.eq('userId', userId).gte('createdAt', sixtyDaysAgo))
    .collect();

  // Group events by date
  const dailyActivity = new Map<string, boolean>();
  for (const event of events) {
    const date = new Date(event.createdAt * 1000).toDateString();
    dailyActivity.set(date, true);
  }

  // Calculate current streak
  let streak = 0;
  const today = new Date(now * 1000).toDateString();
  let currentDate = new Date(today);

  // Check if user was active today or yesterday (to handle timezone issues)
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (dailyActivity.has(today) || dailyActivity.has(yesterdayStr)) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);

    while (streak < 100) { // Prevent infinite loop
      const dateStr = currentDate.toDateString();
      if (dailyActivity.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

 else {
        break;
      }
    }
  }

  // Calculate next milestone (next multiple of 7 or 21)
  const nextMilestone = streak < 7 ? 7 : streak < 21 ? 21 : Math.ceil((streak + 1) / 7) * 7;
  const progress = Math.min(100, Math.round((streak / nextMilestone) * 100));

  return { streak, progress, nextMilestone };
}

async function calculateweeklyprogress(ctx: queryctx, userid: id<'users'>, now: number) {
  // Get current week's study plan
  const weekStart = getWeekStart(now);
  const studyPlan = await ctx.db
    .query('studyPlans')
    .withIndex('byUserWeek', (q) => q.eq('userId', userId).eq('weekStart', weekStart))
    .first();
  // Get progress events for this week
  const weekEnd = weekStart + 7 * 24 * 3600;
  const events = await ctx.db
    .query('progressEvents')
    .withIndex('byUserCreatedAt', (q) =>
      q.eq('userId', userId).gte('createdAt', weekStart).lt('createdAt', weekEnd)
    )
    .collect();
  // Calculate total study time from events (assuming each event represents some study time)
  // For now, we'll count quiz completions and lesson views as study sessions
  const studySessions = events.length;
  // Default weekly target if no plan exists
  const targetHours = studyPlan ? 12 : 10; // Default to 10 hours if no plan
  const completedHours = studySessions * 0.5; // Assume 30 minutes per session

  return {
    completed: Math.min(completedHours, targetHours),
    target: targetHours,
  };
}

async function calculateperformancemetrics(ctx: queryctx, userid: id<'users'>, now: number) {
  // Get quiz attempts from the last 30 days
  const thirtyDaysAgo = now - 30 * 24 * 3600;
  const attempts = await ctx.db
    .query('attempts')
    .withIndex('byUser', (q: any) => q.eq('userId', userId))
    .collect()
    .then((attempts: any[]) => attempts.filter((a: any) => a.completedAt >= thirtyDaysAgo));

  if (attempts.length === 0) {
    return {
      averageGrade: 75,
      averageGradeDelta: 0,
      consistencyScore: 70,
      bestSubject: { name: 'General', score: 75 },
      worstSubject: { name: 'General', score: 75 },
    };
  }

  // Group by subject
  const subjectScores: Record<string, number[]> = {};
  for (const attempt of attempts) {
    const quiz = await ctx.db.get(attempt.quizId) as any;
    const subject = quiz?.subject || 'General';
    if (!subjectScores[subject]) subjectScores[subject] = [];
    subjectScores[subject].push(attempt.score * 100);
  }

  // Calculate average grade and consistency
  const allScores = attempts.map((a: any) => a.score * 100);
  const averageGrade = allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length;

  // Calculate grade delta (compare with previous period)
  const previousPeriodStart = thirtyDaysAgo - 30 * 24 * 3600;
  const previousAttempts = await ctx.db
    .query('attempts')
    .withIndex('byUser', (q: any) => q.eq('userId', userId))
    .collect()
    .then((attempts: any[]) => attempts.filter((a: any) => a.completedAt >= previousPeriodStart && a.completedAt < thirtyDaysAgo));

  const previousAverage = previousAttempts.length > 0
    ? previousAttempts.reduce((sum: number, a: any) => sum + a.score * 100, 0) / previousAttempts.length
    : averageGrade;

  const averageGradeDelta = averageGrade - previousAverage;

  // Calculate consistency (inverse of standard deviation)
  const mean = averageGrade / 100;
  const variance = allScores.reduce((sum: number, score: number) => sum + Math.pow(score / 100 - mean, 2), 0) / allScores.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, Math.min(100, 100 - stdDev * 20)); // Lower std dev = higher consistency

  // Find best and worst subjects
  const subjectAverages = Object.entries(subjectScores).map(([subject, scores]) => ({
    name: subject,
    score: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
  }));

  const bestSubject = subjectAverages.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  const worstSubject = subjectAverages.reduce((worst, current) =>
    current.score < worst.score ? current : worst
  );

  return {
    averageGrade: Math.round(averageGrade),
    averageGradeDelta: Math.round(averageGradeDelta * 10) / 10,
    consistencyScore: Math.round(consistencyScore),
    bestSubject,
    worstSubject,
  };
}

async function getupcomingexam(ctx: queryctx, userid: id<'users'>, now: number) {
  // Look for upcoming quizzes or study plan milestones
  const studyPlans = await ctx.db
    .query('studyPlans')
    .withIndex('byUserWeek', (q: any) => q.eq('userId', userId).gte('weekStart', getWeekStart(now)))
    .take(4); // Next 4 weeks

  // Find the next milestone
  let nextExam: any = null;
  for (const plan of studyPlans) {
    for (const item of plan.items) {
      if (item.limit && item.limit !== 'N/A') {
        const examDate = new Date(item.limit);
        if (examDate.getTime() / 1000 > now && (!nextExam || examDate < nextExam.date)) {
          nextExam = {
            title: item.header,
            date: examDate,
            subject: item.target,
          };
        }
      }
    }
  }

  if (!nextExam) {
    // Fallback to a default upcoming exam
    const defaultDate = new Date(now * 1000);
    defaultDate.setDate(defaultDate.getDate() + 14);
    nextExam = {
      title: 'Evaluación PAES',
      date: defaultDate,
      subject: 'Matemática',
    };
  }

  const daysUntil = Math.max(0, Math.ceil((nextExam.date.getTime() / 1000 - now) / (24 * 3600)));

  return {
    title: nextExam.title,
    date: nextExam.date.toISOString().split('T')[0],
    subject: nextExam.subject,
    daysUntil,
    preparation: 65 + Math.random() * 20, // Mock preparation percentage
  };
}

async function getsubjectprogress(ctx: queryctx, userid: id<'users'>, now: number) {
  // Get quiz attempts grouped by subject
  const attempts = await ctx.db
    .query('attempts')
    .withIndex('byUser', (q: any) => q.eq('userId', userId))
    .collect();

  const subjectData: Record<string, any> = {};

  for (const attempt of attempts) {
    const quiz = await ctx.db.get(attempt.quizId) as any;
    const subject = quiz?.subject || 'General';

    if (!subjectData[subject]) {
      subjectData[subject] = {
        scores: [],
        attempts: 0,
        recentActivity: [],
      };
    }

    subjectData[subject].scores.push(attempt.score * 100);
    subjectData[subject].attempts++;
    subjectData[subject].recentActivity.push(attempt.completedAt);
  }

  // Convert to the format expected by the DataTable
  const result = Object.entries(subjectData).map(([subject, data]) => {
    const scores = data.scores;
    const avgScore = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 75;

    // Calculate score delta (last 5 vs previous 5)
    const recentScores = scores.slice(-5);
    const olderScores = scores.slice(-10, -5);
    const recentAvg = recentScores.length > 0 ? recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length : avgScore;
    const olderAvg = olderScores.length > 0 ? olderScores.reduce((a: number, b: number) => a + b, 0) / olderScores.length : avgScore;
    const scoreDelta = recentAvg - olderAvg;

    // Calculate hours this week (mock data for now)
    const hoursThisWeek = Math.max(0, (Math.random() * 10) + 2);

    // Mock target hours
    const hoursTarget = subject.includes('Matemática') ? 10 : subject.includes('Lenguaje') ? 8 : 7;

    // Determine category
    let category = 'ELECTIVO';
    if (subject.toLowerCase().includes('matemát') || subject.toLowerCase().includes('cienc') || subject.toLowerCase().includes('biol')) {
      category = 'STEM';
    } else if (subject.toLowerCase().includes('lengu') || subject.toLowerCase().includes('hist')) {
      category = 'HUMANIDADES';
    }

    // Calculate risk level
    let risk = 'on-track';
    if (avgScore < 70) risk = 'critical';
    else if (avgScore < 80 || hoursThisWeek < hoursTarget * 0.7) risk = 'attention';

    return {
      id: subject.toLowerCase().replace(/\s+/g, '-'),
      subject,
      category,
      avgScore: Math.round(avgScore),
      scoreDelta: Math.round(scoreDelta * 10) / 10,
      hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
      hoursTarget,
      velocity: Math.round((scoreDelta / 7) * 10) / 10, // Points per week
      consistency: Math.round(80 + Math.random() * 15), // Mock consistency
      completionRate: Math.round(70 + Math.random() * 25), // Mock completion rate
      nextMilestone: `Quiz ${subject}`,
      milestoneDate: new Date(now * 1000 + (7 + Math.random() * 14) * 24 * 3600 * 1000).toISOString().split('T')[0],
      focusArea: subject,
      risk,
    };
  });

  return result;
}

async function getchartdata(ctx: queryctx, userid: id<'users'>, starttime: number, endtime: number) {
  const events = await ctx.db
    .query('progressEvents')
    .withIndex('byUserCreatedAt', (q: any) =>
      q.eq('userId', userId).gte('createdAt', starttime).lte('createdAt', endtime)
    )
    .collect();

  // Group events by date
  const dailyData: Record<string, { deepFocusMinutes: number; activeRecallMinutes: number; avgScore: number; accuracy: number; count: number }> = {};

  for (const event of events) {
    const date = new Date(event.createdAt * 1000).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { deepFocusMinutes: 0, activeRecallMinutes: 0, avgScore: 0, accuracy: 0, count: 0 };
    }

    // Mock study time distribution (in real app, this would come from actual timing data)
    dailyData[date].deepFocusMinutes += 30 + Math.random() * 60;
    dailyData[date].activeRecallMinutes += 15 + Math.random() * 30;
    if (event.kind === 'quiz_completed' && typeof event.value === 'number') {
      dailyData[date].avgScore += event.value * 100;
      dailyData[date].accuracy += event.value * 100;
      dailyData[date].count++;
    }
  }

  // Convert to array format expected by chart
  const result = [];
  const current = new Date(starttime * 1000);
  const end = new Date(endtime * 1000);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const data = dailyData[dateStr] || { deepFocusMinutes: 0, activeRecallMinutes: 0, avgScore: 75, accuracy: 70, count: 0 };

    if (data.count > 0) {
      data.avgScore = data.avgScore / data.count;
      data.accuracy = data.accuracy / data.count;
    }

    result.push({
      date: dateStr,
      deepFocusMinutes: Math.round(data.deepFocusMinutes),
      activeRecallMinutes: Math.round(data.activeRecallMinutes),
      avgScore: Math.round(data.avgScore),
      accuracy: Math.round(data.accuracy),
    });

    current.setDate(current.getDate() + 1);
  }

  return result;
}

function getWeekStart(timestamp: number): number {
  const date = new Date(timestamp * 1000);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return Math.floor(monday.getTime() / 1000);
}

export const predictiveAnalytics = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');

    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 3600;
    const ninetyDaysAgo = now - 90 * 24 * 3600;

    // Get historical performance data
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .collect();

    const recentAttempts = attempts.filter(a => a.completedAt >= thirtyDaysAgo);
    const allAttempts = attempts.filter(a => a.completedAt >= ninetyDaysAgo);

    // Calculate performance trends
    const performanceTrend = calculatePerformanceTrend(allAttempts);

    // Predict PAES score
    const predictedPaesScore = predictPaesScore(recentAttempts, performanceTrend);

    // Identify improvement opportunities
    const improvementAreas = identifyImprovementAreas(recentAttempts);

    // Calculate study time recommendations
    const studyRecommendations = calculateStudyRecommendations(recentAttempts, performanceTrend);

    // Predict timeline to target score
    const timelinePrediction = predictTimelineToTarget(predictedPaesScore, performanceTrend);

    return {
      predictedPaesScore: Math.round(predictedPaesScore),
      confidenceLevel: calculateConfidenceLevel(recentAttempts),
      performanceTrend,
      improvementAreas,
      studyRecommendations,
      timelinePrediction,
      riskFactors: identifyRiskFactors(recentAttempts, performanceTrend),
      strengths: identifyStrengths(recentAttempts),
    };
  },
});

function calculatePerformanceTrend(attempts: any[]): {
  overall: 'improving' | 'stable' | 'declining';
  bySubject: record<string, 'improving' | 'stable' | 'declining'>;
  velocity: number; // points per week
}

 {
  if (attempts.length < 5) {
    return { overall: 'stable', bySubject: {}, velocity: 0 };
  }

  // Sort by completion date
  const sortedAttempts = attempts.sort((a, b) => a.completedAt - b.completedAt);

  // Calculate moving averages
  const recentHalf = sortedAttempts.slice(-Math.ceil(sortedAttempts.length / 2));
  const earlierHalf = sortedAttempts.slice(0, Math.floor(sortedAttempts.length / 2));

  const recentAvg = recentHalf.reduce((sum, a) => sum + a.score, 0) / recentHalf.length;
  const earlierAvg = earlierHalf.reduce((sum, a) => sum + a.score, 0) / earlierHalf.length;

  let overall: 'improving' | 'stable' | 'declining' = 'stable';overall
  if (recentAvg > earlierAvg + 0.05) overall = 'improving';
  else if (recentAvg < earlierAvg - 0.05) overall = 'declining';

  // Calculate by subject
  const bySubject: Record<string, 'improving' | 'stable' | 'declining'> = {};
  const subjects = [...new Set(attempts.map(a => {
    // Try to get subject from quiz or attempt data
    return a.subject || 'General';
  }))];

  for (const subject of subjects) {
    const subjectAttempts = sortedAttempts.filter(a => (a.subject || 'General') === subject);
    if (subjectAttempts.length < 3) continue;

    const subjectRecent = subjectAttempts.slice(-Math.ceil(subjectAttempts.length / 2));
    const subjectEarlier = subjectAttempts.slice(0, Math.floor(subjectAttempts.length / 2));

    const subjectRecentAvg = subjectRecent.reduce((sum, a) => sum + a.score, 0) / subjectRecent.length;
    const subjectEarlierAvg = subjectEarlier.reduce((sum, a) => sum + a.score, 0) / subjectEarlier.length;

    if (subjectRecentAvg > subjectEarlierAvg + 0.05) bySubject[subject] = 'improving';
    else if (subjectRecentAvg < subjectEarlierAvg - 0.05) bySubject[subject] = 'declining';
    else bySubject[subject] = 'stable';
  }

  // Calculate velocity (points improvement per week)
  const timeSpanWeeks = (sortedAttempts[sortedAttempts.length - 1].completedAt - sortedAttempts[0].completedAt) / (7 * 24 * 3600);
  const totalImprovement = recentAvg - earlierAvg;
  const velocity = timeSpanWeeks > 0 ? totalImprovement / timeSpanWeeks : 0;velocitytimeSpanWeeks0totalImprovementtimeSpanWeeks

  return { overall, bySubject, velocity };
}

function predictPaesScore(recentAttempts: any[], trend: any): number {
  if (recentAttempts.length === 0) return 650; // Default baseline

  const avgScore = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length;
  const baseScore = avgScore * 1000; // Convert to PAES scale (roughly)

  // Adjust based on trend
  let adjustment = 0;
  if (trend.overall === 'improving') adjustment = trend.velocity * 50;
  else if (trend.overall === 'declining') adjustment = trend.velocity * 50;

  // Factor in attempt count (more practice = better prediction)
  const experienceFactor = Math.min(recentAttempts.length / 20, 1) * 50;

  const predictedScore = Math.max(400, Math.min(850, baseScore + adjustment + experienceFactor));

  return predictedScore;
}

function identifyImprovementAreas(attempts: any[]): Array<{
  subject: string;
  issue: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

> {
  const areas: Array<{
    subject: string;
    issue: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Group by subject
  const bySubject: Record<string, any[]> = {};
  attempts.forEach(attempt => {
    const subject = attempt.subject || 'General';
    if (!bySubject[subject]) bySubject[subject] = [];
    bySubject[subject].push(attempt);
  });

  for (const [subject, subjectAttempts] of Object.entries(bySubject)) {
    if (subjectAttempts.length < 2) continue;

    const avgScore = subjectAttempts.reduce((sum, a) => sum + a.score, 0) / subjectAttempts.length;

    if (avgScore < 0.7) {
      areas.push({
        subject,
        issue: `Puntuación baja en ${subject}`,
        recommendation: `Enfócate en repasar conceptos fundamentales de ${subject} y practica más ejercicios`,
        priority: 'high'
      });
    } else if (avgScore < 0.8) {
      areas.push({
        subject,
        issue: `Necesitas mejorar en ${subject}`,
        recommendation: `Dedica tiempo adicional a ${subject} esta semana`,
        priority: 'medium'
      });
    }
  }

  return areas.slice(0, 3); // Top 3 areas
}

function calculateStudyRecommendations(attempts: any[], trend: any): {
  dailyStudyTime: number;
  focusSubjects: string[];
  studyTechniques: string[];
}

 {
  const weakSubjects = Object.entries(trend.bySubject)
    .filter(([_, trend]) => trend === 'declining' || trend === 'stable')
    .map(([subject, _]) => subject);
  const dailyStudyTime = weakSubjects.length > 0 ? 120 : 90; // minutes

  return {
    dailyStudyTime,
    focusSubjects: weakSubjects,
    studyTechniques: trend.overall === 'improving'
      ? ['Repetición espaciada', 'Práctica activa', 'Análisis de errores']
      : ['Enfoque en fundamentos', 'Preguntas de práctica adicionales', 'Revisión de conceptos débiles']
  };
}

function predictTimelineToTarget(currentScore: number, trend: any): {
  targetScore: number;
  weeksNeeded: number;
  projectedScore: number;
}

 {
  const targetScore = 750; // Typical good PAES score
  const weeklyImprovement = trend.velocity * 100; // Convert to PAES points
  const pointsNeeded = Math.max(0, targetScore - currentScore);
  const weeksNeeded = weeklyImprovement > 0 ? Math.ceil(pointsNeeded / weeklyImprovement) : 52; // Max 1 year

  return {
    targetScore,
    weeksNeeded: Math.min(weeksNeeded, 52),
    projectedScore: Math.min(targetScore, currentScore + weeklyImprovement * 4) // 1 month projection
  };
}

function calculateConfidenceLevel(attempts: any[]): 'low' | 'medium' | 'high' {
  const count = attempts.length;
  if (count < 5) return 'low';
  if (count < 15) return 'medium';
  return 'high';
}

function identifyRiskFactors(attempts: any[], trend: any): string[] {
  const risks: string[] = [];

  if (trend.overall === 'declining') {
    risks.push('Rendimiento decreciente - necesita intervención inmediata');
  }

  if (attempts.length < 10) {
    risks.push('Muestra de datos limitada - predicciones menos confiables');
  }

  const weakSubjectsCount = Object.values(trend.bySubject).filter(t => t === 'declining').length;
  if (weakSubjectsCount > 2) {
    risks.push('Múltiples materias débiles - riesgo de sobrecarga');
  }

  return risks;
}

function identifyStrengths(attempts: any[]): string[] {
  const strengths: string[] = [];

  // This would analyze which subjects/areas the student excels in
  // For now, return mock strengths
  strengths.push('Buena comprensión lectora');
  strengths.push('Habilidades matemáticas sólidas');
  strengths.push('Consistencia en estudio regular');

  return strengths;
}