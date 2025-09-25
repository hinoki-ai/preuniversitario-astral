import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

async function getuser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    // For demo purposes, create or get a demo user
    const demoUser = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q: any) => q.eq('externalId', 'demo-user'))
      .unique();
    if (demoUser) return demoUser;
    // Create a demo user if it doesn't exist
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
export const getLessonQuiz = query({
  args: { lessonId: v.id('lessons') },
  handler: async (ctx, { lessonId }) => {
    const quiz = await ctx.db
      .query('quizzes')
      .withIndex('byLesson', q => q.eq('lessonId', lessonId))
      .unique();
    if (!quiz) return null;
    const questions = await ctx.db
      .query('questions')
      .withIndex('byQuiz', q => q.eq('quizId', quiz._id))
      .collect();
    questions.sort((a, b) => a.order - b.order);
    // Hide correctIndex on read
    return {
      _id: quiz._id,
      title: quiz.title,
      durationSec: quiz.durationSec,
      questions: questions.map(q => ({
        _id: q._id,
        order: q.order,
        text: q.text,
        choices: q.choices,
      })),
    };
  },
});
export const submitLessonQuizAttempt = mutation({
  args: { lessonId: v.id('lessons'), answers: v.array(v.number()), startedAt: v.number() },
  handler: async (ctx, { lessonId, answers, startedAt }) => {
    const user = await getUser(ctx);
    const quiz = await ctx.db
      .query('quizzes')
      .withIndex('byLesson', q => q.eq('lessonId', lessonId))
      .unique();
    if (!quiz) throw new Error('No quiz');
    const questions = await ctx.db
      .query('questions')
      .withIndex('byQuiz', q => q.eq('quizId', quiz._id))
      .collect();
    questions.sort((a, b) => a.order - b.order);
    const totalCount = questions.length;
    let correctCount = 0;
    const review = [] as { correct: boolean; correctIndex: number; explanation?: string }[];
    for (let i = 0; i < totalCount; i++) {
      const q = questions[i];
      const ans = answers[i];
      const correct = ans === q.correctIndex;
      if (correct) correctCount++;
      review.push({ correct, correctIndex: q.correctIndex, explanation: q.explanation });
    }
    const score = totalCount > 0 ? correctCount / totalCount : 0;
    const completedAt = Math.floor(Date.now() / 1000);
    const timeTakenSec = completedAt - startedAt;
    await ctx.db.insert('attempts', {
      quizId: quiz._id,
      userId: user._id,
      answers,
      correctCount,
      totalCount,
      score,
      startedAt,
      completedAt,
      timeTakenSec,
    });
    // Log progress event
    await ctx.db.insert('progressEvents', {
      userId: user._id,
      subject: quiz.subject,
      kind: 'quiz_completed',
      value: score,
      createdAt: completedAt,
    });
    // Update user stats with gamification (import at the top instead)
    // This will be handled by the userStats mutation directly
    return { correctCount, totalCount, score, review };
  },
});
export const getPaesCatalog = query({
  args: {},
  handler: async ctx => {
    const quizzes = await ctx.db
      .query('quizzes')
      .withIndex('byType', q => q.eq('type', 'paes'))
      .collect();
    if (quizzes.length === 0) return [];
    const catalog = await Promise.all(
      quizzes.map(async quiz => {
        const questions = await ctx.db
          .query('questions')
          .withIndex('byQuiz', q => q.eq('quizId', quiz._id))
          .collect();
        return {
          _id: quiz._id,
          title: quiz.title,
          assignment: quiz.assignment,
          subject: quiz.subject,
          durationSec: quiz.durationSec,
          source: quiz.source,
          createdAt: quiz.createdAt,
          questionCount: questions.length,
        };
      })
    );
    catalog.sort((a, b) => b.createdAt - a.createdAt);
    return catalog;
  },
});
export const getPaesQuiz = query({
  args: { quizId: v.optional(v.id('quizzes')) },
  handler: async (ctx, { quizId }) => {
    const user = await getUser(ctx);
    let quiz;
    if (quizId) {
      quiz = await ctx.db.get(quizId);
    } else {
      const quizzes = await ctx.db
        .query('quizzes')
        .withIndex('byType', q => q.eq('type', 'paes'))
        .collect();
      if (quizzes.length === 0) return null;
      quizzes.sort((a, b) => b.createdAt - a.createdAt);
      quiz = quizzes[0];
    }
    if (!quiz || quiz.type !== 'paes') return null;
    const questions = await ctx.db
      .query('questions')
      .withIndex('byQuiz', q => q.eq('quizId', quiz._id))
      .collect();
    questions.sort((a, b) => a.order - b.order);
    // Get user's recent attempts for adaptive difficulty
    const recentAttempts = await ctx.db
      .query('attempts')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .order('desc')
      .take(5);
    const avgScore = recentAttempts.length > 0 
      ? recentAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / recentAttempts.length
      : 0.5;avgScorerecentAttempts.length0recentAttempts.reducesumattempt.score,0recentAttempts.length

    // Adapt question selection based on performance
    let adaptedQuestions = questions;
    if (avgScore < 0.4) {
      // Poor performance: mix easier questions first
      adaptedquestions = questions.slice(0, math.floor(questions.length * 0.7));Poorperformance
    } else if (avgScore > 0.8) {
      // High performance: include all questions, harder ones first
      adaptedquestions = [...questions].reverse();Highperformance
    }

    return {
      _id: quiz._id,;
      title: quiz.title,;
      durationSec: quiz.durationsec ?? 1800,;
      assignment: quiz.assignment,;
      subject: quiz.subject,;
      source: quiz.source,;
      adaptiveLevel: avgscore < 0.4; ? 'beginner' : avgscore > 0.8; ? 'advanced' : 'intermediate',;
      questions: adaptedQuestions.map(q => ({
        _id: q._id,
        order: q.order,
        text: q.text,
        choices: q.choices,
      })),
    };
  },
});

