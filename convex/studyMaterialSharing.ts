import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getUser } from './shared';

// Share study material with minimal overhead
export const shareStudyMaterial = mutation({
  args: {
    materialType: v.string(), // 'quiz_result', 'study_notes', 'concept_map', 'progress_summary'
    materialId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    subject: v.string(),
    difficulty: v.optional(v.string()),
    shareWith: v.string(), // 'public', 'friends', 'study_group', 'specific_users'
    recipients: v.optional(v.array(v.id('users'))), // For specific_users
    studyGroupId: v.optional(v.id('studyGroups')), // For study_group sharing
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    
    // Validate sharing permissions
    if (args.shareWith === 'study_group' && !args.studyGroupId) {
      throw new Error('Study group ID required for group sharing');
    }
    
    if (args.shareWith === 'specific_users' && (!args.recipients || args.recipients.length === 0)) {
      throw new Error('Recipients required for specific user sharing');
    }
    
    // Generate a simple share code
    const shareCode = generateShareCode();
    
    // Create the shared material entry
    const sharedMaterialId = await ctx.db.insert('sharedStudyMaterials', {
      userId: user._id,
      materialType: args.materialType,
      materialId: args.materialId,
      title: args.title,
      description: args.description || '',
      subject: args.subject,
      difficulty: args.difficulty || 'medium',
      shareWith: args.shareWith,
      recipients: args.recipients || [],
      studyGroupId: args.studyGroupId,
      tags: args.tags || [],
      shareCode,
      viewCount: 0,
      likeCount: 0,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });
    
    // If sharing with study group, notify members
    if (args.shareWith === 'study_group' && args.studyGroupId) {
      await notifyStudyGroupMembers(ctx, args.studyGroupId, user._id, args.title, shareCode);
    }
    
    // If sharing with specific users, create notifications
    if (args.shareWith === 'specific_users' && args.recipients) {
      await notifySpecificUsers(ctx, args.recipients, user._id, args.title, shareCode);
    }
    
    return {
      shareId: sharedMaterialId,
      shareCode,
      shareUrl: `${process.env.SITE_URL}/shared/${shareCode}`,
    };
  },
});

// Get shared study materials (discovery feed)
export const getSharedMaterials = query({
  args: {
    subject: v.optional(v.string()),
    materialType: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const limit = args.limit || 20;
    
    // Get materials the user can access
    let query = ctx.db
      .query('sharedStudyMaterials')
      .withIndex('byCreated', q => q.eq('isActive', true))
      .order('desc')
      .take(limit * 2); // Get more to filter
    
    const allMaterials = await query;
    
    // Filter based on sharing permissions
    const accessibleMaterials = allMaterials.filter(material => {
      switch (material.shareWith) {
        case 'public':
          return true;
        case 'friends':
          // Would need to check friend relationships
          return false; // Simplified for now
        case 'study_group':
          // Would need to check if user is in the group
          return false; // Simplified for now
        case 'specific_users':
          return material.recipients.includes(user._id);
        default:
          return false;
      }
    });
    
    // Apply additional filters
    let filteredMaterials = accessibleMaterials;
    
    if (args.subject) {
      filteredMaterials = filteredMaterials.filter(m => m.subject === args.subject);
    }
    
    if (args.materialType) {
      filteredMaterials = filteredMaterials.filter(m => m.materialType === args.materialType);
    }
    
    if (args.difficulty) {
      filteredMaterials = filteredMaterials.filter(m => m.difficulty === args.difficulty);
    }
    
    // Get creator info for each material
    const materialsWithCreators = await Promise.all(
      filteredMaterials.slice(0, limit).map(async (material) => {
        const creator = await ctx.db.get(material.userId);
        return {
          ...material,
          creatorName: creator?.name || 'Anonymous',
          isOwn: material.userId === user._id,
        };
      })
    );
    
    return materialsWithCreators;
  },
});

// Get a specific shared material by share code
export const getSharedMaterial = query({
  args: {
    shareCode: v.string(),
  },
  handler: async (ctx, { shareCode }) => {
    const user = await getUser(ctx);
    
    const sharedMaterial = await ctx.db
      .query('sharedStudyMaterials')
      .withIndex('byShareCode', q => q.eq('shareCode', shareCode))
      .unique();
    
    if (!sharedMaterial || !sharedMaterial.isActive) {
      throw new Error('Shared material not found or no longer available');
    }
    
    // Check access permissions
    const hasAccess = await checkMaterialAccess(ctx, sharedMaterial, user._id);
    
    if (!hasAccess) {
      throw new Error('You do not have permission to view this material');
    }
    
    // Increment view count (only once per user)
    const existingView = await ctx.db
      .query('materialViews')
      .withIndex('byUserMaterial', q => 
        q.eq('userId', user._id).eq('materialId', sharedMaterial._id))
      .unique();
    
    if (!existingView) {
      await ctx.db.insert('materialViews', {
        userId: user._id,
        materialId: sharedMaterial._id,
        viewedAt: Math.floor(Date.now() / 1000),
      });
      
      await ctx.db.patch(sharedMaterial._id, {
        viewCount: sharedMaterial.viewCount + 1,
        updatedAt: Math.floor(Date.now() / 1000),
      });
    }
    
    // Get the actual material data based on type
    const materialData = await getMaterialData(ctx, sharedMaterial);
    
    // Get creator info
    const creator = await ctx.db.get(sharedMaterial.userId);
    
    return {
      ...sharedMaterial,
      materialData,
      creatorName: creator?.name || 'Anonymous',
      isOwn: sharedMaterial.userId === user._id,
    };
  },
});

