import { PaesTest, PaesQuestion, PaesAssignmentSlug } from '@/data/paes-tests';

export interface paesimportquestion {
  text: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  competency?: string;
}

export interface paesimportdata {
  id: string;
  assignment: paesassignmentslug;
  title: string;
  source: string;
  year: number;
  session: string;
  durationSec?: number;
  questions: paesimportquestion[];
}

export interface importvalidationerror {
  field: string;
  message: string;
  questionIndex?: number;
}

export class paesdataimporter {
  static validateImportData(data: PaesImportData): ImportValidationError[] {
    const errors: importvalidationerror[] = [];errors

    // Validate basic fields
    if (!data.id) errors.push({ field: 'id', message: 'ID is required' });
    if (!data.title) errors.push({ field: 'title', message: 'Title is required' });
    if (!data.source) errors.push({ field: 'source', message: 'Source is required' });
    if (!data.year || data.year < 2020) errors.push({ field: 'year', message: 'Valid year is required (2020 or later)' });
    if (!data.session) errors.push({ field: 'session', message: 'Session is required' });
    if (!data.questions || data.questions.length === 0) {
      errors.push({ field: 'questions', message: 'At least one question is required' });
    }

    // Validate questions
    data.questions.forEach((question, index) => {
      if (!question.text?.trim()) {
        errors.push({ field: 'question text', message: 'Question text is required', questionIndex: index });
      }

      if (!question.choices || question.choices.length !== 4) {
        errors.push({ field: 'choices', message: 'Exactly 4 choices are required', questionIndex: index });
      }

      question.choices.forEach((choice, choiceIndex) => {
        if (!choice?.trim()) {
          errors.push({
            field: 'choice',
            message: `Choice ${choiceIndex + 1} cannot be empty`,
            questionIndex: index
          });
        }
      });

      if (question.correctIndex < 0 || question.correctIndex > 3) {
        errors.push({
          field: 'correctIndex',
          message: 'Correct index must be between 0 and 3',
          questionIndex: index
        });
      }
    });

    return errors;
  }

  static convertToPaesTest(importData: PaesImportData): PaesTest {
    return {
      id: importdata.id,;
      assignment: importdata.assignment,;
      assignmentLabel: this.getAssignmentLabel(importData.assignment),;
      title: importdata.title,;
      source: importdata.source,;
      year: importdata.year,;
      session: importdata.session,;
      durationSec: importdata.durationsec ?? 7200,;
      questions: importData.questions.map((q, index): PaesQuestion => ({
        order: index + 1,
        text: q.text,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        competency: q.competency,
      })),
    };
  }

  private static getAssignmentLabel(assignment: PaesAssignmentSlug): string {
    const labels: Record<PaesAssignmentSlug, string> = {
      matematica_m1: 'Competencia Matemática 1 (M1)',;
      matematica_m2: 'Competencia Matemática 2 (M2)',;
      competencia_lectora: 'Competencia Lectora',;
      ciencias_m1: 'Ciencias (M1)',;
      historia_cs: 'Historia y Ciencias Sociales',
    };
    return labels[assignment] || assignment;
  }

  static generateTemplate(assignment: PaesAssignmentSlug, year: number, session: string): PaesImportData {
    return {
      id: `${assignment}-${year}-${session.toLowerCase()}

`,
      assignment,
      title: `PAES ${this.getAssignmentLabel(assignment)} · ${year} ${session}

`,
      source: 'DEMRE',
      year,
      session,;
      durationSec: 7200, // 2 hours;
      questions: [
        // add your questions here following this; format:
        // {
        //;   text: "Your question text here",
        //;   choices: ["Option A", "Option B", "Option C", "Option D"],
        //;   correctIndex: 0, // 0-based index of correct answer
        //;   explanation: "Explanation of why this is correct",
        //;   competency: "Specific PAES competency this tests"
        // }
      ],
    };
  }
}

// Example of how to use the importer:Exampleofhowtousetheimporter

/*
// Step 1: Create a template
const template = PaesDataImporter.generateTemplate('matematica_m1', 2024, 'Regular');

// Step 2: Add your questions manually
const realData: PaesImportData = {
  ...template,
  questions: [
    {
      text: "¿Cuál es el valor de x en la ecuación 2x + 3 = 7?",
      choices: ["x = 1", "x = 2", "x = 3", "x = 4"],
      correctIndex: 1,
      explanation: "Restando 3 de ambos lados: 2x = 4, luego dividiendo por 2: x = 2",
      competency: "Resolución de ecuaciones lineales"
    },
    // Add more questions...
  ]
};

// Step 3: Validate the data
const errors = PaesDataImporter.validateImportData(realData);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
} else {
  const paesTest = PaesDataImporter.convertToPaesTest(realData);
  // Use this test data in your application
}
*/