import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

async function getUser(ctx: any) {
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
      : 0.5;

    // Adapt question selection based on performance
    let adaptedQuestions = questions;
    if (avgScore < 0.4) {
      // Poor performance: mix easier questions first
      adaptedQuestions = questions.slice(0, Math.floor(questions.length * 0.7));
    } else if (avgScore > 0.8) {
      // High performance: include all questions, harder ones first
      adaptedQuestions = [...questions].reverse();
    }

    return {
      _id: quiz._id,
      title: quiz.title,
      durationSec: quiz.durationSec ?? 1800,
      assignment: quiz.assignment,
      subject: quiz.subject,
      source: quiz.source,
      adaptiveLevel: avgScore < 0.4 ? 'beginner' : avgScore > 0.8 ? 'advanced' : 'intermediate',
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
  args: { 
    quizId: v.id('quizzes'), 
    answers: v.array(v.number()), 
    startedAt: v.number(),
    sessionId: v.optional(v.string()), // To prevent duplicate submissions
    clientValidation: v.optional(v.object({
      timeSpent: v.number(),
      actionCount: v.number(),
      tabSwitches: v.number(),
    }))
  },
  handler: async (ctx, { quizId, answers, startedAt, sessionId, clientValidation }) => {
    const user = await getUser(ctx);
    const completedAt = Math.floor(Date.now() / 1000);
    const timeTakenSec = completedAt - startedAt;

    // RACE CONDITION PROTECTION - Check for duplicate submissions
    if (sessionId) {
      const existingAttempt = await ctx.db
        .query('attempts')
        .withIndex('byQuizUser', q => q.eq('quizId', quizId).eq('userId', user._id))
        .filter(q => q.and(
          q.gte(q.field('startedAt'), startedAt - 10), // Within 10 seconds of start time
          q.lte(q.field('startedAt'), startedAt + 10)
        ))
        .first();

      if (existingAttempt) {
        throw new Error('Duplicate submission detected. Please refresh and try again.');
      }
    }

    // GET QUIZ AND QUESTIONS
    const quiz = await ctx.db.get(quizId);
    if (!quiz) throw new Error('Quiz not found');

    const questions = await ctx.db
      .query('questions')
      .withIndex('byQuiz', q => q.eq('quizId', quizId))
      .collect();
    questions.sort((a, b) => a.order - b.order);

    // COMPREHENSIVE SERVER-SIDE VALIDATION
    const { validateQuizSubmission, validateProgressEvent } = await import('./shared');
    
    // Get recent user attempts for validation context
    const recentAttempts = await ctx.db
      .query('attempts')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .order('desc')
      .take(10);

    const validationResult = validateQuizSubmission(startedAt, answers, timeTakenSec, recentAttempts);
    
    if (!validationResult.isValid) {
      // Log suspicious activity but still allow submission with reduced rewards
      await ctx.db.insert('progressEvents', {
        userId: user._id,
        subject: quiz.subject || 'PAES',
        kind: 'quiz_validation_failed',
        value: validationResult.score,
        createdAt: completedAt,
        metadata: {
          flags: validationResult.flags,
          sessionId: sessionId || 'unknown'
        }
      });
      
      // Still process but with warnings
      console.warn(`Quiz validation failed for user ${user._id}:`, validationResult.flags);
    }

    // CALCULATE RESULTS
    const totalCount = questions.length;
    let correctCount = 0;
    let conceptsMastered = 0;
    const review = [] as { correct: boolean; correctIndex: number; explanation?: string }[];
    
    for (let i = 0; i < totalCount; i++) {
      const question = questions[i];
      const ans = answers[i];
      const correct = ans === question.correctIndex;
      if (correct) {
        correctCount++;
        // Simple concept mastery detection
        if (timeTakenSec / totalCount < 120) { // Less than 2 minutes per question average
          conceptsMastered += 0.5; // Partial credit for speed
        } else {
          conceptsMastered += 1; // Full credit for thoughtful answer
        }
      }
      review.push({ correct, correctIndex: question.correctIndex, explanation: question.explanation });
    }

    const score = totalCount > 0 ? correctCount / totalCount : 0;
    const difficulty = quiz.difficulty || 'escudero'; // Default difficulty if not set

    // CALCULATE ESENCIA ARCANA (new unified currency system)
    const { calculateEsenciaArcana } = await import('./shared');
    const baseEsencia = calculateEsenciaArcana(
      score, 
      difficulty, 
      timeTakenSec, 
      Math.floor(conceptsMastered),
      0 // No retention bonus for initial attempt
    );

    // Apply validation penalty if submission was suspicious
    const finalEsencia = Math.floor(baseEsencia * Math.max(0.5, validationResult.score));

    // ATOMIC DATABASE UPDATES
    try {
      // Insert attempt with enhanced data
      const attemptId = await ctx.db.insert('attempts', {
        quizId,
        userId: user._id,
        answers,
        correctCount,
        totalCount,
        score,
        startedAt,
        completedAt,
        timeTakenSec,
        difficulty,
        subject: quiz.subject, // Denormalized for performance
      });

      // Insert progress event with validation data
      const recentEvents = await ctx.db
        .query('progressEvents')
        .withIndex('byUserCreatedAt', q => 
          q.eq('userId', user._id).gte('createdAt', completedAt - 3600)
        )
        .collect();

      const eventValidation = validateProgressEvent(
        user._id,
        'quiz_completed',
        score,
        completedAt,
        sessionId,
        recentEvents
      );

      if (eventValidation.isValid) {
        await ctx.db.insert('progressEvents', {
          userId: user._id,
          subject: quiz.subject || 'PAES',
          kind: 'quiz_completed',
          value: score,
          createdAt: completedAt,
          sessionId,
          metadata: {
            duration: timeTakenSec,
            difficulty,
            accuracy: score,
            conceptsMastered: Math.floor(conceptsMastered),
            validationScore: validationResult.score,
            esenciaAwarded: finalEsencia
          }
        });

        // Update user stats with new unified system
        await updateUserStatsWithEsencia(ctx, user._id, {
          quizScore: score,
          subject: quiz.subject,
          difficulty,
          esenciaEarned: finalEsencia,
          conceptsMastered: Math.floor(conceptsMastered),
          timeTaken: timeTakenSec
        });
      }

      return { 
        correctCount, 
        totalCount, 
        score, 
        review,
        esenciaEarned: finalEsencia,
        validationWarnings: validationResult.flags.length > 0 ? validationResult.flags : undefined,
        conceptsMastered: Math.floor(conceptsMastered)
      };

    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw new Error('Failed to submit quiz attempt. Please try again.');
    }
  },
});

