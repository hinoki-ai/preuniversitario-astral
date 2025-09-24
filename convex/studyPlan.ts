import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

function weekStartUtc(tsSec: number): number {
  const d = new Date(tsSec * 1000);
  const day = d.getUTCDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

const defaultItemsByTrack: Record<
  string,
  {
    id: number;
    header: string;
    type: string;
    status: string;
    target: string;
    limit: string;
    reviewer: string;
    order: number;
  }[]
> = {
  medicina: [
    {
      id: 1,
      header: 'Semana 1 — Matemáticas',
      type: 'Módulo',
      status: 'In Progress',
      target: '3h',
      limit: '5h',
      reviewer: 'Asignar revisor',
      order: 0,
    },
    {
      id: 2,
      header: 'Cápsula: Derivadas',
      type: 'Cápsula',
      status: 'Not Started',
      target: '1',
      limit: '2',
      reviewer: 'Asignar revisor',
      order: 1,
    },
    {
      id: 3,
      header: 'Guía PDF: Práctica',
      type: 'Guía',
      status: 'Not Started',
      target: '1',
      limit: '2',
      reviewer: 'Asignar revisor',
      order: 2,
    },
  ],
  ingenieria: [
    {
      id: 1,
      header: 'Semana 1 — Física',
      type: 'Módulo',
      status: 'Not Started',
      target: '2h',
      limit: '4h',
      reviewer: 'Asignar revisor',
      order: 0,
    },
    {
      id: 2,
      header: 'Cápsula: Cinemática',
      type: 'Cápsula',
      status: 'Not Started',
      target: '1',
      limit: '1',
      reviewer: 'Asignar revisor',
      order: 1,
    },
  ],
  humanista: [
    {
      id: 1,
      header: 'Semana 1 — Lectura',
      type: 'Módulo',
      status: 'Not Started',
      target: '2h',
      limit: '4h',
      reviewer: 'Asignar revisor',
      order: 0,
    },
  ],
};

export const getWeeklyPlan = query({
  args: { track: v.optional(v.string()) },
  handler: async (ctx, { track }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    const now = Math.floor(Date.now() / 1000);
    const ws = weekStartUtc(now);
    const chosen = track || 'medicina';
    const plan = await ctx.db
      .query('studyPlans')
      .withIndex('byUserWeekTrack', q =>
        q.eq('userId', user._id).eq('weekStart', ws).eq('track', chosen)
      )
      .unique();
    if (plan) return plan;
    // return default template (not saved until user edits)
    return {
      _id: undefined,
      userId: user._id,
      track: chosen,
      weekStart: ws,
      items: defaultItemsByTrack[chosen] || [],
      updatedAt: now,
    } as any;
  },
});

export const saveWeeklyPlan = mutation({
  args: {
    track: v.string(),
    weekStart: v.number(),
    items: v.array(
      v.object({
        id: v.number(),
        header: v.string(),
        type: v.string(),
        status: v.string(),
        target: v.string(),
        limit: v.string(),
        reviewer: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, { track, weekStart, items }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    const existing = await ctx.db
      .query('studyPlans')
      .withIndex('byUserWeekTrack', q =>
        q.eq('userId', user._id).eq('weekStart', weekStart).eq('track', track)
      )
      .unique();
    const updatedAt = Math.floor(Date.now() / 1000);
    if (existing) {
      await ctx.db.patch(existing._id, { items, updatedAt });
    } else {
      await ctx.db.insert('studyPlans', { userId: user._id, track, weekStart, items, updatedAt });
    }
  },
});
