import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

export const listSubjects = query({
  args: {},
  handler: async ctx => {
    const lessons = await ctx.db.query('lessons').collect();
    const set = new Set<string>();
    for (const l of lessons) if (l.subject) set.add(l.subject);
    return Array.from(set).sort();
  },
});

export const listLessons = query({
  args: { subject: v.optional(v.string()) },
  handler: async (ctx, { subject }) => {
    const results = await ctx.db.query('lessons').collect();
    return results
      .filter(l => (subject ? l.subject === subject : true))
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(l => ({
        _id: l._id,
        title: l.title,
        subject: l.subject,
        videoUrl: l.videoUrl,
        pdfUrl: l.pdfUrl,
      }));
  },
});

export const getLesson = query({
  args: { id: v.id('lessons') },
  handler: async (ctx, { id }) => {
    const l = await ctx.db.get(id);
    if (!l) return null;
    return l;
  },
});

export const createLesson = mutation({
  args: {
    moduleId: v.id('modules'),
    title: v.string(),
    order: v.number(),
    subject: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    transcript: v.optional(v.string()),
    attachments: v.optional(v.array(v.object({ name: v.string(), url: v.string() }))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Allow direct creation during seeding
      await ctx.db.insert('lessons', { ...args });
      return;
    }
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('Forbidden');
    await ctx.db.insert('lessons', { ...args });
  },
});

export const createCourse = mutation({
  args: {
    title: v.string(),
    track: v.string(),
    createdBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Allow creation during seeding (for admin users) or require auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Allow direct creation during seeding
      return await ctx.db.insert('courses', { ...args, createdAt: Math.floor(Date.now() / 1000) });
    }
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('Forbidden');
    return await ctx.db.insert('courses', { ...args, createdAt: Math.floor(Date.now() / 1000) });
  },
});

export const createModule = mutation({
  args: {
    courseId: v.id('courses'),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Allow direct creation during seeding
      return await ctx.db.insert('modules', args);
    }
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('Forbidden');
    return await ctx.db.insert('modules', args);
  },
});

export const markLessonViewed = mutation({
  args: { lessonId: v.id('lessons') },
  handler: async (ctx, { lessonId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    const lesson = await ctx.db.get(lessonId);
    const subject = (lesson as any)?.subject;
    const now = Math.floor(Date.now() / 1000);
    await ctx.db.insert('progressEvents', {
      userId: user._id,
      subject,
      kind: 'lesson_viewed',
      value: 1,
      createdAt: now,
    });
  },
});
