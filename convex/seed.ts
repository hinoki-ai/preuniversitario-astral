import { api } from './_generated/api';
import { action } from './_generated/server';

export const seed = action(async ctx => {
  // Create admin user first
  const adminUser = await ctx.runMutation(api.users.createUser, {
    name: 'Admin Professor',
    externalId: 'admin-seed-user',
    role: 'admin',
  });

  // Create courses for each track
  const medicinaCourse = await ctx.runMutation(api.content.createCourse, {
    title: 'Preparación PAES Medicina',
    track: 'Medicina',
    createdBy: adminUser,
  });

  const ingenieriaCourse = await ctx.runMutation(api.content.createCourse, {
    title: 'Preparación PAES Ingeniería',
    track: 'Ingenieria',
    createdBy: adminUser,
  });

  const humanistaCourse = await ctx.runMutation(api.content.createCourse, {
    title: 'Preparación PAES Humanista',
    track: 'Humanista',
    createdBy: adminUser,
  });

  // Seed Medicina course content
  await seedMedicinaContent(ctx, medicinaCourse, adminUser);

  // Seed Ingeniería course content
  await seedIngenieriaContent(ctx, ingenieriaCourse, adminUser);

  // Seed Humanista course content
  await seedHumanistaContent(ctx, humanistaCourse, adminUser);

  // Create PAES practice quiz
  await seedPaesQuiz(ctx, adminUser);

  return { success: true, message: 'Demo data seeded successfully' };
});

async function seedMedicinaContent(ctx: any, courseId: any, adminUser: any) {
  // Module 1: Biología
  const bioModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Biología Celular y Molecular',
    order: 1,
  });

  // Lessons for Biología
  const bioLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: bioModule,
    title: 'Estructura de la Célula',
    order: 1,
    subject: 'Biología',
    videoUrl: 'https://example.com/video-celula',
    transcript: 'En esta lección aprenderemos sobre la estructura básica de la célula...',
  });

  // Quiz for Biología module
  const bioQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Biología Celular',
    type: 'lesson',
    lessonId: bioLesson1,
    subject: 'Biología',
    durationSec: 600,
    createdBy: adminUser,
  });

  // Questions for biology quiz
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: bioQuiz,
    order: 1,
    text: '¿Cuál es la función principal del núcleo celular?',
    choices: [
      'Producir energía',
      'Controlar las actividades celulares',
      'Sintetizar proteínas',
      'Almacenar agua',
    ],
    correctIndex: 1,
    explanation: 'El núcleo contiene el ADN y controla todas las actividades celulares.',
  });

  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: bioQuiz,
    order: 2,
    text: '¿Qué organelo es responsable de la fotosíntesis?',
    choices: ['Mitocondria', 'Cloroplasto', 'Ribosoma', 'Lisosoma'],
    correctIndex: 1,
    explanation: 'Los cloroplastos contienen clorofila y realizan la fotosíntesis.',
  });

  // Module 2: Química
  const chemModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Química Orgánica',
    order: 2,
  });

  const chemLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: chemModule,
    title: 'Enlaces Químicos',
    order: 1,
    subject: 'Química',
    videoUrl: 'https://example.com/video-enlaces',
    transcript: 'Los enlaces químicos son las fuerzas que mantienen unidos a los átomos...',
  });

  // Chemistry quiz
  const chemQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Química Orgánica',
    type: 'lesson',
    lessonId: chemLesson1,
    subject: 'Química',
    durationSec: 600,
    createdBy: adminUser,
  });

  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: chemQuiz,
    order: 1,
    text: '¿Cuál es la fórmula del agua?',
    choices: ['H2O', 'CO2', 'NaCl', 'CH4'],
    correctIndex: 0,
    explanation: 'El agua está compuesta por 2 átomos de hidrógeno y 1 de oxígeno.',
  });
}

async function seedIngenieriaContent(ctx: any, courseId: any, adminUser: any) {
  // Module 1: Matemáticas
  const mathModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Matemáticas Avanzadas',
    order: 1,
  });

  const mathLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: mathModule,
    title: 'Funciones y Derivadas',
    order: 1,
    subject: 'Matemáticas',
    videoUrl: 'https://example.com/video-funciones',
    transcript: 'Las funciones matemáticas relacionan elementos de dos conjuntos...',
  });

  // Math quiz
  const mathQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Matemáticas',
    type: 'lesson',
    lessonId: mathLesson1,
    subject: 'Matemáticas',
    durationSec: 900,
    createdBy: adminUser,
  });

  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: mathQuiz,
    order: 1,
    text: '¿Cuál es la derivada de x²?',
    choices: ['x', '2x', 'x²', '2'],
    correctIndex: 1,
    explanation: 'La derivada de x² es 2x según la regla de la potencia.',
  });

  // Module 2: Física
  const physicsModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Física Mecánica',
    order: 2,
  });

  const physicsLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: physicsModule,
    title: 'Leyes de Newton',
    order: 1,
    subject: 'Física',
    videoUrl: 'https://example.com/video-newton',
    transcript: 'Las leyes de Newton describen el movimiento de los objetos...',
  });

  // Physics quiz
  const physicsQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Física Mecánica',
    type: 'lesson',
    lessonId: physicsLesson1,
    subject: 'Física',
    durationSec: 600,
    createdBy: adminUser,
  });

  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: physicsQuiz,
    order: 1,
    text: '¿Cuál es la primera ley de Newton?',
    choices: ['Ley de la inercia', 'F = ma', 'Acción-Reacción', 'Ley de la gravitación'],
    correctIndex: 0,
    explanation:
      'La primera ley de Newton establece que un objeto en reposo permanece en reposo y uno en movimiento mantiene su velocidad constante a menos que actúe una fuerza externa.',
  });
}

