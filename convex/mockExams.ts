import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

async function getuser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    const demoUser = await ctx.db
      .query('users')
      .withIndex('byExternalId', (q: any) => q.eq('externalId', 'demo-user'))
      .unique();
    if (demoUser) return demoUser;
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

// Get all available mock exams
export const getMockExamCatalog = query({
  args: {},
  handler: async (ctx) => {
    const mockExams = await ctx.db
      .query('quizzes')
      .withIndex('byExamType', q => q.eq('examType', 'mock'))
      .collect();

    if (mockExams.length === 0) return [];

    const catalog = await Promise.all(
      mockExams.map(async (exam) => {
        const questions = await ctx.db
          .query('questions')
          .withIndex('byQuiz', q => q.eq('quizId', exam._id))
          .collect();

        // Get attempt statistics
        const attempts = await ctx.db
          .query('attempts')
          .withIndex('byQuiz', q => q.eq('quizId', exam._id))
          .collect();

        const avgScore = attempts.length > 0 
          ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length * 100
          : 0;

        return {
          _id: exam._id,
          title: exam.title,
          subjects: exam.mockExamMetadata?.subjects || [],
          totalDurationMin: exam.mockExamMetadata?.totalDurationMin || 120,
          totalQuestions: questions.length,
          questionBreakdown: exam.mockExamMetadata?.questionBreakdown || [],
          difficulty: exam.difficulty || 'intermediate',
          totalAttempts: attempts.length,
          averageScore: Math.round(avgScore),
          isRanked: exam.mockExamMetadata?.isRanked || false,
          scheduledStart: exam.mockExamMetadata?.scheduledStart,
          createdAt: exam.createdAt,
        };
      })
    );

    catalog.sort((a, b) => {
      // Prioritize scheduled exams
      if (a.scheduledStart && !b.scheduledStart) return -1;
      if (!a.scheduledStart && b.scheduledStart) return 1;
      if (a.scheduledStart && b.scheduledStart) return a.scheduledStart - b.scheduledStart;
      return b.createdAt - a.createdAt;
    });

    return catalog;
  },
});

// Get a specific mock exam for taking
export const getMockExam = query({
  args: { examId: v.id('quizzes') },
  handler: async (ctx, { examId }) => {
    const user = await getUser(ctx);
    const exam = await ctx.db.get(examId);
    
    if (!exam || exam.examType !== 'mock') {
      throw new Error('Mock exam not found');
    }

    const questions = await ctx.db
      .query('questions')
      .withIndex('byQuiz', q => q.eq('quizId', examId))
      .collect();
    
    questions.sort((a, b) => a.order - b.order);

    // Check if user has already attempted this exam
    const existingAttempt = await ctx.db
      .query('attempts')
      .withIndex('byQuizUser', q => q.eq('quizId', examId).eq('userId', user._id))
      .unique();

    // Group questions by subject for proper mock exam structure
    const questionsBySubject: Record<string, any[]> = {};
    const subjectQuestionCounts: Record<string, number> = {};
    
    for (const question of questions) {
      // Determine subject from question content or use exam metadata
      const subject = determineQuestionSubject(question, exam.mockExamMetadata?.subjects || ['General']);
      if (!questionsBySubject[subject]) {
        questionsBySubject[subject] = [];
        subjectQuestionCounts[subject] = 0;
      }
      questionsBySubject[subject].push({
        _id: question._id,
        order: question.order,
        text: question.text,
        choices: question.choices,
        subject,
      });
      subjectQuestionCounts[subject]++;
    }

    return {
      _id: exam._id,
      title: exam.title,
      totalDurationMin: exam.mockExamMetadata?.totalDurationMin || 180,
      subjects: exam.mockExamMetadata?.subjects || Object.keys(questionsBySubject),
      questionBreakdown: exam.mockExamMetadata?.questionBreakdown || Object.entries(subjectQuestionCounts).map(([subject, count]) => ({
        subject,
        questionCount: count,
        timeAllotment: Math.floor((exam.mockExamMetadata?.totalDurationMin || 180) * count / questions.length),
      })),
      questionsBySubject,
      totalQuestions: questions.length,
      isRanked: exam.mockExamMetadata?.isRanked || false,
      scheduledStart: exam.mockExamMetadata?.scheduledStart,
      hasAttempted: !!existingAttempt,
      difficulty: exam.difficulty || 'intermediate',
      instructions: generateMockExamInstructions(exam),
    };
  },
});

