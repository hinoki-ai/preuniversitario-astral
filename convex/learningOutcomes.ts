import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUser, calculateEsenciaArcana, getDayStart, isSameDay, validateProgressEvent } from "./shared";

// ===== LEARNING-FOCUSED DAILY MISSIONS SYSTEM =====

// Get today's missions focused on learning outcomes
export const getTodaysMissions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    const today = getDayStart(now);
    
    // Get user stats to determine appropriate mission difficulty
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    // Check if user already has missions for today
    if (userStats?.dailyMissions && isSameDay(userStats.dailyMissions.date, today)) {
      return {
        missions: userStats.dailyMissions.missions,
        completedCount: userStats.dailyMissions.completedCount,
        masteryBonus: userStats.dailyMissions.masteryBonus,
        date: today,
      };
    }

    // No missions for today yet
    return null;
  },
});

// Initialize daily missions based on learning analytics
export const initializeTodaysMissions = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    const today = getDayStart(now);

    // Get user stats and learning analytics
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userStats) {
      throw new Error('User stats not found');
    }

    // Check if user already has missions for today
    if (userStats.dailyMissions && isSameDay(userStats.dailyMissions.date, today)) {
      return userStats.dailyMissions;
    }

    // Generate new learning-focused missions
    const newMissions = await generateLearningMissions(ctx, user, userStats);

    // Update user stats with new missions
    await ctx.db.patch(userStats._id, {
      dailyMissions: {
        date: today,
        missions: newMissions,
        completedCount: 0,
        masteryBonus: calculateMasteryBonus(userStats),
      },
      updatedAt: now,
    });

    return {
      missions: newMissions,
      completedCount: 0,
      masteryBonus: calculateMasteryBonus(userStats),
      date: today,
    };
  },
});

