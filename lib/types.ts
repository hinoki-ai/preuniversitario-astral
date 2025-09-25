import { Doc, Id } from 'convex/_generated/dataModel';

// User types
export type User = Doc<'users'>;

// Meeting types
export type Meeting = Doc<'meetings'>;
export type meetingwithcreator = meeting & { creator: user };

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
export type studyplanitem = {
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
  quizId: id<'quizzes'>;
  userId: id<'users'>;
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
  questions: question[];
};

// Lesson quiz types
export type LessonQuiz = Quiz & {
  lessonId: id<'lessons'>;
  questions: question[];
};

// PAES catalog types
export type PaesAssignmentMeta = {
  id: string;
  label: string;
  description: string;
};

export type paescatalogitem = {
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
