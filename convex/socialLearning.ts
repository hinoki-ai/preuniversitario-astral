import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUser, calculateEsenciaArcana } from "./shared";

// ===== OPTIMIZED SOCIAL LEARNING SYSTEM =====
// Integrates with the new schema additions for minimal overhead sharing

// Share study material with optimized storage
export const shareStudyMaterial = mutation({
  args: {
    materialType: v.string(), // 'quiz_result', 'study_notes', 'concept_map', 'progress_summary'
    materialData: v.object({
      title: v.string(),
      description: v.string(),
      subject: v.string(),
      difficulty: v.string(),
      content: v.any(), // Flexible content structure
      tags: v.array(v.string()),
    }),
    shareWith: v.string(), // 'public', 'friends', 'study_group', 'specific_users'
    recipients: v.optional(v.array(v.id('users'))),
    studyGroupId: v.optional(v.id('studyGroups')),
  },
  handler: async (ctx, { materialType, materialData, shareWith, recipients, studyGroupId }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    
    // Generate unique share code
    const shareCode = generateShareCode();
    
    // Create optimized material entry
    const materialId = await ctx.db.insert('sharedStudyMaterials', {
      userId: user._id,
      materialType,
      materialId: generateMaterialId(materialType, user._id, now),
      title: materialData.title,
      description: materialData.description,
      subject: materialData.subject,
      difficulty: materialData.difficulty,
      shareWith,
      recipients: recipients || [],
      studyGroupId,
      tags: materialData.tags,
      shareCode,
      viewCount: 0,
      likeCount: 0,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    // Award Esencia for sharing (teaching others)
    const teachingBonus = calculateTeachingBonus(materialData.difficulty, shareWith);
    await awardEsenciaForSharing(ctx, user._id, teachingBonus);

    // Notify recipients if specific users
    if (shareWith === 'specific_users' && recipients) {
      await notifyRecipients(ctx, recipients, user._id, materialData.title, shareCode);
    }

    // Create progress event for sharing
    await ctx.db.insert('progressEvents', {
      userId: user._id,
      subject: materialData.subject,
      kind: 'material_shared',
      value: 1,
      createdAt: now,
      metadata: {
        materialType,
        difficulty: materialData.difficulty,
        shareWith,
        recipientCount: recipients?.length || 0,
        esenciaAwarded: teachingBonus,
      }
    });

    return {
      success: true,
      materialId,
      shareCode,
      esenciaAwarded: teachingBonus,
    };
  }
});

// View shared material (optimized for minimal overhead)
export const viewSharedMaterial = mutation({
  args: {
    shareCode: v.string(),
  },
  handler: async (ctx, { shareCode }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);

    // Get material by share code
    const material = await ctx.db
      .query('sharedStudyMaterials')
      .withIndex('byShareCode', q => q.eq('shareCode', shareCode))
      .unique();

    if (!material || !material.isActive) {
      throw new Error('Material not found or no longer available');
    }

    // Check access permissions
    const hasAccess = await checkMaterialAccess(ctx, user._id, material);
    if (!hasAccess) {
      throw new Error('Access denied to this material');
    }

    // Track view (avoid duplicate views)
    const existingView = await ctx.db
      .query('materialViews')
      .withIndex('byUserMaterial', q => 
        q.eq('userId', user._id).eq('materialId', material._id)
      )
      .unique();

    if (!existingView) {
      // Record new view
      await ctx.db.insert('materialViews', {
        userId: user._id,
        materialId: material._id,
        viewedAt: now,
      });

      // Increment view count
      await ctx.db.patch(material._id, {
        viewCount: material.viewCount + 1,
        updatedAt: now,
      });

      // Award creator small Esencia for helpful content
      if (material.viewCount > 0 && material.viewCount % 5 === 0) { // Every 5 views
        await awardEsenciaForViews(ctx, material.userId, 10);
      }
    }

    return {
      material: {
        title: material.title,
        description: material.description,
        subject: material.subject,
        difficulty: material.difficulty,
        tags: material.tags,
        viewCount: material.viewCount + (existingView ? 0 : 1),
        likeCount: material.likeCount,
        createdAt: material.createdAt,
      },
      creator: await getUserPublicProfile(ctx, material.userId),
      hasLiked: await hasUserLikedMaterial(ctx, user._id, material._id),
    };
  }
});

// Like shared material
export const likeMaterial = mutation({
  args: {
    shareCode: v.string(),
  },
  handler: async (ctx, { shareCode }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);

    const material = await ctx.db
      .query('sharedStudyMaterials')
      .withIndex('byShareCode', q => q.eq('shareCode', shareCode))
      .unique();

    if (!material || !material.isActive) {
      throw new Error('Material not found');
    }

    // Check if already liked
    const existingLike = await ctx.db
      .query('materialLikes')
      .withIndex('byUserMaterial', q => 
        q.eq('userId', user._id).eq('materialId', material._id)
      )
      .unique();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(material._id, {
        likeCount: Math.max(0, material.likeCount - 1),
        updatedAt: now,
      });
      return { liked: false, likeCount: material.likeCount - 1 };
    } else {
      // Like
      await ctx.db.insert('materialLikes', {
        userId: user._id,
        materialId: material._id,
        likedAt: now,
      });
      
      await ctx.db.patch(material._id, {
        likeCount: material.likeCount + 1,
        updatedAt: now,
      });

      // Award creator Esencia for helpful content
      await awardEsenciaForLikes(ctx, material.userId, 5);

      return { liked: true, likeCount: material.likeCount + 1 };
    }
  }
});

