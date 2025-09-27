import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUser, calculateLevel } from "./shared";

// ===== LEARNING-OUTCOME FOCUSED REWARDS SYSTEM =====

// Get user's educational rewards and meaningful spending options
export const getUserLearningRewards = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    let userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    // Get user stats for context
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userRewards) {
      // Initialize with learning-focused rewards
      const now = Math.floor(Date.now() / 1000);
      userRewards = await initializeUserLearningRewards(ctx, user._id);
    }

    // Get available learning enhancements
    const availableEnhancements = await getAvailableLearningEnhancements(ctx, userStats);

    return {
      ...userRewards,
      currentEsencia: userStats?.esenciaArcana || 0,
      availableEnhancements,
    };
  },
});

// Purchase learning enhancement (meaningful Esencia Arcana spending)
export const purchaseLearningEnhancement = mutation({
  args: {
    enhancementId: v.string(),
    esenciaCost: v.number(),
  },
  handler: async (ctx, { enhancementId, esenciaCost }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);

    // Get user stats and rewards
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    let userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userStats) throw new Error('User stats not found');
    if (!userRewards) {
      userRewards = await initializeUserLearningRewards(ctx, user._id);
    }

    const currentEsencia = userStats.esenciaArcana || 0;
    if (currentEsencia < esenciaCost) {
      throw new Error('Insufficient Esencia Arcana');
    }

    // Get enhancement details
    const enhancement = await ctx.db
      .query('rewardsCatalog')
      .filter(q => q.eq(q.field('itemId'), enhancementId))
      .unique();

    if (!enhancement) throw new Error('Enhancement not found');

    // Check if already owned
    const alreadyOwned = isEnhancementOwned(enhancement, userRewards);
    if (alreadyOwned) throw new Error('Enhancement already owned');

    // Validate educational value requirements
    const canPurchase = validateEducationalRequirements(enhancement, userStats);
    if (!canPurchase.valid) {
      throw new Error(`Requirements not met: ${canPurchase.reason}`);
    }

    try {
      // Atomic transaction: deduct Esencia and add enhancement
      await ctx.db.patch(userStats._id, {
        esenciaArcana: currentEsencia - esenciaCost,
        updatedAt: now,
      });

      // Add enhancement to user rewards
      const updatedRewards = { ...userRewards };
      addEnhancementToUser(enhancement, updatedRewards, now);

      await ctx.db.patch(userRewards._id, {
        ...updatedRewards,
        purchases: [
          ...updatedRewards.purchases,
          {
            itemId: enhancementId,
            itemType: enhancement.itemType,
            cost: esenciaCost,
            purchasedAt: now,
            valueReceived: enhancement.educationalValue,
          }
        ],
        totalEsenciaSpent: (updatedRewards.totalEsenciaSpent || 0) + esenciaCost,
        valueCreated: (updatedRewards.valueCreated || 0) + (enhancement.impact?.learningAcceleration || 1),
        updatedAt: now,
      });

      // Log the purchase event
      await ctx.db.insert('progressEvents', {
        userId: user._id,
        subject: 'Learning Enhancement',
        kind: 'enhancement_purchased',
        value: esenciaCost,
        createdAt: now,
        metadata: {
          enhancementType: enhancement.itemType,
          educationalValue: enhancement.educationalValue,
          learningAcceleration: enhancement.impact?.learningAcceleration || 0,
        }
      });

      return {
        success: true,
        enhancementPurchased: {
          id: enhancement.itemId,
          name: enhancement.name,
          type: enhancement.itemType,
          educationalValue: enhancement.educationalValue,
          cost: esenciaCost,
        },
        remainingEsencia: currentEsencia - esenciaCost,
        valueCreated: enhancement.impact?.learningAcceleration || 1,
      };

    } catch (error) {
      console.error('Purchase failed:', error);
      throw new Error('Purchase failed. Please try again.');
    }
  }
});

