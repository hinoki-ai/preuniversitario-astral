import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

import { paymentAttemptSchemaValidator } from './paymentAttemptTypes';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    // Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    // Optional plan and role copied from Clerk public metadata via webhook
    plan: v.optional(v.string()),
    role: v.optional(v.string()), // e.g., 'teacher', 'admin', 'student'
    // Optional trial end timestamp (epoch seconds) for trial gating
    trialEndsAt: v.optional(v.number()),
  }).index('byExternalId', ['externalId']),

  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index('byPaymentId', ['payment_id'])
    .index('byUserId', ['userId'])
    .index('byPayerUserId', ['payer.user_id']),

  meetings: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(), // epoch seconds
    meetingNumber: v.string(), // hidden for free users
    passcode: v.string(), // hidden for free users
    published: v.boolean(),
    createdBy: v.id('users'),
    createdAt: v.number(), // epoch seconds
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
        })
      )
    ),
  })
    .index('byStartTime', ['startTime']) // for upcoming queries
    .index('byCreator', ['createdBy']),

  // RSVP table for meetings
  rsvps: defineTable({
    meetingId: v.id('meetings'),
    userId: v.id('users'),
    status: v.string(), // 'yes' | 'no' | 'maybe'
    updatedAt: v.number(),
  })
    .index('byMeetingUser', ['meetingId', 'userId']) // unique per user per meeting
    .index('byUser', ['userId']) // quick lookup of user's RSVPs
    .index('byMeetingStatus', ['meetingId', 'status']) // for RSVP counts by meeting and status
    .index('byUpdatedAt', ['updatedAt']), // for real-time polling of recent updates

  // Study content skeleton
  courses: defineTable({
    title: v.string(),
    track: v.string(), // Medicina | Ingenieria | Humanista
    createdBy: v.id('users'),
    createdAt: v.number(),
  })
    .index('byTrack', ['track'])
    .index('byCreator', ['createdBy']),

  modules: defineTable({
    courseId: v.id('courses'),
    title: v.string(),
    order: v.number(),
  })
    .index('byCourse', ['courseId'])
    .index('byOrder', ['courseId', 'order']),

  lessons: defineTable({
    moduleId: v.id('modules'),
    title: v.string(),
    order: v.number(),
    videoUrl: v.optional(v.string()),
    pdfUrl: v.optional(v.string()),
    subject: v.optional(v.string()),
    transcript: v.optional(v.string()),
    attachments: v.optional(v.array(v.object({ name: v.string(), url: v.string() }))),
  })
    .index('byModule', ['moduleId'])
    .index('byOrder', ['moduleId', 'order']),

  lessonAnnotations: defineTable({
    userId: v.id('users'),
    lessonId: v.id('lessons'),
    type: v.union(v.literal('note'), v.literal('bookmark')),
    timestampSec: v.optional(v.number()),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('byLessonUser', ['lessonId', 'userId'])
    .index('byUser', ['userId']),

  // Quizzes and questions
  quizzes: defineTable({
    title: v.string(),
    type: v.string(), // 'lesson' | 'paes' | 'mock'
    examType: v.optional(v.string()), // 'practice' | 'mock' | 'full_simulation'
    lessonId: v.optional(v.id('lessons')),
    subject: v.optional(v.string()),
    assignment: v.optional(v.string()),
    durationSec: v.optional(v.number()),
    source: v.optional(v.string()),
    difficulty: v.optional(v.string()), // 'beginner' | 'intermediate' | 'advanced'
    totalQuestions: v.optional(v.number()),
    mockExamMetadata: v.optional(v.object({
      subjects: v.array(v.string()),
      totalDurationMin: v.number(),
      questionBreakdown: v.array(v.object({
        subject: v.string(),
        questionCount: v.number(),
        timeAllotment: v.number(),
      })),
      isRanked: v.boolean(),
      scheduledStart: v.optional(v.number()),
    })),
    createdBy: v.id('users'),
    createdAt: v.number(),
  })
    .index('byLesson', ['lessonId'])
    .index('byType', ['type'])
    .index('byExamType', ['examType'])
    .index('byScheduledStart', ['mockExamMetadata.scheduledStart']),

  questions: defineTable({
    quizId: v.id('quizzes'),
    order: v.number(),
    text: v.string(),
    choices: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.optional(v.string()),
  })
    .index('byQuiz', ['quizId'])
    .index('byOrder', ['quizId', 'order']),

  attempts: defineTable({
    quizId: v.id('quizzes'),
    userId: v.id('users'),
    answers: v.array(v.number()),
    correctCount: v.number(),
    totalCount: v.number(),
    score: v.number(), // 0..1
    startedAt: v.number(),
    completedAt: v.number(),
    timeTakenSec: v.optional(v.number()),
    mockExamData: v.optional(v.object({
      subjectBreakdown: v.array(v.object({
        subject: v.string(),
        correct: v.number(),
        total: v.number(),
        score: v.number(),
        timeSpent: v.number(),
      })),
      ranking: v.optional(v.number()),
      percentile: v.optional(v.number()),
      averageComparison: v.optional(v.number()),
    })),
  })
    .index('byQuizUser', ['quizId', 'userId'])
    .index('byUser', ['userId'])
    .index('byQuiz', ['quizId'])
    .index('byCompletedAt', ['completedAt']),

  // Progress events
  progressEvents: defineTable({
    userId: v.id('users'),
    subject: v.optional(v.string()),
    kind: v.string(), // 'lesson_viewed' | 'quiz_completed' | 'streak_maintained'
    value: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index('byUser', ['userId'])
    .index('byUserCreatedAt', ['userId', 'createdAt']),

  // User streaks, achievements, and gamification
  userStats: defineTable({
    userId: v.id('users'),
    currentStreak: v.number(),
    longestStreak: v.number(),
    totalQuizzes: v.number(),
    avgScore: v.number(),
    weakSubjects: v.array(v.string()),
    strongSubjects: v.array(v.string()),
    lastActiveDate: v.string(), // YYYY-MM-DD format
    
    // Gamification fields
    totalPoints: v.number(),
    level: v.number(),
    experiencePoints: v.number(),
    pointsToNextLevel: v.number(),
    achievements: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      iconType: v.string(), // 'streak', 'score', 'completion', 'speed', 'consistency'
      earnedAt: v.number(),
      points: v.number(),
    })),
    weeklyGoals: v.object({
      quizzesTarget: v.number(),
      quizzesCompleted: v.number(),
      studyTimeTarget: v.number(), // in minutes
      studyTimeCompleted: v.number(),
      weekStart: v.number(), // epoch seconds
    }),
    
    updatedAt: v.number(),
  }).index('byUser', ['userId'])
    .index('byLevel', ['level'])
    .index('byTotalPoints', ['totalPoints']),

  // Weekly study plan by track
  studyPlans: defineTable({
    userId: v.id('users'),
    track: v.string(), // 'medicina' | 'ingenieria' | 'humanista'
    weekStart: v.number(), // epoch seconds at 00:00 UTC of Monday
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
    updatedAt: v.number(),
  })
    .index('byUserWeekTrack', ['userId', 'weekStart', 'track'])
    .index('byUserWeek', ['userId', 'weekStart']),
});
