import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { 
  getUser, 
  calculateEsenciaArcana, 
  calculateLevel, 
  getDayStart, 
  isSameDay, 
  validateProgressEvent,
  validateQuizSubmission,
  validateStudySession
} from "./shared";

// ===== UNIFIED GAMIFICATION SYSTEM =====
// This file integrates all gamification optimizations into a cohesive system

// Get comprehensive user gamification data
export const getGamificationData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    const today = getDayStart(now);
    
    // Get user stats with unified currency system
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userStats) {
      return {
        esenciaArcana: 0,
        level: 1,
        experiencePoints: 0,
        pointsToNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        achievements: [],
        dailyMissions: null,
        learningMetrics: getDefaultLearningMetrics(),
        spacedRepetition: getDefaultSpacedRepetition(now),
        weeklyGoals: getDefaultWeeklyGoals(now),
      };
    }

    // Get today's missions
    const dailyMissions = userStats.dailyMissions && isSameDay(userStats.dailyMissions.date, today)
      ? userStats.dailyMissions
      : null;

    // Get recent purchases for spending analytics
    const recentPurchases = await ctx.db
      .query('esenciaPurchases')
      .withIndex('byUserPurchased', q => 
        q.eq('userId', user._id).gte('purchasedAt', now - 7 * 24 * 3600)
      )
      .collect();

    // Calculate learning progress trends
    const progressTrends = await calculateLearningProgressTrends(ctx, user._id, now);

    return {
      ...userStats,
      dailyMissions,
      progressTrends,
      recentPurchases: recentPurchases.map(p => ({
        itemName: p.itemName,
        cost: p.cost,
        category: p.category,
        purchasedAt: p.purchasedAt
      })),
      spendingPower: calculateSpendingRecommendations(userStats, recentPurchases),
    };
  }
});