// Activate learning boost
export const activateLearningBoost = mutation({
  args: {
    boostId: v.string(),
  },
  handler: async (ctx, { boostId }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);

    const userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userRewards) throw new Error('User rewards not found');

    const boost = userRewards.learningBoosts.find(b => b.id === boostId);
    if (!boost) throw new Error('Learning boost not found');
    if (boost.usesRemaining !== undefined && boost.usesRemaining <= 0) {
      throw new Error('No uses remaining for this boost');
    }

    // Activate the boost
    const updatedBoosts = userRewards.learningBoosts.map(b => 
      b.id === boostId 
        ? {
            ...b,
            isActive: true,
            usesRemaining: b.usesRemaining ? b.usesRemaining - 1 : b.usesRemaining,
            expiresAt: b.duration ? now + b.duration : undefined,
          }
        : b
    );

    await ctx.db.patch(userRewards._id, {
      learningBoosts: updatedBoosts,
      updatedAt: now,
    });

    // Log activation
    await ctx.db.insert('progressEvents', {
      userId: user._id,
      subject: 'Learning Boost',
      kind: 'boost_activated',
      value: 1,
      createdAt: now,
      metadata: {
        boostType: boost.effect,
        duration: boost.duration,
        usesRemaining: boost.usesRemaining ? boost.usesRemaining - 1 : undefined,
      }
    });

    return {
      success: true,
      boostActivated: {
        name: boost.name,
        effect: boost.effect,
        duration: boost.duration,
        expiresAt: boost.duration ? now + boost.duration : undefined,
      }
    };
  }
});

// Get learning analytics and recommendations
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

    // Get recent progress events for analysis
    const recentEvents = await ctx.db
      .query('progressEvents')
      .withIndex('byUserCreatedAt', q => 
        q.eq('userId', user._id).gte('createdAt', thirtyDaysAgo)
      )
      .collect();

    // Get recent quiz attempts for learning pattern analysis
    const recentAttempts = await ctx.db
      .query('attempts')
      .withIndex('byUserCompletedAt', q => 
        q.eq('userId', user._id).gte('completedAt', thirtyDaysAgo)
      )
      .collect();

    // Calculate learning metrics
    const learningMetrics = calculateLearningMetrics(recentEvents, recentAttempts, userStats);
    
    // Generate personalized recommendations
    const recommendations = generateLearningRecommendations(learningMetrics, userStats);

    return {
      currentLevel: userStats.level,
      esenciaArcana: userStats.esenciaArcana || 0,
      learningMetrics,
      recommendations,
      spacedRepetition: userStats.spacedRepetition,
      weeklyGoals: userStats.weeklyGoals,
    };
  }
});

// Helper functions
async function initializeUserLearningRewards(ctx: any, userId: string) {
  const now = Math.floor(Date.now() / 1000);
  
  const rewardsId = await ctx.db.insert('userRewards', {
    userId,
    learningBoosts: [],
    exclusiveContent: [],
    assistanceTools: [],
    recognitionItems: [],
    services: [],
    purchases: [],
    profileCustomization: {
      learningStreak: 0,
      masteryBadges: [],
    },
    totalEsenciaEarned: 0,
    totalEsenciaSpent: 0,
    valueCreated: 0,
    createdAt: now,
    updatedAt: now,
  });

  return await ctx.db.get(rewardsId);
}

async function getAvailableLearningEnhancements(ctx: any, userStats: any) {
  const userLevel = userStats?.level || 1;
  const conceptsMastered = userStats?.learningMetrics?.conceptsMastered || 0;
  const retentionRate = userStats?.spacedRepetition?.retentionRate || 0;

  const catalog = await ctx.db
    .query('rewardsCatalog')
    .withIndex('byActive', q => q.eq('isActive', true))
    .collect();

  return catalog.filter(item => {
    const requirements = item.unlockRequirements;
    
    // Check level requirement
    if (requirements.minLevel && userLevel < requirements.minLevel) return false;
    
    // Check concept mastery requirement
    if (requirements.conceptsMastered && 
        requirements.conceptsMastered.length > conceptsMastered) return false;
    
    // Check retention requirement
    if (requirements.retentionPeriod && retentionRate < 80) return false;
    
    return true;
  }).map(item => ({
    ...item,
    canAfford: (userStats?.esenciaArcana || 0) >= (item.unlockRequirements.esenciaCost || 0),
    educationalBenefit: item.impact?.learningAcceleration || 1,
  }));
}