// Get user's notifications
export const getNotifications = query({
  args: { unreadOnly: v.optional(v.boolean()) },
  handler: async (ctx, { unreadOnly = false }) => {
    const user = await getUser(ctx);
    
    const query = unreadOnly 
      ? ctx.db.query('notifications').withIndex('byUserUnread', q => 
          q.eq('userId', user._id).eq('read', false)
        )
      : ctx.db.query('notifications').withIndex('byUser', q => q.eq('userId', user._id));
    
    const notifications = await query
      .order('desc')
      .take(20);

    return notifications;
  }
});

// Mark notification as read
export const markNotificationRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, { notificationId }) => {
    const user = await getUser(ctx);
    
    const notification = await ctx.db.get(notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error('Notification not found');
    }

    await ctx.db.patch(notificationId, { read: true });
    return { success: true };
  }
});

// Discover public study materials
export const discoverStudyMaterials = query({
  args: {
    subject: v.optional(v.string()),
    materialType: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { subject, materialType, difficulty, limit = 20 }) => {
    let query = ctx.db.query('sharedStudyMaterials');
    
    if (subject) {
      query = query.withIndex('bySubject', q => q.eq('subject', subject).eq('isActive', true));
    } else if (materialType) {
      query = query.withIndex('byMaterialType', q => q.eq('materialType', materialType).eq('isActive', true));
    } else {
      query = query.withIndex('byCreated', q => q.eq('isActive', true));
    }

    let materials = await query
      .order('desc')
      .take(limit * 2); // Get more to filter

    // Filter by difficulty if specified
    if (difficulty) {
      materials = materials.filter(m => m.difficulty === difficulty);
    }

    // Filter to public only and add creator info
    const publicMaterials = await Promise.all(
      materials
        .filter(m => m.shareWith === 'public')
        .slice(0, limit)
        .map(async (material) => ({
          ...material,
          creator: await getUserPublicProfile(ctx, material.userId),
        }))
    );

    return publicMaterials;
  }
});

// ===== HELPER FUNCTIONS =====

function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateMaterialId(type: string, userId: string, timestamp: number): string {
  return `${type}_${userId.slice(-4)}_${timestamp}`;
}

