import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

async function getuser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    const demoUser = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q: any) => q.eq('externalId', 'demo-user'))
      .unique();
    if (demoUser) return demoUser;
    return await ctx.db.insert('users', {
      name: 'Demo User',
      externalId: 'demo-user',
      role: 'student',
      plan: 'free',
    });
  }
  const user = await ctx.db
    .query('users')
    .withIndex('byExternalId', (q: any) => q.eq('externalId', identity.subject))
    .unique();
  if (!user) throw new Error('User not found');
  return user;
}

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    let stats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    const now = Math.floor(Date.now() / 1000);
    const today = new Date().toISOString().split('T')[0];

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
        
        // Gamification fields
        totalPoints: 0,
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
    
    // Calculate weekly goal progress
    const weekStart = getWeekStart(now);
    const weeklyQuizzes = await ctx.db
      .query('attempts')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .collect()
      .then(attempts => attempts.filter(a => a.completedAt >= weekStart).length);

    // Ensure backward compatibility with existing stats
    const gamificationFields = {
      totalPoints: (stats as any).totalPoints || 0,
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

async function checktodayactivity(ctx: any, userid: string) {
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
    const today = new Date().toISOString().split('T')[0];
    const now = Math.floor(Date.now() / 1000);
    
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
        
        // Gamification fields
        totalPoints: initialPoints,
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
    const currentPoints = stats.totalPoints || 0;
    const currentLevel = stats.level || 1;
    const currentXP = stats.experiencePoints || 0;

    // Update streak
    let newStreak = stats.currentStreak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (stats.lastActiveDate === yesterdayStr) {
      newStreak = stats.currentStreak + 1;
    } else if (stats.lastActiveDate !== today) {
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

    const newTotalPoints = currentPoints + pointsEarned;
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
      
      // Gamification updates
      totalPoints: newTotalPoints,
      level: newLevel,
      experiencePoints: newXP,
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
      totalPoints: newTotalPoints,
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

// Get leaderboard data
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const allStats = await ctx.db
      .query('userStats')
      .withIndex('byTotalPoints')
      .order('desc')
      .take(limit);

    const leaderboard = await Promise.all(
      allStats.map(async (stats) => {
        const user = await ctx.db.get(stats.userId);
        return {
          userId: stats.userId,
          userName: user?.name || 'Anonymous',
          level: stats.level || 1,
          totalPoints: stats.totalPoints || 0,
          currentStreak: stats.currentStreak || 0,
          avgScore: Math.round((stats.avgScore || 0) * 100),
          achievements: stats.achievements?.length || 0,
        };
      })
    );

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
      points: achievements.find(a => a.id === achievement.id)?.points || achievement.points,
    }));
  },
});

// Helper functions
function getWeekStart(timestamp: number): number {
  const date = new Date(timestamp * 1000);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return Math.floor(monday.getTime() / 1000);
}

function calculateQuizPoints(score: number): number {
  if (score >= 0.9) return 50; // Perfect or near-perfect
  if (score >= 0.8) return 40; // Excellent
  if (score >= 0.7) return 30; // Good
  if (score >= 0.6) return 20; // Average
  if (score >= 0.5) return 10; // Below average
  return 5; // Participation points
}

function calculateLevel(experiencePoints: number): { level: number; pointsToNext: number }

 {
  // Level progression: 100, 200, 400, 800, 1600, etc.
  let level = 1;Levelprogression
  let pointsNeededForCurrentLevel = 0;
  let pointsNeededForNextLevel = 100;
  
  while (experiencePoints >= pointsNeededForNextLevel) {
    level++;
    pointsNeededForCurrentLevel = pointsNeededForNextLevel;
    pointsNeededForNextLevel = pointsNeededForCurrentLevel + (100 * Math.pow(2, level - 2));
  }
  
  const pointsToNext = pointsNeededForNextLevel - experiencePoints;
  
  return { level, pointsToNext };
}