async function seedHumanistaContent(ctx: any, courseId: any, adminUser: any) {
  // Module 1: Historia
  const historyModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Historia de Chile',
    order: 1,
  });

  const historyLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: historyModule,
    title: 'Independencia de Chile',
    order: 1,
    subject: 'Historia',
    videoUrl: 'https://example.com/video-independencia',
    transcript: 'La independencia de Chile comenzó en 1810...',
  });

  // History quiz
  const historyQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Historia de Chile',
    type: 'lesson',
    lessonId: historyLesson1,
    subject: 'Historia',
    durationSec: 600,
    createdBy: adminUser,
  });

  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: historyQuiz,
    order: 1,
    text: '¿En qué año declaró Chile su independencia?',
    choices: ['1810', '1818', '1823', '1830'],
    correctIndex: 1,
    explanation: 'Chile declaró su independencia el 12 de febrero de 1818.',
  });

  // Module 2: Literatura
  const litModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Literatura Chilena',
    order: 2,
  });

  const litLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: litModule,
    title: 'Pablo Neruda',
    order: 1,
    subject: 'Literatura',
    videoUrl: 'https://example.com/video-neruda',
    transcript: 'Pablo Neruda fue uno de los más grandes poetas chilenos...',
  });

  // Literature quiz
  const litQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Literatura Chilena',
    type: 'lesson',
    lessonId: litLesson1,
    subject: 'Literatura',
    durationSec: 600,
    createdBy: adminUser,
  });

  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: litQuiz,
    order: 1,
    text: '¿Cuál es el nombre real de Pablo Neruda?',
    choices: [
      'Ricardo Eliécer Neftalí Reyes Basoalto',
      'Gabriela Mistral',
      'Vicente Huidobro',
      'Nicanor Parra',
    ],
    correctIndex: 0,
    explanation: 'Pablo Neruda es el seudónimo de Ricardo Eliécer Neftalí Reyes Basoalto.',
  });
}

async function seedPaesQuiz(ctx: any, adminUser: any) {
  // Create PAES practice quiz
  const paesQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Simulacro PAES 2024',
    type: 'paes',
    subject: 'PAES',
    durationSec: 1800, // 30 minutes
    createdBy: adminUser,
  });

  // Add PAES questions (mixed subjects)
  const paesQuestions = [
    {
      text: '¿Cuál es el resultado de la integral ∫(2x + 3)dx?',
      choices: ['x² + 3x + C', 'x² + C', '2x² + 3x + C', '(x² + 3x) + C'],
      correctIndex: 0,
      explanation: 'La integral de 2x es x² y la de 3 es 3x, más la constante de integración C.',
    },
    {
      text: 'En física, ¿qué mide la ley de Coulomb?',
      choices: [
        'La fuerza entre cargas eléctricas',
        'La velocidad de la luz',
        'La resistencia eléctrica',
        'El campo magnético',
      ],
      correctIndex: 0,
      explanation:
        'La ley de Coulomb describe la fuerza electrostática entre dos cargas puntuales.',
    },
    {
      text: 'En biología, ¿qué tipo de célula carece de núcleo?',
      choices: ['Célula procariota', 'Célula eucariota', 'Célula vegetal', 'Célula animal'],
      correctIndex: 0,
      explanation: 'Las células procariotas, como las bacterias, no tienen núcleo definido.',
    },
    {
      text: "¿Quién escribió 'Cien años de soledad'?",
      choices: ['Gabriel García Márquez', 'Pablo Neruda', 'Mario Vargas Llosa', 'Julio Cortázar'],
      correctIndex: 0,
      explanation: "Gabriel García Márquez es el autor de 'Cien años de soledad'.",
    },
    {
      text: 'En química, ¿cuál es el número atómico del carbono?',
      choices: ['4', '6', '8', '12'],
      correctIndex: 1,
      explanation: 'El carbono tiene número atómico 6, lo que significa que tiene 6 protones.',
    },
  ];

  for (let i = 0; i < paesQuestions.length; i++) {
    const q = paesQuestions[i];
    await ctx.runMutation(api.quizzes.createQuestion, {
      quizId: paesQuiz,
      order: i + 1,
      text: q.text,
      choices: q.choices,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    });
  }
}