// Submit learning activity with comprehensive validation
export const submitLearningActivity = mutation({
  args: {
    activityType: v.string(), // 'quiz', 'study_session', 'concept_review', 'retention_test'
    activityData: v.object({
      subject: v.optional(v.string()),
      difficulty: v.string(),
      score: v.number(), // 0-1
      timeSpent: v.number(), // seconds
      conceptsEngaged: v.optional(v.array(v.string())),
      retentionVerified: v.optional(v.boolean()),
      answers: v.optional(v.array(v.number())),
      startedAt: v.number(),
    }),
    sessionId: v.string(),
    clientValidation: v.optional(v.object({
      actionCount: v.number(),
      tabSwitches: v.number(),
      idleTime: v.number(),
    }))
  },
  handler: async (ctx, { activityType, activityData, sessionId, clientValidation }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    const today = getDayStart(now);

    // COMPREHENSIVE VALIDATION
    const recentEvents = await ctx.db
      .query('progressEvents')
      .withIndex('byUserCreatedAt', q => 
        q.eq('userId', user._id).gte('createdAt', now - 3600)
      )
      .collect();

    // Validate based on activity type
    let validation;
    if (activityType === 'quiz' && activityData.answers) {
      validation = validateQuizSubmission(
        activityData.startedAt,
        activityData.answers,
        activityData.timeSpent,
        []
      );
    } else {
      validation = validateStudySession(
        activityData.startedAt,
        now,
        [{ type: activityType, timestamp: now }],
        []
      );
    }

    if (!validation.isValid) {
      throw new Error(`Activity validation failed: ${validation.flags.join(', ')}`);
    }

    // Calculate Esencia Arcana using difficulty-based system
    const conceptsMastered = activityData.conceptsEngaged?.length || 0;
    const retentionBonus = activityData.retentionVerified ? 25 : 0;
    
    const esenciaEarned = calculateEsenciaArcana(
      activityData.score,
      activityData.difficulty,
      activityData.timeSpent,
      conceptsMastered,
      retentionBonus
    );

    // Apply validation penalty
    const finalEsencia = Math.floor(esenciaEarned * Math.max(0.5, validation.score));

    // Get or create user stats
    let userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userStats) {
      userStats = await initializeUserGamification(ctx, user._id, today);
    }

    // Update stats with new unified system
    const currentEsencia = userStats.esenciaArcana || 0;
    const newEsencia = currentEsencia + finalEsencia;
    const levelInfo = calculateLevel(newEsencia);

    // Update streak logic with proper date handling
    const lastActiveDay = getDayStart(userStats.lastActiveDate);
    const yesterday = getDayStart(now - 24 * 3600);
    
    let newStreak = userStats.currentStreak;
    if (lastActiveDay === yesterday) {
      newStreak = userStats.currentStreak + 1;
    } else if (lastActiveDay !== today) {
      newStreak = 1;
    }

    // Update learning metrics
    const updatedMetrics = updateLearningMetrics(
      userStats.learningMetrics || getDefaultLearningMetrics(),
      activityData,
      finalEsencia
    );

    // Update weekly goals progress
    const updatedWeeklyGoals = updateWeeklyGoals(
      userStats.weeklyGoals || getDefaultWeeklyGoals(now),
      activityData,
      conceptsMastered,
      finalEsencia,
      now
    );

    // Check for new achievements
    const newAchievements = await checkLearningAchievements(
      ctx,
      user._id,
      {
        esenciaEarned: finalEsencia,
        conceptsMastered,
        score: activityData.score,
        difficulty: activityData.difficulty,
        streak: newStreak,
        currentLevel: levelInfo.level,
      }
    );

    // Update user stats atomically
    await ctx.db.patch(userStats._id, {
      esenciaArcana: newEsencia,
      level: levelInfo.level,
      experiencePoints: newEsencia, // Same as esenciaArcana for leveling
      pointsToNextLevel: levelInfo.pointsToNext,
      currentStreak: newStreak,
      longestStreak: Math.max(userStats.longestStreak, newStreak),
      lastActiveDate: today,
      learningMetrics: updatedMetrics,
      weeklyGoals: updatedWeeklyGoals,
      achievements: [...(userStats.achievements || []), ...newAchievements],
      updatedAt: now,
    });

    // Create progress event with rich metadata
    await ctx.db.insert('progressEvents', {
      userId: user._id,
      subject: activityData.subject || 'General',
      kind: `${activityType}_completed`,
      value: activityData.score,
      createdAt: now,
      sessionId,
      metadata: {
        duration: activityData.timeSpent,
        difficulty: activityData.difficulty,
        accuracy: activityData.score,
        conceptsEngaged: conceptsMastered,
        esenciaAwarded: finalEsencia,
        validationScore: validation.score,
        retentionVerified: activityData.retentionVerified || false,
        newLevel: levelInfo.level !== userStats.level,
      }
    });

    return {
      success: true,
      esenciaEarned: finalEsencia,
      newLevel: levelInfo.level !== userStats.level,
      levelInfo,
      newStreak: newStreak > userStats.currentStreak,
      streakCount: newStreak,
      newAchievements,
      validationScore: validation.score,
      learningProgress: {
        conceptsMastered,
        weeklyProgress: (updatedWeeklyGoals.masteryCompleted / updatedWeeklyGoals.masteryTarget) * 100,
        retentionRate: updatedMetrics.conceptsRetained / Math.max(1, updatedMetrics.conceptsMastered) * 100,
      }
    };
  }
});

// Get learning analytics and spending recommendations
export const getLearningAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 3600;

    // Get user stats
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userStats) return null;

    // Get recent activity for trend analysis
    const recentEvents = await ctx.db
      .query('progressEvents')
      .withIndex('byUserCreatedAt', q => 
        q.eq('userId', user._id).gte('createdAt', thirtyDaysAgo)
      )
      .collect();

    // Get spending history
    const spendingHistory = await ctx.db
      .query('esenciaPurchases')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .collect();

    // Calculate comprehensive analytics
    const analytics = await calculateComprehensiveAnalytics(
      recentEvents, 
      spendingHistory, 
      userStats
    );

    // Generate personalized recommendations
    const recommendations = generatePersonalizedRecommendations(analytics, userStats);

    // Get available enhancements
    const availableEnhancements = await getOptimalEnhancements(ctx, userStats, analytics);

    return {
      currentStats: {
        esenciaArcana: userStats.esenciaArcana || 0,
        level: userStats.level,
        streak: userStats.currentStreak,
        learningMetrics: userStats.learningMetrics,
      },
      analytics,
      recommendations,
      availableEnhancements,
      spendingPower: calculateSpendingPower(userStats, analytics),
    };
  }
});

// ===== HELPER FUNCTIONS =====

