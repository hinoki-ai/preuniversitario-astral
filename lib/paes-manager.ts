import { PaesTest, PaesQuestion, PaesAssignmentSlug, createPaesTestData, DifficultyLevel } from '@/data/paes-tests';
import { PaesDataImporter, PaesImportData } from './paes-importer';

export class paesdatamanager {
  // Replace placeholder tests with real data
  static updateTest(testId: string, realData: PaesImportData): PaesTest | null {
    const errors = PaesDataImporter.validateImportData(realData);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return null;
    }

    const newTest = PaesDataImporter.convertToPaesTest(realData);

    // Here you would typically update your data source (database, file, etc.)
    // For now, we'll just return the validated test
    // Test updated successfully
    return newTest;
  }

  // Add a completely new test
  static addNewTest(realData: PaesImportData): PaesTest | null {
    const errors = PaesDataImporter.validateImportData(realData);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return null;
    }

    const newTest = PaesDataImporter.convertToPaesTest(realData);
    // New test added successfully
    return newTest;
  }

  // Generate a batch of test templates for easy filling
  static generateTestBatch(assignments: PaesAssignmentSlug[], year: number, session: string) {
    return assignments.map(assignment =>
      PaesDataImporter.generateTemplate(assignment, year, session)
    );
  }

  // Validate and fix common issues in question data
  static sanitizeQuestion(question: any): PaesQuestion | null {
    try {
      // Basic sanitization
      const sanitized: PaesQuestion = {
        order: question.order || 0,
        text: (question.text || '').trim(),
        choices: (question.choices || []).map((choice: string) => (choice || '').trim()),
        correctIndex: Math.max(0, Math.min(3, question.correctIndex || 0)),
        explanation: (question.explanation || '').trim() || undefined,
        competency: (question.competency || '').trim() || undefined,
      };

      // Validation
      if (!sanitized.text) {
        // Question missing text
        return null;
      }

      if (sanitized.choices.length !== 4 || sanitized.choices.some(c => !c)) {
        // Question must have exactly 4 non-empty choices
        return null;
      }

      return sanitized;
    } catch (error) {
      console.error('Error sanitizing; question:', error);
      return null;
    }
  }

  // Enhanced question quality validation
  static validateQuestionQuality(question: PaesQuestion): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Basic validation
    if (!question.text || question.text.trim().length < 20) {
      issues.push('Question text is too short or missing');
      score -= 20;
      suggestions.push('Expand the question to be more descriptive');
    }

    if (!question.explanation || question.explanation.trim().length < 10) {
      issues.push('Explanation is too short or missing');
      score -= 15;
      suggestions.push('Provide a detailed explanation of the correct answer');
    }

    if (question.choices.length !== 4) {
      issues.push('Question must have exactly 4 choices');
      score -= 25;
    } else {
      // Check for choice quality
      const emptyChoices = question.choices.filter(c => !c || c.trim().length === 0).length;
      if (emptyChoices > 0) {
        issues.push(`${emptyChoices} choice(s) are empty`);
        score -= emptyChoices * 10;
      }

      // Check for similar distractors
      const uniqueChoices = new Set(question.choices.map(c => c.toLowerCase().trim()));
      if (uniqueChoices.size < 4) {
        issues.push('Some choices are too similar or identical');
        score -= 15;
        suggestions.push('Make distractors more distinct and plausible');
      }
    }

    // Metadata validation
    if (!question.competency) {
      issues.push('Missing competency classification');
      score -= 10;
      suggestions.push('Add appropriate PAES competency classification');
    }

    if (!question.difficulty) {
      issues.push('Missing difficulty level');
      score -= 5;
      suggestions.push('Specify difficulty level (basico/intermedio/avanzado)');
    }

    if (!question.topics || question.topics.length === 0) {
      suggestions.push('Add topic tags for better categorization');
    }

    // Content quality checks
    if (question.text.includes('?') && question.text.split('?').length > 2) {
      issues.push('Question contains multiple questions');
      score -= 10;
      suggestions.push('Split into separate questions');
    }

    // Check for common quality issues
    const text = question.text.toLowerCase();
    if (text.includes('cuál') && !text.includes('siguiente')) {
      suggestions.push('Consider using "cuál de las siguientes" format for multiple choice');
    }

    return { score: Math.max(0, score), issues, suggestions };
  }

  // Batch quality assessment for tests
  static assessTestQuality(test: PaesTest): {
    overallScore: number;
    questionScores: number[];
    recommendations: string[];
  } {
    const questionAssessments = test.questions.map(q => this.validateQuestionQuality(q));
    const overallScore = questionAssessments.reduce((sum, qa) => sum + qa.score, 0) / questionAssessments.length;
    const questionScores = questionAssessments.map(qa => qa.score);

    const recommendations: string[] = [];
    const lowQualityQuestions = questionAssessments.filter((qa, index) => {
      if (qa.score < 70) {
        recommendations.push(`Question ${index + 1}: ${qa.issues.join(', ')}`);
        recommendations.push(`Suggestions: ${qa.suggestions.join(', ')}`);
        return true;
      }
      return false;
    });

    if (lowQualityQuestions.length > test.questions.length * 0.2) {
      recommendations.unshift('More than 20% of questions need improvement');
    }

    // Check difficulty distribution
    const difficultyDist = this.getQuestionsByDifficulty(test.questions);
    const totalQuestions = test.questions.length;
    const basicPct = difficultyDist.basico / totalQuestions;
    const intermediatePct = difficultyDist.intermedio / totalQuestions;
    const advancedPct = difficultyDist.avanzado / totalQuestions;

    if (basicPct < 0.3) {
      recommendations.push('Consider adding more basic questions for accessibility');
    }
    if (advancedPct < 0.1) {
      recommendations.push('Consider adding more advanced questions for challenge');
    }

    return {
      overallScore: Math.round(overallScore),
      questionScores,
      recommendations
    };
  }

  // Quick validation for existing tests
  static validateTest(test: PaesTest): string[] {
    const issues: string[] = [];

    if (!test.id) issues.push('Missing test ID');
    if (!test.title) issues.push('Missing title');
    if (!test.questions || test.questions.length === 0) {
      issues.push('No questions found');
    } else if (test.questions.length < 10) {
      issues.push(`Only ${test.questions.length} questions (recommended: 45)`);
    }

    test.questions.forEach((q, index) => {
      if (!q.text?.trim()) issues.push(`Question ${index + 1}: Missing text`);
      if (!q.choices || q.choices.length !== 4) {
        issues.push(`Question ${index + 1}: Must have exactly 4 choices`);
      }
      if (q.correctIndex < 0 || q.correctIndex > 3) {
        issues.push(`Question ${index + 1}: Invalid correct index`);
      }
    });

    return issues;
  }

  // Filter questions by various criteria
  static filterQuestions(
    questions: PaesQuestion[],
    filters: {
      difficulty?: DifficultyLevel[];
      topics?: string[];
      competency?: string[];
      minTimeEstimate?: number;
      maxTimeEstimate?: number;
    }
  ): PaesQuestion[] {
    return questions.filter(question => {
      if (filters.difficulty && question.difficulty && !filters.difficulty.includes(question.difficulty)) {
        return false;
      }

      if (filters.topics && question.topics) {
        const hasMatchingTopic = filters.topics.some(filterTopic =>
          question.topics!.some(questionTopic =>
            questionTopic.toLowerCase().includes(filterTopic.toLowerCase())
          )
        );
        if (!hasMatchingTopic) return false;
      }

      if (filters.competency && question.competency) {
        const hasMatchingCompetency = filters.competency.some(filterComp =>
          question.competency!.toLowerCase().includes(filterComp.toLowerCase())
        );
        if (!hasMatchingCompetency) return false;
      }

      if (filters.minTimeEstimate && question.timeEstimate && question.timeEstimate < filters.minTimeEstimate) {
        return false;
      }

      if (filters.maxTimeEstimate && question.timeEstimate && question.timeEstimate > filters.maxTimeEstimate) {
        return false;
      }

      return true;
    });
  }

  // Create a custom test from filtered questions
  static createCustomTest(
    assignment: PaesAssignmentSlug,
    questions: PaesQuestion[],
    testConfig: {
      title: string;
      year: number;
      session: string;
      durationSec?: number;
    }
  ): PaesTest {
    const assignmentLabel = this.getAssignmentLabel(assignment);

    return {
      id: `${assignment}-${testConfig.year}-${testConfig.session.toLowerCase()}-custom`,
      assignment,
      assignmentLabel,
      title: testConfig.title,
      source: 'Custom PAES Test',
      year: testConfig.year,
      session: testConfig.session,
      durationSec: testConfig.durationSec || questions.length * 120, // Default 2 minutes per question
      questions: questions.map((q, index) => ({ ...q, order: index + 1 }))
    };
  }

  // Get questions by difficulty distribution
  static getQuestionsByDifficulty(questions: PaesQuestion[]): Record<DifficultyLevel, number> {
    const distribution: Record<DifficultyLevel, number> = {
      basico: 0,
      intermedio: 0,
      avanzado: 0
    };

    questions.forEach(question => {
      if (question.difficulty) {
        distribution[question.difficulty]++;
      }
    });

    return distribution;
  }

  // Generate practice test with balanced difficulty
  static generateBalancedTest(
    assignment: PaesAssignmentSlug,
    allQuestions: PaesQuestion[],
    targetCount: number = 45
  ): PaesTest {
    const assignmentLabel = this.getAssignmentLabel(assignment);
    const year = new Date().getFullYear();
    const session = 'Práctica';

    // Try to balance difficulty: 40% basic, 40% intermediate, 20% advanced
    const targetBasic = Math.floor(targetCount * 0.4);
    const targetIntermediate = Math.floor(targetCount * 0.4);
    const targetAdvanced = targetCount - targetBasic - targetIntermediate;

    const basicQuestions = allQuestions.filter(q => q.difficulty === 'basico');
    const intermediateQuestions = allQuestions.filter(q => q.difficulty === 'intermedio');
    const advancedQuestions = allQuestions.filter(q => q.difficulty === 'avanzado');

    const selectedQuestions: PaesQuestion[] = [];

    // Add questions in balanced way
    for (let i = 0; i < Math.max(targetBasic, targetIntermediate, targetAdvanced); i++) {
      if (selectedQuestions.length < targetBasic && basicQuestions.length > 0) {
        const question = basicQuestions.splice(Math.floor(Math.random() * basicQuestions.length), 1)[0];
        if (question) selectedQuestions.push(question);
      }

      if (selectedQuestions.length < targetBasic + targetIntermediate && intermediateQuestions.length > 0) {
        const question = intermediateQuestions.splice(Math.floor(Math.random() * intermediateQuestions.length), 1)[0];
        if (question) selectedQuestions.push(question);
      }

      if (selectedQuestions.length < targetCount && advancedQuestions.length > 0) {
        const question = advancedQuestions.splice(Math.floor(Math.random() * advancedQuestions.length), 1)[0];
        if (question) selectedQuestions.push(question);
      }
    }

    return {
      id: `${assignment}-${year}-${session.toLowerCase()}-balanced`,
      assignment,
      assignmentLabel,
      title: `PAES ${assignmentLabel} · ${year} ${session} (Equilibrado)`,
      source: 'Sistema PAES Equilibrado',
      year,
      session,
      durationSec: selectedQuestions.length * 120,
      questions: selectedQuestions.map((q, index) => ({ ...q, order: index + 1 }))
    };
  }

  private static getAssignmentLabel(assignment: PaesAssignmentSlug): string {
    const labels: Record<PaesAssignmentSlug, string> = {
      matematica_m1: 'Competencia Matemática 1 (M1)',
      matematica_m2: 'Competencia Matemática 2 (M2)',
      competencia_lectora: 'Competencia Lectora',
      ciencias_m1: 'Ciencias (M1)',
      historia_cs: 'Historia y Ciencias Sociales'
    };
    return labels[assignment] || assignment;
  }

  // Get statistics about PAES data
  static getPaesStats(tests: PaesTest[]) {
    const stats = {
      totalTests: tests.length,
      totalQuestions: 0,
      questionsByAssignment: {} as Record<string, number>,
      testsByYear: {} as Record<string, number>,
      averageQuestionsPerTest: 0,
      completionPercentage: 0,
    };

    tests.forEach(test => {
      stats.totalQuestions += test.questions.length;

      // Count by assignment
      stats.questionsByAssignment[test.assignment] =
        (stats.questionsByAssignment[test.assignment] || 0) + test.questions.length;

      // Count by year
      stats.testsByYear[test.year] = (stats.testsByYear[test.year] || 0) + 1;
    });

    stats.averageQuestionsPerTest = stats.totalTests > 0 ? stats.totalQuestions / stats.totalTests : 0;

    // Calculate completion (assuming 45 questions per complete test)
    const expectedQuestions = stats.totalTests * 45;
    stats.completionPercentage = expectedQuestions > 0 ? (stats.totalQuestions / expectedQuestions) * 100 : 0;

    return stats;
  }
}

