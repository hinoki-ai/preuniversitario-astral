import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getUser, calculateLevel, getWeekStart, calculateQuizPoints, requireTeacherOrAdmin } from './shared';

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    let stats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    const now = Math.floor(Date.now() / 1000);
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) * (1000 * 60 * 60 * 24) / 1000; // Start of today in seconds

    if (!stats) {
      // Initialize default values for new user
      const defaultStats = {
        userId: user._id,
        currentStreak: 0,
        longestStreak: 0,
        totalQuizzes: 0,
        avgScore: 0,
        weakSubjects: [],
        strongSubjects: [],
        lastActiveDate: today,
        
        // Gamification fields - using esenciaArcana as unified currency
        level: 1,
        experiencePoints: 0,
        pointsToNextLevel: 100,
        achievements: [],
        weeklyGoals: {
          quizzesTarget: 5,
          quizzesCompleted: 0,
          studyTimeTarget: 300, // 5 hours
          studyTimeCompleted: 0,
          weekStart: getWeekStart(now),
        },
        
        updatedAt: now,
      };

      // Return the default values for display
      const todayStreak = await checkTodayActivity(ctx, user._id);
      const weekStart = getWeekStart(now);
      const weeklyQuizzes = await ctx.db
        .query('attempts')
        .withIndex('byUser', (q: any) => q.eq('userId', user._id))
        .collect()
        .then(attempts => attempts.filter(a => a.completedAt >= weekStart).length);

      return {
        ...defaultStats,
        weeklyGoals: {
          ...defaultStats.weeklyGoals,
          quizzesCompleted: weeklyQuizzes,
        },
        recentPerformance: [],
        todayActive: todayStreak,
      };
    }

    // Get recent attempts for current performance
    const recentAttempts = await ctx.db
      .query('attempts')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .order('desc')
      .take(10);

    const todayStreak = await checkTodayActivity(ctx, user._id);
    
    // Calculate weekly goal progress - OPTIMIZED with new index
    const weekStart = getWeekStart(now);
    const weeklyQuizzes = await ctx.db
      .query('attempts')
      .withIndex('byUserCompletedAt', q => q.eq('userId', user._id).gte('completedAt', weekStart))
      .collect()
      .then(attempts => attempts.length);

    // Use esenciaArcana as the unified currency field
    const gamificationFields = {
      esenciaArcana: (stats as any).esenciaArcana || 0, // Primary currency
      level: (stats as any).level || 1,
      experiencePoints: (stats as any).experiencePoints || 0,
      pointsToNextLevel: (stats as any).pointsToNextLevel || 100,
      achievements: (stats as any).achievements || [],
      weeklyGoals: (stats as any).weeklyGoals || {
        quizzesTarget: 5,
        quizzesCompleted: weeklyQuizzes,
        studyTimeTarget: 300,
        studyTimeCompleted: 0,
        weekStart,
      },
    };
    
    return {
      ...stats,
      ...gamificationFields,
      weeklyGoals: {
        ...gamificationFields.weeklyGoals,
        quizzesCompleted: weeklyQuizzes,
      },
      recentPerformance: recentAttempts.map(a => ({
        score: a.score,
        completedAt: a.completedAt,
        timeTaken: a.timeTakenSec,
      })),
      todayActive: todayStreak,
    };
  },
});

async function checkTodayActivity(ctx: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const todayStart = Math.floor(new Date(today + 'T00:00:00Z').getTime() / 1000);
  const todayEnd = todayStart + 86400;

  const todayEvents = await ctx.db
    .query('progressEvents')
    .withIndex('byUserCreatedAt', (q: any) => 
      q.eq('userId', userId).gte('createdAt', todayStart).lt('createdAt', todayEnd)
    )
    .collect();

  return todayEvents.length > 0;
}

