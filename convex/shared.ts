// Shared utility functions for Convex backend
import { v } from 'convex/values';

// Role-based access control utilities
export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Get authenticated user with role verification
export async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("byExternalId", (q: any) => q.eq("externalId", identity.subject))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

// Get user with role requirement
export async function getUserWithRole(ctx: any, requiredRole: UserRole) {
  const user = await getAuthenticatedUser(ctx);
  requireRole(user, requiredRole);
  return user;
}

// Admin-only function helper
export async function requireAdmin(ctx: any) {
  return getUserWithRole(ctx, ROLES.ADMIN);
}

// Teacher or Admin function helper
export async function requireTeacherOrAdmin(ctx: any) {
  const user = await getAuthenticatedUser(ctx);
  if (!hasAnyRole(user, [ROLES.TEACHER, ROLES.ADMIN])) {
    throw new Error("Access denied. Teacher or Admin role required.");
  }
  return user;
}

// Verify user has required role
export function requireRole(user: any, requiredRole: UserRole) {
  if (!user.role) {
    throw new Error("User role not set");
  }

  const roleHierarchy = {
    [ROLES.STUDENT]: 1,
    [ROLES.TEACHER]: 2,
    [ROLES.ADMIN]: 3,
  };

  // Ensure user.role is a valid role before using it as an index
  const userRole = user.role as UserRole;
  if (roleHierarchy[userRole] === undefined) {
    throw new Error(`Invalid user role: ${userRole}`);
  }

  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    throw new Error(`Access denied. Required role: ${requiredRole}, user role: ${userRole}`);
  }
}

// Check if user has any of the specified roles
export function hasAnyRole(user: any, roles: UserRole[]): boolean {
  const userRole = user.role as UserRole;
  return roles.includes(userRole);
}

// Helper function to get current user (legacy compatibility)
export async function getUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("byExternalId", (q: any) => q.eq("externalId", identity.subject))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