async function initializeUserGamification(ctx: any, userId: string, today: number) {
  const now = Math.floor(Date.now() / 1000);
  
  const statsId = await ctx.db.insert('userStats', {
    userId,
    currentStreak: 1,
    longestStreak: 1,
    totalQuizzes: 0,
    avgScore: 0,
    weakSubjects: [],
    strongSubjects: [],
    lastActiveDate: today,
    
    // Unified currency system
    esenciaArcana: 0,
    level: 1,
    experiencePoints: 0,
    pointsToNextLevel: 100,
    
    achievements: [],
    weeklyGoals: getDefaultWeeklyGoals(now),
    learningMetrics: getDefaultLearningMetrics(),
    spacedRepetition: getDefaultSpacedRepetition(now),
    
    updatedAt: now,
  });

  return await ctx.db.get(statsId);
}

function getDefaultLearningMetrics() {
  return {
    conceptsMastered: 0,
    conceptsRetained: 0,
    averageImprovement: 0,
    difficultyPreference: 'adaptive',
    optimalStudyDuration: 1800, // 30 minutes
    peakPerformanceHour: undefined,
  };
}

function getDefaultSpacedRepetition(now: number) {
  return {
    dueCards: 0,
    masteredCards: 0,
    streakDays: 0,
    nextReviewDate: now + 86400, // Tomorrow
    retentionRate: 100,
  };
}

function getDefaultWeeklyGoals(now: number) {
  return {
    masteryTarget: 5,
    masteryCompleted: 0,
    improvementTarget: 100,
    improvementCompleted: 0,
    retentionTarget: 3,
    retentionCompleted: 0,
    weekStart: now,
  };
}

function updateLearningMetrics(current: any, activityData: any, esenciaEarned: number) {
  return {
    ...current,
    conceptsMastered: current.conceptsMastered + (activityData.conceptsEngaged?.length || 0),
    conceptsRetained: current.conceptsRetained + (activityData.retentionVerified ? 1 : 0),
    averageImprovement: Math.round((current.averageImprovement + esenciaEarned) / 2),
    optimalStudyDuration: Math.round((current.optimalStudyDuration + activityData.timeSpent) / 2),
  };
}

function updateWeeklyGoals(current: any, activityData: any, conceptsMastered: number, esencia: number, now: number) {
  // Check if we need to reset for new week
  const weekStart = Math.floor(now / (7 * 24 * 3600)) * (7 * 24 * 3600);
  if (weekStart > current.weekStart) {
    return {
      ...getDefaultWeeklyGoals(weekStart),
      masteryCompleted: conceptsMastered,
      improvementCompleted: esencia,
      retentionCompleted: activityData.retentionVerified ? 1 : 0,
    };
  }

  return {
    ...current,
    masteryCompleted: current.masteryCompleted + conceptsMastered,
    improvementCompleted: current.improvementCompleted + esencia,
    retentionCompleted: current.retentionCompleted + (activityData.retentionVerified ? 1 : 0),
  };
}

async function checkLearningAchievements(ctx: any, userId: string, data: any): Promise<any[]> {
  const achievements = [];
  const now = Math.floor(Date.now() / 1000);

  // Esencia milestones
  if (data.esenciaEarned >= 100) {
    achievements.push({
      id: 'esencia_century',
      title: 'Centuria Arcana',
      description: 'Ganaste 100+ Esencia en una sola actividad',
      iconType: 'mastery',
      earnedAt: now,
      esencia: 50,
      difficulty: 'guerrero',
    });
  }

  // Concept mastery achievements
  if (data.conceptsMastered >= 5) {
    achievements.push({
      id: 'concept_master',
      title: 'Maestro de Conceptos',
      description: 'Dominaste 5 conceptos en una sola sesión',
      iconType: 'mastery',
      earnedAt: now,
      esencia: 75,
      difficulty: 'paladín',
    });
  }

  // Difficulty achievements
  if (data.difficulty === 'leyenda' && data.score >= 0.9) {
    achievements.push({
      id: 'legend_performer',
      title: 'Actuación Legendaria',
      description: 'Alcanzaste 90%+ en contenido de dificultad Leyenda',
      iconType: 'breakthrough',
      earnedAt: now,
      esencia: 150,
      difficulty: 'leyenda',
    });
  }

  // Streak achievements
  if (data.streak >= 30) {
    achievements.push({
      id: 'month_streak',
      title: 'Constancia Inquebrantable',
      description: 'Mantuviste una racha de 30 días',
      iconType: 'consistency',
      earnedAt: now,
      esencia: 200,
      difficulty: 'paladín',
    });
  }

  return achievements;
}

