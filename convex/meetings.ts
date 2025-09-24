import { v } from 'convex/values';

import { query, mutation } from './_generated/server';

function isTeacherOrAdmin(role?: string | null) {
  return role === 'teacher' || role === 'admin';
}

export const listUpcoming = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    const now = Math.floor(Date.now() / 1000);

    // Fetch current user (may be null if auth misconfigured)
    let plan: string | undefined;
    let role: string | undefined;
    let trialEndsAt: number | undefined;
    let userRecord: any = null;
    if (identity) {
      userRecord = await ctx.db
        .query('users')
        .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
        .unique();
      plan = userRecord?.plan;
      role = userRecord?.role;
      trialEndsAt = userRecord?.trialEndsAt;
    }

    // Query upcoming meetings from now-1h to allow late joins
    const results = await ctx.db
      .query('meetings')
      .withIndex('byStartTime', q => q.gte('startTime', now - 3600))
      .collect();

    const trialActive =
      plan === 'trial_user' && typeof trialEndsAt === 'number' && trialEndsAt > now;
    const isPaid = plan ? (plan !== 'free_user' && plan !== 'trial_user') || trialActive : false; // default to free if unknown
    const isTeacher = isTeacherOrAdmin(role);

    // If logged-in, fetch RSVPs for these meetings for current user
    const rsvpMap: Record<string, 'yes' | 'no' | 'maybe'> = {};
    if (userRecord) {
      const rsvps = await ctx.db
        .query('rsvps')
        .withIndex('byUser', q => q.eq('userId', userRecord._id))
        .collect();
      for (const r of rsvps) {
        rsvpMap[r.meetingId] = r.status as any;
      }
    }

    return results
      .filter(m => (isTeacher ? true : m.published))
      .sort((a, b) => a.startTime - b.startTime)
      .map(m => ({
        _id: m._id,
        title: m.title,
        description: m.description,
        startTime: m.startTime,
        published: m.published,
        attachments: m.attachments,
        // Hide join details for free users; teachers always see
        meetingNumber: isPaid || isTeacher ? m.meetingNumber : undefined,
        passcode: isPaid || isTeacher ? m.passcode : undefined,
        // Include my RSVP if logged in
        myRsvp: rsvpMap[m._id] as any as undefined | 'yes' | 'no' | 'maybe',
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
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (!isTeacherOrAdmin(user.role)) throw new Error('Forbidden');

    const createdAt = Math.floor(Date.now() / 1000);
    await ctx.db.insert('meetings', {
      ...args,
      createdBy: user._id,
      createdAt,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('meetings'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    meetingNumber: v.optional(v.string()),
    passcode: v.optional(v.string()),
    published: v.optional(v.boolean()),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, { id, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (!isTeacherOrAdmin(user.role)) throw new Error('Forbidden');
    await ctx.db.patch(id, patch as any);
  },
});

export const remove = mutation({
  args: { id: v.id('meetings') },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (!isTeacherOrAdmin(user.role)) throw new Error('Forbidden');
    await ctx.db.delete(id);
  },
});

// Upsert RSVP for the current user
export const rsvp = mutation({
  args: {
    meetingId: v.id('meetings'),
    status: v.union(v.literal('yes'), v.literal('no'), v.literal('maybe')),
  },
  handler: async (ctx, { meetingId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    const now = Math.floor(Date.now() / 1000);

    const existing = await ctx.db
      .query('rsvps')
      .withIndex('byMeetingUser', q => q.eq('meetingId', meetingId).eq('userId', user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { status, updatedAt: now });
    } else {
      await ctx.db.insert('rsvps', { meetingId, userId: user._id, status, updatedAt: now });
    }
  },
});

export const listRsvps = query({
  args: { id: v.id('meetings') },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (!isTeacherOrAdmin(user.role)) throw new Error('Forbidden');

    const list = await ctx.db
      .query('rsvps')
      .withIndex('byMeetingUser', q => q.eq('meetingId', id))
      .collect();
    const byStatus: Record<string, number> = { yes: 0, no: 0, maybe: 0 } as any;
    for (const r of list) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }
    return { counts: byStatus, total: list.length };
  },
});