function isEnhancementOwned(enhancement: any, userRewards: any): boolean {
  switch (enhancement.itemType) {
    case 'learning_boost':
      return userRewards.learningBoosts.some((b: any) => b.id === enhancement.itemId);
    case 'exclusive_content':
      return userRewards.exclusiveContent.some((c: any) => c.id === enhancement.itemId);
    case 'assistance_tool':
      return userRewards.assistanceTools.some((t: any) => t.id === enhancement.itemId);
    case 'recognition_item':
      return userRewards.recognitionItems.some((r: any) => r.id === enhancement.itemId);
    default:
      return false;
  }
}

function validateEducationalRequirements(enhancement: any, userStats: any) {
  const requirements = enhancement.unlockRequirements;
  const metrics = userStats.learningMetrics || {};

  if (requirements.conceptsMastered && 
      requirements.conceptsMastered.length > metrics.conceptsMastered) {
    return {
      valid: false,
      reason: `Need to master ${requirements.conceptsMastered.length - metrics.conceptsMastered} more concepts`
    };
  }

  if (requirements.retentionPeriod && 
      (userStats.spacedRepetition?.retentionRate || 0) < 80) {
    return {
      valid: false,
      reason: 'Need to improve knowledge retention rate to 80%+'
    };
  }

  if (requirements.improvementRequired && 
      metrics.averageImprovement < requirements.improvementRequired) {
    return {
      valid: false,
      reason: `Need to show ${requirements.improvementRequired}% improvement`
    };
  }

  return { valid: true };
}

function addEnhancementToUser(enhancement: any, userRewards: any, now: number) {
  const newItem = {
    id: enhancement.itemId,
    name: enhancement.name,
    description: enhancement.description,
    unlockedAt: now,
    isActive: false,
  };

  switch (enhancement.itemType) {
    case 'learning_boost':
      userRewards.learningBoosts.push({
        ...newItem,
        effect: enhancement.category,
        duration: enhancement.cooldownPeriod,
        usesRemaining: enhancement.maxUsages,
      });
      break;
    case 'exclusive_content':
      userRewards.exclusiveContent.push({
        ...newItem,
        type: enhancement.category,
        subject: enhancement.impact?.applicability?.[0],
        difficulty: enhancement.impact?.difficulty || 'guerrero',
      });
      break;
    case 'assistance_tool':
      userRewards.assistanceTools.push({
        ...newItem,
        toolType: enhancement.category,
        usageCount: 0,
        maxUsages: enhancement.maxUsages,
      });
      break;
    case 'recognition_item':
      userRewards.recognitionItems.push({
        ...newItem,
        type: enhancement.category,
        rarity: enhancement.visual.rarity,
        earnedFor: 'purchase',
      });
      break;
  }
}