async function calculateLearningProgressTrends(ctx: any, userId: string, now: number) {
  const fourWeeksAgo = now - 28 * 24 * 3600;
  
  const events = await ctx.db
    .query('progressEvents')
    .withIndex('byUserCreatedAt', q => 
      q.eq('userId', userId).gte('createdAt', fourWeeksAgo)
    )
    .collect();

  // Calculate weekly trends
  const weeklyData = [0, 1, 2, 3].map(weekOffset => {
    const weekStart = now - (weekOffset + 1) * 7 * 24 * 3600;
    const weekEnd = now - weekOffset * 7 * 24 * 3600;
    
    const weekEvents = events.filter(e => e.createdAt >= weekStart && e.createdAt < weekEnd);
    
    return {
      week: weekOffset,
      esenciaEarned: weekEvents.reduce((sum, e) => sum + (e.metadata?.esenciaAwarded || 0), 0),
      conceptsMastered: weekEvents.reduce((sum, e) => sum + (e.metadata?.conceptsEngaged || 0), 0),
      activeDays: new Set(weekEvents.map(e => getDayStart(e.createdAt))).size,
      averageAccuracy: weekEvents.length > 0 
        ? weekEvents.reduce((sum, e) => sum + (e.value || 0), 0) / weekEvents.length
        : 0
    };
  });

  return {
    weeklyTrends: weeklyData.reverse(), // Most recent first
    totalEsenciaMonth: weeklyData.reduce((sum, w) => sum + w.esenciaEarned, 0),
    conceptsMasteredMonth: weeklyData.reduce((sum, w) => sum + w.conceptsMastered, 0),
    averageActiveDays: weeklyData.reduce((sum, w) => sum + w.activeDays, 0) / 4,
  };
}

async function calculateComprehensiveAnalytics(events: any[], purchases: any[], userStats: any) {
  // Learning velocity (concepts per week)
  const conceptsPerWeek = events
    .filter(e => e.metadata?.conceptsEngaged > 0)
    .reduce((sum, e) => sum + e.metadata.conceptsEngaged, 0) / 4;

  // Esencia earning rate
  const esenciaPerWeek = events
    .filter(e => e.metadata?.esenciaAwarded > 0)
    .reduce((sum, e) => sum + e.metadata.esenciaAwarded, 0) / 4;

  // Spending patterns
  const spendingByCategory = purchases.reduce((acc: any, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.cost;
    return acc;
  }, {});

  // Learning efficiency
  const totalTime = events
    .filter(e => e.metadata?.duration)
    .reduce((sum, e) => sum + e.metadata.duration, 0);
  
  const totalEsencia = events
    .filter(e => e.metadata?.esenciaAwarded)
    .reduce((sum, e) => sum + e.metadata.esenciaAwarded, 0);

  const esenciaPerHour = totalTime > 0 ? totalEsencia / (totalTime / 3600) : 0;

  return {
    conceptsPerWeek: Math.round(conceptsPerWeek),
    esenciaPerWeek: Math.round(esenciaPerWeek),
    esenciaPerHour: Math.round(esenciaPerHour),
    spendingByCategory,
    totalSpent: purchases.reduce((sum, p) => sum + p.cost, 0),
    retentionRate: userStats.spacedRepetition?.retentionRate || 0,
    learningEfficiency: Math.round((esenciaPerHour / 50) * 100), // Percentage score
  };
}

