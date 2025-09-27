import { query } from './_generated/server';

export const overview = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');

    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 24 * 3600;

    const events = await ctx.db
      .query('progressEvents')
      .withIndex('byUserCreatedAt', q => q.eq('userId', user._id).gte('createdAt', sevenDaysAgo))
      .collect();

    const bySubject: Record<
      string,
      { lessons: number; quizzes: number; avgScore: number; scores: number[] }
    > = {};
    for (const e of events) {
      const key = e.subject || 'General';
      if (!bySubject[key]) bySubject[key] = { lessons: 0, quizzes: 0, avgScore: 0, scores: [] };
      if (e.kind === 'lesson_viewed') bySubject[key].lessons++;
      if (e.kind === 'quiz_completed') {
        bySubject[key].quizzes++;
        if (typeof e.value === 'number') bySubject[key].scores.push(e.value);
      }
    }
    for (const k of Object.keys(bySubject)) {
      const subjectData = bySubject[k];
      subjectData.avgScore = subjectData.scores.length ? subjectData.scores.reduce((a, b) => a + b, 0) / subjectData.scores.length : 0;
      delete (subjectData as any).scores;
    }

    // Overall activity count last 7 days
    const totalActivities = events.length;

    return { bySubject, totalActivities, since: sevenDaysAgo, now };
  },
});
