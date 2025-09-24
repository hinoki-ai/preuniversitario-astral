import { Doc, Id } from 'convex/_generated/dataModel';

// User types
export type User = Doc<'users'>;

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
  totalLessons: number;
  viewedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  bySubject: Record<
    string,
    {
      lessons: number;
      viewed: number;
      quizzes: number;
      completed: number;
      averageScore: number;
    }
  >;
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