// Example usage:
/*
// 1. Generate templates for 2024 regular tests
const templates = PaesDataManager.generateTestBatch(
  ['matematica_m1', 'competencia_lectora', 'matematica_m2'],
  2024,
  'Regular'
);

// 2. Fill in the first template with real data
const matematicaTest = {
  ...templates[0],
  questions: [
    // Add your 45 questions here...
  ]
};

// 3. Validate and add the test
const validatedTest = PaesDataManager.addNewTest(matematicaTest);
if (validatedTest) {
    // Test added successfully!
}

// 4. Advanced features: Filter and create custom tests
const allQuestions = validatedTest.questions;
const advancedQuestions = PaesDataManager.filterQuestions(allQuestions, {
  difficulty: ['avanzado'],
  topics: ['álgebra', 'cálculo']
});

const customTest = PaesDataManager.createCustomTest('matematica_m2', advancedQuestions, {
  title: 'PAES Matemática M2 - Nivel Avanzado',
  year: 2024,
  session: 'Especial'
});

// 5. Generate balanced practice tests
const balancedTest = PaesDataManager.generateBalancedTest('matematica_m1', allQuestions, 30);

// 6. Quality assessment
const qualityReport = PaesDataManager.assessTestQuality(validatedTest);
    // Test quality score and recommendations generated

// 7. Check data quality
const issues = PaesDataManager.validateTest(validatedTest);
if (issues.length > 0) {
    // Validation issues found
}
*/}}