export const createQuiz = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    lessonId: v.optional(v.id('lessons')),
    subject: v.optional(v.string()),
    assignment: v.optional(v.string()),
    durationSec: v.optional(v.number()),
    source: v.optional(v.string()),
    createdBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Allow direct creation during seeding
      return await ctx.db.insert('quizzes', { ...args, createdAt: Math.floor(Date.now() / 1000) });
    }
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('Forbidden');
    return await ctx.db.insert('quizzes', { ...args, createdAt: Math.floor(Date.now() / 1000) });
  },
});

export const createQuestion = mutation({
  args: {
    quizId: v.id('quizzes'),
    order: v.number(),
    text: v.string(),
    choices: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Allow direct creation during seeding
      return await ctx.db.insert('questions', args);
    }
    const user = await ctx.db
      .query('users')
      .withIndex('byExternalId', q => q.eq('externalId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('Forbidden');
    return await ctx.db.insert('questions', args);
  },
});

export const submitPaesAttempt = mutation({
  args: { quizId: v.id('quizzes'), answers: v.array(v.number()), startedAt: v.number() },
  handler: async (ctx, { quizId, answers, startedAt }) => {
    const user = await getUser(ctx);
    const questions = await ctx.db
      .query('questions')
      .withIndex('byQuiz', q => q.eq('quizId', quizId))
      .collect();
    questions.sort((a, b) => a.order - b.order);
    const totalCount = questions.length;
    let correctCount = 0;
    const review = [] as { correct: boolean; correctIndex: number; explanation?: string }[];
    for (let i = 0; i < totalCount; i++) {
      const q = questions[i];
      const ans = answers[i];
      const correct = ans === q.correctIndex;
      if (correct) correctCount++;
      review.push({ correct, correctIndex: q.correctIndex, explanation: q.explanation });
    }
    const score = totalCount > 0 ? correctCount / totalCount : 0;
    const completedAt = Math.floor(Date.now() / 1000);
    const timeTakenSec = completedAt - startedAt;
    await ctx.db.insert('attempts', {
      quizId,
      userId: user._id,
      answers,
      correctCount,
      totalCount,
      score,
      startedAt,
      completedAt,
      timeTakenSec,
    });
    await ctx.db.insert('progressEvents', {
      userId: user._id,
      subject: 'PAES',
      kind: 'quiz_completed',
      value: score,
      createdAt: completedAt,
    });
    
    // Update user stats with gamification (import at the top instead)
    // This will be handled by calling the userStats mutation directly
    
    return { correctCount, totalCount, score, review };
  },
});