export const updateUserStats = mutation({
  args: { 
    quizScore: v.optional(v.number()),
    subject: v.optional(v.string()),
    studyTimeMinutes: v.optional(v.number()),
  },
  handler: async (ctx, { quizScore, subject, studyTimeMinutes }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) * (1000 * 60 * 60 * 24) / 1000; // Start of today in seconds
    
    let stats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!stats) {
      // Create initial stats with gamification
      const initialPoints = quizScore !== undefined ? calculateQuizPoints(quizScore) : 0;
      const statsId = await ctx.db.insert('userStats', {
        userId: user._id,
        currentStreak: 1,
        longestStreak: 1,
        totalQuizzes: quizScore !== undefined ? 1 : 0,
        avgScore: quizScore ?? 0,
        weakSubjects: quizScore !== undefined && quizScore < 0.6 && subject ? [subject] : [],
        strongSubjects: quizScore !== undefined && quizScore > 0.8 && subject ? [subject] : [],
        lastActiveDate: today,

        // UNIFIED CURRENCY: Esencia Arcana
        esenciaArcana: initialPoints,

        // Gamification fields
        level: 1,
        experiencePoints: initialPoints,
        pointsToNextLevel: 100 - initialPoints,
        achievements: [],
        weeklyGoals: {
          quizzesTarget: 5,
          quizzesCompleted: quizScore !== undefined ? 1 : 0,
          studyTimeTarget: 300,
          studyTimeCompleted: studyTimeMinutes || 0,
          weekStart: getWeekStart(now),
        },

        // Learning analytics
        learningMetrics: {
          conceptsMastered: 0,
          conceptsRetained: 0,
          averageImprovement: 0,
          difficultyPreference: 'adaptive',
          optimalStudyDuration: 25,
          peakPerformanceHour: undefined,
        },

        // Spaced repetition system
        spacedRepetition: {
          totalCards: 0,
          dueCards: 0,
          masteredCards: 0,
          streakDays: 0,
          nextReviewDate: now,
          retentionRate: 0,
        },

        updatedAt: now,
      });
      
      // Check for initial achievements
      if (quizScore !== undefined) {
        await checkAndAwardAchievements(ctx, user._id, {
          totalQuizzes: 1,
          currentStreak: 1,
          avgScore: quizScore,
        });
      }
      
      return statsId;
    }

    // Ensure gamification fields exist for legacy users
    const currentPoints = stats.esenciaArcana || 0;
    const currentLevel = stats.level || 1;
    const currentXP = stats.experiencePoints || 0;

    // Update streak
    let newStreak = stats.currentStreak;
    const yesterday = today - (24 * 60 * 60); // Yesterday's timestamp

    if (stats.lastActiveDate >= yesterday && stats.lastActiveDate < today) {
      newStreak = stats.currentStreak + 1;
    } else if (stats.lastActiveDate < yesterday) {
      newStreak = 1; // Reset streak
    }

    // Calculate points earned this session
    let pointsEarned = 0;
    if (quizScore !== undefined) {
      pointsEarned += calculateQuizPoints(quizScore);
    }
    if (studyTimeMinutes) {
      pointsEarned += Math.floor(studyTimeMinutes / 10); // 1 point per 10 minutes
    }
    if (newStreak > stats.currentStreak) {
      pointsEarned += 5; // Streak bonus
    }

    const newEsenciaPoints = currentPoints + pointsEarned;
    const newXP = currentXP + pointsEarned;
    
    // Calculate level progression
    const { level: newLevel, pointsToNext } = calculateLevel(newXP);

    // Update quiz stats if provided
    let newTotalQuizzes = stats.totalQuizzes;
    let newAvgScore = stats.avgScore;
    if (quizScore !== undefined) {
      newTotalQuizzes += 1;
      newAvgScore = (stats.avgScore * stats.totalQuizzes + quizScore) / newTotalQuizzes;
    }

    // Update subject performance
    let weakSubjects = [...stats.weakSubjects];
    let strongSubjects = [...stats.strongSubjects];
    if (subject && quizScore !== undefined) {
      if (quizScore < 0.6 && !weakSubjects.includes(subject)) {
        weakSubjects.push(subject);
        strongSubjects = strongSubjects.filter(s => s !== subject);
      } else if (quizScore > 0.8 && !strongSubjects.includes(subject)) {
        strongSubjects.push(subject);
        weakSubjects = weakSubjects.filter(s => s !== subject);
      }
    }

    // Update weekly goals
    const weekStart = getWeekStart(now);
    const isNewWeek = !stats.weeklyGoals || stats.weeklyGoals.weekStart < weekStart;
    const weeklyGoals = isNewWeek ? {
      quizzesTarget: 5,
      quizzesCompleted: quizScore !== undefined ? 1 : 0,
      studyTimeTarget: 300,
      studyTimeCompleted: studyTimeMinutes || 0,
      weekStart,
    } : {
      ...stats.weeklyGoals,
      quizzesCompleted: stats.weeklyGoals.quizzesCompleted + (quizScore !== undefined ? 1 : 0),
      studyTimeCompleted: stats.weeklyGoals.studyTimeCompleted + (studyTimeMinutes || 0),
    };

    await ctx.db.patch(stats._id, {
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      totalQuizzes: newTotalQuizzes,
      avgScore: newAvgScore,
      weakSubjects,
      strongSubjects,
      lastActiveDate: today,

      // Gamification updates - Unified currency system
      esenciaArcana: newXP, // Primary currency field (same as experience points for leveling)
      level: newLevel,
      experiencePoints: newXP, // Used for level calculations
      pointsToNextLevel: pointsToNext,
      weeklyGoals,

      updatedAt: now,
    });

    // Check for new achievements
    await checkAndAwardAchievements(ctx, user._id, {
      totalQuizzes: newTotalQuizzes,
      currentStreak: newStreak,
      avgScore: newAvgScore,
      level: newLevel,
      esenciaArcana: newEsenciaPoints,
    });

    return stats._id;
  },
});

