import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Get current user helper function
async function getUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  
  const user = await ctx.db
    .query("users")
    .withIndex("byClerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
    
  if (!user) throw new Error("User not found");
  return user;
}

// Get today's daily missions for a user
export const getTodaysMissions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const today = new Date().toISOString().split('T')[0];
    
    // Get user stats to check current progress
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    // Check if user already has missions for today
    if (userStats?.dailyMissions?.date === today) {
      return {
        missions: userStats.dailyMissions.missions,
        completedCount: userStats.dailyMissions.completedCount,
        streakBonus: userStats.dailyMissions.streakBonus,
        date: today,
      };
    }

    // Generate new missions for today
    const newMissions = await generateDailyMissions(ctx, user, userStats);
    
    // Update user stats with new missions
    if (userStats) {
      await ctx.db.patch(userStats._id, {
        dailyMissions: {
          date: today,
          missions: newMissions,
          completedCount: 0,
          streakBonus: calculateStreakBonus(userStats),
        },
        updatedAt: Math.floor(Date.now() / 1000),
      });
    }

    return {
      missions: newMissions,
      completedCount: 0,
      streakBonus: calculateStreakBonus(userStats),
      date: today,
    };
  },
});

// Update mission progress
export const updateMissionProgress = mutation({
  args: {
    missionId: v.string(),
    progressIncrement: v.number(),
  },
  handler: async (ctx, { missionId, progressIncrement }) => {
    const user = await getUser(ctx);
    const today = new Date().toISOString().split('T')[0];
    
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

    // Update progress
    const newProgress = Math.min(mission.progress + progressIncrement, mission.target);
    missions[missionIndex] = {
      ...mission,
      progress: newProgress,
      completed: newProgress >= mission.target,
    };

    // Calculate completed count
    const completedCount = missions.filter(m => m.completed).length;
    
    // Award points if mission just completed
    let pointsAwarded = 0;
    let newAchievements: any[] = [];
    
    if (missions[missionIndex].completed && !mission.completed) {
      pointsAwarded = mission.reward.points;
      
      // Check for mission completion achievements
      if (completedCount === missions.length) {
        // All daily missions completed - bonus points
        pointsAwarded += userStats.dailyMissions.streakBonus;
        
        // Check for achievement: Daily Completionist
        newAchievements = await checkMissionAchievements(ctx, user._id, completedCount, true);
      }

      // Update user points and experience
      const newTotalPoints = (userStats.totalPoints || 0) + pointsAwarded;
      const newXP = (userStats.experiencePoints || 0) + pointsAwarded;
      const levelInfo = calculateLevel(newXP);

      await ctx.db.patch(userStats._id, {
        dailyMissions: {
          ...userStats.dailyMissions,
          missions,
          completedCount,
        },
        totalPoints: newTotalPoints,
        experiencePoints: newXP,
        level: levelInfo.level,
        pointsToNextLevel: levelInfo.pointsToNext,
        updatedAt: Math.floor(Date.now() / 1000),
      });

      // Log mission completion
      await ctx.db.insert('userMissionHistory', {
        userId: user._id,
        date: today,
        missionId,
        completed: true,
        completedAt: Math.floor(Date.now() / 1000),
        progress: newProgress,
        pointsEarned: pointsAwarded,
      });

      return {
        missionCompleted: true,
        pointsAwarded,
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
    const today = new Date().toISOString().split('T')[0];
    
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
    const weekStartDate = new Date(weekStart * 1000).toISOString().split('T')[0];
    
    const leaderboard = await ctx.db
      .query('userMissionHistory')
      .filter(q => q.gte(q.field('date'), weekStartDate))
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
        const user = await ctx.db.get(userId);
        return {
          userId,
          name: user?.name || 'Anonymous',
          completions,
          isCurrentUser: userId === user._id,
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
        favoriteType: getmostfrequentmissiontype(history),
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
    .withIndex('byActive', q => q.eq('active', true))
    .collect();

  // Filter templates based on user level and conditions
  const availableTemplates = templates.filter(template => {
    if (template.conditions?.minLevel && level < template.conditions.minLevel) return false;
    if (template.conditions?.maxLevel && level > template.conditions.maxLevel) return false;
    if (template.conditions?.weekday && !template.conditions.weekday.includes(dayOfWeek)) return false;
    return true;
  });

  // Select 3-4 missions of varying difficulty
  const missions = [];
  const difficulties = ['easy', 'medium', 'hard'];
  
  // Always include one easy mission
  const easyMissions = availableTemplates.filter(t => t.difficulty === 'easy');
  if (easyMissions.length > 0) {
    const selected = easyMissions[Math.floor(Math.random() * easyMissions.length)];
    missions.push(createMissionFromTemplate(selected));
  }

  // Add medium difficulty mission
  const mediumMissions = availableTemplates.filter(t => t.difficulty === 'medium');
  if (mediumMissions.length > 0) {
    const selected = mediumMissions[Math.floor(Math.random() * mediumMissions.length)];
    missions.push(createMissionFromTemplate(selected));
  }

  // Add hard mission for higher level users
  if (level >= 5) {
    const hardMissions = availableTemplates.filter(t => t.difficulty === 'hard');
    if (hardMissions.length > 0) {
      const selected = hardMissions[Math.floor(Math.random() * hardMissions.length)];
      missions.push(createMissionFromTemplate(selected));
    }
  }

  // Add legendary mission for very high level users (with lower probability)
  if (level >= 15 && Math.random() < 0.3) {
    const legendaryMissions = availableTemplates.filter(t => t.difficulty === 'legendary');
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
      points: template.points,
      bonus: template.bonusreward,
    },
    difficulty: template.difficulty
  };
}

function calculateStreakBonus(userStats: any) {
  // Bonus points for completing all daily missions
  const baseBonus = 50;
  const level = userStats?.level || 1;
  const streakMultiplier = Math.min(level / 10, 3); // Max 3x multiplier
  return Math.floor(baseBonus * (1 + streakMultiplier));
}

function calculateLevel(experiencePoints: number): { level: number; pointsToNext: number }

 {
  // Same level calculation as in userStats.ts
  let level = 1;
  let pointsNeededForNextLevel = 100;
  let totalPointsNeeded = 0;

  while (experiencePoints >= totalPointsNeeded + pointsNeededForNextLevel) {
    totalPointsNeeded += pointsNeededForNextLevel;
    level++;
    pointsNeededForNextLevel = Math.floor(100 * Math.pow(1.2, level - 1));
  }

  const pointsToNext = pointsNeededForNextLevel - (experiencePoints - totalPointsNeeded);
  return { level, pointsToNext };
}

function getWeekStart(timestamp: number): number {
  const date = new Date(timestamp * 1000);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

function getmostfrequentmissiontype(history: any[]) {
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
  // Implementation for mission-related achievements
  // This would check for achievements like "Daily Completionist", "Mission Streak", etc.
  return [];
}

// Seed daily mission templates
export const seedMissionTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    // Only run if templates don't exist
    const existing = await ctx.db.query('dailyMissionTemplates').collect();
    if (existing.length > 0) return { message: "Templates already exist" };

    const templates = [
      // Easy missions
      { type: 'quiz_streak', title: 'Quick Learner', description: 'Complete 2 quizzes today', target: 2, difficulty: 'easy', points: 30, active: true },
      { type: 'subject_focus', title: 'Math Focus', description: 'Complete 1 math quiz with 70%+ score', target: 1, difficulty: 'easy', points: 25, active: true, conditions: { subjects: ['Matemáticas'] } },
      { type: 'exploration', title: 'Subject Explorer', description: 'Try a quiz in a new subject', target: 1, difficulty: 'easy', points: 35, active: true },
      { type: 'accuracy_test', title: 'Steady Progress', description: 'Score 60%+ on any quiz', target: 1, difficulty: 'easy', points: 20, active: true },
      
      // Medium missions
      { type: 'quiz_streak', title: 'Dedicated Student', description: 'Complete 5 quizzes today', target: 5, difficulty: 'medium', points: 75, active: true },
      { type: 'speed_challenge', title: 'Speed Reader', description: 'Complete a quiz in under 90 seconds', target: 1, difficulty: 'medium', points: 50, active: true },
      { type: 'accuracy_test', title: 'High Achiever', description: 'Score 80%+ on 2 different quizzes', target: 2, difficulty: 'medium', points: 60, active: true },
      { type: 'subject_focus', title: 'Science Specialist', description: 'Score 75%+ on 2 science quizzes', target: 2, difficulty: 'medium', points: 55, active: true, conditions: { subjects: ['Ciencias'] } },
      
      // Hard missions
      { type: 'accuracy_test', title: 'Perfectionist', description: 'Score 95%+ on any quiz', target: 1, difficulty: 'hard', points: 100, active: true, conditions: { minLevel: 5 } },
      { type: 'quiz_streak', title: 'Quiz Machine', description: 'Complete 8 quizzes with 70%+ average', target: 8, difficulty: 'hard', points: 120, active: true, conditions: { minLevel: 3 } },
      { type: 'speed_challenge', title: 'Lightning Fast', description: 'Complete 3 quizzes in under 60 seconds each', target: 3, difficulty: 'hard', points: 90, active: true, conditions: { minLevel: 5 } },
      { type: 'subject_focus', title: 'Triple Threat', description: 'Score 80%+ in 3 different subjects', target: 3, difficulty: 'hard', points: 110, active: true, conditions: { minLevel: 7 } },
      
      // Legendary missions  
      { type: 'accuracy_test', title: 'Flawless Victory', description: 'Score 100% on 2 different quizzes', target: 2, difficulty: 'legendary', points: 200, active: true, conditions: { minLevel: 15 } },
      { type: 'quiz_streak', title: 'Unstoppable Force', description: 'Complete 15 quizzes with 85%+ average', target: 15, difficulty: 'legendary', points: 300, active: true, conditions: { minLevel: 20 } },
      { type: 'speed_challenge', title: 'Speed of Light', description: 'Complete 5 quizzes in under 30 seconds each with 90%+ score', target: 5, difficulty: 'legendary', points: 250, active: true, conditions: { minLevel: 25 } },
    ];

    // Insert all templates
    for (const template of templates) {
      await ctx.db.insert('dailyMissionTemplates', template);
    }
  },
});