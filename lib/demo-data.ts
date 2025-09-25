// Minimal placeholder - all demo data removed
// This file exists to prevent import errors while transitioning to real data

export const getDemoSubjects = () => [];

export const getDemoLessons = (subject?: string) => [];

export const getDemoLesson = (id: string) => null;

export const getDemoLessonQuiz = (lessonId: string) => null;

export const getDemoPaesAssignments = () => [];

export const getDemoPaesCatalog = () => [];

export const getDemoPaesQuiz = (id: string) => null;

export const getPaesAssignmentMeta = (slug: string) => null;

// Empty exports for backward compatibility
export const demoCourses = [];
export const getDemoCourses = () => [];

export type demopaesquizpayload = {
  quiz: {
    _id: string;
    title: string;
    durationSec: number;
    questions: {
      _id: string;
      order: number;
      text: string;
      choices: string[];
    }[];
    metadata: {
      assignment: string;
      assignmentLabel: string;
      source: string;
      year: number;
      session: string;
    };
  };
  answerKey: {
    order: number;
    correctIndex: number;
    explanation?: string;
    competency?: string;
  }[];
};