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

// Week start calculation utility
export function getWeekStart(timestamp: number): number {
  const date = new Date(timestamp * 1000);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return Math.floor(monday.getTime() / 1000);
}

// Quiz points calculation utility
export function calculateQuizPoints(score: number): number {
  if (score >= 0.9) return 50; // Perfect or near-perfect
  if (score >= 0.8) return 40; // Excellent
  if (score >= 0.7) return 30; // Good
  if (score >= 0.6) return 20; // Average
  if (score >= 0.5) return 10; // Below average
  return 5; // Participation points
}