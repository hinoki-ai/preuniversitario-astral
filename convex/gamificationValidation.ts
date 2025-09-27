import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getUser } from './shared';

// Comprehensive validation system for gamification actions
export const validateAndRecordAction = mutation({
  args: {
    actionType: v.string(), // 'quiz_completed', 'lesson_viewed', 'mission_progress', 'achievement_earned'
    actionData: v.object({
      itemId: v.string(),
      score: v.optional(v.number()),
      timeSpent: v.number(), // seconds
      accuracy: v.optional(v.number()),
      attempts: v.optional(v.number()),
      difficulty: v.optional(v.string()),
      subject: v.optional(v.string()),
      sessionId: v.string(),
      clientTimestamp: v.number(),
      previousScore: v.optional(v.number()),
    }),
    clientFingerprint: v.string(), // Browser/device fingerprint for fraud detection
  },
  handler: async (ctx, { actionType, actionData, clientFingerprint }) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    
    // Basic validation
    const validationResult = await performComprehensiveValidation(ctx, user._id, actionType, actionData, clientFingerprint);
    
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.reason}`);
    }
    
    // Record the validated action
    await ctx.db.insert('validatedActions', {
      userId: user._id,
      actionType,
      itemId: actionData.itemId,
      score: actionData.score,
      timeSpent: actionData.timeSpent,
      accuracy: actionData.accuracy,
      attempts: actionData.attempts || 1,
      difficulty: actionData.difficulty || 'medium',
      subject: actionData.subject,
      sessionId: actionData.sessionId,
      clientTimestamp: actionData.clientTimestamp,
      serverTimestamp: now,
      clientFingerprint,
      validationScore: validationResult.validationScore,
      flaggedAsSuspicious: validationResult.validationScore < 0.5,
      metadata: validationResult.metadata,
    });
    
    return {
      validated: true,
      validationScore: validationResult.validationScore,
      canProceed: validationResult.validationScore >= 0.5,
    };
  },
});

// Get user's validation history (for admin/debugging)
export const getUserValidationHistory = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 50 }) => {
    const currentUser = await getUser(ctx);
    
    // Only allow users to see their own history, or admins to see any
    if (currentUser._id !== userId && !isAdmin(currentUser)) {
      throw new Error('Permission denied');
    }
    
    const validationHistory = await ctx.db
      .query('validatedActions')
      .withIndex('byUser', q => q.eq('userId', userId))
      .order('desc')
      .take(limit);
    
    return validationHistory;
  },
});

// Get validation statistics for monitoring
export const getValidationStats = query({
  args: {
    timeRangeHours: v.optional(v.number()),
  },
  handler: async (ctx, { timeRangeHours = 24 }) => {
    const currentUser = await getUser(ctx);
    
    if (!isAdmin(currentUser)) {
      throw new Error('Admin access required');
    }
    
    const since = Math.floor(Date.now() / 1000) - (timeRangeHours * 3600);
    
    const recentActions = await ctx.db
      .query('validatedActions')
      .withIndex('byTimestamp', q => q.gte('serverTimestamp', since))
      .collect();
    
    const totalActions = recentActions.length;
    const suspiciousActions = recentActions.filter(a => a.flaggedAsSuspicious).length;
    const averageValidationScore = totalActions > 0 
      ? recentActions.reduce((sum, a) => sum + a.validationScore, 0) / totalActions 
      : 0;
    
    const actionsByType = recentActions.reduce((acc, action) => {
      acc[action.actionType] = (acc[action.actionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const suspiciousUsers = [...new Set(
      recentActions
        .filter(a => a.flaggedAsSuspicious)
        .map(a => a.userId)
    )];
    
    return {
      timeRangeHours,
      totalActions,
      suspiciousActions,
      suspiciousActionRate: totalActions > 0 ? suspiciousActions / totalActions : 0,
      averageValidationScore,
      actionsByType,
      suspiciousUsers: suspiciousUsers.length,
    };
  },
});

// Flag suspicious users for review
export const flagUserForReview = mutation({
  args: {
    userId: v.id('users'),
    reason: v.string(),
    evidence: v.string(),
  },
  handler: async (ctx, { userId, reason, evidence }) => {
    const currentUser = await getUser(ctx);
    
    if (!isAdmin(currentUser)) {
      throw new Error('Admin access required');
    }
    
    await ctx.db.insert('userFlags', {
      userId,
      flaggedBy: currentUser._id,
      reason,
      evidence,
      status: 'pending_review',
      createdAt: Math.floor(Date.now() / 1000),
    });
    
    return { success: true };
  },
});

// Core validation function
async function performComprehensiveValidation(
  ctx: any, 
  userId: string, 
  actionType: string, 
  actionData: any, 
  clientFingerprint: string
) {
  const now = Math.floor(Date.now() / 1000);
  let validationScore = 1.0;
  const metadata: any = {};
  const issues: string[] = [];
  
  // 1. Time-based validation
  const timeValidation = validateTiming(actionData, now);
  validationScore *= timeValidation.score;
  if (timeValidation.issues.length > 0) {
    issues.push(...timeValidation.issues);
    metadata.timeIssues = timeValidation.issues;
  }
  
  // 2. Rate limiting validation
  const rateLimitValidation = await validateRateLimit(ctx, userId, actionType, now);
  validationScore *= rateLimitValidation.score;
  if (rateLimitValidation.issues.length > 0) {
    issues.push(...rateLimitValidation.issues);
    metadata.rateLimitIssues = rateLimitValidation.issues;
  }
  
  // 3. Performance consistency validation
  const performanceValidation = await validatePerformanceConsistency(ctx, userId, actionData);
  validationScore *= performanceValidation.score;
  if (performanceValidation.issues.length > 0) {
    issues.push(...performanceValidation.issues);
    metadata.performanceIssues = performanceValidation.issues;
  }
  
  // 4. Session validation
  const sessionValidation = await validateSession(ctx, userId, actionData.sessionId, clientFingerprint);
  validationScore *= sessionValidation.score;
  if (sessionValidation.issues.length > 0) {
    issues.push(...sessionValidation.issues);
    metadata.sessionIssues = sessionValidation.issues;
  }
  
  // 5. Action-specific validation
  const actionValidation = validateActionSpecifics(actionType, actionData);
  validationScore *= actionValidation.score;
  if (actionValidation.issues.length > 0) {
    issues.push(...actionValidation.issues);
    metadata.actionSpecificIssues = actionValidation.issues;
  }
  
  // 6. Pattern analysis
  const patternValidation = await validateBehavioralPatterns(ctx, userId, actionType, actionData);
  validationScore *= patternValidation.score;
  if (patternValidation.issues.length > 0) {
    issues.push(...patternValidation.issues);
    metadata.patternIssues = patternValidation.issues;
  }
  
  const isValid = validationScore >= 0.3; // Minimum threshold
  const reason = issues.length > 0 ? issues.join('; ') : 'Valid action';
  
  return {
    isValid,
    validationScore,
    reason,
    metadata,
  };
}

// Individual validation functions
function validateTiming(actionData: any, serverTime: number) {
  const issues: string[] = [];
  let score = 1.0;
  
  // Check if client timestamp is reasonable (within 5 minutes of server time)
  const timeDiff = Math.abs(serverTime - actionData.clientTimestamp);
  if (timeDiff > 300) { // 5 minutes
    issues.push(`Suspicious time difference: ${timeDiff}s`);
    score *= 0.5;
  }
  
  // Check if time spent is reasonable for the action
  const minTimeByAction: Record<string, number> = {
    quiz_completed: 30, // At least 30 seconds for a quiz
    lesson_viewed: 10,  // At least 10 seconds for a lesson
    mission_progress: 5, // At least 5 seconds for mission progress
  };
  
  const minTime = minTimeByAction[actionData.itemId?.split('_')[0]] || 5;
  if (actionData.timeSpent < minTime) {
    issues.push(`Time spent too short: ${actionData.timeSpent}s (min: ${minTime}s)`);
    score *= 0.3;
  }
  
  // Check for impossibly fast completion
  if (actionData.timeSpent < 1) {
    issues.push('Impossibly fast completion');
    score *= 0.1;
  }
  
  return { score, issues };
}

async function validateRateLimit(ctx: any, userId: string, actionType: string, now: number) {
  const issues: string[] = [];
  let score = 1.0;
  
  // Check recent actions in the last minute
  const recentActions = await ctx.db
    .query('validatedActions')
    .withIndex('byUserTimestamp', q => 
      q.eq('userId', userId).gte('serverTimestamp', now - 60))
    .collect();
  
  // Rate limits by action type
  const rateLimits: Record<string, number> = {
    quiz_completed: 3,    // Max 3 quizzes per minute
    lesson_viewed: 10,    // Max 10 lessons per minute
    mission_progress: 20, // Max 20 mission updates per minute
    achievement_earned: 5, // Max 5 achievements per minute
  };
  
  const limit = rateLimits[actionType] || 10;
  const recentCount = recentActions.filter(a => a.actionType === actionType).length;
  
  if (recentCount >= limit) {
    issues.push(`Rate limit exceeded: ${recentCount}/${limit} per minute`);
    score *= 0.2;
  }
  
  // Check for burst activity patterns (suspicious)
  if (recentActions.length > 50) { // More than 50 actions per minute
    issues.push('Extremely high activity rate');
    score *= 0.1;
  }
  
  return { score, issues };
}

async function validatePerformanceConsistency(ctx: any, userId: string, actionData: any) {
  const issues: string[] = [];
  let score = 1.0;
  
  if (!actionData.score && !actionData.accuracy) {
    return { score: 1.0, issues: [] }; // Skip if no performance data
  }
  
  // Get user's historical performance
  const recentActions = await ctx.db
    .query('validatedActions')
    .withIndex('byUser', q => q.eq('userId', userId))
    .order('desc')
    .take(20);
  
  const similarActions = recentActions.filter(a => 
    a.actionType === 'quiz_completed' && 
    a.subject === actionData.subject &&
    a.difficulty === actionData.difficulty
  );
  
  if (similarActions.length >= 3) {
    const avgScore = similarActions.reduce((sum, a) => sum + (a.score || 0), 0) / similarActions.length;
    const avgAccuracy = similarActions.reduce((sum, a) => sum + (a.accuracy || 0), 0) / similarActions.length;
    
    // Check for sudden dramatic improvement
    if (actionData.score && actionData.score > avgScore * 1.8) {
      issues.push(`Sudden score improvement: ${actionData.score} vs avg ${avgScore.toFixed(1)}`);
      score *= 0.6;
    }
    
    if (actionData.accuracy && actionData.accuracy > avgAccuracy * 1.5) {
      issues.push(`Sudden accuracy improvement: ${actionData.accuracy}% vs avg ${avgAccuracy.toFixed(1)}%`);
      score *= 0.6;
    }
    
    // Check for perfect scores on difficult content without gradual improvement
    if (actionData.accuracy === 100 && avgAccuracy < 70 && actionData.difficulty === 'hard') {
      issues.push('Perfect score on hard content without gradual improvement');
      score *= 0.4;
    }
  }
  
  return { score, issues };
}

async function validateSession(ctx: any, userId: string, sessionId: string, clientFingerprint: string) {
  const issues: string[] = [];
  let score = 1.0;
  
  // Check if session exists and is valid
  const sessionActions = await ctx.db
    .query('validatedActions')
    .withIndex('byUserSession', q => q.eq('userId', userId).eq('sessionId', sessionId))
    .collect();
  
  // Check for fingerprint consistency within session
  if (sessionActions.length > 0) {
    const uniqueFingerprints = new Set(sessionActions.map(a => a.clientFingerprint));
    if (uniqueFingerprints.size > 1 && !uniqueFingerprints.has(clientFingerprint)) {
      issues.push('Fingerprint inconsistency within session');
      score *= 0.3;
    }
  }
  
  // Check for session duration (shouldn't be too long)
  if (sessionActions.length > 0) {
    const sessionStart = Math.min(...sessionActions.map(a => a.serverTimestamp));
    const sessionDuration = Date.now() / 1000 - sessionStart;
    
    if (sessionDuration > 14400) { // 4 hours
      issues.push(`Extremely long session: ${sessionDuration / 3600}h`);
      score *= 0.7;
    }
  }
  
  return { score, issues };
}

function validateActionSpecifics(actionType: string, actionData: any) {
  const issues: string[] = [];
  let score = 1.0;
  
  switch (actionType) {
    case 'quiz_completed':
      // Quiz-specific validation
      if (actionData.score > 100 || actionData.score < 0) {
        issues.push('Invalid score range');
        score *= 0.1;
      }
      
      if (actionData.accuracy > 100 || actionData.accuracy < 0) {
        issues.push('Invalid accuracy range');
        score *= 0.1;
      }
      
      // Check if score and accuracy are consistent
      if (actionData.score && actionData.accuracy) {
        const expectedScore = actionData.accuracy; // Assuming 1:1 mapping
        const scoreDiff = Math.abs(actionData.score - expectedScore);
        if (scoreDiff > 10) {
          issues.push(`Score-accuracy mismatch: ${scoreDiff} points`);
          score *= 0.6;
        }
      }
      break;
      
    case 'lesson_viewed':
      // Lesson-specific validation
      if (actionData.timeSpent > 7200) { // 2 hours max per lesson
        issues.push('Unreasonably long lesson viewing time');
        score *= 0.8;
      }
      break;
      
    case 'mission_progress':
      // Mission-specific validation
      if (!actionData.itemId.includes('mission_')) {
        issues.push('Invalid mission ID format');
        score *= 0.5;
      }
      break;
  }
  
  return { score, issues };
}

async function validateBehavioralPatterns(ctx: any, userId: string, actionType: string, actionData: any) {
  const issues: string[] = [];
  let score = 1.0;
  
  // Get user's recent activity pattern
  const recentActions = await ctx.db
    .query('validatedActions')
    .withIndex('byUser', q => q.eq('userId', userId))
    .order('desc')
    .take(50);
  
  if (recentActions.length < 5) {
    return { score: 1.0, issues: [] }; // Not enough data for pattern analysis
  }
  
  // Check for robotic behavior patterns
  const timeBetweenActions = [];
  for (let i = 0; i < recentActions.length - 1; i++) {
    const diff = recentActions[i].serverTimestamp - recentActions[i + 1].serverTimestamp;
    timeBetweenActions.push(diff);
  }
  
  // Check if intervals are suspiciously regular
  if (timeBetweenActions.length >= 5) {
    const variance = calculateVariance(timeBetweenActions);
    const mean = timeBetweenActions.reduce((a, b) => a + b, 0) / timeBetweenActions.length;
    
    if (variance < mean * 0.1 && mean < 120) { // Very regular pattern under 2 minutes
      issues.push('Suspiciously regular activity pattern');
      score *= 0.4;
    }
  }
  
  // Check for identical performance patterns
  const sameTypeActions = recentActions.filter(a => a.actionType === actionType);
  if (sameTypeActions.length >= 5) {
    const scores = sameTypeActions.map(a => a.score).filter(s => s !== null && s !== undefined);
    const uniqueScores = new Set(scores);
    
    if (scores.length >= 5 && uniqueScores.size === 1) {
      issues.push('Identical performance across multiple attempts');
      score *= 0.3;
    }
  }
  
  return { score, issues };
}

// Helper functions
function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function isAdmin(user: any): boolean {
  // This would check if user has admin role
  return user?.role === 'admin' || user?.email?.includes('@admin.') || false;
}