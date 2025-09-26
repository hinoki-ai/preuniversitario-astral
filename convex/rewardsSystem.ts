import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Helper function to get current user
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

// ===== USER REWARDS =====

// Get user's rewards and unlockables
export const getUserRewards = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    let userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    // Initialize rewards for new user
    if (!userRewards) {
      const now = Math.floor(Date.now() / 1000);
      
      userRewards = {
        _id: '' as any, // Will be set by Convex
        _creationTime: now,
        userId: user._id,
        themes: [{
          id: 'default_light',
          name: 'Light Theme',
          unlockedAt: now,
          isActive: true,
        }],
        avatars: [{
          id: 'default_avatar',
          name: 'Default Avatar',
          category: 'default',
          unlockedAt: now,
          isActive: true,
        }],
        titles: [{
          id: 'new_student',
          title: 'New Student',
          description: 'Welcome to your learning journey!',
          category: 'starter',
          color: 'text-blue-600',
          unlockedAt: now,
          isActive: true,
        }],
        badges: [],
        perks: [],
        coins: 100, // Starting coins
        gems: 0,
        shopPurchases: [],
        profileCustomization: {
          selectedTheme: 'default_light',
          selectedAvatar: 'default_avatar',
          selectedTitle: 'new_student',
          selectedBadges: [],
          profileBanner: undefined,
          profileColor: undefined,
        },
        totalItemsUnlocked: 3,
        totalCoinsEarned: 100,
        totalCoinsSpent: 0,
        createdAt: now,
        updatedAt: now,
      } as any;

      // Don't insert yet, just return the default values
    }

    return userRewards;
  }
});

// Get rewards catalog (shop items)
export const getRewardsCatalog = query({
  args: {
    category: v.optional(v.string()),
    itemType: v.optional(v.string()),
    rarity: v.optional(v.string()),
  },
  handler: async (ctx, { category, itemType, rarity }) => {
    const user = await getUser(ctx);
    
    let query = ctx.db.query('rewardsCatalog').withIndex('byActive', q => q.eq('isActive', true));
    
    if (category) {
      query = ctx.db.query('rewardsCatalog').withIndex('byCategory', q => q.eq('category', category));
    }
    if (itemType) {
      query = ctx.db.query('rewardsCatalog').withIndex('byType', q => q.eq('itemType', itemType));
    }
    
    let catalogItems = await query.collect();
    
    if (rarity) {
      catalogItems = catalogItems.filter(item => item.visual.rarity === rarity);
    }

    // Get user's rewards to check what's unlocked
    const userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();
    
    // Get user stats for unlock requirements
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    const userAchievements = (userStats as any)?.achievements || [];
    const userLevel = (userStats as any)?.level || 1;
    const userPoints = (userStats as any)?.totalPoints || 0;

    // Add unlock status to each item
    const itemsWithStatus = catalogItems.map(item => {
      const isUnlocked = checkIfItemUnlocked(item, userRewards, userAchievements, userLevel, userPoints);
      const canUnlock = checkCanUnlock(item, userAchievements, userLevel, userPoints);
      
      return {
        ...item,
        isUnlocked,
        canUnlock,
        isOwned: isItemOwned(item, userRewards),
      };
    });

    return itemsWithStatus.sort((a, b) => a.sortOrder - b.sortOrder);
  }
});

