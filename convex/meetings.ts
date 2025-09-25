import { v } from 'convex/values';

import { query, mutation } from './_generated/server';

function isteacheroradmin(role?: string | null) {
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

    const trialActive =
      plan === 'trial_user' && typeof trialEndsAt === 'number' && trialEndsAt > now;
    const isPaid = plan ? (plan !== 'free_user' && plan !== 'trial_user') || trialActive : false; // default to free if unknown
    const isTeacher = isTeacherOrAdmin(role);

    // Query upcoming meetings from now-1h to allow late joins - optimized with better filtering
    let query = ctx.db
      .query('meetings')
      .withIndex('byStartTime', (q: any) => q.gte('startTime', now - 3600));

    if (!isTeacher) {
      query = query.filter((q: any) => q.eq('published', true));
    }

    const results = await query.collect();

    // Optimized RSVP fetching - only fetch for meetings that exist
    const rsvpMap: Record<string, 'yes' | 'no' | 'maybe'> = {};
    if (userRecord && results.length > 0) {
      const meetingIds = results.map(m => m._id);
      const rsvps = await ctx.db
        .query('rsvps')
        .withIndex('byUser', (q: any) => q.eq('userId', userRecord._id))
        .filter((q: any) => meetingIds.includes(q.meetingId))
        .collect();
      for (const r of rsvps) {
        rsvpMap[r.meetingId] = r.status as any;
      }
    }

    return results
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

// Optimized query for current user's RSVPs - used for real-time polling
export const listMyRsvps = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) return [];

    const rsvps = await ctx.db
      .query('rsvps')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .collect();

    return rsvps.map(r => ({
      meetingId: r.meetingId,
      status: r.status,
      updatedAt: r.updatedAt,
    }));
  },
});

// Get meeting status and participant info (for real-time updates)
export const getMeetingStatus = query({
  args: { id: v.id('meetings') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');

    const meeting = await ctx.db.get(args.id);
    if (!meeting) throw new Error('Meeting not found');

    // Get RSVP summary for this meeting
    const rsvps = await ctx.db
      .query('rsvps')
      .withIndex('byMeetingUser', (q: any) => q.eq('meetingId', args.id))
      .collect();

    const byStatus: Record<string, number> = { yes: 0, no: 0, maybe: 0 };
    for (const r of rsvps) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }

    // Get my RSVP status
    const myRsvp = rsvps.find(r => r.userId === user._id)?.status;

    const now = Math.floor(Date.now() / 1000);
    const meetingData = meeting as any; // We know this is a meeting document
    const meetingStart = meetingData.startTime;
    const meetingEnd = meetingStart + (60 * 60); // Assume 1 hour duration

    return {
      id: meetingData._id,
      title: meetingData.title,
      startTime: meetingStart,
      endTime: meetingEnd,
      isActive: now >= meetingStart && now <= meetingEnd,
      isUpcoming: now < meetingStart,
      isPast: now > meetingEnd,
      rsvpCounts: byStatus,
      totalRsvps: rsvps.length,
      myRsvp: myRsvp as 'yes' | 'no' | 'maybe' | undefined,
      lastUpdated: Math.max(...rsvps.map(r => r.updatedAt)),
    };
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

    // Use optimized index for RSVP counts by meeting
    const list = await ctx.db
      .query('rsvps')
      .withIndex('byMeetingStatus', q => q.eq('meetingId', id))
      .collect();

    const byStatus: Record<string, number> = { yes: 0, no: 0, maybe: 0 } as any;
    for (const r of list) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    }
    return { counts: byStatus, total: list.length };
  },
});

// Optimized query for getting RSVP updates since a certain time (for real-time polling)
export const getRsvpUpdates = query({
  args: { since: v.optional(v.number()) },
  handler: async (ctx, { since }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');

    const cutoff = since || Math.floor(Date.now() / 1000) - 300; // Default to last 5 minutes

    const updates = await ctx.db
      .query('rsvps')
      .withIndex('byUpdatedAt', q => q.gte('updatedAt', cutoff))
      .collect();

    return updates.map(r => ({
      meetingId: r.meetingId,
      userId: r.userId,
      status: r.status,
      updatedAt: r.updatedAt,
    }));
  },
});