function getAllPossibleAchievements() {
  return [
    // === STREAK ACHIEVEMENTS (CHAIN) ===
    { id: 'first_streak', title: '🔥 Getting Started', description: 'Study for 3 days in a row', iconType: 'streak', points: 25, category: 'streak', tier: 'bronze', prerequisites: [] },
    { id: 'week_streak', title: '🔥 Dedicated Student', description: 'Study for 7 days in a row', iconType: 'streak', points: 50, category: 'streak', tier: 'silver', prerequisites: ['first_streak'] },
    { id: 'month_streak', title: '🔥 Consistency Master', description: 'Study for 30 days in a row', iconType: 'streak', points: 200, category: 'streak', tier: 'gold', prerequisites: ['week_streak'] },
    { id: 'legend_streak', title: '🔥 Legendary Scholar', description: 'Study for 100 days in a row', iconType: 'streak', points: 500, category: 'streak', tier: 'legendary', prerequisites: ['month_streak'] },
    { id: 'comeback_kid', title: '💪 Comeback Kid', description: 'Rebuild a 7-day streak after breaking one', iconType: 'streak', points: 75, category: 'streak', tier: 'silver', prerequisites: [] },

    // === SCORE ACHIEVEMENTS (PERFORMANCE) ===
    { id: 'first_perfect', title: '⭐ Perfect Score!', description: 'Score 100% on a quiz', iconType: 'score', points: 75, category: 'performance', tier: 'silver', prerequisites: [] },
    { id: 'perfectionist', title: '⭐ Perfectionist', description: 'Score 100% on 5 different quizzes', iconType: 'score', points: 150, category: 'performance', tier: 'gold', prerequisites: ['first_perfect'] },
    { id: 'high_achiever', title: '⭐ High Achiever', description: 'Maintain 80%+ average for 10 quizzes', iconType: 'score', points: 100, category: 'performance', tier: 'silver', prerequisites: [] },
    { id: 'elite_performer', title: '⭐ Elite Performer', description: 'Maintain 90%+ average for 25 quizzes', iconType: 'score', points: 250, category: 'performance', tier: 'gold', prerequisites: ['high_achiever'] },
    { id: 'paes_master', title: '👑 PAES Master', description: 'Score 90%+ on 5 different PAES subjects', iconType: 'score', points: 300, category: 'performance', tier: 'legendary', prerequisites: ['elite_performer'] },
    
    // === COMPLETION ACHIEVEMENTS (PERSISTENCE) ===
    { id: 'first_quiz', title: '🎯 First Steps', description: 'Complete your first practice quiz', iconType: 'completion', points: 10, category: 'persistence', tier: 'bronze', prerequisites: [] },
    { id: 'rookie_scholar', title: '🎯 Rookie Scholar', description: 'Complete 10 practice quizzes', iconType: 'completion', points: 50, category: 'persistence', tier: 'bronze', prerequisites: ['first_quiz'] },
    { id: 'quiz_machine', title: '🎯 Quiz Machine', description: 'Complete 50 practice quizzes', iconType: 'completion', points: 125, category: 'persistence', tier: 'silver', prerequisites: ['rookie_scholar'] },
    { id: 'century_club', title: '🎯 Century Club', description: 'Complete 100 practice quizzes', iconType: 'completion', points: 250, category: 'persistence', tier: 'gold', prerequisites: ['quiz_machine'] },
    { id: 'quiz_legend', title: '🎯 Quiz Legend', description: 'Complete 500 practice quizzes', iconType: 'completion', points: 750, category: 'persistence', tier: 'legendary', prerequisites: ['century_club'] },
    { id: 'daily_grinder', title: '⚡ Daily Grinder', description: 'Complete at least 3 quizzes in a day', iconType: 'completion', points: 60, category: 'persistence', tier: 'bronze', prerequisites: [] },

    // === SPEED ACHIEVEMENTS (EFFICIENCY) ===
    { id: 'speed_demon', title: '⚡ Speed Demon', description: 'Complete a quiz in under 30 seconds', iconType: 'speed', points: 40, category: 'efficiency', tier: 'bronze', prerequisites: [] },
    { id: 'efficient_learner', title: '⚡ Efficient Learner', description: 'Score 90%+ in under 2 minutes', iconType: 'speed', points: 80, category: 'efficiency', tier: 'silver', prerequisites: ['speed_demon'] },
    { id: 'lightning_scholar', title: '⚡ Lightning Scholar', description: 'Score 95%+ in under 1 minute', iconType: 'speed', points: 150, category: 'efficiency', tier: 'gold', prerequisites: ['efficient_learner'] },
    { id: 'time_master', title: '⚡ Time Master', description: 'Complete 10 quizzes with perfect speed and accuracy', iconType: 'speed', points: 200, category: 'efficiency', tier: 'legendary', prerequisites: ['lightning_scholar'] },

    // === SUBJECT MASTERY ACHIEVEMENTS ===
    { id: 'math_novice', title: '📐 Math Novice', description: 'Score 80%+ on 5 math quizzes', iconType: 'mastery', points: 75, category: 'mastery', tier: 'bronze', subject: 'Matemáticas', prerequisites: [] },
    { id: 'math_expert', title: '📐 Math Expert', description: 'Score 90%+ on 15 math quizzes', iconType: 'mastery', points: 150, category: 'mastery', tier: 'gold', subject: 'Matemáticas', prerequisites: ['math_novice'] },
    { id: 'science_novice', title: '🔬 Science Novice', description: 'Score 80%+ on 5 science quizzes', iconType: 'mastery', points: 75, category: 'mastery', tier: 'bronze', subject: 'Ciencias', prerequisites: [] },
    { id: 'science_expert', title: '🔬 Science Expert', description: 'Score 90%+ on 15 science quizzes', iconType: 'mastery', points: 150, category: 'mastery', tier: 'gold', subject: 'Ciencias', prerequisites: ['science_novice'] },
    { id: 'language_novice', title: '📚 Language Novice', description: 'Score 80%+ on 5 language quizzes', iconType: 'mastery', points: 75, category: 'mastery', tier: 'bronze', subject: 'Lenguaje', prerequisites: [] },
    { id: 'language_expert', title: '📚 Language Expert', description: 'Score 90%+ on 15 language quizzes', iconType: 'mastery', points: 150, category: 'mastery', tier: 'gold', subject: 'Lenguaje', prerequisites: ['language_novice'] },
    { id: 'polymath', title: '🎓 Polymath', description: 'Achieve expert level in all 3 main subjects', iconType: 'mastery', points: 500, category: 'mastery', tier: 'legendary', prerequisites: ['math_expert', 'science_expert', 'language_expert'] },

    // === CONSISTENCY ACHIEVEMENTS (DISCIPLINE) ===
    { id: 'reliable_student', title: '📈 Reliable Student', description: 'Study every day for a week', iconType: 'consistency', points: 75, category: 'discipline', tier: 'silver', prerequisites: [] },
    { id: 'disciplined_scholar', title: '📈 Disciplined Scholar', description: 'Study every day for a month', iconType: 'consistency', points: 200, category: 'discipline', tier: 'gold', prerequisites: ['reliable_student'] },
    { id: 'subject_specialist', title: '📈 Subject Specialist', description: 'Score 85%+ in the same subject 10 times', iconType: 'consistency', points: 100, category: 'discipline', tier: 'silver', prerequisites: [] },
    { id: 'improvement_champion', title: '📈 Improvement Champion', description: 'Show consistent improvement over 2 weeks', iconType: 'consistency', points: 125, category: 'discipline', tier: 'gold', prerequisites: [] },
    { id: 'never_give_up', title: '💪 Never Give Up', description: 'Complete 5 quizzes after scoring below 50%', iconType: 'consistency', points: 100, category: 'discipline', tier: 'gold', prerequisites: [] },

    // === MILESTONE ACHIEVEMENTS (SPECIAL) ===
    { id: 'level_5', title: '🌟 Rising Star', description: 'Reach Level 5', iconType: 'milestone', points: 100, category: 'milestone', tier: 'bronze', prerequisites: [] },
    { id: 'level_10', title: '🌟 Dedicated Learner', description: 'Reach Level 10', iconType: 'milestone', points: 200, category: 'milestone', tier: 'silver', prerequisites: ['level_5'] },
    { id: 'level_25', title: '🌟 Academic Elite', description: 'Reach Level 25', iconType: 'milestone', points: 500, category: 'milestone', tier: 'gold', prerequisites: ['level_10'] },
    { id: 'level_50', title: '🌟 Scholar Supreme', description: 'Reach Level 50', iconType: 'milestone', points: 1000, category: 'milestone', tier: 'legendary', prerequisites: ['level_25'] },

    // === SEASONAL/SPECIAL ACHIEVEMENTS ===
    { id: 'weekend_warrior', title: '🛡️ Weekend Warrior', description: 'Study every weekend for a month', iconType: 'seasonal', points: 125, category: 'seasonal', tier: 'silver', prerequisites: [] },
    { id: 'early_bird', title: '🌅 Early Bird', description: 'Complete 10 quizzes before 8 AM', iconType: 'seasonal', points: 100, category: 'seasonal', tier: 'silver', prerequisites: [] },
    { id: 'night_owl', title: '🦉 Night Owl', description: 'Complete 10 quizzes after 10 PM', iconType: 'seasonal', points: 100, category: 'seasonal', tier: 'silver', prerequisites: [] },
  ];
}