function calculateTeachingBonus(difficulty: string, shareWith: string): number {
  let baseBonus = 20;
  
  // Difficulty multiplier
  switch (difficulty) {
    case 'leyenda': baseBonus *= 2.5; break;
    case 'paladín': baseBonus *= 2.0; break;
    case 'guerrero': baseBonus *= 1.5; break;
    case 'escudero': baseBonus *= 1.0; break;
  }
  
  // Sharing scope multiplier
  switch (shareWith) {
    case 'public': baseBonus *= 1.5; break;
    case 'study_group': baseBonus *= 1.2; break;
    case 'friends': baseBonus *= 1.1; break;
    case 'specific_users': baseBonus *= 1.0; break;
  }
  
  return Math.floor(baseBonus);
}

async function awardEsenciaForSharing(ctx: any, userId: string, amount: number) {
  const userStats = await ctx.db
    .query('userStats')
    .withIndex('byUser', q => q.eq('userId', userId))
    .unique();

  if (userStats) {
    const newEsencia = (userStats.esenciaArcana || 0) + amount;
    await ctx.db.patch(userStats._id, {
      esenciaArcana: newEsencia,
      experiencePoints: newEsencia,
      updatedAt: Math.floor(Date.now() / 1000),
    });
  }
}

async function awardEsenciaForViews(ctx: any, userId: string, amount: number) {
  await awardEsenciaForSharing(ctx, userId, amount);
}

async function awardEsenciaForLikes(ctx: any, userId: string, amount: number) {
  await awardEsenciaForSharing(ctx, userId, amount);
}

async function checkMaterialAccess(ctx: any, userId: string, material: any): Promise<boolean> {
  switch (material.shareWith) {
    case 'public':
      return true;
    
    case 'friends':
      // Check if users are friends
      const friendship = await ctx.db
        .query('friendships')
        .withIndex('byUsers', q => q.eq('requesterId', userId).eq('addresseeId', material.userId))
        .unique() ||
        await ctx.db
        .query('friendships')
        .withIndex('byUsers', q => q.eq('requesterId', material.userId).eq('addresseeId', userId))
        .unique();
      
      return friendship?.status === 'accepted';
    
    case 'study_group':
      if (!material.studyGroupId) return false;
      const studyGroup = await ctx.db.get(material.studyGroupId);
      return studyGroup?.members.some((m: any) => m.userId === userId) || false;
    
    case 'specific_users':
      return material.recipients.includes(userId);
    
    default:
      return false;
  }
}

async function notifyRecipients(ctx: any, recipients: string[], senderId: string, title: string, shareCode: string) {
  const sender = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('_id'), senderId))
    .unique();

  const now = Math.floor(Date.now() / 1000);

  for (const recipientId of recipients) {
    await ctx.db.insert('notifications', {
      userId: recipientId,
      type: 'material_shared',
      title: 'Material de Estudio Compartido',
      message: `${sender?.name || 'Un usuario'} compartió "${title}" contigo`,
      data: {
        shareCode,
        userId: senderId,
      },
      createdAt: now,
      read: false,
    });
  }
}

async function getUserPublicProfile(ctx: any, userId: string) {
  const user = await ctx.db
    .query('users')
    .filter(q => q.eq(q.field('_id'), userId))
    .unique();
  
  const userStats = await ctx.db
    .query('userStats')
    .withIndex('byUser', q => q.eq('userId', userId))
    .unique();

  return {
    name: user?.name || 'Usuario Anónimo',
    level: userStats?.level || 1,
    achievements: userStats?.achievements?.length || 0,
  };
}

async function hasUserLikedMaterial(ctx: any, userId: string, materialId: string): Promise<boolean> {
  const like = await ctx.db
    .query('materialLikes')
    .withIndex('byUserMaterial', q => q.eq('userId', userId).eq('materialId', materialId))
    .unique();
  
  return !!like;
}