// Level calculation utility (consolidated from multiple files)
export function calculateLevel(experiencePoints: number): { level: number; pointsToNext: number } {
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

// TIMEZONE-AWARE Date utilities
export function getWeekStart(timestamp: number, timezone = 'UTC'): number {
  // Use proper timezone handling instead of naive date manipulation
  const date = new Date(timestamp * 1000);
  const utcDay = date.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToMonday = utcDay === 0 ? -6 : 1 - utcDay;
  const monday = new Date(date);
  monday.setUTCDate(monday.getUTCDate() + daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  return Math.floor(monday.getTime() / 1000);
}

export function getDayStart(timestamp: number, timezone = 'UTC'): number {
  const date = new Date(timestamp * 1000);
  date.setUTCHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

export function isSameDay(timestamp1: number, timestamp2: number): boolean {
  return getDayStart(timestamp1) === getDayStart(timestamp2);
}

export function daysBetween(timestamp1: number, timestamp2: number): number {
  const day1 = getDayStart(timestamp1);
  const day2 = getDayStart(timestamp2);
  return Math.abs(day2 - day1) / (24 * 3600);
}

// DIFFICULTY-BASED Esencia Arcana calculation (replaces time-grinding points)
export function calculateEsenciaArcana(
  score: number, 
  difficulty: string, 
  timeSpent: number, 
  conceptsMastered: number = 0,
  retentionBonus: number = 0
): number {
  // Base score component (40% of total)
  let baseEsencia = 0;
  if (score >= 0.95) baseEsencia = 100; // Near perfect
  else if (score >= 0.9) baseEsencia = 80; // Excellent
  else if (score >= 0.8) baseEsencia = 60; // Good
  else if (score >= 0.7) baseEsencia = 40; // Fair
  else if (score >= 0.6) baseEsencia = 20; // Passing
  else baseEsencia = 5; // Participation

  // Difficulty multiplier (30% of total)
  let difficultyMultiplier = 1.0;
  switch (difficulty.toLowerCase()) {
    case 'leyenda': difficultyMultiplier = 2.5; break;
    case 'paladín': difficultyMultiplier = 2.0; break;
    case 'guerrero': difficultyMultiplier = 1.5; break;
    case 'escudero': difficultyMultiplier = 1.0; break;
    default: difficultyMultiplier = 1.0;
  }

  // Concept mastery bonus (20% of total)
  const masteryBonus = conceptsMastered * 10; // 10 esencia per concept mastered

  // Optimal time bonus (10% of total) - rewards efficiency, not grinding
  let timeEfficiencyBonus = 0;
  const optimalTimeRange = [60, 300]; // 1-5 minutes optimal range
  if (timeSpent >= optimalTimeRange[0] && timeSpent <= optimalTimeRange[1]) {
    timeEfficiencyBonus = 15; // Bonus for optimal time spent
  } else if (timeSpent > optimalTimeRange[1]) {
    // Penalty for taking too long (potential time wasting)
    const excessTime = timeSpent - optimalTimeRange[1];
    timeEfficiencyBonus = Math.max(0, 15 - (excessTime / 60) * 2); // Lose 2 points per minute over
  }

  // Calculate total
  const totalEsencia = Math.floor(
    baseEsencia * difficultyMultiplier + masteryBonus + timeEfficiencyBonus + retentionBonus
  );

  // Cap maximum esencia to prevent exploitation
  const maxEsencia = difficulty === 'leyenda' ? 300 : difficulty === 'paladín' ? 200 : 150;
  return Math.min(totalEsencia, maxEsencia);
}

// COMPREHENSIVE VALIDATION SYSTEM
export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-1 confidence score
  flags: string[];
  details?: any;
}

export function validateStudySession(
  startTime: number,
  endTime: number,
  actions: Array<{ type: string; timestamp: number; data?: any }>,
  userHistory: any[]
): ValidationResult {
  const flags: string[] = [];
  let score = 1.0;

  const duration = endTime - startTime;
  const now = Math.floor(Date.now() / 1000);

  // Time validation
  if (duration < 30) {
    flags.push('session_too_short');
    score -= 0.3;
  }
  if (duration > 7200) { // 2 hours max
    flags.push('session_too_long');
    score -= 0.4;
  }
  if (endTime > now + 60) { // Allow 1 minute clock skew
    flags.push('future_timestamp');
    score -= 0.8;
  }

  // Action pattern validation
  if (actions.length === 0) {
    flags.push('no_actions_recorded');
    score -= 0.5;
  }

  const actionDensity = actions.length / (duration / 60); // actions per minute
  if (actionDensity > 10) { // Too many actions
    flags.push('suspicious_action_density');
    score -= 0.6;
  }
  if (actionDensity < 0.1 && duration > 300) { // Too few actions for long session
    flags.push('inactive_session');
    score -= 0.3;
  }

  // Check for rapid repeated actions (potential automation)
  const actionIntervals = actions.slice(1).map((action, i) => 
    action.timestamp - actions[i].timestamp
  );
  const suspiciousPatterns = actionIntervals.filter(interval => interval < 1).length;
  if (suspiciousPatterns > 5) {
    flags.push('rapid_repeated_actions');
    score -= 0.7;
  }

  // Historical consistency check
  if (userHistory.length > 0) {
    const avgSessionDuration = userHistory.reduce((sum, session) => 
      sum + (session.endTime - session.startTime), 0) / userHistory.length;
    
    if (duration > avgSessionDuration * 3) {
      flags.push('unusual_session_length');
      score -= 0.2;
    }
  }

  return {
    isValid: score > 0.3 && !flags.includes('future_timestamp'),
    score: Math.max(0, score),
    flags
  };
}

export function validateQuizSubmission(
  startTime: number,
  answers: number[],
  timeTaken: number,
  userHistory: any[]
): ValidationResult {
  const flags: string[] = [];
  let score = 1.0;

  // Time validation
  const avgTimePerQuestion = timeTaken / answers.length;
  if (avgTimePerQuestion < 5) { // Less than 5 seconds per question
    flags.push('suspiciously_fast');
    score -= 0.6;
  }
  if (avgTimePerQuestion > 600) { // More than 10 minutes per question
    flags.push('suspiciously_slow');
    score -= 0.3;
  }

  // Pattern detection
  const uniqueAnswers = new Set(answers).size;
  if (uniqueAnswers === 1 && answers.length > 5) {
    flags.push('all_same_answer');
    score -= 0.8;
  }

  // Sequential pattern detection
  let sequentialCount = 0;
  for (let i = 1; i < answers.length; i++) {
    if (answers[i] === answers[i-1] + 1 || answers[i] === answers[i-1]) {
      sequentialCount++;
    }
  }
  if (sequentialCount / answers.length > 0.7) {
    flags.push('sequential_pattern');
    score -= 0.5;
  }

  return {
    isValid: score > 0.4,
    score: Math.max(0, score),
    flags
  };
}

export function validateProgressEvent(
  userId: string,
  eventType: string,
  value: number | undefined,
  timestamp: number,
  sessionId?: string,
  recentEvents: any[] = []
): ValidationResult {
  const flags: string[] = [];
  let score = 1.0;
  const now = Math.floor(Date.now() / 1000);

  // Timestamp validation
  if (timestamp > now + 60) {
    flags.push('future_timestamp');
    score -= 0.9;
  }
  if (timestamp < now - 86400) { // Older than 24 hours
    flags.push('old_timestamp');
    score -= 0.2;
  }

  // Value range validation
  if (value !== undefined) {
    if (eventType === 'quiz_completed' && (value < 0 || value > 1)) {
      flags.push('invalid_score_range');
      score -= 0.8;
    }
    if (eventType === 'study_session' && value > 480) { // More than 8 hours
      flags.push('excessive_study_time');
      score -= 0.6;
    }
  }

  // Rate limiting check
  const recentSimilarEvents = recentEvents.filter(event => 
    event.kind === eventType && 
    event.createdAt > timestamp - 3600 && // Within last hour
    event.userId === userId
  );

  const maxEventsPerHour = {
    'quiz_completed': 10,
    'lesson_viewed': 20,
    'study_session': 5,
    'achievement_earned': 3
  };

  const limit = maxEventsPerHour[eventType as keyof typeof maxEventsPerHour] || 5;
  if (recentSimilarEvents.length >= limit) {
    flags.push('rate_limit_exceeded');
    score -= 0.7;
  }

  // Duplicate session check
  if (sessionId && recentEvents.some(event => event.sessionId === sessionId)) {
    flags.push('duplicate_session');
    score -= 0.9;
  }

  return {
    isValid: score > 0.5 && !flags.includes('future_timestamp') && !flags.includes('duplicate_session'),
    score: Math.max(0, score),
    flags
  };
}

// Medieval level titles mapping
export function getLevelTitle(level: number): { title: string; rank: string } {
  if (level >= 1 && level <= 5) {
    return {
      title: `Escudero de Nivel ${level}`,
      rank: 'Escudero'
    };
  } else if (level >= 6 && level <= 10) {
    return {
      title: `Guerrero de Nivel ${level}`,
      rank: 'Guerrero'
    };
  } else if (level >= 11 && level <= 15) {
    return {
      title: `Paladín de Nivel ${level}`,
      rank: 'Paladín'
    };
  } else if (level >= 16 && level <= 25) {
    return {
      title: `Maestro de Nivel ${level}`,
      rank: 'Maestro'
    };
  } else if (level >= 26) {
    return {
      title: `Leyenda Viva de Nivel ${level}`,
      rank: 'Leyenda Viva'
    };
  }

  // Fallback
  return {
    title: `Aprendiz de Nivel ${level}`,
    rank: 'Aprendiz'
  };
}

// Calculate points earned from quiz score (0.0 to 1.0)
export function calculateQuizPoints(score: number): number {
  if (score >= 0.9) return 10; // Perfect or near perfect
  if (score >= 0.8) return 8;  // Excellent
  if (score >= 0.7) return 6;  // Good
  if (score >= 0.6) return 4;  // Satisfactory
  if (score >= 0.5) return 2;  // Passing
  return 0; // Below passing
}