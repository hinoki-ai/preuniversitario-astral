import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { getUser, calculateLevel, getWeekStart } from "./shared";

// Get today's daily missions for a user
export const getTodaysMissions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Days since epoch
    
    // Get user stats to check current progress
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    // Check if user already has missions for today
    if (userStats?.dailyMissions && userStats.dailyMissions.date === today) {
      return {
        missions: userStats.dailyMissions.missions,
        completedCount: userStats.dailyMissions.completedCount,
        streakBonus: userStats.dailyMissions.masteryBonus,
        date: today,
      };
    }

    // No missions for today yet
    return null;
  },
});

// Initialize daily missions for today
export const initializeTodaysMissions = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Days since epoch

    // Get user stats
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userStats) {
      throw new Error('User stats not found');
    }

    // Check if user already has missions for today
    if (userStats.dailyMissions?.date === today) {
      return {
        missions: userStats.dailyMissions.missions,
        completedCount: userStats.dailyMissions.completedCount,
        streakBonus: userStats.dailyMissions.masteryBonus,
        date: today,
      };
    }

    // Generate new missions for today
    const newMissions = await generateDailyMissions(ctx, user, userStats);

    // Update user stats with new missions
    await ctx.db.patch(userStats._id, {
      dailyMissions: {
        date: today,
        missions: newMissions,
        completedCount: 0,
        masteryBonus: calculateStreakBonus(userStats),
      },
      updatedAt: Math.floor(Date.now() / 1000),
    });

    return {
      missions: newMissions,
      completedCount: 0,
      streakBonus: calculateStreakBonus(userStats),
      date: today,
    };
  },
});