// Submit mock exam attempt with comprehensive scoring
export const submitMockExamAttempt = mutation({
  args: { 
    examId: v.id('quizzes'), 
    answers: v.array(v.number()), 
    startedAt: v.number(),
    subjectTimings: v.array(v.object({
      subject: v.string(),
      timeSpent: v.number(),
    }))
  },
  handler: async (ctx, { examId, answers, startedAt, subjectTimings }) => {
    const user = await getUser(ctx);
    const exam = await ctx.db.get(examId);
    
    if (!exam || exam.examType !== 'mock') {
      throw new Error('Mock exam not found');
    }

    const questions = await ctx.db
      .query('questions')
      .withIndex('byQuiz', q => q.eq('quizId', examId))
      .collect();
    
    questions.sort((a, b) => a.order - b.order);

    // Calculate overall performance
    const totalCount = questions.length;
    let correctCount = 0;
    const review = [];
    const subjectPerformance: Record<string, { correct: number; total: number; questions: any[] }> = {};

    for (let i = 0; i < totalCount; i++) {
      const question = questions[i];
      const answer = answers[i];
      const correct = answer === question.correctIndex;
      const subject = determineQuestionSubject(question, exam.mockExamMetadata?.subjects || ['General']);
      
      if (correct) correctCount++;
      
      review.push({
        correct,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        subject,
        questionOrder: question.order,
      });

      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { correct: 0, total: 0, questions: [] };
      }
      subjectPerformance[subject].total++;
      if (correct) subjectPerformance[subject].correct++;
      subjectPerformance[subject].questions.push({
        question: question.text,
        correct,
        userAnswer: answer,
        correctAnswer: question.correctIndex,
      });
    }

    const score = totalCount > 0 ? correctCount / totalCount : 0;
    const completedAt = Math.floor(Date.now() / 1000);
    const timeTakenSec = completedAt - startedAt;

    // Calculate subject breakdown with timing
    const subjectBreakdown = Object.entries(subjectPerformance).map(([subject, perf]) => {
      const timing = subjectTimings.find(t => t.subject === subject);
      return {
        subject,
        correct: perf.correct,
        total: perf.total,
        score: perf.total > 0 ? perf.correct / perf.total : 0,
        timeSpent: timing?.timeSpent || 0,
      };
    });

    // Calculate ranking and percentile if this is a ranked exam
    let ranking, percentile, averageComparison;
    if (exam.mockExamMetadata?.isRanked) {
      const allAttempts = await ctx.db
        .query('attempts')
        .withIndex('byQuiz', q => q.eq('quizId', examId))
        .collect();
      
      const sortedScores = allAttempts
        .map(a => a.score)
        .sort((a, b) => b - a);
      
      ranking = sortedScores.filter(s => s > score).length + 1;
      percentile = allAttempts.length > 0 ? Math.round(((allAttempts.length - ranking + 1) / allAttempts.length) * 100) : 100;
      averageComparison = allAttempts.length > 0 
        ? score - (sortedScores.reduce((sum, s) => sum + s, 0) / sortedScores.length)
        : 0;
    }

    // Insert attempt with comprehensive data
    const attemptId = await ctx.db.insert('attempts', {
      quizId: examId,
      userId: user._id,
      answers,
      correctCount,
      totalCount,
      score,
      startedAt,
      completedAt,
      timeTakenSec,
      mockExamData: {
        subjectBreakdown,
        ranking,
        percentile,
        averageComparison,
      },
    });

    // Create progress events for each subject
    for (const subjectData of subjectBreakdown) {
      await ctx.db.insert('progressEvents', {
        userId: user._id,
        subject: subjectData.subject,
        kind: 'mock_exam_completed',
        value: subjectData.score,
        createdAt: completedAt,
      });
    }

    // Update user stats with gamification (will be called via API)
    // The userStats update will be handled by the client calling the mutation directly

    return {
      attemptId,
      correctCount,
      totalCount,
      score,
      subjectBreakdown,
      ranking,
      percentile,
      averageComparison,
      timeTaken: timeTakenSec,
      review,
      recommendations: generatePostExamRecommendations(subjectBreakdown, score),
    };
  },
});