// Helper function to update user stats with new unified system
async function updateUserStatsWithEsencia(ctx: any, userId: any, data: {
  quizScore: number;
  subject?: string;
  difficulty: string;
  esenciaEarned: number;
  conceptsMastered: number;
  timeTaken: number;
}) {
  // This function will be implemented when we update the userStats system
  // For now, we'll keep the existing behavior but prepare for the migration
  
  // TODO: Implement unified currency system update
  const { calculateLevel, getDayStart } = await import('./shared');
  const now = Math.floor(Date.now() / 1000);
  const today = getDayStart(now);

  let userStats = await ctx.db
    .query('userStats')
    .withIndex('byUser', q => q.eq('userId', userId))
    .unique();

  if (!userStats) {
    // Create new user stats with unified currency
    const statsId = await ctx.db.insert('userStats', {
      userId,
      currentStreak: 1,
      longestStreak: 1,
      totalQuizzes: 1,
      avgScore: data.quizScore,
      weakSubjects: data.quizScore < 0.6 && data.subject ? [data.subject] : [],
      strongSubjects: data.quizScore > 0.8 && data.subject ? [data.subject] : [],
      lastActiveDate: today,
      
      // NEW UNIFIED CURRENCY SYSTEM
      esenciaArcana: data.esenciaEarned,
      level: 1,
      experiencePoints: data.esenciaEarned,
      pointsToNextLevel: 100 - data.esenciaEarned,
      
      achievements: [],
      weeklyGoals: {
        masteryTarget: 5,
        masteryCompleted: data.conceptsMastered,
        improvementTarget: 100,
        improvementCompleted: data.esenciaEarned,
        retentionTarget: 3,
        retentionCompleted: 0,
        weekStart: Math.floor(Date.now() / 1000)
      },
      
      learningMetrics: {
        conceptsMastered: data.conceptsMastered,
        conceptsRetained: 0,
        averageImprovement: 0,
        difficultyPreference: 'adaptive',
        optimalStudyDuration: Math.min(data.timeTaken, 1800), // Cap at 30 minutes
        peakPerformanceHour: undefined
      },
      
      spacedRepetition: {
        dueCards: 0,
        masteredCards: 0,
        streakDays: 0,
        nextReviewDate: now + 86400, // Tomorrow
        retentionRate: 100
      },
      
      updatedAt: now
    });
    return statsId;
  }

  // Update existing stats - TRANSITIONAL CODE
  // This will be fully replaced when implementing the new system
  const newTotalQuizzes = userStats.totalQuizzes + 1;
  const newAvgScore = (userStats.avgScore * userStats.totalQuizzes + data.quizScore) / newTotalQuizzes;
  const newEsencia = (userStats.esenciaArcana || 0) + data.esenciaEarned;
  const levelInfo = calculateLevel(newEsencia);

  await ctx.db.patch(userStats._id, {
    totalQuizzes: newTotalQuizzes,
    avgScore: newAvgScore,
    esenciaArcana: newEsencia, // Unified currency
    level: levelInfo.level,
    experiencePoints: newEsencia,
    pointsToNextLevel: levelInfo.pointsToNext,
    lastActiveDate: today,
    updatedAt: now
  });
}