export const getRecommendations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    const stats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!stats) {
      return {
        nextAction: 'Take your first PAES practice test',
        reason: 'Get started with your PAES preparation',
        priority: 'high'
      };
    }

    // Get available quizzes
    const quizzes = await ctx.db
      .query('quizzes')
      .withIndex('byType', q => q.eq('type', 'paes'))
      .collect();

    // Get user's attempts to see what they haven't tried
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .collect();

    const attemptedQuizIds = new Set(attempts.map(a => a.quizId));
    const unattemptedQuizzes = quizzes.filter(q => !attemptedQuizIds.has(q._id));

    // Recommendations based on performance
    if (stats.weakSubjects.length > 0) {
      const weakSubject = stats.weakSubjects[0];
      const relevantQuiz = unattemptedQuizzes.find(q => 
        q.subject?.toLowerCase().includes(weakSubject.toLowerCase())
      );
      
      if (relevantQuiz) {
        return {
          nextAction: `Practice ${relevantQuiz.subject} - ${relevantQuiz.title}`,
          reason: `Strengthen your ${weakSubject} skills`,
          priority: 'high',
          quizId: relevantQuiz._id,
        };
      }
    }

    if (stats.currentStreak === 0) {
      return {
        nextAction: 'Rebuild your study streak',
        reason: 'Consistency is key for PAES success',
        priority: 'medium'
      };
    }

    if (unattemptedQuizzes.length > 0) {
      const nextQuiz = unattemptedQuizzes[0];
      return {
        nextAction: `Try ${nextQuiz.subject} - ${nextQuiz.title}`,
        reason: 'Expand your practice across all subjects',
        priority: 'medium',
        quizId: nextQuiz._id,
      };
    }

    return {
      nextAction: 'Review your weakest areas',
      reason: 'Focus on continuous improvement',
      priority: 'low'
    };
  },
});

// Get leaderboard data - FIXED N+1 Query Issue & Added Role Verification
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    // Only teachers and admins can view leaderboard
    await requireTeacherOrAdmin(ctx);
    const allStats = await ctx.db
      .query('userStats')
      .withIndex('byEsenciaArcana')
      .order('desc')
      .take(limit);

    // Batch fetch all users in a single query to eliminate N+1 problem
    const userIds = allStats.map(stats => stats.userId);
    const users = await ctx.db
      .query('users')
      .filter(q => q.or(...userIds.map(id => q.eq(q.field('_id'), id))))
      .collect();

    // Create user lookup map for O(1) access
    const userMap = new Map(users.map(user => [user._id, user]));

    const leaderboard = allStats.map((stats) => {
      const user = userMap.get(stats.userId);
      return {
        userId: stats.userId,
        userName: user?.name || 'Anonymous',
        level: stats.level || 1,
        esenciaArcana: stats.esenciaArcana || 0,
        currentStreak: stats.currentStreak || 0,
        avgScore: Math.round((stats.avgScore || 0) * 100),
        achievements: stats.achievements?.length || 0,
      };
    });

    return leaderboard;
  },
});

// Get user achievements
export const getUserAchievements = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const stats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!stats) return [];

    const achievements = stats.achievements || [];
    const availableAchievements = getAllPossibleAchievements();
    
    return availableAchievements.map(achievement => ({
      ...achievement,
      earned: achievements.some(a => a.id === achievement.id),
      earnedAt: achievements.find(a => a.id === achievement.id)?.earnedAt,
      esencia: achievements.find(a => a.id === achievement.id)?.esencia || achievement.esencia,
    }));
  },
});

