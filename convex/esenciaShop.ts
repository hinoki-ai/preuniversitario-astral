import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getCurrentUser } from './users';

// Get available Esencia Arcana shop items
export const getEsenciaShopItems = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, { category }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('User not authenticated');
    
    // Get user stats for level-based availability
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();
      
    const userLevel = userStats?.level || 1;
    const userEsencia = userStats?.esenciaArcana || 0;
    
    // Get user rewards to check what's already owned
    const userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();
    
    // Define shop items based on learning enhancement
    const shopItems = [
      // Learning Boosters
      {
        id: 'concept_revealer',
        name: 'Concept Revealer',
        description: 'Reveals the underlying concept behind difficult questions',
        category: 'learning_boost',
        cost: 150,
        rarity: 'common',
        effect: 'concept_reveal',
        duration: 3600, // 1 hour
        usesRemaining: 3,
        minLevel: 3,
        available: userLevel >= 3,
        owned: hasLearningBoost(userRewards, 'concept_revealer'),
      },
      {
        id: 'difficulty_insight',
        name: 'Difficulty Insight',
        description: 'Shows why a question is classified as hard and how to approach it',
        category: 'learning_boost',
        cost: 200,
        rarity: 'common',
        effect: 'difficulty_insight',
        duration: 7200, // 2 hours
        usesRemaining: 5,
        minLevel: 5,
        available: userLevel >= 5,
        owned: hasLearningBoost(userRewards, 'difficulty_insight'),
      },
      {
        id: 'retention_booster',
        name: 'Retention Booster',
        description: 'Increases spaced repetition effectiveness by 50% for 24 hours',
        category: 'learning_boost',
        cost: 300,
        rarity: 'rare',
        effect: 'retention_boost',
        duration: 86400, // 24 hours
        usesRemaining: 1,
        minLevel: 8,
        available: userLevel >= 8,
        owned: hasLearningBoost(userRewards, 'retention_booster'),
      },
      {
        id: 'mastery_accelerator',
        name: 'Mastery Accelerator',
        description: 'Doubles concept mastery progress for 30 minutes of focused study',
        category: 'learning_boost',
        cost: 500,
        rarity: 'epic',
        effect: 'mastery_accelerator',
        duration: 1800, // 30 minutes
        usesRemaining: 1,
        minLevel: 12,
        available: userLevel >= 12,
        owned: hasLearningBoost(userRewards, 'mastery_accelerator'),
      },
      
      // Exclusive Content
      {
        id: 'advanced_math_strategies',
        name: 'Advanced Math Strategies',
        description: 'Exclusive video series on advanced problem-solving techniques',
        category: 'exclusive_content',
        cost: 800,
        rarity: 'rare',
        contentType: 'advanced_lessons',
        subject: 'matemática',
        minLevel: 10,
        available: userLevel >= 10,
        owned: hasExclusiveContent(userRewards, 'advanced_math_strategies'),
      },
      {
        id: 'physics_expert_insights',
        name: 'Physics Expert Insights',
        description: 'Learn from physics professors about common PAES traps',
        category: 'exclusive_content',
        cost: 1000,
        rarity: 'epic',
        contentType: 'expert_strategies',
        subject: 'ciencias',
        minLevel: 15,
        available: userLevel >= 15,
        owned: hasExclusiveContent(userRewards, 'physics_expert_insights'),
      },
      
      // Learning Tools
      {
        id: 'concept_visualizer',
        name: 'Concept Visualizer',
        description: 'Interactive diagrams and visual representations of complex concepts',
        category: 'learning_tool',
        cost: 600,
        rarity: 'rare',
        toolType: 'concept_visualizer',
        minLevel: 7,
        available: userLevel >= 7,
        owned: hasLearningTool(userRewards, 'concept_visualizer'),
      },
      {
        id: 'weakness_identifier',
        name: 'Weakness Identifier',
        description: 'AI-powered analysis to identify your specific knowledge gaps',
        category: 'learning_tool',
        cost: 400,
        rarity: 'common',
        toolType: 'weakness_identifier',
        minLevel: 5,
        available: userLevel >= 5,
        owned: hasLearningTool(userRewards, 'weakness_identifier'),
      },
      {
        id: 'progress_analyzer',
        name: 'Progress Analyzer',
        description: 'Detailed analytics on your learning patterns and optimization suggestions',
        category: 'learning_tool',
        cost: 750,
        rarity: 'epic',
        toolType: 'progress_analyzer',
        minLevel: 12,
        available: userLevel >= 12,
        owned: hasLearningTool(userRewards, 'progress_analyzer'),
      },
      
      // Study Enhancements
      {
        id: 'focus_mode',
        name: 'Deep Focus Mode',
        description: 'Distraction-free study environment with ambient sounds',
        category: 'study_enhancement',
        cost: 250,
        rarity: 'common',
        duration: 7200, // 2 hours
        minLevel: 3,
        available: userLevel >= 3,
        owned: hasStudyEnhancement(userRewards, 'focus_mode'),
      },
      {
        id: 'streak_protection',
        name: 'Streak Protection',
        description: 'Protects your study streak if you miss one day (single use)',
        category: 'study_enhancement',
        cost: 1200,
        rarity: 'legendary',
        usesRemaining: 1,
        minLevel: 20,
        available: userLevel >= 20,
        owned: hasStudyEnhancement(userRewards, 'streak_protection'),
      },
    ];
    
    // Filter by category if specified
    let filteredItems = category 
      ? shopItems.filter(item => item.category === category)
      : shopItems;
    
    // Add affordability info
    filteredItems = filteredItems.map(item => ({
      ...item,
      canAfford: userEsencia >= item.cost,
      userEsencia,
    }));
    
    return filteredItems;
  },
});

