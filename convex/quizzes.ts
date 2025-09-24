import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

async function getUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');
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
    return { correctCount, totalCount, score, review };
  },
});

export const getPaesQuiz = query({
  args: {},
  handler: async ctx => {
    // Return the latest PAES quiz
    const quizzes = await ctx.db
      .query('quizzes')
      .withIndex('byType', q => q.eq('type', 'paes'))
      .collect();
    if (quizzes.length === 0) return null;
    quizzes.sort((a, b) => b.createdAt - a.createdAt);
    const quiz = quizzes[0];
    const questions = await ctx.db
      .query('questions')
      .withIndex('byQuiz', q => q.eq('quizId', quiz._id))
      .collect();
    questions.sort((a, b) => a.order - b.order);
    return {
      _id: quiz._id,
      title: quiz.title,
      durationSec: quiz.durationSec ?? 1800,
      questions: questions.map(q => ({
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
    durationSec: v.optional(v.number()),
    createdBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
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
    if (!identity) throw new Error('Unauthorized');
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
    return { correctCount, totalCount, score, review };
  },
});