// Helper functions moved to shared.ts

function getAllPossibleAchievements() {
  return [
    // === STREAK ACHIEVEMENTS (CHAIN) ===
    { id: 'first_streak', title: '🔥 Getting Started', description: 'Study for 3 days in a row', iconType: 'streak', esencia: 25, category: 'streak', tier: 'bronze', prerequisites: [] },
    { id: 'week_streak', title: '🔥 Dedicated Student', description: 'Study for 7 days in a row', iconType: 'streak', esencia: 50, category: 'streak', tier: 'silver', prerequisites: ['first_streak'] },
    { id: 'month_streak', title: '🔥 Consistency Master', description: 'Study for 30 days in a row', iconType: 'streak', esencia: 200, category: 'streak', tier: 'gold', prerequisites: ['week_streak'] },
    { id: 'legend_streak', title: '🔥 Legendary Scholar', description: 'Study for 100 days in a row', iconType: 'streak', esencia: 500, category: 'streak', tier: 'legendary', prerequisites: ['month_streak'] },
    { id: 'comeback_kid', title: '💪 Comeback Kid', description: 'Rebuild a 7-day streak after breaking one', iconType: 'streak', esencia: 75, category: 'streak', tier: 'silver', prerequisites: [] },

    // === SCORE ACHIEVEMENTS (PERFORMANCE) ===
    { id: 'first_perfect', title: '⭐ Perfect Score!', description: 'Score 100% on a quiz', iconType: 'score', esencia: 75, category: 'performance', tier: 'silver', prerequisites: [] },
    { id: 'perfectionist', title: '⭐ Perfectionist', description: 'Score 100% on 5 different quizzes', iconType: 'score', esencia: 150, category: 'performance', tier: 'gold', prerequisites: ['first_perfect'] },
    { id: 'high_achiever', title: '⭐ High Achiever', description: 'Maintain 80%+ average for 10 quizzes', iconType: 'score', esencia: 100, category: 'performance', tier: 'silver', prerequisites: [] },
    { id: 'elite_performer', title: '⭐ Elite Performer', description: 'Maintain 90%+ average for 25 quizzes', iconType: 'score', esencia: 250, category: 'performance', tier: 'gold', prerequisites: ['high_achiever'] },
    { id: 'paes_master', title: '👑 PAES Master', description: 'Score 90%+ on 5 different PAES subjects', iconType: 'score', esencia: 300, category: 'performance', tier: 'legendary', prerequisites: ['elite_performer'] },

    // === COMPLETION ACHIEVEMENTS (PERSISTENCE) ===
    { id: 'first_quiz', title: '🎯 First Steps', description: 'Complete your first practice quiz', iconType: 'completion', esencia: 10, category: 'persistence', tier: 'bronze', prerequisites: [] },
    { id: 'rookie_scholar', title: '🎯 Rookie Scholar', description: 'Complete 10 practice quizzes', iconType: 'completion', esencia: 50, category: 'persistence', tier: 'bronze', prerequisites: ['first_quiz'] },
    { id: 'quiz_machine', title: '🎯 Quiz Machine', description: 'Complete 50 practice quizzes', iconType: 'completion', esencia: 125, category: 'persistence', tier: 'silver', prerequisites: ['rookie_scholar'] },
    { id: 'century_club', title: '🎯 Century Club', description: 'Complete 100 practice quizzes', iconType: 'completion', esencia: 250, category: 'persistence', tier: 'gold', prerequisites: ['quiz_machine'] },
    { id: 'quiz_legend', title: '🎯 Quiz Legend', description: 'Complete 500 practice quizzes', iconType: 'completion', esencia: 750, category: 'persistence', tier: 'legendary', prerequisites: ['century_club'] },
    { id: 'daily_grinder', title: '⚡ Daily Grinder', description: 'Complete at least 3 quizzes in a day', iconType: 'completion', esencia: 60, category: 'persistence', tier: 'bronze', prerequisites: [] },

    // === SPEED ACHIEVEMENTS (EFFICIENCY) ===
    { id: 'speed_demon', title: '⚡ Speed Demon', description: 'Complete a quiz in under 30 seconds', iconType: 'speed', esencia: 40, category: 'efficiency', tier: 'bronze', prerequisites: [] },
    { id: 'efficient_learner', title: '⚡ Efficient Learner', description: 'Score 90%+ in under 2 minutes', iconType: 'speed', esencia: 80, category: 'efficiency', tier: 'silver', prerequisites: ['speed_demon'] },
    { id: 'lightning_scholar', title: '⚡ Lightning Scholar', description: 'Score 95%+ in under 1 minute', iconType: 'speed', esencia: 150, category: 'efficiency', tier: 'gold', prerequisites: ['efficient_learner'] },
    { id: 'time_master', title: '⚡ Time Master', description: 'Complete 10 quizzes with perfect speed and accuracy', iconType: 'speed', esencia: 200, category: 'efficiency', tier: 'legendary', prerequisites: ['lightning_scholar'] },

    // === SUBJECT MASTERY ACHIEVEMENTS ===
    { id: 'math_novice', title: '📐 Math Novice', description: 'Score 80%+ on 5 math quizzes', iconType: 'mastery', esencia: 75, category: 'mastery', tier: 'bronze', subject: 'Matemáticas', prerequisites: [] },
    { id: 'math_expert', title: '📐 Math Expert', description: 'Score 90%+ on 15 math quizzes', iconType: 'mastery', esencia: 150, category: 'mastery', tier: 'gold', subject: 'Matemáticas', prerequisites: ['math_novice'] },
    { id: 'science_novice', title: '🔬 Science Novice', description: 'Score 80%+ on 5 science quizzes', iconType: 'mastery', esencia: 75, category: 'mastery', tier: 'bronze', subject: 'Ciencias', prerequisites: [] },
    { id: 'science_expert', title: '🔬 Science Expert', description: 'Score 90%+ on 15 science quizzes', iconType: 'mastery', esencia: 150, category: 'mastery', tier: 'gold', subject: 'Ciencias', prerequisites: ['science_novice'] },
    { id: 'language_novice', title: '📚 Language Novice', description: 'Score 80%+ on 5 language quizzes', iconType: 'mastery', esencia: 75, category: 'mastery', tier: 'bronze', subject: 'Lenguaje', prerequisites: [] },
    { id: 'language_expert', title: '📚 Language Expert', description: 'Score 90%+ on 15 language quizzes', iconType: 'mastery', esencia: 150, category: 'mastery', tier: 'gold', subject: 'Lenguaje', prerequisites: ['language_novice'] },
    { id: 'polymath', title: '🎓 Polymath', description: 'Achieve expert level in all 3 main subjects', iconType: 'mastery', esencia: 500, category: 'mastery', tier: 'legendary', prerequisites: ['math_expert', 'science_expert', 'language_expert'] },

    // === CONSISTENCY ACHIEVEMENTS (DISCIPLINE) ===
    { id: 'reliable_student', title: '📈 Reliable Student', description: 'Study every day for a week', iconType: 'consistency', esencia: 75, category: 'discipline', tier: 'silver', prerequisites: [] },
    { id: 'disciplined_scholar', title: '📈 Disciplined Scholar', description: 'Study every day for a month', iconType: 'consistency', esencia: 200, category: 'discipline', tier: 'gold', prerequisites: ['reliable_student'] },
    { id: 'subject_specialist', title: '📈 Subject Specialist', description: 'Score 85%+ in the same subject 10 times', iconType: 'consistency', esencia: 100, category: 'discipline', tier: 'silver', prerequisites: [] },
    { id: 'improvement_champion', title: '📈 Improvement Champion', description: 'Show consistent improvement over 2 weeks', iconType: 'consistency', esencia: 125, category: 'discipline', tier: 'gold', prerequisites: [] },
    { id: 'never_give_up', title: '💪 Never Give Up', description: 'Complete 5 quizzes after scoring below 50%', iconType: 'consistency', esencia: 100, category: 'discipline', tier: 'gold', prerequisites: [] },

    // === MILESTONE ACHIEVEMENTS (SPECIAL) ===
    { id: 'level_5', title: '🌟 Rising Star', description: 'Reach Level 5', iconType: 'milestone', esencia: 100, category: 'milestone', tier: 'bronze', prerequisites: [] },
    { id: 'level_10', title: '🌟 Dedicated Learner', description: 'Reach Level 10', iconType: 'milestone', esencia: 200, category: 'milestone', tier: 'silver', prerequisites: ['level_5'] },
    { id: 'level_25', title: '🌟 Academic Elite', description: 'Reach Level 25', iconType: 'milestone', esencia: 500, category: 'milestone', tier: 'gold', prerequisites: ['level_10'] },
    { id: 'level_50', title: '🌟 Scholar Supreme', description: 'Reach Level 50', iconType: 'milestone', esencia: 1000, category: 'milestone', tier: 'legendary', prerequisites: ['level_25'] },

    // === SEASONAL/SPECIAL ACHIEVEMENTS ===
    { id: 'weekend_warrior', title: '🛡️ Weekend Warrior', description: 'Study every weekend for a month', iconType: 'seasonal', esencia: 125, category: 'seasonal', tier: 'silver', prerequisites: [] },
    { id: 'early_bird', title: '🌅 Early Bird', description: 'Complete 10 quizzes before 8 AM', iconType: 'seasonal', esencia: 100, category: 'seasonal', tier: 'silver', prerequisites: [] },
    { id: 'night_owl', title: '🦉 Night Owl', description: 'Complete 10 quizzes after 10 PM', iconType: 'seasonal', esencia: 100, category: 'seasonal', tier: 'silver', prerequisites: [] },
  ];
}