function generatePersonalizedRecommendations(analytics: any, userStats: any) {
  const recommendations = [];

  // Learning velocity recommendations
  if (analytics.conceptsPerWeek < 3) {
    recommendations.push({
      type: 'learning_acceleration',
      priority: 'high',
      title: 'Acelera tu Aprendizaje',
      description: 'Enfócate en dominar 1-2 conceptos nuevos por día',
      expectedBenefit: '+50% Esencia Arcana',
      action: 'concept_mastery_missions'
    });
  }

  // Spending recommendations
  if (userStats.esenciaArcana >= 200 && analytics.totalSpent === 0) {
    recommendations.push({
      type: 'first_purchase',
      priority: 'medium',
      title: 'Invierte en tu Aprendizaje',
      description: 'Usa tu Esencia Arcana en herramientas de aprendizaje',
      expectedBenefit: 'Acelera tu progreso educativo',
      action: 'browse_enhancements'
    });
  }

  // Efficiency improvements
  if (analytics.esenciaPerHour < 30) {
    recommendations.push({
      type: 'efficiency_boost',
      priority: 'medium',
      title: 'Optimiza tu Tiempo de Estudio',
      description: 'Mejora tu eficiencia de aprendizaje',
      expectedBenefit: '+40% Esencia por hora',
      action: 'purchase_efficiency_tools'
    });
  }

  return recommendations;
}

async function getOptimalEnhancements(ctx: any, userStats: any, analytics: any) {
  const availableEnhancements = await ctx.db
    .query('rewardsCatalog')
    .withIndex('byActive', q => q.eq('isActive', true))
    .collect();

  return availableEnhancements
    .filter(item => {
      const cost = item.unlockRequirements.esenciaCost || 0;
      return (userStats.esenciaArcana || 0) >= cost;
    })
    .map(item => ({
      ...item,
      priority: calculateEnhancementPriority(item, analytics, userStats),
      roiScore: calculateROI(item, analytics),
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5); // Top 5 recommendations
}

function calculateEnhancementPriority(item: any, analytics: any, userStats: any): number {
  let priority = 0;
  
  // Base priority by learning impact
  priority += (item.impact?.learningAcceleration || 1) * 30;
  
  // Boost priority if addresses user's weak areas
  if (analytics.conceptsPerWeek < 3 && item.category === 'concept_reveal') priority += 20;
  if (analytics.retentionRate < 80 && item.category === 'retention_boost') priority += 25;
  if (analytics.learningEfficiency < 50 && item.category === 'efficiency_boost') priority += 15;
  
  // Reduce priority if too expensive relative to current Esencia
  const cost = item.unlockRequirements.esenciaCost || 0;
  const affordabilityRatio = (userStats.esenciaArcana || 0) / Math.max(cost, 1);
  if (affordabilityRatio < 1.5) priority -= 10; // If less than 1.5x the cost
  
  return Math.max(0, priority);
}

function calculateROI(item: any, analytics: any): number {
  const cost = item.unlockRequirements.esenciaCost || 1;
  const benefit = (item.impact?.learningAcceleration || 1) * analytics.esenciaPerWeek;
  return Math.round((benefit / cost) * 100);
}

function calculateSpendingPower(userStats: any, analytics: any) {
  const currentEsencia = userStats.esenciaArcana || 0;
  const weeklyEarning = analytics.esenciaPerWeek;
  
  return {
    current: currentEsencia,
    weeklyEarning,
    spendingTier: currentEsencia >= 500 ? 'premium' : currentEsencia >= 200 ? 'advanced' : 'basic',
    recommendedBudget: Math.floor(weeklyEarning * 0.7), // Save 30% for growth
  };
}

function calculateSpendingRecommendations(userStats: any, recentPurchases: any[]) {
  const currentEsencia = userStats.esenciaArcana || 0;
  const recentSpending = recentPurchases.reduce((sum, p) => sum + p.cost, 0);
  
  // Spending categories by priority
  const recommendations = [];
  
  if (currentEsencia >= 150 && recentPurchases.length === 0) {
    recommendations.push({
      category: 'learning_boost',
      reason: 'First purchase - immediate learning impact',
      suggestedItems: ['concept_revealer', 'retention_enhancer'],
      priority: 'high'
    });
  }
  
  if (currentEsencia >= 300 && userStats.level >= 10) {
    recommendations.push({
      category: 'exclusive_content',
      reason: 'Advanced level - unlock expert strategies',
      suggestedItems: ['advanced_strategies', 'expert_techniques'],
      priority: 'medium'
    });
  }
  
  if (currentEsencia >= 500) {
    recommendations.push({
      category: 'educational_service',
      reason: 'High Esencia balance - invest in personalized help',
      suggestedItems: ['personal_tutor', 'study_optimization'],
      priority: 'high'
    });
  }
  
  return recommendations;
}