function calculateLearningMetrics(events: any[], attempts: any[], userStats: any) {
  const now = Math.floor(Date.now() / 1000);
  const oneWeekAgo = now - 7 * 24 * 3600;

  // Learning velocity (concepts per week)
  const recentMasteryEvents = events.filter(e => 
    e.kind === 'mission_completed' && 
    e.metadata?.conceptsEngaged > 0 &&
    e.createdAt >= oneWeekAgo
  );
  const conceptsThisWeek = recentMasteryEvents.reduce((sum, e) => 
    sum + (e.metadata?.conceptsEngaged || 0), 0
  );

  // Retention consistency
  const retentionEvents = events.filter(e => 
    e.kind === 'retention_verified' && 
    e.createdAt >= oneWeekAgo
  );
  const retentionRate = retentionEvents.length > 0 ? 
    retentionEvents.reduce((sum, e) => sum + (e.value || 0), 0) / retentionEvents.length : 0;

  // Difficulty progression
  const difficultyProgression = attempts.length > 5 ? 
    calculateDifficultyTrend(attempts.slice(-10)) : 0;

  // Learning efficiency (esencia per hour)
  const totalEsenciaThisWeek = events
    .filter(e => e.createdAt >= oneWeekAgo && e.metadata?.esenciaAwarded)
    .reduce((sum, e) => sum + (e.metadata?.esenciaAwarded || 0), 0);
  
  const totalTimeThisWeek = events
    .filter(e => e.createdAt >= oneWeekAgo && e.metadata?.duration)
    .reduce((sum, e) => sum + (e.metadata?.duration || 0), 0);

  const learningEfficiency = totalTimeThisWeek > 0 ? 
    totalEsenciaThisWeek / (totalTimeThisWeek / 3600) : 0;

  return {
    conceptsPerWeek: conceptsThisWeek,
    retentionRate: Math.round(retentionRate * 100),
    difficultyProgression,
    learningEfficiency: Math.round(learningEfficiency),
    streak: userStats.currentStreak || 0,
    totalConceptsMastered: userStats.learningMetrics?.conceptsMastered || 0,
  };
}