// Unlock an item (achievement, level, or points requirement)
export const unlockReward = mutation({
  args: {
    itemId: v.string(),
  },
  handler: async (ctx, { itemId }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    
    // Get catalog item
    const catalogItem = await ctx.db
      .query('rewardsCatalog')
      .filter(q => q.eq(q.field('itemId'), itemId))
      .unique();
      
    if (!catalogItem) {
      throw new Error("Item not found in catalog");
    }

    // Get user rewards
    let userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    // Initialize if doesn't exist
    if (!userRewards) {
      userRewards = await initializeUserRewards(ctx, user._id);
    }

    if (!userRewards) {
      throw new Error("Failed to initialize user rewards");
    }

    // At this point TypeScript knows userRewards is not null
    userRewards = userRewards as NonNullable<typeof userRewards>;

    // Check if already unlocked
    if (isItemOwned(catalogItem, userRewards)) {
      throw new Error("Item already unlocked");
    }

    // Verify unlock requirements
    const userStats = await ctx.db
      .query('userStats')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    const userAchievements = (userStats as any)?.achievements || [];
    const userLevel = (userStats as any)?.level || 1;
    const userPoints = (userStats as any)?.totalPoints || 0;

    if (!checkCanUnlock(catalogItem, userAchievements, userLevel, userPoints)) {
      throw new Error("Requirements not met to unlock this item");
    }

    // Add item to user's collection
    const updatedRewards = { ...userRewards };
    const newItem = {
      id: catalogItem.itemId,
      name: catalogItem.name,
      unlockedAt: now,
      isActive: false, // User needs to manually activate
    };

    switch (catalogItem.itemType) {
      case 'theme':
        updatedRewards.themes = [...(updatedRewards.themes || []), newItem];
        break;
      case 'avatar':
        updatedRewards.avatars = [...(updatedRewards.avatars || []), {
          ...newItem,
          category: catalogItem.category,
        }];
        break;
      case 'title':
        updatedRewards.titles = [...(updatedRewards.titles || []), {
          ...newItem,
          title: catalogItem.name,
          description: catalogItem.description,
          category: catalogItem.category,
          color: catalogItem.visual.color || 'text-primary',
        }];
        break;
      case 'badge':
        updatedRewards.badges = [...(updatedRewards.badges || []), {
          ...newItem,
          description: catalogItem.description,
          iconUrl: catalogItem.visual.iconUrl,
          rarity: catalogItem.visual.rarity,
        }];
        break;
      case 'perk':
        // Perks are automatically activated when unlocked
        updatedRewards.perks = [...(updatedRewards.perks || []), {
          id: catalogItem.itemId,
          name: catalogItem.name,
          description: catalogItem.description,
          type: catalogItem.category, // perk type is stored in category
          value: 1.0, // default multiplier/value
          duration: undefined, // permanent
          activatedAt: now,
          expiresAt: undefined,
          isActive: true,
        }];
        break;
    }

    updatedRewards.totalItemsUnlocked = (updatedRewards.totalItemsUnlocked || 0) + 1;
    updatedRewards.updatedAt = now;

    await ctx.db.patch(userRewards._id, updatedRewards);

    return {
      success: true,
      itemUnlocked: {
        id: catalogItem.itemId,
        name: catalogItem.name,
        type: catalogItem.itemType,
        rarity: catalogItem.visual.rarity,
      },
    };
  }
});

// Purchase item from shop
export const purchaseShopItem = mutation({
  args: {
    itemId: v.string(),
  },
  handler: async (ctx, { itemId }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    
    // Get catalog item
    const catalogItem = await ctx.db
      .query('rewardsCatalog')
      .filter(q => q.eq(q.field('itemId'), itemId))
      .unique();
      
    if (!catalogItem) {
      throw new Error("Item not found in catalog");
    }

    if (catalogItem.unlockRequirements.type !== 'shop_purchase' || !catalogItem.unlockRequirements.shopCost) {
      throw new Error("Item is not available for purchase");
    }

    // Get user rewards
    let userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userRewards) {
      userRewards = await initializeUserRewards(ctx, user._id);
    }

    if (!userRewards) {
      throw new Error("Failed to initialize user rewards");
    }

    // At this point TypeScript knows userRewards is not null
    userRewards = userRewards as NonNullable<typeof userRewards>;

    // Check if already owned
    if (isItemOwned(catalogItem, userRewards)) {
      throw new Error("Item already owned");
    }

    const { amount, currency } = catalogItem.unlockRequirements.shopCost;

    // Check if user has enough currency
    if (currency === 'coins' && userRewards.coins < amount) {
      throw new Error("Not enough coins");
    }
    if (currency === 'gems' && userRewards.gems < amount) {
      throw new Error("Not enough gems");
    }
    if (currency === 'points') {
      const userStats = await ctx.db
        .query('userStats')
        .withIndex('byUser', q => q.eq('userId', user._id))
        .unique();
      const userPoints = (userStats as any)?.totalPoints || 0;
      if (userPoints < amount) {
        throw new Error("Not enough points");
      }
    }

    // Deduct currency (points are not deducted, they're just a requirement)
    const updatedRewards = { ...userRewards };
    if (currency === 'coins') {
      updatedRewards.coins -= amount;
      updatedRewards.totalCoinsSpent += amount;
    }
    if (currency === 'gems') {
      updatedRewards.gems -= amount;
    }

    // Add purchase record
    updatedRewards.shopPurchases = [...updatedRewards.shopPurchases, {
      itemId,
      itemType: catalogItem.itemType,
      cost: amount,
      currency,
      purchasedAt: now,
    }];

    // Add item to collection (same logic as unlock)
    const newItem = {
      id: catalogItem.itemId,
      name: catalogItem.name,
      unlockedAt: now,
      isActive: false,
    };

    switch (catalogItem.itemType) {
      case 'theme':
        updatedRewards.themes = [...updatedRewards.themes, newItem];
        break;
      case 'avatar':
        updatedRewards.avatars = [...updatedRewards.avatars, {
          ...newItem,
          category: catalogItem.category,
        }];
        break;
      case 'title':
        updatedRewards.titles = [...updatedRewards.titles, {
          ...newItem,
          title: catalogItem.name,
          description: catalogItem.description,
          category: catalogItem.category,
          color: catalogItem.visual.color || 'text-primary',
        }];
        break;
      case 'badge':
        updatedRewards.badges = [...updatedRewards.badges, {
          ...newItem,
          description: catalogItem.description,
          iconUrl: catalogItem.visual.iconUrl,
          rarity: catalogItem.visual.rarity,
        }];
        break;
    }

    updatedRewards.totalItemsUnlocked = (updatedRewards.totalItemsUnlocked || 0) + 1;
    updatedRewards.updatedAt = now;

    await ctx.db.patch(userRewards._id, updatedRewards);

    return {
      success: true,
      itemPurchased: {
        id: catalogItem.itemId,
        name: catalogItem.name,
        type: catalogItem.itemType,
        cost: amount,
        currency,
      },
      remainingCurrency: {
        coins: updatedRewards.coins,
        gems: updatedRewards.gems,
      },
    };
  }
});

