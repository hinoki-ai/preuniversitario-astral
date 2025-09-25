import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

async function getuser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    const demoUser = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q: any) => q.eq('externalId', 'demo-user'))
      .unique();
    if (demoUser) return demoUser;
    return await ctx.db.insert('users', {
      name: 'Demo User',
      externalId: 'demo-user',
      role: 'student',
      plan: 'free',
    });
  }
  const user = await ctx.db
    .query('users')
    .withIndex('byExternalId', (q: any) => q.eq('externalId', identity.subject))
    .unique();
  if (!user) throw new Error('User not found');
  return user;
}

export const getReviewItems = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const now = Math.floor(Date.now() / 1000);
    
    // Get all quiz attempts for spaced repetition
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .collect();

    const reviewItems = [];
    
    for (const attempt of attempts) {
      if (attempt.score < 0.8) {  // Only review if performance was poor
        const quiz = await ctx.db.get(attempt.quizId);
        if (!quiz) continue;

        const daysSinceAttempt = Math.floor((now - attempt.completedAt) / 86400);
        
        // Spaced repetition intervals based on SuperMemo algorithm (simplified)
        const intervals = [1, 3, 7, 14, 30]; // days
        let nextReviewDay = 1;
        
        // Find appropriate interval based on performance
        if (attempt.score > 0.6) nextReviewDay = intervals[2]; // 7 days
        else if (attempt.score > 0.4) nextReviewDay = intervals[1]; // 3 days  
        else nextReviewDay = intervals[0]; // 1 day

        if (daysSinceAttempt >= nextReviewDay) {
          reviewItems.push({
            quizId: attempt.quizId,
            quizTitle: quiz.title,
            subject: quiz.subject || 'PAES',
            lastScore: Math.round(attempt.score * 100),
            daysSince: daysSinceAttempt,
            priority: daysSinceAttempt > nextReviewDay * 2 ? 'high' : 'medium',
            type: quiz.type,
          });
        }
      }
    }

    // Sort by priority and days since
    reviewItems.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return b.daysSince - a.daysSince;
    });

    return reviewItems.slice(0, 5); // Limit to top 5 review items
  },
});

export const markReviewed = mutation({
  args: { 
    quizId: v.id('quizzes'),
    score: v.number(),
  },
  handler: async (ctx, { quizId, score }) => {
    const user = await getUser(ctx);
    
    // Log the review session
    await ctx.db.insert('progressEvents', {
      userId: user._id,
      subject: 'Review',
      kind: 'quiz_completed',
      value: score,
      createdAt: Math.floor(Date.now() / 1000),
    });

    // Update user stats
    const { updateUserStats } = await import('./userStats');
    // Update user stats (will be handled by calling the mutation directly)
    // await updateUserStats(ctx, { quizScore: score, subject: 'Review' });

    return true;
  },
});