// Purchase an Esencia Arcana shop item
export const purchaseEsenciaItem = mutation({
  args: {
    itemId: v.string(),
  },
  handler: async (ctx, { itemId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('User not authenticated');
    const now = Math.floor(Date.now() / 1000);
    
    // Get user stats
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();
    
    if (!userStats) {
      throw new Error('User stats not found');
    }
    
    const userEsencia = userStats.esenciaArcana || 0;
    const userLevel = userStats.level || 1;
    
    // Get user rewards
    let userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();
    
    if (!userRewards) {
      // Initialize user rewards if not exists
      const rewardsId = await ctx.db.insert('userRewards', {
        userId: user._id,
        learningBoosts: [],
        exclusiveContent: [],
        assistanceTools: [],
        createdAt: now,
        updatedAt: now,
      });
      userRewards = await ctx.db.get(rewardsId);
    }
    
    if (!userRewards) {
      throw new Error('Failed to initialize user rewards');
    }
    
    // Find the item in our catalog
    const shopItems = await getShopItemsCatalog();
    const item = shopItems.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    // Validate purchase
    if (userLevel < item.minLevel) {
      throw new Error(`You need to be level ${item.minLevel} to purchase this item`);
    }
    
    if (userEsencia < item.cost) {
      throw new Error('Not enough Esencia Arcana');
    }
    
    // Check if already owned (for permanent items)
    if (isItemAlreadyOwned(userRewards, item)) {
      throw new Error('Item already owned');
    }
    
    // Deduct Esencia Arcana
    await ctx.db.patch(userStats._id, {
      esenciaArcana: userEsencia - item.cost,
      updatedAt: now,
    });
    
    // Add item to user's collection
    const updatedRewards = { ...userRewards };
    
    switch (item.category) {
      case 'learning_boost':
        const newBoost = {
          id: item.id,
          name: item.name,
          description: item.description,
          effect: item.effect,
          unlockedAt: now,
          isActive: false,
          duration: item.duration,
          expiresAt: item.duration ? now + item.duration : undefined,
          usesRemaining: item.usesRemaining,
        };
        updatedRewards.learningBoosts = [...(updatedRewards.learningBoosts || []), newBoost];
        break;
        
      case 'exclusive_content':
        const newContent = {
          id: item.id,
          name: item.name,
          type: item.contentType,
          unlockedAt: now,
          subject: item.subject,
          difficulty: item.rarity,
        };
        updatedRewards.exclusiveContent = [...(updatedRewards.exclusiveContent || []), newContent];
        break;
        
      case 'learning_tool':
        const newTool = {
          id: item.id,
          name: item.name,
          description: item.description,
          toolType: item.toolType,
          unlockedAt: now,
          isActive: false,
        };
        updatedRewards.assistanceTools = [...(updatedRewards.assistanceTools || []), newTool];
        break;
        
      case 'study_enhancement':
        const newEnhancement = {
          id: item.id,
          name: item.name,
          description: item.description,
          unlockedAt: now,
          isActive: false,
          duration: item.duration,
          expiresAt: item.duration ? now + item.duration : undefined,
          usesRemaining: item.usesRemaining,
        };
        updatedRewards.assistanceTools = [...(updatedRewards.assistanceTools || []), newEnhancement];
        break;
    }
    
    // Update user rewards
    await ctx.db.patch(userRewards._id, {
      ...updatedRewards,
      updatedAt: now,
    });
    
    // Log the purchase
    await ctx.db.insert('esenciaPurchases', {
      userId: user._id,
      itemId: item.id,
      itemName: item.name,
      cost: item.cost,
      category: item.category,
      purchasedAt: now,
    });
    
    return {
      success: true,
      newEsenciaBalance: userEsencia - item.cost,
      item: {
        id: item.id,
        name: item.name,
        category: item.category,
      },
    };
  },
});

// Activate a learning boost or enhancement
export const activateItem = mutation({
  args: {
    itemId: v.string(),
    category: v.string(),
  },
  handler: async (ctx, { itemId, category }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error('User not authenticated');
    const now = Math.floor(Date.now() / 1000);
    
    const userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();
    
    if (!userRewards) {
      throw new Error('User rewards not found');
    }
    
    const updatedRewards = { ...userRewards };
    let activated = false;
    
    switch (category) {
      case 'learning_boost':
        const boosts = [...(updatedRewards.learningBoosts || [])];
        const boostIndex = boosts.findIndex(b => b.id === itemId);
        
        if (boostIndex === -1) {
          throw new Error('Learning boost not found');
        }
        
        const boost = boosts[boostIndex];
        
        // Check if expired or no uses remaining
        if (boost.expiresAt && boost.expiresAt < now) {
          throw new Error('This boost has expired');
        }
        
        if (boost.usesRemaining !== undefined && boost.usesRemaining <= 0) {
          throw new Error('No uses remaining for this boost');
        }
        
        // Activate the boost
        boosts[boostIndex] = {
          ...boost,
          isActive: true,
          activatedAt: now,
          usesRemaining: boost.usesRemaining ? boost.usesRemaining - 1 : undefined,
        };
        
        updatedRewards.learningBoosts = boosts;
        activated = true;
        break;
        
      case 'learning_tool':
        const tools = [...(updatedRewards.assistanceTools || [])];
        const toolIndex = tools.findIndex(t => t.id === itemId);
        
        if (toolIndex === -1) {
          throw new Error('Learning tool not found');
        }
        
        tools[toolIndex] = {
          ...tools[toolIndex],
          isActive: !tools[toolIndex].isActive, // Toggle activation
        };
        
        updatedRewards.assistanceTools = tools;
        activated = true;
        break;
        
      case 'study_enhancement':
        const enhancements = [...(updatedRewards.assistanceTools || [])];
        const enhancementIndex = enhancements.findIndex(e => e.id === itemId);
        
        if (enhancementIndex === -1) {
          throw new Error('Study enhancement not found');
        }
        
        const enhancement = enhancements[enhancementIndex];
        
        if (enhancement.expiresAt && enhancement.expiresAt < now) {
          throw new Error('This enhancement has expired');
        }
        
        if (enhancement.usesRemaining !== undefined && enhancement.usesRemaining <= 0) {
          throw new Error('No uses remaining for this enhancement');
        }
        
        enhancements[enhancementIndex] = {
          ...enhancement,
          isActive: true,
          activatedAt: now,
          usesRemaining: enhancement.usesRemaining ? enhancement.usesRemaining - 1 : undefined,
        };
        
        updatedRewards.assistanceTools = enhancements;
        activated = true;
        break;
    }
    
    if (activated) {
      await ctx.db.patch(userRewards._id, {
        ...updatedRewards,
        updatedAt: now,
      });
    }
    
    return { success: activated };
  },
});

// Helper functions
async function getShopItemsCatalog() {
  // This would normally be stored in the database, but for now we'll return the hardcoded catalog
  return [
    { id: 'concept_revealer', cost: 150, minLevel: 3, category: 'learning_boost', effect: 'concept_reveal', duration: 3600, usesRemaining: 3, name: 'Concept Revealer', description: 'Reveals the underlying concept behind difficult questions' },
    { id: 'difficulty_insight', cost: 200, minLevel: 5, category: 'learning_boost', effect: 'difficulty_insight', duration: 7200, usesRemaining: 5, name: 'Difficulty Insight', description: 'Shows why a question is classified as hard and how to approach it' },
    { id: 'retention_booster', cost: 300, minLevel: 8, category: 'learning_boost', effect: 'retention_boost', duration: 86400, usesRemaining: 1, name: 'Retention Booster', description: 'Increases spaced repetition effectiveness by 50% for 24 hours' },
    { id: 'mastery_accelerator', cost: 500, minLevel: 12, category: 'learning_boost', effect: 'mastery_accelerator', duration: 1800, usesRemaining: 1, name: 'Mastery Accelerator', description: 'Doubles concept mastery progress for 30 minutes of focused study' },
    { id: 'advanced_math_strategies', cost: 800, minLevel: 10, category: 'exclusive_content', contentType: 'advanced_lessons', subject: 'matemática', name: 'Advanced Math Strategies', description: 'Exclusive video series on advanced problem-solving techniques' },
    { id: 'physics_expert_insights', cost: 1000, minLevel: 15, category: 'exclusive_content', contentType: 'expert_strategies', subject: 'ciencias', name: 'Physics Expert Insights', description: 'Learn from physics professors about common PAES traps' },
    { id: 'concept_visualizer', cost: 600, minLevel: 7, category: 'learning_tool', toolType: 'concept_visualizer', name: 'Concept Visualizer', description: 'Interactive diagrams and visual representations of complex concepts' },
    { id: 'weakness_identifier', cost: 400, minLevel: 5, category: 'learning_tool', toolType: 'weakness_identifier', name: 'Weakness Identifier', description: 'AI-powered analysis to identify your specific knowledge gaps' },
    { id: 'progress_analyzer', cost: 750, minLevel: 12, category: 'learning_tool', toolType: 'progress_analyzer', name: 'Progress Analyzer', description: 'Detailed analytics on your learning patterns and optimization suggestions' },
    { id: 'focus_mode', cost: 250, minLevel: 3, category: 'study_enhancement', duration: 7200, name: 'Deep Focus Mode', description: 'Distraction-free study environment with ambient sounds' },
    { id: 'streak_protection', cost: 1200, minLevel: 20, category: 'study_enhancement', usesRemaining: 1, name: 'Streak Protection', description: 'Protects your study streak if you miss one day (single use)' },
  ];
}

function hasLearningBoost(userRewards: any, boostId: string): boolean {
  return userRewards?.learningBoosts?.some((boost: any) => boost.id === boostId) || false;
}

function hasExclusiveContent(userRewards: any, contentId: string): boolean {
  return userRewards?.exclusiveContent?.some((content: any) => content.id === contentId) || false;
}

function hasLearningTool(userRewards: any, toolId: string): boolean {
  return userRewards?.assistanceTools?.some((tool: any) => tool.id === toolId) || false;
}

function hasStudyEnhancement(userRewards: any, enhancementId: string): boolean {
  return userRewards?.studyEnhancements?.some((enhancement: any) => enhancement.id === enhancementId) || false;
}

function isItemAlreadyOwned(userRewards: any, item: any): boolean {
  switch (item.category) {
    case 'learning_boost':
      return hasLearningBoost(userRewards, item.id);
    case 'exclusive_content':
      return hasExclusiveContent(userRewards, item.id);
    case 'learning_tool':
      return hasLearningTool(userRewards, item.id);
    case 'study_enhancement':
      return hasStudyEnhancement(userRewards, item.id);
    default:
      return false;
  }
}