// Get mock exam rankings
export const getMockExamRankings = query({
  args: { examId: v.id('quizzes'), limit: v.optional(v.number()) },
  handler: async (ctx, { examId, limit = 10 }) => {
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('byQuiz', q => q.eq('quizId', examId))
      .collect();

    // Get user data for each attempt
    const rankingsWithUsers = await Promise.all(
      attempts.map(async (attempt) => {
        const user = await ctx.db.get(attempt.userId);
        return {
          userId: attempt.userId,
          userName: user?.name || 'Anonymous',
          score: Math.round(attempt.score * 100),
          timeTaken: attempt.timeTakenSec || 0,
          completedAt: attempt.completedAt,
          subjectBreakdown: attempt.mockExamData?.subjectBreakdown || [],
        };
      })
    );

    // Sort by score (desc) then by time taken (asc)
    rankingsWithUsers.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    });

    return rankingsWithUsers.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});

// Create a new mock exam (admin/teacher function)
export const createMockExam = mutation({
  args: {
    title: v.string(),
    subjects: v.array(v.string()),
    totalDurationMin: v.number(),
    questionBreakdown: v.array(v.object({
      subject: v.string(),
      questionCount: v.number(),
      timeAllotment: v.number(),
    })),
    difficulty: v.string(),
    isRanked: v.boolean(),
    scheduledStart: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    
    if (user.role !== 'teacher' && user.role !== 'admin') {
      throw new Error('Unauthorized: Only teachers and admins can create mock exams');
    }

    const examId = await ctx.db.insert('quizzes', {
      title: args.title,
      type: 'mock',
      examType: 'mock',
      difficulty: args.difficulty,
      durationSec: args.totalDurationMin * 60,
      totalQuestions: args.questionBreakdown.reduce((sum, breakdown) => sum + breakdown.questionCount, 0),
      mockExamMetadata: {
        subjects: args.subjects,
        totalDurationMin: args.totalDurationMin,
        questionBreakdown: args.questionBreakdown,
        isRanked: args.isRanked,
        scheduledStart: args.scheduledStart,
      },
      createdBy: user._id,
      createdAt: Math.floor(Date.now() / 1000),
    });

    return examId;
  },
});

// Get user's mock exam history and analytics
export const getUserMockExamHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    
    const attempts = await ctx.db
      .query('attempts')
      .withIndex('byUser', q => q.eq('userId', user._id))
      .collect();

    // Filter for mock exam attempts
    const mockExamAttempts = [];
    for (const attempt of attempts) {
      const quiz = await ctx.db.get(attempt.quizId);
      if (quiz && quiz.examType === 'mock') {
        mockExamAttempts.push({
          ...attempt,
          examTitle: quiz.title,
          subjects: quiz.mockExamMetadata?.subjects || [],
          totalDurationMin: quiz.mockExamMetadata?.totalDurationMin || 0,
        });
      }
    }

    // Sort by completion date (most recent first)
    mockExamAttempts.sort((a, b) => b.completedAt - a.completedAt);

    // Calculate summary statistics
    const totalAttempts = mockExamAttempts.length;
    const averageScore = totalAttempts > 0 
      ? mockExamAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts * 100
      : 0;
    
    const bestScore = totalAttempts > 0 
      ? Math.max(...mockExamAttempts.map(a => a.score)) * 100
      : 0;

    // Calculate improvement trend (last 5 vs previous 5)
    const recent = mockExamAttempts.slice(0, 5);
    const previous = mockExamAttempts.slice(5, 10);
    const recentAvg = recent.length > 0 ? recent.reduce((sum, a) => sum + a.score, 0) / recent.length * 100 : 0;
    const previousAvg = previous.length > 0 ? previous.reduce((sum, a) => sum + a.score, 0) / previous.length * 100 : recentAvg;
    const improvementTrend = recentAvg - previousAvg;

    return {
      attempts: mockExamAttempts.map(attempt => ({
        _id: attempt._id,
        examTitle: attempt.examTitle,
        score: Math.round(attempt.score * 100),
        completedAt: attempt.completedAt,
        timeTaken: attempt.timeTakenSec,
        subjectBreakdown: attempt.mockExamData?.subjectBreakdown || [],
        ranking: attempt.mockExamData?.ranking,
        percentile: attempt.mockExamData?.percentile,
      })),
      summary: {
        totalAttempts,
        averageScore: Math.round(averageScore),
        bestScore: Math.round(bestScore),
        improvementTrend: Math.round(improvementTrend * 10) / 10,
      },
    };
  },
});