// Update mission progress with validation and anti-cheating measures
export const updateMissionProgress = mutation({
  args: {
    missionId: v.string(),
    progressIncrement: v.number(),
    validationData: v.optional(v.object({
      sessionId: v.string(),
      timestamp: v.number(),
      accuracy: v.optional(v.number()),
      timeSpent: v.optional(v.number()),
      difficulty: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { missionId, progressIncrement, validationData }) => {
    const user = await getUser(ctx);
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Days since epoch
    
    // Validation: Check for suspicious activity
    if (progressIncrement <= 0) {
      throw new Error("Invalid progress increment");
    }
    
    // Rate limiting: Check if user is making progress too quickly
    const recentActivity = await ctx.db
      .query('userMissionHistory')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .filter(q => q.gte(q.field('completedAt'), Math.floor(Date.now() / 1000) - 300)) // Last 5 minutes
      .collect();
    
    if (recentActivity.length > 10) {
      throw new Error("Too many mission updates in a short time. Please slow down.");
    }
    
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userStats?.dailyMissions || userStats.dailyMissions.date !== today) {
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

    // Validate progress increment based on mission type and difficulty
    const maxProgressPerIncrement = validateProgressIncrement(mission, progressIncrement, validationData);
    const validatedIncrement = Math.min(progressIncrement, maxProgressPerIncrement);

    // Update progress
    const newProgress = Math.min(mission.progress + validatedIncrement, mission.target);
    missions[missionIndex] = {
      ...mission,
      progress: newProgress,
      completed: newProgress >= mission.target,
    };

    // Calculate completed count
    const completedCount = missions.filter(m => m.completed).length;
    
    // Award points if mission just completed
    let pointsAwarded = 0;
    let esenciaAwarded = 0;
    let newAchievements: any[] = [];
    
    if (missions[missionIndex].completed && !mission.completed) {
      // Calculate difficulty-based rewards
      const difficultyMultiplier = getDifficultyMultiplier(mission.difficulty);
      const qualityBonus = calculateQualityBonus(mission, validationData);
      
      pointsAwarded = Math.floor(mission.reward.esencia * difficultyMultiplier * qualityBonus);
      esenciaAwarded = Math.floor(mission.reward.esencia * difficultyMultiplier * qualityBonus);
      
      // Check for mission completion achievements
      if (completedCount === missions.length) {
        // All daily missions completed - bonus points
        const streakBonus = userStats.dailyMissions.masteryBonus || 50;
        pointsAwarded += streakBonus;
        esenciaAwarded += Math.floor(streakBonus * 0.5);
        
        // Check for achievement: Daily Completionist
        newAchievements = await checkMissionAchievements(ctx, user._id, completedCount, true);
      }

      // Update user experience and Esencia Arcana (unified system)
      const newXP = (userStats.experiencePoints || 0) + esenciaAwarded;
      const levelInfo = calculateLevel(newXP);

      await ctx.db.patch(userStats._id, {
        dailyMissions: {
          ...userStats.dailyMissions,
          missions,
          completedCount,
        },
        experiencePoints: newXP, // Used for leveling
        esenciaArcana: newXP, // Primary currency field
        level: levelInfo.level,
        pointsToNextLevel: levelInfo.pointsToNext,
        updatedAt: Math.floor(Date.now() / 1000),
      });

      // Log mission completion with validation data
      await ctx.db.insert('userMissionHistory', {
        userId: user._id,
        date: today,
        missionId,
        completed: true,
        completedAt: Math.floor(Date.now() / 1000),
        progress: newProgress,
        esenciaEarned: esenciaAwarded,
        attempts: 1,
        timeSpent: validationData?.timeSpent || 0,
        averageAccuracy: validationData?.accuracy || 0,
        validationScore: 1, // Assume valid for now
      });

      return {
        missionCompleted: true,
        pointsAwarded,
        esenciaAwarded,
        newLevel: levelInfo.level !== (userStats.level || 1),
        allMissionsCompleted: completedCount === missions.length,
        newAchievements,
      };
    } else {
      // Just update progress
      await ctx.db.patch(userStats._id, {
        dailyMissions: {
          ...userStats.dailyMissions,
          missions,
          completedCount,
        },
        updatedAt: Math.floor(Date.now() / 1000),
      });

      return {
        missionCompleted: false,
        progress: newProgress,
      };
    }
  },
});

// Get mission statistics and leaderboard
export const getMissionStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Days since epoch
    
    // Get user's mission history
    const history = await ctx.db
      .query('userMissionHistory')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .collect();

    // Calculate streak of consecutive days with completed missions
    let currentStreak = 0;
    let longestStreak = 0;
    let totalMissionsCompleted = history.filter(h => h.completed).length;
    
    // Calculate streaks by checking daily completion
    const dailyCompletions = new Map();
    history.forEach(h => {
      if (h.completed) {
        dailyCompletions.set(h.date, (dailyCompletions.get(h.date) || 0) + 1);
      }
    });

    // Calculate current streak
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const completions = dailyCompletions.get(dateStr) || 0;
      
      if (completions >= 3) { // At least 3 missions completed that day
        currentStreak++;
      }

 else {
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Get leaderboard (top mission completers this week)
    const weekStart = getWeekStart(Math.floor(Date.now() / 1000));

    const leaderboard = await ctx.db
      .query('userMissionHistory')
      .filter(q => q.gte(q.field('date'), weekStart))
      .collect();

    // Group by user and count completions
    const userCompletions = new Map();
    leaderboard.forEach(h => {
      if (h.completed) {
        userCompletions.set(h.userId, (userCompletions.get(h.userId) || 0) + 1);
      }
    });

    // Get user names for leaderboard
    const topUsers = Array.from(userCompletions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const leaderboardWithNames = await Promise.all(
      topUsers.map(async ([userId, completions]) => {
        const user = await ctx.db
          .query('users')
          .filter(q => q.eq(q.field('_id'), userId))
          .unique();
        return {
          userId,
          name: user?.name || 'Anonymous',
          completions,
          isCurrentUser: userId === user?._id,
        };
      })
    );

    return {
      currentStreak,
      longestStreak,
      totalMissionsCompleted,
      weeklyLeaderboard: leaderboardWithNames,
      personalStats: {
        averageDailyCompletions: totalMissionsCompleted / Math.max(1, history.length / 3),
        favoriteType: getMostFrequentMissionType(history),
      },
    };
  },
});

// Helper functions
async function generateDailyMissions(ctx: any, user: any, userStats: any) {
  const level = userStats?.level || 1;
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  // Get available mission templates
  const templates = await ctx.db
    .query('dailyMissionTemplates')
    .withIndex('byActive', (q: any) => q.eq('active', true))
    .collect();

  // Filter templates based on user level and conditions
  const availableTemplates = templates.filter((template: any) => {
    if (template.conditions?.minLevel && level < template.conditions.minLevel) return false;
    if (template.conditions?.maxLevel && level > template.conditions.maxLevel) return false;
    if (template.conditions?.weekday && !template.conditions.weekday.includes(dayOfWeek)) return false;
    return true;
  });

  // Select 3-4 missions of varying difficulty
  const missions: any[] = [];
  const difficulties = ['easy', 'medium', 'hard'];
  
  // Always include one easy mission
  const easyMissions = availableTemplates.filter((t: any) => t.difficulty === 'easy');
  if (easyMissions.length > 0) {
    const selected = easyMissions[Math.floor(Math.random() * easyMissions.length)];
    missions.push(createMissionFromTemplate(selected));
  }

  // Add medium difficulty mission
  const mediumMissions = availableTemplates.filter((t: any) => t.difficulty === 'medium');
  if (mediumMissions.length > 0) {
    const selected = mediumMissions[Math.floor(Math.random() * mediumMissions.length)];
    missions.push(createMissionFromTemplate(selected));
  }

  // Add hard mission for higher level users
  if (level >= 5) {
    const hardMissions = availableTemplates.filter((t: any) => t.difficulty === 'hard');
    if (hardMissions.length > 0) {
      const selected = hardMissions[Math.floor(Math.random() * hardMissions.length)];
      missions.push(createMissionFromTemplate(selected));
    }
  }

  // Add legendary mission for very high level users (with lower probability)
  if (level >= 15 && Math.random() < 0.3) {
    const legendaryMissions = availableTemplates.filter((t: any) => t.difficulty === 'legendary');
    if (legendaryMissions.length > 0) {
      const selected = legendaryMissions[Math.floor(Math.random() * legendaryMissions.length)];
      missions.push(createMissionFromTemplate(selected));
    }
  }

  return missions;
}

function createMissionFromTemplate(template: any) {
  return {
    id: `mission_${template._id}_${Date.now()}`,
    type: template.type,
    title: template.title,
    description: template.description,
    target: template.target,
    progress: 0,
    completed: false,
    reward: {
      esencia: template.points,
      masteryBonus: template.bonusReward,
    },
    difficulty: template.difficulty
  };
}

function calculateStreakBonus(userStats: any) {
  // Bonus esencia arcana for completing all daily missions
  const BASE_BONUS = 50;
  const level = userStats?.level || 1;
  const streakMultiplier = Math.min(level / 10, 3); // Max 3x multiplier
  return Math.floor(BASE_BONUS * (1 + streakMultiplier));
}

// Validation functions for mission progress
function validateProgressIncrement(mission: any, increment: number, validationData?: any): number {
  // Base validation - prevent excessive progress increments
  let maxIncrement = mission.target;
  
  switch (mission.type) {
    case 'concept_mastery':
      // For concept mastery, limit to 1 concept per increment unless batch learning
      maxIncrement = validationData?.batchSize || 1;
      break;
    case 'retention_challenge':
      // Retention challenges should be limited by actual review capacity
      maxIncrement = Math.min(5, increment);
      break;
    case 'improvement_sprint':
      // Improvement sprints depend on quiz performance
      maxIncrement = validationData?.accuracy ? Math.ceil(increment * (validationData.accuracy / 100)) : increment;
      break;
    case 'teaching_moment':
      // Teaching moments require time investment
      maxIncrement = validationData?.timeSpent && validationData.timeSpent < 60 ? 0 : increment;
      break;
    default:
      maxIncrement = increment;
  }
  
  return Math.min(maxIncrement, mission.target - mission.progress);
}

function getDifficultyMultiplier(difficulty: string): number {
  switch (difficulty) {
    case 'escudero': return 1.0;   // Easy missions - baseline reward
    case 'guerrero': return 1.5;   // Medium missions - 50% bonus
    case 'paladín': return 2.2;    // Hard missions - 120% bonus
    case 'leyenda': return 3.0;    // Legendary missions - 200% bonus
    default: return 1.0;
  }
}

function calculateQualityBonus(mission: any, validationData?: any): number {
  if (!validationData) return 1.0;
  
  let bonus = 1.0;
  
  // Accuracy bonus
  if (validationData.accuracy !== undefined) {
    if (validationData.accuracy >= 95) bonus += 0.3;
    else if (validationData.accuracy >= 85) bonus += 0.2;
    else if (validationData.accuracy >= 75) bonus += 0.1;
    else if (validationData.accuracy < 50) bonus -= 0.2; // Penalty for poor performance
  }
  
  // Time investment bonus (for deeper learning)
  if (validationData.timeSpent !== undefined && mission.type !== 'velocidad_relámpago') {
    const minutes = validationData.timeSpent / 60;
    if (minutes >= 10) bonus += 0.2; // Bonus for spending time to really learn
    else if (minutes >= 5) bonus += 0.1;
  }
  
  // Speed bonus for time-based challenges
  if (mission.type === 'velocidad_relámpago' && validationData.timeSpent) {
    const timeTarget = mission.metadata?.timeTarget || 300; // 5 minutes default
    if (validationData.timeSpent <= timeTarget * 0.8) bonus += 0.25;
    else if (validationData.timeSpent <= timeTarget) bonus += 0.1;
  }
  
  return Math.max(0.5, Math.min(2.0, bonus)); // Cap bonus between 50% and 200%
}

// calculateLevel and getWeekStart functions moved to shared.ts

function getMostFrequentMissionType(history: any[]) {
  const typeCounts = new Map();
  history.forEach(h => {
    const type = h.missionId.split('_')[1] || 'unknown';
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  });
  
  let maxCount = 0;
  let mostFrequent = 'exploration';
  
  typeCounts.forEach((count, type) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = type;
    }
  });
  
  return mostFrequent;
}