// Customize profile (activate themes, avatars, titles, badges)
export const customizeProfile = mutation({
  args: {
    selectedTheme: v.optional(v.string()),
    selectedAvatar: v.optional(v.string()),
    selectedTitle: v.optional(v.string()),
    selectedBadges: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { selectedTheme, selectedAvatar, selectedTitle, selectedBadges }) => {
    const user = await getUser(ctx);
    
    let userRewards = await ctx.db
      .query('userRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!userRewards) {
      userRewards = await initializeUserRewards(ctx, user._id);
    }

    // At this point userRewards is guaranteed to be non-null
    const updatedCustomization = { ...userRewards!.profileCustomization };
    
    // Validate and update selections
    if (selectedTheme) {
      const ownsTheme = userRewards!.themes.some(t => t.id === selectedTheme);
      if (ownsTheme) {
        updatedCustomization.selectedTheme = selectedTheme;
        // Deactivate other themes
        userRewards!.themes = userRewards!.themes.map(t => ({
          ...t,
          isActive: t.id === selectedTheme,
        }));
      }
    }

    if (selectedAvatar) {
      const ownsAvatar = userRewards!.avatars.some(a => a.id === selectedAvatar);
      if (ownsAvatar) {
        updatedCustomization.selectedAvatar = selectedAvatar;
        userRewards!.avatars = userRewards!.avatars.map(a => ({
          ...a,
          isActive: a.id === selectedAvatar,
        }));
      }
    }

    if (selectedTitle) {
      const ownsTitle = userRewards!.titles.some(t => t.id === selectedTitle);
      if (ownsTitle) {
        updatedCustomization.selectedTitle = selectedTitle;
        userRewards!.titles = userRewards!.titles.map(t => ({
          ...t,
          isActive: t.id === selectedTitle,
        }));
      }
    }

    if (selectedBadges) {
      const maxBadges = 3;
      const validBadges = selectedBadges
        .slice(0, maxBadges)
        .filter(badgeId => userRewards!.badges.some(b => b.id === badgeId));
      updatedCustomization.selectedBadges = validBadges;
    }

    await ctx.db.patch(userRewards!._id, {
      ...userRewards!,
      profileCustomization: updatedCustomization,
      updatedAt: Math.floor(Date.now() / 1000),
    });

    return { success: true, customization: updatedCustomization };
  }
});

// ===== DAILY LOGIN REWARDS =====