// Like/unlike a shared material
export const toggleMaterialLike = mutation({
  args: {
    shareCode: v.string(),
  },
  handler: async (ctx, { shareCode }) => {
    const user = await getUser(ctx);
    
    const sharedMaterial = await ctx.db
      .query('sharedStudyMaterials')
      .withIndex('byShareCode', q => q.eq('shareCode', shareCode))
      .unique();
    
    if (!sharedMaterial) {
      throw new Error('Shared material not found');
    }
    
    // Check if user already liked this material
    const existingLike = await ctx.db
      .query('materialLikes')
      .withIndex('byUserMaterial', q => 
        q.eq('userId', user._id).eq('materialId', sharedMaterial._id))
      .unique();
    
    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(sharedMaterial._id, {
        likeCount: Math.max(0, sharedMaterial.likeCount - 1),
        updatedAt: Math.floor(Date.now() / 1000),
      });
      return { liked: false, newLikeCount: Math.max(0, sharedMaterial.likeCount - 1) };
    } else {
      // Like
      await ctx.db.insert('materialLikes', {
        userId: user._id,
        materialId: sharedMaterial._id,
        likedAt: Math.floor(Date.now() / 1000),
      });
      await ctx.db.patch(sharedMaterial._id, {
        likeCount: sharedMaterial.likeCount + 1,
        updatedAt: Math.floor(Date.now() / 1000),
      });
      return { liked: true, newLikeCount: sharedMaterial.likeCount + 1 };
    }
  },
});

// Get user's own shared materials
export const getMySharedMaterials = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    const myMaterials = await ctx.db
      .query('sharedStudyMaterials')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .order('desc')
      .collect();
    
    return myMaterials.map(material => ({
      ...material,
      shareUrl: `${process.env.SITE_URL}/shared/${material.shareCode}`,
    }));
  },
});

// Delete/deactivate a shared material
export const deleteSharedMaterial = mutation({
  args: {
    shareCode: v.string(),
  },
  handler: async (ctx, { shareCode }) => {
    const user = await getUser(ctx);
    
    const sharedMaterial = await ctx.db
      .query('sharedStudyMaterials')
      .withIndex('byShareCode', q => q.eq('shareCode', shareCode))
      .unique();
    
    if (!sharedMaterial) {
      throw new Error('Shared material not found');
    }
    
    if (sharedMaterial.userId !== user._id) {
      throw new Error('You can only delete your own shared materials');
    }
    
    // Soft delete - just deactivate
    await ctx.db.patch(sharedMaterial._id, {
      isActive: false,
      updatedAt: Math.floor(Date.now() / 1000),
    });
    
    return { success: true };
  },
});

// Helper Functions

function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function checkMaterialAccess(ctx: any, material: any, userId: string): Promise<boolean> {
  switch (material.shareWith) {
    case 'public':
      return true;
    case 'friends':
      // Check if users are friends
      const friendship = await ctx.db
        .query('friendships')
        .withIndex('byUsers', q => 
          q.eq('user1Id', userId).eq('user2Id', material.userId))
        .unique();
      const reverseFriendship = await ctx.db
        .query('friendships')
        .withIndex('byUsers', q => 
          q.eq('user1Id', material.userId).eq('user2Id', userId))
        .unique();
      return !!(friendship || reverseFriendship);
    case 'study_group':
      if (!material.studyGroupId) return false;
      const groupMembership = await ctx.db
        .query('studyGroups')
        .filter(q => q.eq(q.field('_id'), material.studyGroupId))
        .unique();
      return groupMembership?.members?.some((m: any) => m.userId === userId) || false;
    case 'specific_users':
      return material.recipients.includes(userId) || material.userId === userId;
    default:
      return false;
  }
}

async function getMaterialData(ctx: any, sharedMaterial: any) {
  const { materialType, materialId } = sharedMaterial;
  
  switch (materialType) {
    case 'quiz_result':
      const quizAttempt = await ctx.db
        .query('quizAttempts')
        .filter(q => q.eq(q.field('_id'), materialId))
        .unique();
      return {
        score: quizAttempt?.score,
        totalQuestions: quizAttempt?.totalQuestions,
        timeSpent: quizAttempt?.timeSpent,
        completedAt: quizAttempt?.completedAt,
        subject: quizAttempt?.subject,
      };
    case 'study_notes':
      // Would fetch from a notes system
      return {
        content: 'Study notes content would be here',
        wordCount: 0,
        lastModified: sharedMaterial.updatedAt,
      };
    case 'progress_summary':
      // Would fetch user progress for a specific time period
      return {
        period: '1 week',
        quizzesCompleted: 0,
        avgScore: 0,
        streakDays: 0,
      };
    default:
      return {};
  }
}

async function notifyStudyGroupMembers(ctx: any, studyGroupId: string, sharerId: string, title: string, shareCode: string) {
  const studyGroup = await ctx.db.get(studyGroupId);
  if (!studyGroup || !studyGroup.members) return;
  
  const notifications = studyGroup.members
    .filter((member: any) => member.userId !== sharerId)
    .map((member: any) => ({
      userId: member.userId,
      type: 'material_shared',
      title: 'New Study Material Shared',
      message: `${title} was shared in your study group`,
      data: { shareCode },
      createdAt: Math.floor(Date.now() / 1000),
      read: false,
    }));
  
  // Insert notifications
  for (const notification of notifications) {
    await ctx.db.insert('notifications', notification);
  }
}

async function notifySpecificUsers(ctx: any, recipients: string[], sharerId: string, title: string, shareCode: string) {
  const notifications = recipients.map(userId => ({
    userId,
    type: 'material_shared',
    title: 'Study Material Shared With You',
    message: `${title} was shared with you`,
    data: { shareCode },
    createdAt: Math.floor(Date.now() / 1000),
    read: false,
  }));
  
  // Insert notifications
  for (const notification of notifications) {
    await ctx.db.insert('notifications', notification);
  }
}