// Update mission progress with comprehensive validation
export const updateMissionProgress = mutation({
  args: {
    missionId: v.string(),
    progressData: v.object({
      increment: v.number(),
      accuracy: v.optional(v.number()), // 0-1 score
      conceptsEngaged: v.optional(v.array(v.string())),
      difficultyLevel: v.optional(v.string()),
      timeSpent: v.optional(v.number()),
      retentionVerified: v.optional(v.boolean()),
    }),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { missionId, progressData, sessionId }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    const today = getDayStart(now);
    
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userStats?.dailyMissions || !isSameDay(userStats.dailyMissions.date, today)) {
      throw new Error("No missions found for today");
    }

    const missions = [...userStats.dailyMissions.missions];
    const missionIndex = missions.findIndex(m => m.id === missionId);
    
    if (missionIndex === -1) {
      throw new Error("Mission not found");
    }

    const mission = missions[missionIndex];
    if (mission.completed) {
      return { alreadyCompleted: true };
    }

    // Validate the progress event
    const recentEvents = await ctx.db
      .query('progressEvents')
      .withIndex('byUserCreatedAt', q => 
        q.eq('userId', user._id).gte('createdAt', now - 3600)
      )
      .collect();

    const validation = validateProgressEvent(
      user._id,
      `mission_${mission.type}`,
      progressData.accuracy,
      now,
      sessionId,
      recentEvents
    );

    if (!validation.isValid) {
      throw new Error(`Progress validation failed: ${validation.flags.join(', ')}`);
    }

    // Calculate validated progress
    const validatedProgress = Math.floor(progressData.increment * Math.max(0.5, validation.score));
    const newProgress = Math.min(mission.progress + validatedProgress, mission.target);
    const justCompleted = !mission.completed && newProgress >= mission.target;

    // Update mission
    missions[missionIndex] = {
      ...mission,
      progress: newProgress,
      completed: newProgress >= mission.target,
    };

    const completedCount = missions.filter(m => m.completed).length;
    let esenciaAwarded = 0;
    let newAchievements: any[] = [];
    
    if (justCompleted) {
      // Calculate Esencia Arcana based on learning outcomes
      const baseEsencia = mission.reward.esencia;
      const masteryMultiplier = progressData.conceptsEngaged ? 
        Math.min(2.0, 1 + (progressData.conceptsEngaged.length * 0.2)) : 1.0;
      const accuracyMultiplier = progressData.accuracy ? 
        Math.max(0.5, progressData.accuracy) : 1.0;
      const retentionMultiplier = progressData.retentionVerified ? 1.5 : 1.0;

      esenciaAwarded = Math.floor(
        baseEsencia * masteryMultiplier * accuracyMultiplier * retentionMultiplier
      );

      // Add mastery bonus if present
      if (mission.reward.masteryBonus && progressData.conceptsEngaged && progressData.conceptsEngaged.length > 0) {
        esenciaAwarded += mission.reward.masteryBonus * progressData.conceptsEngaged.length;
      }

      // Add retention bonus
      if (mission.reward.retentionBonus && progressData.retentionVerified) {
        esenciaAwarded += mission.reward.retentionBonus;
      }

      // Check for all missions completed bonus
      if (completedCount === missions.length) {
        esenciaAwarded += userStats.dailyMissions.masteryBonus;
        newAchievements = await checkMissionAchievements(ctx, user._id, completedCount, true);
      }

      // Update user stats with Esencia Arcana
      const currentEsencia = userStats.esenciaArcana || 0;
      const newEsencia = currentEsencia + esenciaAwarded;
      
      await ctx.db.patch(userStats._id, {
        dailyMissions: {
          ...userStats.dailyMissions,
          missions,
          completedCount,
        },
        esenciaArcana: newEsencia,
        experiencePoints: newEsencia,
        updatedAt: now,
      });

      // Log mission completion
      await ctx.db.insert('userMissionHistory', {
        userId: user._id,
        date: today,
        missionId,
        completed: true,
        completedAt: now,
        progress: newProgress,
        esenciaEarned: esenciaAwarded,
        masteryBonus: mission.reward.masteryBonus || 0,
        retentionBonus: mission.reward.retentionBonus || 0,
        attempts: 1, // This should be tracked from client
        timeSpent: progressData.timeSpent || 0,
        averageAccuracy: progressData.accuracy || 0,
        validationScore: validation.score,
        conceptsMastered: progressData.conceptsEngaged || [],
        retentionVerified: progressData.retentionVerified || false,
      });

      // Create progress event
      await ctx.db.insert('progressEvents', {
        userId: user._id,
        subject: mission.subject || 'General',
        kind: 'mission_completed',
        value: progressData.accuracy || 1.0,
        createdAt: now,
        sessionId,
        metadata: {
          missionType: mission.type,
          difficulty: mission.difficulty,
          esenciaAwarded,
          conceptsEngaged: progressData.conceptsEngaged?.length || 0,
          retentionVerified: progressData.retentionVerified || false,
        }
      });

      return {
        missionCompleted: true,
        esenciaAwarded,
        allMissionsCompleted: completedCount === missions.length,
        newAchievements,
        validationScore: validation.score,
      };
    } else {
      // Just update progress
      await ctx.db.patch(userStats._id, {
        dailyMissions: {
          ...userStats.dailyMissions,
          missions,
          completedCount,
        },
        updatedAt: now,
      });

      return {
        missionCompleted: false,
        progress: newProgress,
        validationScore: validation.score,
      };
    }
  },
});