function calculateDifficultyTrend(attempts: any[]) {
  if (attempts.length < 5) return 0;
  
  const difficultyScores = attempts.map(a => {
    switch (a.difficulty) {
      case 'leyenda': return 4;
      case 'paladín': return 3;
      case 'guerrero': return 2;
      case 'escudero': return 1;
      default: return 1;
    }
  });

  const firstHalf = difficultyScores.slice(0, Math.floor(difficultyScores.length / 2));
  const secondHalf = difficultyScores.slice(Math.floor(difficultyScores.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  return Math.round((secondAvg - firstAvg) * 25); // Convert to percentage
}

function generateLearningRecommendations(metrics: any, userStats: any) {
  const recommendations = [];
  const currentLevel = userStats.level || 1;

  // Concept mastery recommendations
  if (metrics.conceptsPerWeek < 3) {
    recommendations.push({
      type: 'concept_focus',
      title: 'Acelera tu Dominio Conceptual',
      description: 'Enfócate en dominar 1-2 conceptos nuevos por día',
      priority: 'high',
      expectedBenefit: '+50% Esencia Arcana por concepto dominado',
    });
  }

  // Retention recommendations
  if (metrics.retentionRate < 80) {
    recommendations.push({
      type: 'retention_improvement',
      title: 'Mejora tu Retención',
      description: 'Usa repetición espaciada para retener conocimientos',
      priority: 'high',
      expectedBenefit: 'Bonificaciones de retención de hasta 50 Esencia',
    });
  }

  // Difficulty progression
  if (metrics.difficultyProgression < 10 && currentLevel > 5) {
    recommendations.push({
      type: 'difficulty_challenge',
      title: 'Desafíate con Contenido Más Difícil',
      description: 'Intenta misiones de dificultad Paladín o Leyenda',
      priority: 'medium',
      expectedBenefit: 'Multiplicadores de 2x-2.5x en recompensas',
    });
  }

  // Learning efficiency
  if (metrics.learningEfficiency < 20 && currentLevel > 3) {
    recommendations.push({
      type: 'efficiency_boost',
      title: 'Optimiza tu Tiempo de Estudio',
      description: 'Usa herramientas de asistencia para estudiar más eficientemente',
      priority: 'medium',
      expectedBenefit: 'Hasta 30% más Esencia por hora de estudio',
    });
  }

  return recommendations;
}

// Seed learning-focused rewards catalog
export const seedLearningRewardsCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('rewardsCatalog').first();
    if (existing) return { message: "Catalog already exists" };

    const now = Math.floor(Date.now() / 1000);
    const catalogItems = [
      // Learning Boosts
      {
        itemId: 'concept_revealer',
        itemType: 'learning_boost',
        name: 'Revelador de Conceptos',
        description: 'Revela conexiones ocultas entre conceptos mientras estudias',
        category: 'concept_reveal',
        educationalValue: 'Mejora comprensión conceptual y facilita el aprendizaje profundo',
        unlockRequirements: {
          type: 'mastery',
          esenciaCost: 150,
          conceptsMastered: ['basic_math', 'basic_science'],
        },
        impact: {
          learningAcceleration: 1.3,
          applicability: ['Matemáticas', 'Ciencias', 'Física'],
          difficulty: 'guerrero',
        },
        visual: { rarity: 'guerrero', color: '#4CAF50' },
        isActive: true,
        maxUsages: 5,
        cooldownPeriod: 7200, // 2 hours
        sortOrder: 1,
        createdAt: now,
      },
      {
        itemId: 'retention_enhancer',
        itemType: 'learning_boost',
        name: 'Potenciador de Retención',
        description: 'Mejora significativamente la retención de conocimientos',
        category: 'retention_boost',
        educationalValue: 'Aumenta la retención a largo plazo en 40%',
        unlockRequirements: {
          type: 'retention',
          esenciaCost: 200,
          retentionPeriod: 14,
        },
        impact: {
          retentionImprovement: 0.4,
          applicability: ['Todas las materias'],
          difficulty: 'paladín',
        },
        visual: { rarity: 'paladín', color: '#2196F3' },
        isActive: true,
        maxUsages: 3,
        cooldownPeriod: 86400, // 24 hours
        sortOrder: 2,
        createdAt: now,
      },

      // Exclusive Content
      {
        itemId: 'advanced_strategies',
        itemType: 'exclusive_content',
        name: 'Estrategias Avanzadas PAES',
        description: 'Técnicas exclusivas de resolución rápida y efectiva',
        category: 'expert_strategies',
        educationalValue: 'Mejora velocidad y precisión en exámenes PAES',
        unlockRequirements: {
          type: 'achievement',
          achievementIds: ['quiz_machine', 'high_achiever'],
          esenciaCost: 300,
        },
        impact: {
          learningAcceleration: 1.5,
          masteryDepth: 0.8,
          applicability: ['PAES', 'Exámenes'],
          difficulty: 'paladín',
        },
        visual: { rarity: 'paladín', color: '#FF9800' },
        isActive: true,
        sortOrder: 10,
        createdAt: now,
      },

      // Assistance Tools
      {
        itemId: 'weakness_analyzer',
        itemType: 'assistance_tool',
        name: 'Analizador de Debilidades',
        description: 'Identifica automáticamente tus áreas de mejora más críticas',
        category: 'weakness_identifier',
        educationalValue: 'Optimiza tu tiempo de estudio identificando gaps específicos',
        unlockRequirements: {
          type: 'improvement',
          improvementRequired: 20,
          esenciaCost: 250,
        },
        impact: {
          learningAcceleration: 1.4,
          applicability: ['Análisis de rendimiento'],
          difficulty: 'guerrero',
        },
        visual: { rarity: 'guerrero', color: '#9C27B0' },
        isActive: true,
        maxUsages: 10,
        sortOrder: 20,
        createdAt: now,
      },

      // Educational Services
      {
        itemId: 'personal_tutor',
        itemType: 'educational_service',
        name: 'Sesión de Tutoría Personal',
        description: 'Sesión personalizada con un instructor experto',
        category: 'personal_tutor_session',
        educationalValue: 'Atención personalizada para superar obstáculos específicos',
        unlockRequirements: {
          type: 'mastery',
          conceptsMastered: ['advanced_concepts'],
          esenciaCost: 500,
        },
        impact: {
          learningAcceleration: 2.0,
          masteryDepth: 1.0,
          applicability: ['Todas las materias'],
          difficulty: 'leyenda',
        },
        visual: { rarity: 'leyenda', color: '#F44336' },
        isActive: true,
        sortOrder: 30,
        createdAt: now,
      },
    ];

    for (const item of catalogItems) {
      await ctx.db.insert('rewardsCatalog', item);
    }

    return { message: `Seeded ${catalogItems.length} learning-focused reward items` };
  },
});