// Get daily login status and rewards
export const getDailyLoginRewards = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const today = new Date().toISOString().split('T')[0];
    
    let loginRewards = await ctx.db
      .query('dailyLoginRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!loginRewards) {
      // Return default values for new users
      return {
        userId: user._id,
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: '',
        loginHistory: [],
        claimedToday: false,
        nextRewardDay: 1,
        loggedInToday: false,
        canClaimToday: true,
        todaysReward: generateDailyRewardPreview(1)[0],
        upcomingRewards: generateDailyRewardPreview(1),
      };
    }

    // Check if user logged in today
    const loggedInToday = loginRewards.lastLoginDate === today;
    const canClaimToday = !loginRewards.claimedToday && !loggedInToday;

    // Generate reward preview for next 7 days
    const rewardPreview = generateDailyRewardPreview(loginRewards.nextRewardDay);

    return {
      ...loginRewards,
      loggedInToday,
      canClaimToday,
      todaysReward: rewardPreview[0],
      upcomingRewards: rewardPreview,
    };
  }
});

// Claim daily login reward
export const claimDailyReward = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const today = new Date().toISOString().split('T')[0];
    const now = Math.floor(Date.now() / 1000);
    
    let loginRewards = await ctx.db
      .query('dailyLoginRewards')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .unique();

    if (!loginRewards) {
      const loginRewardsId = await ctx.db.insert('dailyLoginRewards', {
        userId: user._id,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: today,
        loginHistory: [],
        claimedToday: true,
        nextRewardDay: 2,
      });
      loginRewards = await ctx.db.get(loginRewardsId);
    }

    if (!loginRewards) throw new Error("Failed to initialize login rewards");

    // Check if already claimed today
    if (loginRewards.claimedToday && loginRewards.lastLoginDate === today) {
      throw new Error("Daily reward already claimed today");
    }

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    if (loginRewards.lastLoginDate === yesterdayStr) {
      // Consecutive day
      newStreak = loginRewards.currentStreak + 1;
    } else if (loginRewards.lastLoginDate === today) {
      // Same day, maintain streak
      newStreak = loginRewards.currentStreak;
    }
    // If gap > 1 day, streak resets to 1

    const longestStreak = Math.max(loginRewards.longestStreak, newStreak);

    // Generate today's rewards
    const todaysRewards = generateDailyReward(loginRewards.nextRewardDay, newStreak);

    // Add to history
    const newHistoryEntry = {
      date: today,
      dayNumber: loginRewards.nextRewardDay,
      rewards: todaysRewards,
    };

    const updatedHistory = [...loginRewards.loginHistory, newHistoryEntry];

    await ctx.db.patch(loginRewards._id, {
      currentStreak: newStreak,
      longestStreak,
      lastLoginDate: today,
      loginHistory: updatedHistory,
      claimedToday: true,
      nextRewardDay: (loginRewards.nextRewardDay % 7) + 1, // Cycle through 7 days
    });

    // Award the rewards to user
    await awardLoginRewards(ctx, user._id, todaysRewards);

    return {
      success: true,
      rewards: todaysRewards,
      newStreak,
      isNewRecord: longestStreak > loginRewards.longestStreak,
    };
  }
});

// ===== HELPER FUNCTIONS =====

async function initializeUserRewards(ctx: any, userId: string) {
  const now = Math.floor(Date.now() / 1000);
  
  const rewardsId = await ctx.db.insert('userRewards', {
    userId,
    themes: [{
      id: 'default_light',
      name: 'Light Theme',
      unlockedAt: now,
      isActive: true,
    }],
    avatars: [{
      id: 'default_avatar',
      name: 'Default Avatar',
      category: 'default',
      unlockedAt: now,
      isActive: true,
    }],
    titles: [{
      id: 'new_student',
      title: 'New Student',
      description: 'Welcome to your learning journey!',
      category: 'starter',
      color: 'text-blue-600',
      unlockedAt: now,
      isActive: true,
    }],
    badges: [],
    perks: [],
    coins: 100,
    gems: 0,
    shopPurchases: [],
    profileCustomization: {
      selectedTheme: 'default_light',
      selectedAvatar: 'default_avatar',
      selectedTitle: 'new_student',
      selectedBadges: [],
      profileBanner: null,
      profileColor: null,
    },
    totalItemsUnlocked: 3,
    totalCoinsEarned: 100,
    totalCoinsSpent: 0,
    createdAt: now,
    updatedAt: now,
  });

  return await ctx.db.get(rewardsId);
}

function checkIfItemUnlocked(item: any, userRewards: any, userAchievements: any[], userLevel: number, userPoints: number): boolean {
  const { type } = item.unlockRequirements;
  
  switch (type) {
    case 'achievement':
      if (!item.unlockRequirements.achievementIds) return false;
      return item.unlockRequirements.achievementIds.every((achievementId: string) =>
        userAchievements.some(a => a.id === achievementId)
      );
      
    case 'level':
      return userLevel >= (item.unlockRequirements.minLevel || 0);
      
    case 'points':
      return userPoints >= (item.unlockRequirements.minPoints || 0);
      
    case 'shop_purchase':
      return false; // Shop items must be purchased
      
    case 'daily_login':
      // This would require checking daily login streak
      return false; // Placeholder
      
    default:
      return false;
  }
}

