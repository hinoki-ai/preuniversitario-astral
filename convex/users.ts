import { UserJSON } from '@clerk/backend';
import { v, Validator } from 'convex/values';

import { internalMutation, mutation, query, QueryCtx } from './_generated/server';

export const current = query({
  args: {},
  handler: async ctx => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    // Extract plan, role and optional trial end
    const publicMeta = (data.public_metadata as any) ?? {};
    let trialEndsAt: number | undefined = undefined;
    const trialRaw = publicMeta?.trialEndsAt;
    if (typeof trialRaw === 'number') {
      trialEndsAt = trialRaw;
    } else if (typeof trialRaw === 'string') {
      // Accept ISO string or integer string
      const n = Number(trialRaw);
      if (!Number.isNaN(n) && n > 1000000000) {
        trialEndsAt = n;
      } else {
        const d = new Date(trialRaw);
        if (!isNaN(d.getTime())) trialEndsAt = Math.floor(d.getTime() / 1000);
      }
    }
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
      plan: publicMeta?.plan ?? undefined,
      role: publicMeta?.role ?? undefined,
      trialEndsAt,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert('users', userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    }
    // Silently ignore if user doesn't exist - this is expected for some Clerk webhooks
  },
});

export const setPlanByExternalId = internalMutation({
  args: { externalId: v.string(), plan: v.string() },
  async handler(ctx, { externalId, plan }) {
    const user = await userByExternalId(ctx, externalId);
    if (!user) return;
    await ctx.db.patch(user._id, { plan });
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    externalId: v.string(),
    role: v.optional(v.string()),
    plan: v.optional(v.string()),
    trialEndsAt: v.optional(v.number()),
  },
  async handler(ctx, args) {
    return await ctx.db.insert('users', args);
  },
});

export const setTrialByExternalId = internalMutation({
  args: { externalId: v.string(), trialEndsAt: v.number() },
  async handler(ctx, { externalId, trialEndsAt }) {
    const user = await userByExternalId(ctx, externalId);
    if (!user) return;
    await ctx.db.patch(user._id, { plan: 'trial_user', trialEndsAt });
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('byExternalId', q => q.eq('externalId', externalId))
    .unique();
}