async function checkAndAwardAchievements(ctx: any, userId: any, stats: {
  totalQuizzes: number;
  currentStreak: number;
  avgScore: number;
  level?: number;
  esenciaArcana?: number;
}) {
  const userStats = await ctx.db
    .query('userStats')
    .withIndex('byUser', (q: any) => q.eq('userId', userId))
    .unique();

  if (!userStats) return;

  const currentAchievements = userStats.achievements || [];
  const earnedAchievementIds = new Set(currentAchievements.map((a: any) => a.id));
  const now = Math.floor(Date.now() / 1000);
  
  const newAchievements = [];

  // Check streak achievements
  if (stats.currentStreak >= 3 && !earnedAchievementIds.has('first_streak')) {
    newAchievements.push({
      id: 'first_streak',
      title: 'Getting Started',
      description: 'Study for 3 days in a row',
      iconType: 'consistency',
      earnedAt: now,
      esencia: 25,
      difficulty: 'escudero',
    });
  }
  
  if (stats.currentStreak >= 7 && !earnedAchievementIds.has('week_streak')) {
    newAchievements.push({
      id: 'week_streak',
      title: 'Dedicated Student',
      description: 'Study for 7 days in a row',
      iconType: 'consistency',
      earnedAt: now,
      esencia: 50,
      difficulty: 'guerrero',
    });
  }

  if (stats.currentStreak >= 30 && !earnedAchievementIds.has('month_streak')) {
    newAchievements.push({
      id: 'month_streak',
      title: 'Consistency Master',
      description: 'Study for 30 days in a row',
      iconType: 'consistency',
      earnedAt: now,
      esencia: 200,
      difficulty: 'paladín',
    });
  }

  // Check completion achievements
  if (stats.totalQuizzes >= 1 && !earnedAchievementIds.has('first_quiz')) {
    newAchievements.push({
      id: 'first_quiz',
      title: 'First Steps',
      description: 'Complete your first practice quiz',
      iconType: 'mastery',
      earnedAt: now,
      esencia: 10,
      difficulty: 'escudero',
    });
  }

  if (stats.totalQuizzes >= 50 && !earnedAchievementIds.has('quiz_machine')) {
    newAchievements.push({
      id: 'quiz_machine',
      title: 'Quiz Machine',
      description: 'Complete 50 practice quizzes',
      iconType: 'mastery',
      earnedAt: now,
      esencia: 125,
      difficulty: 'guerrero',
    });
  }

  if (stats.totalQuizzes >= 100 && !earnedAchievementIds.has('century_club')) {
    newAchievements.push({
      id: 'century_club',
      title: 'Century Club',
      description: 'Complete 100 practice quizzes',
      iconType: 'mastery',
      earnedAt: now,
      esencia: 250,
      difficulty: 'paladín',
    });
  }

  // Check score achievements
  if (stats.avgScore >= 0.8 && stats.totalQuizzes >= 10 && !earnedAchievementIds.has('high_achiever')) {
    newAchievements.push({
      id: 'high_achiever',
      title: 'High Achiever',
      description: 'Maintain 80%+ average for 10 quizzes',
      iconType: 'improvement',
      earnedAt: now,
      esencia: 100,
      difficulty: 'paladín',
    });
  }

  if (newAchievements.length > 0) {
    const updatedAchievements = [...currentAchievements, ...newAchievements];
    const pointsEarned = newAchievements.reduce((sum, achievement) => sum + achievement.esencia, 0);
    
    await ctx.db.patch(userStats._id, {
      achievements: updatedAchievements,
      esenciaArcana: (userStats.esenciaArcana || 0) + pointsEarned,
      experiencePoints: (userStats.experiencePoints || 0) + pointsEarned,
      updatedAt: now,
    });

    // Create progress events for new achievements
    for (const achievement of newAchievements) {
      await ctx.db.insert('progressEvents', {
        userId,
        subject: 'Achievement',
        kind: 'achievement_earned',
        value: achievement.esencia,
        createdAt: now,
      });
    }
  }
}

