import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function isTeacherOrAdmin(role?: string | null) {
  return role === "teacher" || role === "admin";
}

export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const now = Math.floor(Date.now() / 1000);

    // Fetch current user (may be null if auth misconfigured)
    let plan: string | undefined;
    let role: string | undefined;
    let userRecord: any = null;
    if (identity) {
      userRecord = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      plan = userRecord?.plan;
      role = userRecord?.role;
    }

    // Query upcoming meetings from now-1h to allow late joins
    const results = await ctx.db
      .query("meetings")
      .withIndex("byStartTime", (q) => q.gte("startTime", now - 3600))
      .collect();

    const isPaid = plan ? plan !== "free_user" : false; // default to free if unknown
    const isTeacher = isTeacherOrAdmin(role);

    return results
      .filter((m) => (isTeacher ? true : m.published))
      .sort((a, b) => a.startTime - b.startTime)
      .map((m) => ({
        _id: m._id,
        title: m.title,
        description: m.description,
        startTime: m.startTime,
        published: m.published,
        // Hide join details for free users; teachers always see
        meetingNumber: isPaid || isTeacher ? m.meetingNumber : undefined,
        passcode: isPaid || isTeacher ? m.passcode : undefined,
      }));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(), // epoch seconds
    meetingNumber: v.string(),
    passcode: v.string(),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    if (!isTeacherOrAdmin(user.role)) throw new Error("Forbidden");

    const createdAt = Math.floor(Date.now() / 1000);
    await ctx.db.insert("meetings", {
      ...args,
      createdBy: user._id,
      createdAt,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("meetings"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    meetingNumber: v.optional(v.string()),
    passcode: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    if (!isTeacherOrAdmin(user.role)) throw new Error("Forbidden");
    await ctx.db.patch(id, patch as any);
  },
});

export const remove = mutation({
  args: { id: v.id("meetings") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    if (!isTeacherOrAdmin(user.role)) throw new Error("Forbidden");
    await ctx.db.delete(id);
  },
});

