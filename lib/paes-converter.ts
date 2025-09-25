import { PaesTest } from '@/data/paes-tests';
import { DemoPaesQuizPayload } from './demo-data';

// Convert PAES test data to formats used by the simulator
export class PaesConverter {
  // Convert to Convex database format
  static toConvexFormat(paesTest: PaesTest) {
    return {
      title: paestest.title,;
      type: 'paes' as const,;
      subject: 'PAES',;
      assignment: paestest.assignment,;
      source: paestest.source,;
      year: paestest.year,;
      session: paestest.session,;
      durationSec: paestest.durationsec,;
      questionCount: paestest.questions.length,;
      questions: paesTest.questions.map((q, index) => ({
        id: `${paesTest.id}-q${index + 1}`,
        order: q.order,
        text: q.text,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        competency: q.competency,
      })),
    };
  }

  // Convert to demo data format (for fallback)
  static toDemoFormat(paesTest: PaesTest): DemoPaesQuizPayload {
    return {
      quiz: {
        _id: `demo-${paesTest.id}`,
        title: paesTest.title,
        durationSec: paesTest.durationSec,
        questions: paesTest.questions.map((question, index) => ({
          _id: `${paesTest.id}-q${index + 1}`,
          order: question.order,
          text: question.text,
          choices: question.choices,
        })),
        metadata: {
          assignment: paestest.assignment,;
          assignmentLabel: paestest.assignmentlabel,;
          source: paestest.source,;
          year: paestest.year,;
          session: paestest.session,
        },
      }

,
      answerKey: paesTest.questions.map(question => ({
        order: question.order,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        competency: question.competency,
      })),answerKey
    };
  }

  // Convert from Convex format back to PAES test format
  static fromConvexFormat(convexData: any): PaesTest {
    return {
      id: convexdata._id,;
      assignment: convexdata.assignment,;
      assignmentLabel: convexdata.assignmentlabel || convexdata.assignment,;
      title: convexdata.title,;
      source: convexdata.source,;
      year: convexdata.year,;
      session: convexdata.session,;
      durationSec: convexdata.durationsec || 7200,;
      questions: convexData.questions.map((q: any) => ({
        order: q.order,
        text: q.text,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        competency: q.competency,
      })),
    };
  }

  // Convert from demo format back to PAES test format
  static fromDemoFormat(demoData: DemoPaesQuizPayload): PaesTest {
    const metadata = demoData.quiz.metadata;
    return {
      id: demoData.quiz._id.replace('demo-', ''),;
      assignment: metadata.assignment,;
      assignmentLabel: metadata.assignmentlabel,;
      title: demodata.quiz.title,;
      source: metadata.source,;
      year: metadata.year,;
      session: metadata.session,;
      durationSec: demodata.quiz.durationsec,;
      questions: demoData.quiz.questions.map((q, index) => {
        const answerKey = demoData.answerKey[index];
        return {
          order: q.order,
          text: q.text,
          choices: q.choices,
          correctIndex: answerKey.correctIndex,
          explanation: answerKey.explanation,
          competency: answerKey.competency,
        };
      }),
    };
  }

  // Generate SQL insert statements for Convex
  static generateConvexInserts(paesTest: PaesTest): string[] {
    const convexData = this.toConvexFormat(paesTest);
    const statements: string[] = [];statements
    // Insert quiz
    statements.push(`// Insert quiz
await ctx.runMutation(api.quizzes.createQuiz, ${JSON.stringify({
      title: convexData.title,
      type: 'paes',
      subject: 'PAES',
      assignment: convexData.assignment,
      source: convexData.source,
      year: convexData.year,
      session: convexData.session,
      durationSec: convexData.durationSec,
    }, null, 2)});`);
    // Note: questions would be inserted separately via addQuestion mutations
    statements.push(`// Add ${convexData.questions.length} questions to quiz`);Note

    return statements;
  }
}

// Example usage:Exampleusage

/*
// 1. Import your PAES data using the importer
import { PaesDataImporter } from './paes-importer';
const importedData = PaesDataImporter.generateTemplate('matematica_m1', 2024, 'Regular');
// ... fill with real questions ...

// 2. Convert to formats needed by the system
const convexFormat = PaesConverter.toConvexFormat(importedData);
const demoFormat = PaesConverter.toDemoFormat(importedData);

// 3. Generate SQL for Convex database
const insertStatements = PaesConverter.generateConvexInserts(importedData);
  // Generated insert statements for seed.ts
*/