export const saveDiagnosticResults = mutation({
  args: {
    results: v.array(v.object({
      questionId: v.string(),
      subject: v.string(),
      correct: v.boolean(),
      difficulty: v.string(),
      timeSpent: v.number(),
    })),
    subjectScores: v.any(), // Record<string, { correct: number; total: number }>
    overallScore: v.number(),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);

    // Get or create user stats
    let userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userStats) {
      // Initialize with default values
      const userStatsId = await ctx.db.insert('userStats', {
        userId: user._id,
        currentStreak: 0,
        longestStreak: 0,
        totalQuizzes: 0,
        avgScore: 0,
        weakSubjects: [],
        strongSubjects: [],
        lastActiveDate: now,

        // UNIFIED CURRENCY: Esencia Arcana
        esenciaArcana: 0,
        level: 1,
        experiencePoints: 0,
        pointsToNextLevel: 100,
        achievements: [],
        weeklyGoals: {
          quizzesTarget: 5,
          quizzesCompleted: 0,
          studyTimeTarget: 300,
          studyTimeCompleted: 0,
          weekStart: getWeekStart(now),
        },

        // Learning analytics
        learningMetrics: {
          conceptsMastered: 0,
          conceptsRetained: 0,
          averageImprovement: 0,
          difficultyPreference: 'adaptive',
          optimalStudyDuration: 25,
          peakPerformanceHour: undefined,
        },

        // Spaced repetition system
        spacedRepetition: {
          totalCards: 0,
          dueCards: 0,
          masteredCards: 0,
          streakDays: 0,
          nextReviewDate: now,
          retentionRate: 0,
        },

        updatedAt: now,
      });
      userStats = await ctx.db.get(userStatsId);
    }

    if (!userStats) {
      throw new Error('Failed to create user stats');
    }

    // Update user stats with diagnostic results
    const weakSubjects = Object.entries(args.subjectScores as Record<string, { correct: number; total: number }>)
      .filter(([_, scores]) => (scores.correct / scores.total) < 0.7)
      .map(([subject, _]) => subject);

    const strongSubjects = Object.entries(args.subjectScores as Record<string, { correct: number; total: number }>)
      .filter(([_, scores]) => (scores.correct / scores.total) >= 0.8)
      .map(([subject, _]) => subject);

    // Add diagnostic completion achievement
    const currentAchievements = userStats!.achievements || [];
    const earnedAchievementIds = new Set(currentAchievements.map(a => a.id));

    let newAchievements: any[] = [];
    if (!earnedAchievementIds.has('diagnostic_completed')) {
      newAchievements.push({
        id: 'diagnostic_completed',
        title: 'Assessment Complete',
        description: 'Complete your diagnostic assessment',
        iconType: 'mastery',
        earnedAt: now,
        esencia: 50,
        difficulty: 'escudero',
      });
    }

    await ctx.db.patch(userStats!._id, {
      weakSubjects,
      strongSubjects,
      achievements: [...currentAchievements, ...newAchievements],
      esenciaArcana: (userStats!.esenciaArcana || 0) + newAchievements.reduce((sum, a) => sum + a.esencia, 0),
      experiencePoints: (userStats!.experiencePoints || 0) + newAchievements.reduce((sum, a) => sum + a.esencia, 0),
      updatedAt: now,
    });

    // Create progress event
    await ctx.db.insert('progressEvents', {
      userId: user._id,
      subject: 'Diagnostic',
      kind: 'diagnostic_completed',
      value: Math.round(args.overallScore * 100),
      createdAt: now,
    });

    return { success: true, diagnosticScore: args.overallScore };
  },
});