// Helper functions
function determineQuestionSubject(question: any, availableSubjects: string[]): string {
  // Simple subject determination based on question content
  const text = question.text.toLowerCase();
  
  if (text.includes('matemática') || text.includes('algebra') || text.includes('geometr') || text.includes('cálculo')) {
    return availableSubjects.find(s => s.toLowerCase().includes('matemá')) || 'Matemática';
  }
  if (text.includes('lenguaje') || text.includes('comprensión') || text.includes('texto') || text.includes('literatura')) {
    return availableSubjects.find(s => s.toLowerCase().includes('lengu')) || 'Lenguaje';
  }
  if (text.includes('historia') || text.includes('geografía') || text.includes('sociedad')) {
    return availableSubjects.find(s => s.toLowerCase().includes('hist')) || 'Historia';
  }
  if (text.includes('ciencias') || text.includes('física') || text.includes('química') || text.includes('biología')) {
    return availableSubjects.find(s => s.toLowerCase().includes('cienc')) || 'Ciencias';
  }
  
  return availableSubjects[0] || 'General';
}

function generateMockExamInstructions(exam: any): string[] {
  const duration = exam.mockExamMetadata?.totalDurationMin || 180;
  const subjects = exam.mockExamMetadata?.subjects || [];
  
  return [
    `Este es un examen de simulación PAES con duración total de ${duration} minutos.`,
    `Incluye preguntas de: ${subjects.join(', ')}.`,
    'Responde todas las preguntas marcando la alternativa correcta.',
    'Puedes navegar entre preguntas y cambiar tus respuestas hasta enviar el examen.',
    'El tiempo se administra automáticamente para cada sección.',
    exam.mockExamMetadata?.isRanked 
      ? 'Este examen es rankeado - tu puntaje se comparará con otros estudiantes.'
      : 'Este es un examen de práctica para tu preparación personal.',
    'Al finalizar recibirás un análisis detallado de tu rendimiento.',
  ];
}

function generatePostExamRecommendations(subjectBreakdown: any[], overallScore: number): string[] {
  const recommendations = [];
  
  // Overall performance feedback
  if (overallScore >= 0.8) {
    recommendations.push('¡Excelente rendimiento! Mantén este nivel de preparación.');
  } else if (overallScore >= 0.6) {
    recommendations.push('Buen rendimiento general. Enfócate en reforzar áreas específicas.');
  } else {
    recommendations.push('Necesitas reforzar conceptos fundamentales. Considera aumentar tu tiempo de estudio.');
  }

  // Subject-specific recommendations
  const weakSubjects = subjectBreakdown
    .filter(subject => subject.score < 0.6)
    .sort((a, b) => a.score - b.score);

  if (weakSubjects.length > 0) {
    recommendations.push(`Prioriza el estudio de: ${weakSubjects.map(s => s.subject).join(', ')}.`);
  }

  // Time management feedback
  const slowSubjects = subjectBreakdown
    .filter(subject => subject.timeSpent > subject.total * 2) // More than 2 minutes per question
    .map(s => s.subject);

  if (slowSubjects.length > 0) {
    recommendations.push(`Mejora tu velocidad en: ${slowSubjects.join(', ')}.`);
  }

  return recommendations;
}