async function checkAndAwardAchievements(ctx: any, userId: any, stats: {
  totalQuizzes: number;
  currentStreak: number;
  avgScore: number;
  level?: number;
  totalPoints?: number;
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
      iconType: 'streak',
      earnedAt: now,
      points: 25,
    });
  }
  
  if (stats.currentStreak >= 7 && !earnedAchievementIds.has('week_streak')) {
    newAchievements.push({
      id: 'week_streak',
      title: 'Dedicated Student',
      description: 'Study for 7 days in a row',
      iconType: 'streak',
      earnedAt: now,
      points: 50,
    });
  }
  
  if (stats.currentStreak >= 30 && !earnedAchievementIds.has('month_streak')) {
    newAchievements.push({
      id: 'month_streak',
      title: 'Consistency Master',
      description: 'Study for 30 days in a row',
      iconType: 'streak',
      earnedAt: now,
      points: 200,
    });
  }

  // Check completion achievements
  if (stats.totalQuizzes >= 1 && !earnedAchievementIds.has('first_quiz')) {
    newAchievements.push({
      id: 'first_quiz',
      title: 'First Steps',
      description: 'Complete your first practice quiz',
      iconType: 'completion',
      earnedAt: now,
      points: 10,
    });
  }
  
  if (stats.totalQuizzes >= 50 && !earnedAchievementIds.has('quiz_machine')) {
    newAchievements.push({
      id: 'quiz_machine',
      title: 'Quiz Machine',
      description: 'Complete 50 practice quizzes',
      iconType: 'completion',
      earnedAt: now,
      points: 125,
    });
  }
  
  if (stats.totalQuizzes >= 100 && !earnedAchievementIds.has('century_club')) {
    newAchievements.push({
      id: 'century_club',
      title: 'Century Club',
      description: 'Complete 100 practice quizzes',
      iconType: 'completion',
      earnedAt: now,
      points: 250,
    });
  }

  // Check score achievements
  if (stats.avgScore >= 0.8 && stats.totalQuizzes >= 10 && !earnedAchievementIds.has('high_achiever')) {
    newAchievements.push({
      id: 'high_achiever',
      title: 'High Achiever',
      description: 'Maintain 80%+ average for 10 quizzes',
      iconType: 'score',
      earnedAt: now,
      points: 100,
    });
  }

  if (newAchievements.length > 0) {
    const updatedAchievements = [...currentAchievements, ...newAchievements];
    const pointsEarned = newAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
    
    await ctx.db.patch(userStats._id, {
      achievements: updatedAchievements,
      totalPoints: (userStats.totalPoints || 0) + pointsEarned,
      experiencePoints: (userStats.experiencePoints || 0) + pointsEarned,
      updatedAt: now,
    });

    // Create progress events for new achievements
    for (const achievement of newAchievements) {
      await ctx.db.insert('progressEvents', {
        userId,
        subject: 'Achievement',
        kind: 'achievement_earned',
        value: achievement.points,
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
      userStats = await ctx.db.insert('userStats', {
        userId: user._id,
        currentStreak: 0,
        longestStreak: 0,
        totalQuizzes: 0,
        avgScore: 0,
        weakSubjects: [],
        strongSubjects: [],
        lastActiveDate: new Date().toISOString().split('T')[0],
        totalPoints: 0,
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
        updatedAt: now,
      });
    }

    // Update user stats with diagnostic results
    const weakSubjects = Object.entries(args.subjectScores as Record<string, { correct: number; total: number }>)
      .filter(([_, scores]) => (scores.correct / scores.total) < 0.7)
      .map(([subject, _]) => subject);

    const strongSubjects = Object.entries(args.subjectScores as Record<string, { correct: number; total: number }>)
      .filter(([_, scores]) => (scores.correct / scores.total) >= 0.8)
      .map(([subject, _]) => subject);

    // Add diagnostic completion achievement
    const currentAchievements = userStats.achievements || [];
    const earnedAchievementIds = new Set(currentAchievements.map(a => a.id));

    let newAchievements: any[] = [];
    if (!earnedAchievementIds.has('diagnostic_completed')) {
      newAchievements.push({
        id: 'diagnostic_completed',
        title: 'Assessment Complete',
        description: 'Complete your diagnostic assessment',
        iconType: 'completion',
        earnedAt: now,
        points: 50,
      });
    }

    await ctx.db.patch(userStats, {
      weakSubjects,
      strongSubjects,
      achievements: [...currentAchievements, ...newAchievements],
      totalPoints: (userStats.totalPoints || 0) + newAchievements.reduce((sum, a) => sum + a.points, 0),
      experiencePoints: (userStats.experiencePoints || 0) + newAchievements.reduce((sum, a) => sum + a.points, 0),
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