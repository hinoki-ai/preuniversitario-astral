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
    difficulty: v.optional(v.string()), // Track difficulty for better points calculation
    subject: v.optional(v.string()), // Denormalized for performance
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
    .index('byUserCompletedAt', ['userId', 'completedAt']) // For efficient weekly calculations
    .index('byUserSubjectCompletedAt', ['userId', 'subject', 'completedAt']) // Subject-specific performance tracking
    .index('byUserScoreCompletedAt', ['userId', 'score', 'completedAt']) // Performance analysis
    .index('byQuiz', ['quizId'])
    .index('byCompletedAt', ['completedAt'])
    .index('bySubjectCompletedAt', ['subject', 'completedAt']), // Global subject analytics

  // Progress events
  progressEvents: defineTable({
    userId: v.id('users'),
    subject: v.optional(v.string()),
    kind: v.string(), // 'lesson_viewed' | 'quiz_completed' | 'streak_maintained' | 'study_session'
    value: v.optional(v.number()),
    createdAt: v.number(),
    sessionId: v.optional(v.string()), // To prevent duplicate sessions
    metadata: v.optional(v.object({
      duration: v.optional(v.number()), // minutes spent
      difficulty: v.optional(v.string()),
      accuracy: v.optional(v.number()),
      attempts: v.optional(v.number()),
    })),
  })
    .index('byUser', ['userId'])
    .index('byUserCreatedAt', ['userId', 'createdAt'])
    .index('byUserKindCreatedAt', ['userId', 'kind', 'createdAt']) // Efficient filtering by activity type
    .index('bySessionId', ['sessionId']) // Prevent duplicate sessions
    .index('bySubjectCreatedAt', ['subject', 'createdAt']), // Subject-specific analytics

  // User streaks, achievements, and gamification - UNIFIED CURRENCY SYSTEM
  userStats: defineTable({
    userId: v.id('users'),
    currentStreak: v.number(),
    longestStreak: v.number(),
    totalQuizzes: v.number(),
    avgScore: v.number(),
    weakSubjects: v.array(v.string()),
    strongSubjects: v.array(v.string()),
    lastActiveDate: v.number(), // FIXED: Now using timestamp instead of string
    
    // UNIFIED CURRENCY SYSTEM
    esenciaArcana: v.number(), // Spendable currency earned through learning achievements
    level: v.number(),
    experiencePoints: v.number(), // Leveling XP (same as esenciaArcana for consistent leveling)
    pointsToNextLevel: v.number(),
    
    // Learning-focused achievements
    achievements: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      iconType: v.string(), // 'mastery', 'improvement', 'consistency', 'breakthrough', 'teaching'
      earnedAt: v.number(),
      esencia: v.number(), // Esencia Arcana reward
      difficulty: v.string(), // 'escudero', 'guerrero', 'paladín', 'leyenda'
      retentionBonus: v.optional(v.number()), // Bonus for long-term retention
    })),
    
    // Learning-outcome focused goals (backward compatible)
    weeklyGoals: v.object({
      // Legacy fields for backward compatibility
      quizzesTarget: v.optional(v.number()),
      quizzesCompleted: v.optional(v.number()),
      studyTimeTarget: v.optional(v.number()),
      studyTimeCompleted: v.optional(v.number()),

      // New mastery-focused fields
      masteryTarget: v.optional(v.number()), // Number of concepts to master
      masteryCompleted: v.optional(v.number()),
      improvementTarget: v.optional(v.number()), // Points improvement target
      improvementCompleted: v.optional(v.number()),
      retentionTarget: v.optional(v.number()), // Concepts to retain from previous weeks
      retentionCompleted: v.optional(v.number()),

      weekStart: v.number(), // epoch seconds
    }),
    
    // Learning analytics for better rewards
    learningMetrics: v.object({
      conceptsMastered: v.number(),
      conceptsRetained: v.number(), // From spaced repetition
      averageImprovement: v.number(), // Points per week
      difficultyPreference: v.string(), // 'adaptive', 'challenging', 'steady'
      optimalStudyDuration: v.number(), // Minutes per session for this user
      peakPerformanceHour: v.optional(v.number()), // Hour of day (0-23) when user performs best
    }),
    
    // Daily missions progress - RESTRUCTURED for learning focus
    dailyMissions: v.optional(v.object({
      date: v.number(), // FIXED: timestamp instead of string
      missions: v.array(v.object({
        id: v.string(),
        type: v.string(), // 'concept_mastery', 'retention_challenge', 'improvement_sprint', 'teaching_moment', 'breakthrough_attempt'
        title: v.string(),
        description: v.string(),
        target: v.number(),
        progress: v.number(),
        completed: v.boolean(),
        reward: v.object({
          esencia: v.number(), // Unified currency
          masteryBonus: v.optional(v.number()), // Extra for concept mastery
          retentionBonus: v.optional(v.number()), // Extra for knowledge retention
        }),
        difficulty: v.string(), // 'escudero', 'guerrero', 'paladín', 'leyenda'
        subject: v.optional(v.string()), // Specific subject focus
        conceptsRequired: v.optional(v.array(v.string())), // Required concept mastery
      })),
      completedCount: v.number(),
      masteryBonus: v.number(), // Bonus for completing all missions with high accuracy
    })),
    
    // Spaced repetition system for retention
    spacedRepetition: v.object({
      dueCards: v.number(),
      masteredCards: v.number(),
      streakDays: v.number(),
      nextReviewDate: v.number(),
      retentionRate: v.number(), // Percentage of concepts retained
    }),
    
    updatedAt: v.number(),
  }).index('byUser', ['userId'])
    .index('byLevel', ['level'])
    .index('byEsenciaArcana', ['esenciaArcana']) // For leaderboard
    .index('byLastActiveDate', ['lastActiveDate']) // For engagement analysis
    .index('byUserUpdatedAt', ['userId', 'updatedAt']), // For efficient updates

  // Daily Missions System - LEARNING OUTCOME FOCUSED
  dailyMissionTemplates: defineTable({
    type: v.string(), // 'concept_mastery', 'retention_challenge', 'improvement_sprint', 'teaching_moment', 'breakthrough_attempt'
    title: v.string(),
    description: v.string(),
    target: v.number(),
    difficulty: v.string(), // 'escudero', 'guerrero', 'paladín', 'leyenda'
    esenciaReward: v.number(), // Unified currency
    masteryBonus: v.optional(v.number()), // Bonus for demonstrating concept mastery
    retentionBonus: v.optional(v.number()), // Bonus for knowledge retention
    
    // Learning outcome requirements
    conditions: v.optional(v.object({
      minLevel: v.optional(v.number()),
      maxLevel: v.optional(v.number()),
      subjects: v.optional(v.array(v.string())),
      conceptsRequired: v.optional(v.array(v.string())), // Prerequisite concepts
      minAccuracy: v.optional(v.number()), // Minimum accuracy required (0.0-1.0)
      timeConstraint: v.optional(v.number()), // Maximum time allowed (seconds)
      retentionDays: v.optional(v.number()), // Must retain knowledge for N days
      difficultyProgression: v.optional(v.boolean()), // Must demonstrate improvement across difficulties
      weekday: v.optional(v.array(v.number())), // 0=Sunday, 1=Monday, etc.
    })),
    
    // Validation rules to prevent exploitation
    validationRules: v.object({
      maxAttemptsPerHour: v.number(), // Rate limiting
      minTimeSpent: v.number(), // Minimum seconds spent to be valid
      accuracyThreshold: v.number(), // Minimum accuracy to count progress
      cooldownPeriod: v.number(), // Seconds between attempts
      duplicateSubmissionWindow: v.number(), // Window to detect duplicate submissions
    }),
    
    active: v.boolean(),
    availableFrom: v.optional(v.number()), // Timestamp when mission becomes available
    availableUntil: v.optional(v.number()), // Timestamp when mission expires
  }).index('byType', ['type'])
    .index('byDifficulty', ['difficulty'])
    .index('byActive', ['active'])
    .index('byAvailability', ['availableFrom', 'availableUntil']) // For time-limited missions
    .index('byTypeActive', ['type', 'active']), // Efficient filtering

  // User's daily mission history - ENHANCED WITH VALIDATION
  userMissionHistory: defineTable({
    userId: v.id('users'),
    date: v.number(), // FIXED: timestamp instead of string
    missionId: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    progress: v.number(),
    esenciaEarned: v.number(), // Unified currency
    masteryBonus: v.optional(v.number()),
    retentionBonus: v.optional(v.number()),
    
    // Validation data to prevent cheating
    attempts: v.number(), // Number of attempts made
    timeSpent: v.number(), // Total seconds spent
    averageAccuracy: v.number(), // Average accuracy across attempts
    validationScore: v.number(), // 0-1 score for submission validity
    sessionId: v.optional(v.string()), // Session identifier
    ipAddress: v.optional(v.string()), // For basic fraud detection
    
    // Learning outcome data
    conceptsMastered: v.optional(v.array(v.string())), // Concepts demonstrated
    difficultyProgression: v.optional(v.array(v.number())), // Scores by difficulty level
    retentionVerified: v.optional(v.boolean()), // Whether retention was verified
  }).index('byUser', ['userId'])
    .index('byUserDate', ['userId', 'date'])
    .index('byDate', ['date'])
    .index('byUserCompletedAt', ['userId', 'completedAt']) // For streak calculation
    .index('bySessionId', ['sessionId']) // For duplicate detection
    .index('byValidationScore', ['userId', 'validationScore']), // For fraud detection

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
    createdBy: v.id('users'),
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
      avgScore: v.number(),
      studyStreak: v.number(),
    }),
    stats: v.object({
      totalQuizzes: v.number(),
      avgScore: v.number(),
      currentStreak: v.number(),
      totalPoints: v.number(),
      weeklyProgress: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('byCreator', ['createdBy'])
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
        avgScore: v.number(),
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

  // Educational Rewards System - MEANINGFUL ESENCIA ARCANA SPENDING
  userRewards: defineTable({
    userId: v.id('users'),
    
    // Educational Enhancement Items
    learningBoosts: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      effect: v.string(), // 'concept_reveal', 'difficulty_insight', 'retention_boost', 'mastery_accelerator'
      unlockedAt: v.number(),
      isActive: v.boolean(),
      duration: v.optional(v.number()), // Duration in seconds, null for permanent
      expiresAt: v.optional(v.number()),
      usesRemaining: v.optional(v.number()), // For consumable items
    })),
    
    // Exclusive Educational Content
    exclusiveContent: v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(), // 'advanced_lessons', 'expert_strategies', 'exam_insights', 'concept_deep_dives'
      unlockedAt: v.number(),
      subject: v.optional(v.string()),
      difficulty: v.string(), // 'guerrero', 'paladín', 'leyenda'
    })),
    
    // Learning Assistance Tools
    assistanceTools: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      toolType: v.string(), // 'concept_visualizer', 'progress_analyzer', 'weakness_identifier', 'strength_amplifier'
      unlockedAt: v.number(),
      isActive: v.boolean(),
      usageCount: v.number(),
      maxUsages: v.optional(v.number()),
    })),
    
    // Achievement Recognition Items
    recognitionItems: v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(), // 'title', 'badge', 'avatar_frame', 'profile_effect'
      description: v.string(),
      rarity: v.string(), // 'escudero', 'guerrero', 'paladín', 'leyenda'
      earnedFor: v.string(), // Achievement that earned this item
      unlockedAt: v.number(),
      isActive: v.boolean(),
    })),

    // Profile Customization Items (earned through achievements)
    themes: v.array(v.object({
      id: v.string(),
      name: v.string(),
      rarity: v.string(),
      unlockedAt: v.number(),
      isActive: v.boolean(),
    })),

    avatars: v.array(v.object({
      id: v.string(),
      name: v.string(),
      rarity: v.string(),
      unlockedAt: v.number(),
      isActive: v.boolean(),
    })),

    titles: v.array(v.object({
      id: v.string(),
      name: v.string(),
      rarity: v.string(),
      unlockedAt: v.number(),
      isActive: v.boolean(),
    })),

    badges: v.array(v.object({
      id: v.string(),
      name: v.string(),
      rarity: v.string(),
      unlockedAt: v.number(),
      isActive: v.boolean(),
    })),

    perks: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      rarity: v.string(),
      unlockedAt: v.number(),
      isActive: v.boolean(),
    })),

    // Currency system
    coins: v.number(),
    gems: v.number(),
    totalCoinsSpent: v.number(),
    totalItemsUnlocked: v.number(),
    shopPurchases: v.array(v.object({
      itemId: v.string(),
      itemName: v.string(),
      cost: v.number(),
      purchasedAt: v.number(),
    })),

    // Educational Services
    services: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      serviceType: v.string(), // 'personal_tutor_session', 'study_plan_optimization', 'weakness_analysis', 'retention_coaching'
      purchasedAt: v.number(),
      scheduledAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      rating: v.optional(v.number()), // User rating of the service
    })),
    
    // Purchase History - UNIFIED CURRENCY ONLY
    purchases: v.array(v.object({
      itemId: v.string(),
      itemType: v.string(),
      cost: v.number(), // Esencia Arcana spent
      purchasedAt: v.number(),
      valueReceived: v.optional(v.string()), // What educational value was gained
    })),
    
    // Profile Customization - Earned through achievement
    profileCustomization: v.object({
      selectedTitle: v.optional(v.string()),
      selectedBadges: v.array(v.string()), // Max 3 badges to display
      selectedFrame: v.optional(v.string()),
      profileEffect: v.optional(v.string()),
      learningStreak: v.number(), // Days of consistent learning
      masteryBadges: v.array(v.string()), // Subjects where mastery was achieved
    }),
    
    // Analytics
    totalEsenciaEarned: v.number(),
    totalEsenciaSpent: v.number(),
    valueCreated: v.number(), // Educational value created through spending
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('byUser', ['userId'])
    .index('byTotalEsencia', ['totalEsenciaEarned']) // For leaderboards
    .index('byValueCreated', ['valueCreated']), // For impact tracking

  // Educational Items Catalog - FOCUSED ON LEARNING VALUE
  rewardsCatalog: defineTable({
    itemId: v.string(),
    itemType: v.string(), // 'learning_boost', 'exclusive_content', 'assistance_tool', 'recognition_item', 'educational_service'
    name: v.string(),
    description: v.string(),
    category: v.string(),
    educationalValue: v.string(), // Clear description of learning benefit
    
    // Achievement-Based Unlock Requirements (no more purchasing basic educational tools)
    unlockRequirements: v.object({
      type: v.string(), // 'achievement', 'mastery', 'retention', 'improvement', 'teaching_others'
      achievementIds: v.optional(v.array(v.string())),
      minLevel: v.optional(v.number()),
      conceptsMastered: v.optional(v.array(v.string())), // Must master these concepts first
      retentionPeriod: v.optional(v.number()), // Must retain knowledge for N days
      improvementRequired: v.optional(v.number()), // Must show X% improvement
      teachingScore: v.optional(v.number()), // For items unlocked by helping others
      esenciaCost: v.optional(v.number()), // Only for premium educational services
    }),
    
    // Educational Impact Metrics
    impact: v.object({
      learningAcceleration: v.optional(v.number()), // How much faster learning becomes
      retentionImprovement: v.optional(v.number()), // Improvement in knowledge retention
      masteryDepth: v.optional(v.number()), // Depth of understanding achieved
      applicability: v.array(v.string()), // Which subjects/concepts this helps with
      difficulty: v.string(), // 'escudero', 'guerrero', 'paladín', 'leyenda'
    }),
    
    // Visual Properties
    visual: v.object({
      iconUrl: v.optional(v.string()),
      previewUrl: v.optional(v.string()),
      color: v.optional(v.string()),
      rarity: v.string(), // 'escudero', 'guerrero', 'paladín', 'leyenda'
      effectDescription: v.optional(v.string()), // Visual effect description
    }),
    
    // Metadata
    isActive: v.boolean(),
    isSeasonalEvent: v.boolean(),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    maxUsages: v.optional(v.number()), // For consumable items
    cooldownPeriod: v.optional(v.number()), // Seconds between uses
    sortOrder: v.number(),
    
    createdAt: v.number(),
  }).index('byType', ['itemType'])
    .index('byCategory', ['category'])
    .index('byRarity', ['visual.rarity'])
    .index('byActive', ['isActive'])
    .index('byAvailability', ['availableFrom', 'availableUntil'])
    .index('byDifficulty', ['impact.difficulty']),

  // Spaced Repetition System for Long-term Retention
  spacedRepetitionCards: defineTable({
    userId: v.id('users'),
    conceptId: v.string(),
    subject: v.string(),
    question: v.string(),
    answer: v.string(),
    difficulty: v.string(), // 'escudero', 'guerrero', 'paladín', 'leyenda'
    
    // Spaced repetition algorithm data
    easeFactor: v.number(), // 1.3 to 2.5
    interval: v.number(), // Days until next review
    repetitions: v.number(), // Number of successful reviews
    lastReviewed: v.number(), // Timestamp
    nextReviewDate: v.number(), // Timestamp
    
    // Performance tracking
    correctStreak: v.number(),
    totalReviews: v.number(),
    averageResponseTime: v.number(), // Seconds
    masteryLevel: v.string(), // 'learning', 'review', 'mastered'
    
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('byUser', ['userId'])
    .index('byUserNextReview', ['userId', 'nextReviewDate'])
    .index('byUserSubject', ['userId', 'subject'])
    .index('byUserMastery', ['userId', 'masteryLevel'])
    .index('byConceptId', ['conceptId']),

  // Study Material Sharing System - OPTIMIZED FOR MINIMAL OVERHEAD
  sharedStudyMaterials: defineTable({
    createdBy: v.id('users'),
    title: v.string(),
    description: v.string(),
    subject: v.string(),
    materialType: v.string(), // 'notes', 'concept_map', 'quiz', 'strategy', 'memory_aid'
    difficulty: v.string(),

    // Content (lightweight storage)
    content: v.object({
      text: v.optional(v.string()),
      quiz: v.optional(v.array(v.object({
        question: v.string(),
        choices: v.array(v.string()),
        correctIndex: v.number(),
        explanation: v.optional(v.string()),
      }))),
      concepts: v.optional(v.array(v.string())), // Concept tags
      references: v.optional(v.array(v.string())), // External references
    }),

    // Sharing and access
    visibility: v.string(), // 'public', 'friends', 'study_group', 'private'
    shareWith: v.string(), // 'public', 'friends', 'study_group', 'private'
    recipients: v.optional(v.array(v.id('users'))), // For private sharing
    shareCode: v.optional(v.string()), // Unique code for public sharing
    studyGroupId: v.optional(v.id('studyGroups')),
    accessCount: v.number(),
    viewCount: v.number(),
    likes: v.number(),
    likeCount: v.number(),
    helpfulVotes: v.number(),

    // Status and control
    isActive: v.boolean(),

    // Quality and validation
    verificationStatus: v.string(), // 'pending', 'verified', 'flagged'
    verifiedBy: v.optional(v.id('users')), // Teacher/admin who verified
    avgScore: v.number(), // 0-100 based on user feedback

    tags: v.array(v.string()), // For efficient searching
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('byCreator', ['createdBy'])
    .index('bySubject', ['subject'])
    .index('byMaterialType', ['materialType'])
    .index('byVisibility', ['visibility'])
    .index('byStudyGroup', ['studyGroupId'])
    .index('byQualityScore', ['avgScore'])
    .index('bySubjectDifficulty', ['subject', 'difficulty'])
    .index('byShareCode', ['shareCode'])
    .index('byCreated', ['isActive']),

  // Daily Login Rewards - ENHANCED WITH LEARNING FOCUS
  dailyLoginRewards: defineTable({
    userId: v.id('users'),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastLoginDate: v.number(), // FIXED: timestamp instead of string
    loginHistory: v.array(v.object({
      date: v.number(), // FIXED: timestamp
      dayNumber: v.number(),
      rewards: v.array(v.object({
        type: v.string(), // 'esencia', 'learning_boost', 'exclusive_content', 'assistance_tool'
        amount: v.optional(v.number()),
        itemId: v.optional(v.string()),
        educationalValue: v.optional(v.string()), // What learning benefit this provides
      })),
      learningGoalMet: v.boolean(), // Whether user met learning goal that day
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
  // Esencia Arcana Purchase History
  esenciaPurchases: defineTable({
    userId: v.id('users'),
    itemId: v.string(),
    itemName: v.string(),
    cost: v.number(),
    category: v.string(),
    purchasedAt: v.number(),
  })
    .index('byUser', ['userId'])
    .index('byUserPurchased', ['userId', 'purchasedAt'])
    .index('byCategory', ['category']),


  // Material Views Tracking
  materialViews: defineTable({
    userId: v.id('users'),
    materialId: v.id('sharedStudyMaterials'),
    viewedAt: v.number(),
  })
    .index('byUserMaterial', ['userId', 'materialId'])
    .index('byMaterial', ['materialId']),

  // Material Likes
  materialLikes: defineTable({
    userId: v.id('users'),
    materialId: v.id('sharedStudyMaterials'),
    likedAt: v.number(),
  })
    .index('byUserMaterial', ['userId', 'materialId'])
    .index('byMaterial', ['materialId']),

  // Notifications
  notifications: defineTable({
    userId: v.id('users'),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.object({
      shareCode: v.optional(v.string()),
      userId: v.optional(v.id('users')),
      groupId: v.optional(v.id('studyGroups')),
    })),
    createdAt: v.number(),
    read: v.boolean(),
  })
    .index('byUser', ['userId'])
    .index('byUserUnread', ['userId', 'read']),

  // Comprehensive Gamification Validation System
  validatedActions: defineTable({
    userId: v.id('users'),
    actionType: v.string(),
    itemId: v.string(),
    score: v.optional(v.number()),
    timeSpent: v.number(),
    accuracy: v.optional(v.number()),
    attempts: v.number(),
    difficulty: v.string(),
    subject: v.optional(v.string()),
    sessionId: v.string(),
    clientTimestamp: v.number(),
    serverTimestamp: v.number(),
    clientFingerprint: v.string(),
    validationScore: v.number(), // 0-1 score indicating how likely this action is legitimate
    flaggedAsSuspicious: v.boolean(),
    metadata: v.optional(v.object({
      timeIssues: v.optional(v.array(v.string())),
      rateLimitIssues: v.optional(v.array(v.string())),
      performanceIssues: v.optional(v.array(v.string())),
      sessionIssues: v.optional(v.array(v.string())),
      actionSpecificIssues: v.optional(v.array(v.string())),
      patternIssues: v.optional(v.array(v.string())),
    })),
  })
    .index('byUser', ['userId'])
    .index('byUserTimestamp', ['userId', 'serverTimestamp'])
    .index('byUserSession', ['userId', 'sessionId'])
    .index('byTimestamp', ['serverTimestamp'])
    .index('bySuspicious', ['flaggedAsSuspicious']),

  // User flags for suspicious behavior
  userFlags: defineTable({
    userId: v.id('users'),
    flaggedBy: v.id('users'),
    reason: v.string(),
    evidence: v.string(),
    status: v.string(), // 'pending_review', 'reviewed', 'resolved', 'false_positive'
    resolution: v.optional(v.string()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id('users')),
  })
    .index('byUser', ['userId'])
    .index('byStatus', ['status'])
    .index('byFlagged', ['flaggedBy']),

});
