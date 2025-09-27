import { Doc, Id } from '../convex/_generated/dataModel';

// User types
export type User = Doc<'users'>;

// Extended user stats type with gamification fields
export type UserStats = Doc<'userStats'> & {
  // Gamification fields
  esenciaArcana?: number;
  level?: number;
  experiencePoints?: number;
  pointsToNextLevel?: number;
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    iconType: string;
    earnedAt: number;
    esencia: number;
    difficulty: string;
    retentionBonus?: number;
  }>;
  weeklyGoals?: {
    quizzesTarget?: number;
    quizzesCompleted?: number;
    studyTimeTarget?: number;
    studyTimeCompleted?: number;
    masteryTarget?: number;
    masteryCompleted?: number;
    improvementTarget?: number;
    improvementCompleted?: number;
    retentionTarget?: number;
    retentionCompleted?: number;
    weekStart: number;
  };
  learningMetrics?: {
    conceptsMastered: number;
    conceptsRetained: number;
    averageImprovement: number;
    difficultyPreference: string;
    optimalStudyDuration: number;
    peakPerformanceHour?: number;
  };
  dailyMissions?: {
    date: number;
    missions: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      target: number;
      progress: number;
      completed: boolean;
      reward: {
        esencia: number;
        masteryBonus?: number;
        retentionBonus?: number;
      };
      difficulty: string;
      subject?: string;
      conceptsRequired?: string[];
    }>;
    completedCount: number;
    masteryBonus: number;
  };
  spacedRepetition?: {
    dueCards: number;
    masteredCards: number;
    streakDays: number;
    nextReviewDate: number;
    retentionRate: number;
  };
  updatedAt: number;
  // Keep the original fields
  currentStreak: number;
  longestStreak: number;
  totalQuizzes: number;
  avgScore: number;
  weakSubjects: string[];
  strongSubjects: string[];
  lastActiveDate: number;
};

// Meeting types
export type Meeting = Doc<'meetings'>;
export type MeetingWithCreator = Meeting & { creator: User };

// RSVP types
export type RSVP = Doc<'rsvps'>;

// Course types
export type Course = Doc<'courses'>;
export type Module = Doc<'modules'>;
export type Lesson = Doc<'lessons'>;

// Quiz types
export type Quiz = Doc<'quizzes'>;
export type Question = Doc<'questions'>;
export type Attempt = Doc<'attempts'>;

// Progress types
export type ProgressEvent = Doc<'progressEvents'>;

// Study plan types
export type StudyPlan = Doc<'studyPlans'>;
export type StudyPlanItem = {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
  order: number;
};

// Progress overview types
export type ProgressOverview = {
  bySubject: Record<string, { lessons: number; quizzes: number; avgScore: number; scores: number[]; }>;

  totalActivities: number;
  since: number;
  now: number;
};

// Quiz attempt types
export type QuizAttempt = {
  quizId: Id<'quizzes'>;
  userId: Id<'users'>;
  answers: number[];
  correctCount: number;
  totalCount: number;
  score: number;
  startedAt: number;
  completedAt: number;
  timeTakenSec?: number;
};

// PAES quiz types
export type PaesQuiz = Quiz & {
  subject?: string;
  durationSec?: number;
  questions: Question[];
};

// Lesson quiz types
export type LessonQuiz = Quiz & {
  lessonId: Id<'lessons'>;
  questions: Question[];
};

// Shop item types
export type ShopItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  rarity: string;
  effect?: string;
  duration?: number;
  usesRemaining?: number;
  minLevel?: number;
  available: boolean;
  owned: boolean;
  contentType?: string;
  subject?: string;
};

// PAES catalog types
export type PaesAssignmentMeta = {
  id: string;
  label: string;
  description: string;
};

export type PaesCatalogItem = {
  id: string;
  title: string;
  assignment: string;
  assignmentLabel: string;
  questionCount: number;
  durationSec?: number;
  source?: string;
  year?: number;
  session?: string;
};