// Generate learning-focused missions based on user analytics
async function generateLearningMissions(ctx: any, user: any, userStats: any) {
  const level = userStats?.level || 1;
  const learningMetrics = userStats?.learningMetrics || {
    conceptsMastered: 0,
    conceptsRetained: 0,
    averageImprovement: 0,
    difficultyPreference: 'adaptive'
  };
  
  // Get available mission templates
  const templates = await ctx.db
    .query('dailyMissionTemplates')
    .withIndex('byActive', q => q.eq('active', true))
    .collect();

  // Filter templates based on learning needs
  const availableTemplates = templates.filter((template: any) => {
    const conditions = template.conditions || {};
    if (conditions.minLevel && level < conditions.minLevel) return false;
    if (conditions.maxLevel && level > conditions.maxLevel) return false;
    
    // Check if template is available today
    if (template.availableFrom && Math.floor(Date.now() / 1000) < template.availableFrom) return false;
    if (template.availableUntil && Math.floor(Date.now() / 1000) > template.availableUntil) return false;
    
    return true;
  });

  // Prioritize missions based on learning needs
  const missions = [];
  
  // 1. Always include concept mastery mission
  const conceptMissions = availableTemplates.filter(t => t.type === 'concept_mastery');
  if (conceptMissions.length > 0) {
    const selected = selectMissionByDifficulty(conceptMissions, learningMetrics.difficultyPreference);
    missions.push(createMissionFromTemplate(selected, learningMetrics));
  }

  // 2. Include retention challenge if user has mastered concepts
  if (learningMetrics.conceptsMastered > 0) {
    const retentionMissions = availableTemplates.filter(t => t.type === 'retention_challenge');
    if (retentionMissions.length > 0) {
      const selected = selectMissionByDifficulty(retentionMissions, learningMetrics.difficultyPreference);
      missions.push(createMissionFromTemplate(selected, learningMetrics));
    }
  }

  // 3. Include improvement sprint based on recent performance
  const improvementMissions = availableTemplates.filter(t => t.type === 'improvement_sprint');
  if (improvementMissions.length > 0) {
    const selected = selectMissionByDifficulty(improvementMissions, learningMetrics.difficultyPreference);
    missions.push(createMissionFromTemplate(selected, learningMetrics));
  }

  // 4. Add breakthrough attempt for advanced users
  if (level >= 10) {
    const breakthroughMissions = availableTemplates.filter(t => t.type === 'breakthrough_attempt');
    if (breakthroughMissions.length > 0) {
      const selected = selectMissionByDifficulty(breakthroughMissions, learningMetrics.difficultyPreference);
      missions.push(createMissionFromTemplate(selected, learningMetrics));
    }
  }

  return missions;
}

function selectMissionByDifficulty(missions: any[], preference: string) {
  switch (preference) {
    case 'challenging':
      return missions.filter(m => m.difficulty === 'leyenda' || m.difficulty === 'paladín')[0] || missions[0];
    case 'steady':
      return missions.filter(m => m.difficulty === 'escudero' || m.difficulty === 'guerrero')[0] || missions[0];
    default: // adaptive
      return missions[Math.floor(Math.random() * missions.length)];
  }
}

function createMissionFromTemplate(template: any, learningMetrics: any) {
  // Adjust target based on user's learning metrics
  let adjustedTarget = template.target;
  if (learningMetrics.averageImprovement > 0) {
    adjustedTarget = Math.max(1, Math.floor(template.target * (1 + learningMetrics.averageImprovement / 100)));
  }

  return {
    id: `mission_${template._id}_${Date.now()}`,
    type: template.type,
    title: template.title,
    description: template.description,
    target: adjustedTarget,
    progress: 0,
    completed: false,
    reward: {
      esencia: template.esenciaReward,
      masteryBonus: template.masteryBonus,
      retentionBonus: template.retentionBonus,
    },
    difficulty: template.difficulty,
    subject: template.conditions?.subjects?.[0],
    conceptsRequired: template.conditions?.conceptsRequired || [],
  };
}

function calculateMasteryBonus(userStats: any) {
  const BASE_BONUS = 50;
  const level = userStats?.level || 1;
  const masteryMultiplier = Math.min(level / 10, 3); // Max 3x multiplier
  return Math.floor(BASE_BONUS * (1 + masteryMultiplier));
}

async function checkMissionAchievements(ctx: any, userId: any, completedCount: number, allCompleted: boolean) {
  // Implementation for achievement checking based on learning outcomes
  const achievements: any[] = [];
  
  if (allCompleted) {
    achievements.push({
      id: 'daily_learning_master',
      title: 'Maestro del Aprendizaje Diario',
      description: 'Completaste todas las misiones de aprendizaje del día',
      iconType: 'mastery',
      earnedAt: Math.floor(Date.now() / 1000),
      esencia: 100,
      difficulty: 'guerrero',
    });
  }

  return achievements;
}