function checkCanUnlock(item: any, userAchievements: any[], userLevel: number, userPoints: number): boolean {
  return checkIfItemUnlocked(item, null, userAchievements, userLevel, userPoints);
}

function isItemOwned(item: any, userRewards: any): boolean {
  const itemId = item.itemId;
  const itemType = item.itemType;
  
  switch (itemType) {
    case 'theme':
      return userRewards.themes.some((t: any) => t.id === itemId);
    case 'avatar':
      return userRewards.avatars.some((a: any) => a.id === itemId);
    case 'title':
      return userRewards.titles.some((t: any) => t.id === itemId);
    case 'badge':
      return userRewards.badges.some((b: any) => b.id === itemId);
    case 'perk':
      return userRewards.perks.some((p: any) => p.id === itemId);
    default:
      return false;
  }
}

function generateDailyRewardPreview(startDay: number) {
  const rewards = [];
  
  for (let i = 0; i < 7; i++) {
    const day = ((startDay - 1 + i) % 7) + 1;
    const dayRewards = generateDailyReward(day, 1); // Use streak 1 for preview
    rewards.push({
      day,
      rewards: dayRewards,
    });
  }
  
  return rewards;
}

function generateDailyReward(dayNumber: number, streak: number) {
  const baseRewards = [
    [{ type: 'coins', amount: 10 }], // Day 1
    [{ type: 'coins', amount: 15 }], // Day 2
    [{ type: 'coins', amount: 20 }, { type: 'xp', amount: 50 }], // Day 3
    [{ type: 'coins', amount: 25 }], // Day 4
    [{ type: 'coins', amount: 30 }, { type: 'gems', amount: 1 }], // Day 5
    [{ type: 'coins', amount: 40 }], // Day 6
    [{ type: 'coins', amount: 50 }, { type: 'gems', amount: 2 }, { type: 'xp', amount: 100 }], // Day 7 (jackpot)
  ];
  
  const dayRewards = baseRewards[dayNumber - 1] || baseRewards[0];
  
  // Apply streak multiplier
  const streakMultiplier = Math.min(1 + (streak - 1) * 0.1, 2.0); // Max 2x multiplier
  
  return dayRewards.map(reward => ({
    ...reward,
    amount: reward.amount ? Math.floor(reward.amount * streakMultiplier) : reward.amount,
  }));
}

async function awardLoginRewards(ctx: any, userId: string, rewards: any[]) {
  for (const reward of rewards) {
    if (reward.type === 'coins') {
      await awardCoins(ctx, userId, reward.amount);
    } else if (reward.type === 'gems') {
      await awardGems(ctx, userId, reward.amount);
    } else if (reward.type === 'xp') {
      await awardXP(ctx, userId, reward.amount);
    } else if (reward.type === 'item' && reward.itemId) {
      // Award specific item (would need item unlocking logic)
    }
  }
}

async function awardCoins(ctx: any, userId: string, amount: number) {
  let userRewards = await ctx.db
    .query('userRewards')
    .withIndex('byUser', (q: any) => q.eq('userId', userId))
    .unique();

  if (!userRewards) {
    userRewards = await initializeUserRewards(ctx, userId);
  }

  await ctx.db.patch(userRewards._id, {
    coins: userRewards.coins + amount,
    totalCoinsEarned: userRewards.totalCoinsEarned + amount,
    updatedAt: Math.floor(Date.now() / 1000),
  });
}

async function awardGems(ctx: any, userId: string, amount: number) {
  let userRewards = await ctx.db
    .query('userRewards')
    .withIndex('byUser', (q: any) => q.eq('userId', userId))
    .unique();

  if (!userRewards) {
    userRewards = await initializeUserRewards(ctx, userId);
  }

  await ctx.db.patch(userRewards._id, {
    gems: userRewards.gems + amount,
    updatedAt: Math.floor(Date.now() / 1000),
  });
}

