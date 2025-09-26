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
    .index('byPaymentId', ['paymentId'])
    .index('byUserId', ['userId'])
    .index('byPayerUserId', ['payer.userId']),

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
    .index('byUserCompletedAt', ['userId', 'completedAt']) // NEW: For efficient weekly calculations
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
    
    // Daily missions progress
    dailyMissions: v.optional(v.object({
      date: v.string(), // YYYY-MM-DD
      missions: v.array(v.object({
        id: v.string(),
        type: v.string(), // 'quiz_streak', 'subject_focus', 'speed_challenge', 'accuracy_test', 'exploration'
        title: v.string(),
        description: v.string(),
        target: v.number(),
        progress: v.number(),
        completed: v.boolean(),
        reward: v.object({
          points: v.number(),
          bonus: v.optional(v.string()),
        }),
        difficulty: v.string(), // 'easy', 'medium', 'hard', 'legendary'
      })),
      completedCount: v.number(),
      streakBonus: v.number(),
    })),
    
    updatedAt: v.number(),
  }).index('byUser', ['userId'])
    .index('byLevel', ['level'])
    .index('byTotalPoints', ['totalPoints']),

  // Daily Missions System
  dailyMissionTemplates: defineTable({
    type: v.string(), // 'quiz_streak', 'subject_focus', 'speed_challenge', 'accuracy_test', 'exploration'
    title: v.string(),
    description: v.string(),
    target: v.number(),
    difficulty: v.string(), // 'easy', 'medium', 'hard', 'legendary'
    points: v.number(),
    bonusReward: v.optional(v.string()),
    conditions: v.optional(v.object({
      minLevel: v.optional(v.number()),
      maxLevel: v.optional(v.number()),
      subjects: v.optional(v.array(v.string())),
      weekday: v.optional(v.array(v.number())), // 0=Sunday, 1=Monday, etc.
    })),
    active: v.boolean(),
  }).index('byType', ['type'])
    .index('byDifficulty', ['difficulty'])
    .index('byActive', ['active']),

  // User's daily mission history
  userMissionHistory: defineTable({
    userId: v.id('users'),
    date: v.string(), // YYYY-MM-DD
    missionId: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    progress: v.number(),
    pointsEarned: v.number(),
  }).index('byUser', ['userId'])
    .index('byUserDate', ['userId', 'date'])
    .index('byDate', ['date']),

  // Social Features
  friendships: defineTable({
    requesterId: v.id('users'),
    addresseeId: v.id('users'),
    status: v.string(), // 'pending', 'accepted', 'declined', 'blocked'
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
  }).index('byRequester', ['requesterId'])
    .index('byAddressee', ['addresseeId'])
    .index('byUsers', ['requesterId', 'addresseeId'])
    .index('byStatus', ['status']),

  studyGroups: defineTable({
    name: v.string(),
    description: v.string(),
    creatorId: v.id('users'),
    members: v.array(v.object({
      userId: v.id('users'),
      role: v.string(), // 'creator', 'admin', 'member'
      joinedAt: v.number(),
      totalPoints: v.number(),
      weeklyPoints: v.number(),
    })),
    isPrivate: v.boolean(),
    inviteCode: v.optional(v.string()),
    subject: v.optional(v.string()),
    level: v.optional(v.string()), // 'beginner', 'intermediate', 'advanced'
    maxMembers: v.number(),
    goals: v.object({
      weeklyQuizzes: v.number(),
      averageScore: v.number(),
      studyStreak: v.number(),
    }),
    stats: v.object({
      totalQuizzes: v.number(),
      averageScore: v.number(),
      currentStreak: v.number(),
      totalPoints: v.number(),
      weeklyProgress: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('byCreator', ['creatorId'])
    .index('byInviteCode', ['inviteCode'])
    .index('bySubject', ['subject']),

  groupChallenges: defineTable({
    groupId: v.id('studyGroups'),
    title: v.string(),
    description: v.string(),
    type: v.string(), // 'quiz_marathon', 'streak_challenge', 'score_competition', 'subject_mastery'
    startDate: v.number(),
    endDate: v.number(),
    rules: v.object({
      target: v.number(),
      metric: v.string(), // 'quizzes_completed', 'average_score', 'total_points', 'streak_days'
      subjects: v.optional(v.array(v.string())),
    }),
    participants: v.array(v.object({
      userId: v.id('users'),
      progress: v.number(),
      score: v.number(),
      joinedAt: v.number(),
      completed: v.boolean(),
    })),
    rewards: v.object({
      winner: v.object({
        points: v.number(),
        badge: v.optional(v.string()),
      }),
      participant: v.object({
        points: v.number(),
      }),
    }),
    status: v.string(), // 'upcoming', 'active', 'completed', 'cancelled'
    createdAt: v.number(),
  }).index('byGroup', ['groupId'])
    .index('byStatus', ['status'])
    .index('byDateRange', ['startDate', 'endDate']),

  globalCompetitions: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(), // 'weekly_leaderboard', 'monthly_tournament', 'subject_championship'
    startDate: v.number(),
    endDate: v.number(),
    rules: v.object({
      eligibility: v.object({
        minLevel: v.optional(v.number()),
        subjects: v.optional(v.array(v.string())),
        regions: v.optional(v.array(v.string())),
      }),
      scoring: v.object({
        metric: v.string(), // 'total_points', 'quiz_accuracy', 'improvement_rate'
        multipliers: v.optional(v.object({
          streak: v.number(),
          speed: v.number(),
          difficulty: v.number(),
        })),
      }),
    }),
    participants: v.array(v.object({
      userId: v.id('users'),
      score: v.number(),
      rank: v.number(),
      progress: v.object({
        quizzesCompleted: v.number(),
        averageScore: v.number(),
        pointsEarned: v.number(),
        bestStreak: v.number(),
      }),
      joinedAt: v.number(),
    })),
    prizes: v.array(v.object({
      rank: v.number(),
      title: v.string(),
      points: v.number(),
      badge: v.optional(v.string()),
      specialReward: v.optional(v.string()),
    })),
    status: v.string(), // 'registration', 'active', 'completed', 'archived'
    featured: v.boolean(),
    createdAt: v.number(),
  }).index('byStatus', ['status'])
    .index('byFeatured', ['featured'])
    .index('byDateRange', ['startDate', 'endDate']),

  // Rewards and Unlockables System
  userRewards: defineTable({
    userId: v.id('users'),
    
    // Unlocked Content
    themes: v.array(v.object({
      id: v.string(),
      name: v.string(),
      unlockedAt: v.number(),
      isActive: v.boolean(),
    })),
    avatars: v.array(v.object({
      id: v.string(),
      name: v.string(),
      category: v.string(), // 'default', 'achievement', 'seasonal', 'premium'
      unlockedAt: v.number(),
      isActive: v.boolean(),
    })),
    titles: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      category: v.string(),
      color: v.string(),
      unlockedAt: v.number(),
      isActive: v.boolean(),
    })),
    badges: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      iconUrl: v.optional(v.string()),
      rarity: v.string(), // 'common', 'rare', 'epic', 'legendary'
      unlockedAt: v.number(),
    })),
    
    // Perks and Benefits
    perks: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      type: v.string(), // 'xp_boost', 'streak_protection', 'bonus_missions', 'leaderboard_highlight'
      value: v.number(),
      duration: v.optional(v.number()), // null for permanent
      activatedAt: v.optional(v.number()),
      expiresAt: v.optional(v.number()),
      isActive: v.boolean(),
    })),
    
    // Currency and Shop
    coins: v.number(), // earned currency for shop purchases
    gems: v.number(), // premium currency
    shopPurchases: v.array(v.object({
      itemId: v.string(),
      itemType: v.string(),
      cost: v.number(),
      currency: v.string(), // 'points', 'coins', 'gems'
      purchasedAt: v.number(),
    })),
    
    // Customization
    profileCustomization: v.object({
      selectedTheme: v.string(),
      selectedAvatar: v.string(),
      selectedTitle: v.string(),
      selectedBadges: v.array(v.string()), // max 3-5 badges to display
      profileBanner: v.optional(v.string()),
      profileColor: v.optional(v.string()),
    }),
    
    // Analytics
    totalItemsUnlocked: v.number(),
    totalCoinsEarned: v.number(),
    totalCoinsSpent: v.number(),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('byUser', ['userId']),

  // Shop Items and Unlockables Catalog
  rewardsCatalog: defineTable({
    itemId: v.string(),
    itemType: v.string(), // 'theme', 'avatar', 'title', 'badge', 'perk'
    name: v.string(),
    description: v.string(),
    category: v.string(),
    
    // Unlock Requirements
    unlockRequirements: v.object({
      type: v.string(), // 'achievement', 'level', 'points', 'shop_purchase', 'daily_login'
      achievementIds: v.optional(v.array(v.string())),
      minLevel: v.optional(v.number()),
      minPoints: v.optional(v.number()),
      shopCost: v.optional(v.object({
        amount: v.number(),
        currency: v.string(), // 'points', 'coins', 'gems'
      })),
      dailyLoginStreak: v.optional(v.number()),
      seasonalEvent: v.optional(v.string()),
    }),
    
    // Visual Properties
    visual: v.object({
      iconUrl: v.optional(v.string()),
      previewUrl: v.optional(v.string()),
      color: v.optional(v.string()),
      rarity: v.string(), // 'common', 'rare', 'epic', 'legendary'
      animationType: v.optional(v.string()),
    }),
    
    // Metadata
    isActive: v.boolean(),
    isLimited: v.boolean(), // limited-time availability
    availableUntil: v.optional(v.number()),
    sortOrder: v.number(),
    
    createdAt: v.number(),
  }).index('byType', ['itemType'])
    .index('byCategory', ['category'])
    .index('byRarity', ['visual.rarity'])
    .index('byActive', ['isActive'])
    .index('byLimited', ['isLimited']),

  // Daily Login Rewards
  dailyLoginRewards: defineTable({
    userId: v.id('users'),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastLoginDate: v.string(), // YYYY-MM-DD
    loginHistory: v.array(v.object({
      date: v.string(),
      dayNumber: v.number(),
      rewards: v.array(v.object({
        type: v.string(), // 'coins', 'gems', 'item', 'xp'
        amount: v.optional(v.number()),
        itemId: v.optional(v.string()),
      })),
    })),
    claimedToday: v.boolean(),
    nextRewardDay: v.number(),
  }).index('byUser', ['userId'])
    .index('byStreak', ['currentStreak']),

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
