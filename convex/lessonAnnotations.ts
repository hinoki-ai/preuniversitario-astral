import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

const annotationType = v.union(v.literal('note'), v.literal('bookmark'));

async function ensureuser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');

  const user = await ctx.db
    .query('users')
    .withIndex('byExternalId', (q: any) => q.eq('externalId', identity.subject))
    .unique();

  if (!user) throw new Error('User not found');
  return user;
}

export const listLessonAnnotations = query({
  args: { lessonId: v.id('lessons') },
  handler: async (ctx, { lessonId }) => {
    const user = await ensureUser(ctx);

    const annotations = await ctx.db
      .query('lessonAnnotations')
      .withIndex('byLessonUser', (q: any) => q.eq('lessonId', lessonId).eq('userId', user._id))
      .collect();

    return annotations.sort((a, b) => {
      const tsA = a.timestampSec ?? Number.MAX_SAFE_INTEGER;
      const tsB = b.timestampSec ?? Number.MAX_SAFE_INTEGER;
      if (tsA !== tsB) return tsA - tsB;
      return a.createdAt - b.createdAt;
    });
  },
});

export const createLessonAnnotation = mutation({
  args: {
    lessonId: v.id('lessons'),
    type: annotationType,
    timestampSec: v.optional(v.number()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, { lessonId, type, timestampSec, content }) => {
    const user = await ensureUser(ctx);
    const now = Math.floor(Date.now() / 1000);

    const clampedTimestamp =
      typeof timestampSec === 'number' && Number.isFinite(timestampSec)
        ? Math.max(0, Math.round(timestampSec))
        : undefined;

    const annotationId = await ctx.db.insert('lessonAnnotations', {
      userId: user._id,
      lessonId,
      type,
      timestampSec: clampedTimestamp,
      content: content ?? '',
      createdAt: now,
      updatedAt: now,
    });

    return annotationId;
  },
});

export const updateLessonAnnotation = mutation({
  args: {
    id: v.id('lessonAnnotations'),
    content: v.optional(v.string()),
    timestampSec: v.optional(v.number()),
  },
  handler: async (ctx, { id, content, timestampSec }) => {
    const user = await ensureUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Annotation not found');
    if (existing.userId !== user._id) throw new Error('Forbidden');

    const patch: Record<string, unknown> = { updatedAt: Math.floor(Date.now() / 1000) };

    if (typeof content === 'string') {
      patch.content = content;
    }

    if (typeof timestampSec === 'number' && Number.isFinite(timestampSec)) {
      patch.timestampSec = Math.max(0, Math.round(timestampSec));
    }

    await ctx.db.patch(id, patch);
  },
});

export const deleteLessonAnnotation = mutation({
  args: { id: v.id('lessonAnnotations') },
  handler: async (ctx, { id }) => {
    const user = await ensureUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) return;
    if (existing.userId !== user._id) throw new Error('Forbidden');
    await ctx.db.delete(id);
  },
});