async function checkMissionAchievements(ctx: any, userId: any, completedCount: number, allCompleted: boolean) {
  const userStats = await ctx.db
    .query('userStats')
    .withIndex('byUser', (q: any) => q.eq('userId', userId))
    .unique();

  if (!userStats) return [];

  const currentAchievements = userStats.achievements || [];
  const earnedAchievementIds = new Set(currentAchievements.map((a: any) => a.id));
  const now = Math.floor(Date.now() / 1000);

  const newAchievements: any[] = [];

  // Daily Completionist: Complete all daily missions
  if (allCompleted && !earnedAchievementIds.has('daily_completionist')) {
    newAchievements.push({
      id: 'daily_completionist',
      title: 'Daily Completionist',
      description: 'Complete all daily missions in a single day',
      iconType: 'completion',
      earnedAt: now,
      points: 100,
    });
  }

  // Mission Streak achievements
  const missionHistory = await ctx.db
    .query('userMissionHistory')
    .withIndex('byUser', (q: any) => q.eq('userId', userId))
    .collect();

  // Calculate current mission streak
  let currentStreak = 0;
  let checkDate = new Date();
  for (let i = 0; i < 30; i++) { // Check last 30 days
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayCompletions = missionHistory.filter((h: any) =>
      h.date === dateStr && h.completed && h.completedAt
    ).length;

    if (dayCompletions >= 3) { // At least 3 missions completed that day
      currentStreak++;
    } else {
      break;
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Mission Streak: 3-day streak
  if (currentStreak >= 3 && !earnedAchievementIds.has('mission_streak_3')) {
    newAchievements.push({
      id: 'mission_streak_3',
      title: 'Mission Streak: 3 Days',
      description: 'Complete daily missions for 3 consecutive days',
      iconType: 'streak',
      earnedAt: now,
      points: 75,
    });
  }

  // Mission Streak: 7-day streak
  if (currentStreak >= 7 && !earnedAchievementIds.has('mission_streak_7')) {
    newAchievements.push({
      id: 'mission_streak_7',
      title: 'Mission Streak: 7 Days',
      description: 'Complete daily missions for 7 consecutive days',
      iconType: 'streak',
      earnedAt: now,
      points: 150,
    });
  }

  // Mission Streak: 30-day streak
  if (currentStreak >= 30 && !earnedAchievementIds.has('mission_streak_30')) {
    newAchievements.push({
      id: 'mission_streak_30',
      title: 'Mission Master',
      description: 'Complete daily missions for 30 consecutive days',
      iconType: 'streak',
      earnedAt: now,
      points: 500,
    });
  }

  // Total missions completed milestone
  const totalCompleted = missionHistory.filter((h: any) => h.completed).length;

  if (totalCompleted >= 10 && !earnedAchievementIds.has('mission_enthusiast_10')) {
    newAchievements.push({
      id: 'mission_enthusiast_10',
      title: 'Mission Enthusiast',
      description: 'Complete 10 daily missions',
      iconType: 'completion',
      earnedAt: now,
      points: 50,
    });
  }

  if (totalCompleted >= 50 && !earnedAchievementIds.has('mission_enthusiast_50')) {
    newAchievements.push({
      id: 'mission_enthusiast_50',
      title: 'Mission Veteran',
      description: 'Complete 50 daily missions',
      iconType: 'completion',
      earnedAt: now,
      points: 150,
    });
  }

  if (totalCompleted >= 100 && !earnedAchievementIds.has('mission_enthusiast_100')) {
    newAchievements.push({
      id: 'mission_enthusiast_100',
      title: 'Mission Legend',
      description: 'Complete 100 daily missions',
      iconType: 'completion',
      earnedAt: now,
      points: 300,
    });
  }

  return newAchievements;
}

// Seed daily mission templates
export const seedMissionTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    // Only run if templates don't exist
    const existing = await ctx.db.query('dailyMissionTemplates').collect();
    if (existing.length > 0) return { message: "Templates already exist" };

    const templates = [
      // Easy missions (Aprendiz)
      { type: 'racha_guerrera', title: 'El Despertar del Aprendiz', description: 'Completa 2 pruebas guerreras hoy', target: 2, difficulty: 'escudero', esenciaReward: 30, validationRules: { maxAttemptsPerHour: 10, minTimeSpent: 30, accuracyThreshold: 0.6, cooldownPeriod: 60, duplicateSubmissionWindow: 300 }, active: true },
      { type: 'dominio_sabio', title: 'Sabiduría Matemática', description: 'Completa 1 prueba de matemáticas con 70%+ de precisión', target: 1, difficulty: 'escudero', esenciaReward: 25, validationRules: { maxAttemptsPerHour: 10, minTimeSpent: 30, accuracyThreshold: 0.7, cooldownPeriod: 60, duplicateSubmissionWindow: 300 }, active: true, conditions: { subjects: ['Matemáticas'] } },
      { type: 'exploración_mística', title: 'Explorador de Saberes', description: 'Prueba una materia nueva por primera vez', target: 1, difficulty: 'escudero', esenciaReward: 35, validationRules: { maxAttemptsPerHour: 10, minTimeSpent: 30, accuracyThreshold: 0.6, cooldownPeriod: 60, duplicateSubmissionWindow: 300 }, active: true },
      { type: 'precisión_letal', title: 'Primeros Pasos Firmes', description: 'Alcanza 60%+ en cualquier prueba', target: 1, difficulty: 'escudero', esenciaReward: 20, validationRules: { maxAttemptsPerHour: 10, minTimeSpent: 30, accuracyThreshold: 0.6, cooldownPeriod: 60, duplicateSubmissionWindow: 300 }, active: true },

      // Medium missions (Guerrero)
      { type: 'racha_guerrera', title: 'Guerrero Dedicado', description: 'Completa 5 pruebas guerreras hoy', target: 5, difficulty: 'guerrero', esenciaReward: 75, validationRules: { maxAttemptsPerHour: 8, minTimeSpent: 45, accuracyThreshold: 0.7, cooldownPeriod: 90, duplicateSubmissionWindow: 300 }, active: true },
      { type: 'velocidad_relámpago', title: 'Lector Veloz', description: 'Completa una prueba en menos de 90 segundos', target: 1, difficulty: 'guerrero', esenciaReward: 50, validationRules: { maxAttemptsPerHour: 8, minTimeSpent: 45, accuracyThreshold: 0.7, cooldownPeriod: 90, duplicateSubmissionWindow: 300 }, active: true },
      { type: 'precisión_letal', title: 'Alto Rendimiento', description: 'Alcanza 80%+ en 2 pruebas diferentes', target: 2, difficulty: 'guerrero', esenciaReward: 60, validationRules: { maxAttemptsPerHour: 8, minTimeSpent: 45, accuracyThreshold: 0.8, cooldownPeriod: 90, duplicateSubmissionWindow: 300 }, active: true },
      { type: 'dominio_sabio', title: 'Especialista en Ciencias', description: 'Alcanza 75%+ en 2 pruebas de ciencias', target: 2, difficulty: 'guerrero', esenciaReward: 55, validationRules: { maxAttemptsPerHour: 8, minTimeSpent: 45, accuracyThreshold: 0.75, cooldownPeriod: 90, duplicateSubmissionWindow: 300 }, active: true, conditions: { subjects: ['Ciencias'] } },

      // Hard missions (Paladín)
      { type: 'precisión_letal', title: 'Perfeccionista Arcano', description: 'Alcanza 95%+ en cualquier prueba', target: 1, difficulty: 'paladín', esenciaReward: 100, validationRules: { maxAttemptsPerHour: 6, minTimeSpent: 60, accuracyThreshold: 0.95, cooldownPeriod: 120, duplicateSubmissionWindow: 300 }, active: true, conditions: { minLevel: 5 } },
      { type: 'racha_guerrera', title: 'Máquina de Pruebas', description: 'Completa 8 pruebas con 70%+ de promedio', target: 8, difficulty: 'paladín', esenciaReward: 120, validationRules: { maxAttemptsPerHour: 6, minTimeSpent: 60, accuracyThreshold: 0.7, cooldownPeriod: 120, duplicateSubmissionWindow: 300 }, active: true, conditions: { minLevel: 3 } },
      { type: 'velocidad_relámpago', title: 'Relámpago Veloz', description: 'Completa 3 pruebas en menos de 60 segundos cada una', target: 3, difficulty: 'paladín', esenciaReward: 90, validationRules: { maxAttemptsPerHour: 6, minTimeSpent: 60, accuracyThreshold: 0.8, cooldownPeriod: 120, duplicateSubmissionWindow: 300 }, active: true, conditions: { minLevel: 5 } },
      { type: 'dominio_sabio', title: 'Amenaza Triple', description: 'Alcanza 80%+ en 3 materias diferentes', target: 3, difficulty: 'paladín', esenciaReward: 110, validationRules: { maxAttemptsPerHour: 6, minTimeSpent: 60, accuracyThreshold: 0.8, cooldownPeriod: 120, duplicateSubmissionWindow: 300 }, active: true, conditions: { minLevel: 7 } },

      // Legendary missions (Leyenda)
      { type: 'precisión_letal', title: 'Victoria Impecable', description: 'Alcanza 100% en 2 pruebas diferentes', target: 2, difficulty: 'leyenda', esenciaReward: 200, validationRules: { maxAttemptsPerHour: 4, minTimeSpent: 90, accuracyThreshold: 1.0, cooldownPeriod: 180, duplicateSubmissionWindow: 300 }, active: true, conditions: { minLevel: 15 } },
      { type: 'racha_guerrera', title: 'Fuerza Inquebrantable', description: 'Completa 15 pruebas con 85%+ de promedio', target: 15, difficulty: 'leyenda', esenciaReward: 300, validationRules: { maxAttemptsPerHour: 4, minTimeSpent: 90, accuracyThreshold: 0.85, cooldownPeriod: 180, duplicateSubmissionWindow: 300 }, active: true, conditions: { minLevel: 20 } },
      { type: 'velocidad_relámpago', title: 'Velocidad de la Luz', description: 'Completa 5 pruebas en menos de 30 segundos cada una con 90%+', target: 5, difficulty: 'leyenda', esenciaReward: 250, validationRules: { maxAttemptsPerHour: 4, minTimeSpent: 90, accuracyThreshold: 0.9, cooldownPeriod: 180, duplicateSubmissionWindow: 300 }, active: true, conditions: { minLevel: 25 } },
    ];

    // Insert all templates
    for (const template of templates) {
      await ctx.db.insert('dailyMissionTemplates', template);
    }
  },
});