async function awardXP(ctx: any, userId: string, amount: number) {
  // This would integrate with the existing userStats XP system
  const userStats = await ctx.db
    .query('userStats')
    .withIndex('byUser', (q: any) => q.eq('userId', userId))
    .unique();

  if (userStats) {
    const newXP = (userStats.experiencePoints || 0) + amount;
    const levelInfo = calculateLevel(newXP);
    
    await ctx.db.patch(userStats._id, {
      experiencePoints: newXP,
      totalPoints: (userStats.totalPoints || 0) + amount,
      level: levelInfo.level,
      pointsToNextLevel: levelInfo.pointsToNext,
      updatedAt: Math.floor(Date.now() / 1000),
    });
  }
}

function calculateLevel(experiencePoints: number): { level: number; pointsToNext: number } {
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

// Seed rewards catalog with initial items
export const seedRewardsCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if catalog already exists
    const existing = await ctx.db.query('rewardsCatalog').first();
    if (existing) return { message: "Catalog already seeded" };

    const now = Math.floor(Date.now() / 1000);
    const catalogItems = [
      // Themes
      {
        itemId: 'dark_theme',
        itemType: 'theme',
        name: 'Dark Theme',
        description: 'Easy on the eyes for late-night study sessions',
        category: 'appearance',
        unlockRequirements: {
          type: 'points',
          minPoints: 500,
        },
        visual: {
          color: '#1a1a1a',
          rarity: 'common',
        },
        isActive: true,
        isLimited: false,
        sortOrder: 1,
        createdAt: now,
      },
      {
        itemId: 'ocean_theme',
        itemType: 'theme',
        name: 'Ocean Theme',
        description: 'Calming blue tones inspired by the ocean',
        category: 'appearance',
        unlockRequirements: {
          type: 'level',
          minLevel: 10,
        },
        visual: {
          color: '#006994',
          rarity: 'rare',
        },
        isActive: true,
        isLimited: false,
        sortOrder: 2,
        createdAt: now,
      },

      // Titles
      {
        itemId: 'quiz_master',
        itemType: 'title',
        name: 'Quiz Master',
        description: 'For those who excel at quizzes',
        category: 'achievement',
        unlockRequirements: {
          type: 'achievement',
          achievementIds: ['quiz_machine'],
        },
        visual: {
          color: 'text-purple-600',
          rarity: 'rare',
        },
        isActive: true,
        isLimited: false,
        sortOrder: 10,
        createdAt: now,
      },
      {
        itemId: 'streak_legend',
        itemType: 'title',
        name: 'Streak Legend',
        description: 'Maintained an incredible study streak',
        category: 'achievement',
        unlockRequirements: {
          type: 'achievement',
          achievementIds: ['month_streak'],
        },
        visual: {
          color: 'text-orange-600',
          rarity: 'epic',
        },
        isActive: true,
        isLimited: false,
        sortOrder: 11,
        createdAt: now,
      },

      // Shop Items
      {
        itemId: 'golden_avatar',
        itemType: 'avatar',
        name: 'Golden Scholar',
        description: 'A prestigious golden avatar for dedicated students',
        category: 'premium',
        unlockRequirements: {
          type: 'shop_purchase',
          shopCost: {
            amount: 500,
            currency: 'coins',
          },
        },
        visual: {
          color: '#FFD700',
          rarity: 'epic',
        },
        isActive: true,
        isLimited: false,
        sortOrder: 20,
        createdAt: now,
      },

      // Perks
      {
        itemId: 'xp_boost',
        itemType: 'perk',
        name: 'XP Boost',
        description: 'Earn 25% more experience points for 7 days',
        category: 'xp_boost',
        unlockRequirements: {
          type: 'shop_purchase',
          shopCost: {
            amount: 5,
            currency: 'gems',
          },
        },
        visual: {
          rarity: 'rare',
        },
        isActive: true,
        isLimited: false,
        sortOrder: 30,
        createdAt: now,
      },
      {
        itemId: 'streak_protection',
        itemType: 'perk',
        name: 'Streak Shield',
        description: 'Protect your streak for one missed day',
        category: 'streak_protection',
        unlockRequirements: {
          type: 'shop_purchase',
          shopCost: {
            amount: 3,
            currency: 'gems',
          },
        },
        visual: {
          rarity: 'epic',
        },
        isActive: true,
        isLimited: false,
        sortOrder: 31,
        createdAt: now,
      },
    ];

    // Insert all items
    for (const item of catalogItems) {
      await ctx.db.insert('rewardsCatalog', item);
    }

    return { message: `Seeded ${catalogItems.length} catalog items` };
  },
});