// Seed learning-focused mission templates
export const seedLearningMissionTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('dailyMissionTemplates').first();
    if (existing) return { message: "Templates already exist" };

    const now = Math.floor(Date.now() / 1000);
    const templates = [
      // Concept Mastery Missions
      {
        type: 'concept_mastery',
        title: 'Dominio Conceptual',
        description: 'Demuestra dominio de 3 conceptos nuevos con 85%+ de precisión',
        target: 3,
        difficulty: 'guerrero',
        esenciaReward: 75,
        masteryBonus: 20,
        retentionBonus: 0,
        conditions: {
          minAccuracy: 0.85,
          conceptsRequired: [],
          minLevel: 1,
        },
        validationRules: {
          maxAttemptsPerHour: 5,
          minTimeSpent: 180, // 3 minutes minimum
          accuracyThreshold: 0.70, // Must maintain 70% to count
          cooldownPeriod: 300, // 5 minutes between attempts
          duplicateSubmissionWindow: 60,
        },
        active: true,
      },
      {
        type: 'concept_mastery',
        title: 'Maestría Arcana',
        description: 'Alcanza dominio perfecto en 2 conceptos avanzados',
        target: 2,
        difficulty: 'paladín',
        esenciaReward: 150,
        masteryBonus: 50,
        retentionBonus: 0,
        conditions: {
          minAccuracy: 0.95,
          minLevel: 8,
        },
        validationRules: {
          maxAttemptsPerHour: 3,
          minTimeSpent: 300, // 5 minutes minimum
          accuracyThreshold: 0.85,
          cooldownPeriod: 600, // 10 minutes between attempts
          duplicateSubmissionWindow: 60,
        },
        active: true,
      },

      // Retention Challenge Missions
      {
        type: 'retention_challenge',
        title: 'Memoria de Acero',
        description: 'Retén y aplica conocimientos de la semana pasada',
        target: 5,
        difficulty: 'guerrero',
        esenciaReward: 100,
        masteryBonus: 0,
        retentionBonus: 30,
        conditions: {
          retentionDays: 7,
          minAccuracy: 0.80,
        },
        validationRules: {
          maxAttemptsPerHour: 3,
          minTimeSpent: 240,
          accuracyThreshold: 0.75,
          cooldownPeriod: 900, // 15 minutes between attempts
          duplicateSubmissionWindow: 60,
        },
        active: true,
      },

      // Improvement Sprint Missions
      {
        type: 'improvement_sprint',
        title: 'Salto Cuántico',
        description: 'Mejora tu rendimiento en 15 puntos en una sesión',
        target: 15,
        difficulty: 'paladín',
        esenciaReward: 125,
        masteryBonus: 25,
        retentionBonus: 0,
        conditions: {
          improvementRequired: 15,
          minLevel: 5,
        },
        validationRules: {
          maxAttemptsPerHour: 2,
          minTimeSpent: 600, // 10 minutes minimum
          accuracyThreshold: 0.70,
          cooldownPeriod: 1800, // 30 minutes between attempts
          duplicateSubmissionWindow: 60,
        },
        active: true,
      },

      // Breakthrough Attempt Missions
      {
        type: 'breakthrough_attempt',
        title: 'Rompe Barreras',
        description: 'Supera tu límite personal en una materia difícil',
        target: 1,
        difficulty: 'leyenda',
        esenciaReward: 200,
        masteryBonus: 75,
        retentionBonus: 50,
        conditions: {
          minLevel: 15,
          minAccuracy: 0.90,
          difficultyProgression: true,
        },
        validationRules: {
          maxAttemptsPerHour: 1,
          minTimeSpent: 900, // 15 minutes minimum
          accuracyThreshold: 0.85,
          cooldownPeriod: 3600, // 1 hour between attempts
          duplicateSubmissionWindow: 300,
        },
        active: true,
      },
    ];

    for (const template of templates) {
      await ctx.db.insert('dailyMissionTemplates', template);
    }

    return { message: `Seeded ${templates.length} learning-focused mission templates` };
  },
});