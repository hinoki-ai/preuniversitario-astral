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
  // Module 1: Matemáticas M1
  const mathM1Module = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Matemáticas M1 - Fundamentos',
    order: 1,
  });
  const mathM1Lesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: mathM1Module,
    title: 'Álgebra Básica y Ecuaciones',
    order: 1,
    subject: 'Matemáticas M1',
    videoUrl: 'https://example.com/video-algebra-m1',
    transcript: 'En esta lección revisaremos los conceptos fundamentales del álgebra...',
  });
  const mathM1Quiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Matemáticas M1 - Álgebra',
    type: 'lesson',
    lessonId: mathM1Lesson1,
    subject: 'Matemáticas M1',
    durationSec: 900,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: mathM1Quiz,
    order: 1,
    text: 'Resuelve para x: 3x - 7 = 2x + 5',
    choices: ['x = 12', 'x = 10', 'x = 8', 'x = 6'],
    correctIndex: 0,
    explanation: 'Restar 2x de ambos lados: x - 7 = 5, luego sumar 7: x = 12',
  });
  // Module 2: Matemáticas M2
  const mathM2Module = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Matemáticas M2 - Avanzado',
    order: 2,
  });
  const mathM2Lesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: mathM2Module,
    title: 'Cálculo Diferencial',
    order: 1,
    subject: 'Matemáticas M2',
    videoUrl: 'https://example.com/video-calculo-m2',
    transcript: 'El cálculo diferencial es fundamental para carreras científicas...',
  });
  const mathM2Quiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Matemáticas M2 - Derivadas',
    type: 'lesson',
    lessonId: mathM2Lesson1,
    subject: 'Matemáticas M2',
    durationSec: 900,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: mathM2Quiz,
    order: 1,
    text: '¿Cuál es la derivada de f(x) = 3x² + 2x - 1?',
    choices: ['6x + 2', '6x - 2', '3x² + 2', '6x + 1'],
    correctIndex: 0,
    explanation: 'Derivada: f\'(x) = 6x + 2',
  });
  // Module 3: Competencia Lectora
  const lecturaModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Competencia Lectora',
    order: 3,
  });
  const lecturaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: lecturaModule,
    title: 'Comprensión de Textos Científicos',
    order: 1,
    subject: 'Competencia Lectora',
    videoUrl: 'https://example.com/video-lectura-ciencia',
    transcript: 'La competencia lectora es esencial para el éxito en la PAES...',
  });
  const lecturaQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Competencia Lectora - Textos Científicos',
    type: 'lesson',
    lessonId: lecturaLesson1,
    subject: 'Competencia Lectora',
    durationSec: 600,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: lecturaQuiz,
    order: 1,
    text: 'Según el texto científico, ¿cuál es el propósito principal del autor?',
    choices: [
      'Informar sobre un descubrimiento',
      'Persuadir al lector de cambiar hábitos',
      'Describir un proceso histórico',
      'Explicar un concepto teórico'
    ],
    correctIndex: 0,
    explanation: 'El texto presenta información sobre un descubrimiento científico reciente',
  });
  // Module 4: Física
  const fisicaModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Física para Ciencias de la Salud',
    order: 4,
  });
  const fisicaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: fisicaModule,
    title: 'Movimiento y Fuerzas',
    order: 1,
    subject: 'Física',
    videoUrl: 'https://example.com/video-fisica-movimiento',
    transcript: 'La física es fundamental para entender procesos biológicos...',
  });
  const fisicaQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Física - Mecánica',
    type: 'lesson',
    lessonId: fisicaLesson1,
    subject: 'Física',
    durationSec: 600,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: fisicaQuiz,
    order: 1,
    text: '¿Cuál es la primera ley de Newton?',
    choices: [
      'Ley de la inercia',
      'F = ma',
      'Acción-Reacción',
      'Ley de la gravitación'
    ],
    correctIndex: 0,
    explanation: 'La primera ley establece que un objeto mantiene su estado a menos que actúe una fuerza externa',
  });
  // Module 5: Química
  const chemModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Química para Ciencias de la Salud',
    order: 5,
  });
  const chemLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: chemModule,
    title: 'Enlaces Químicos y Biomoléculas',
    order: 1,
    subject: 'Química',
    videoUrl: 'https://example.com/video-enlaces-biomoleculas',
    transcript: 'Los enlaces químicos son las fuerzas que mantienen unidos a los átomos...',
  });
  const chemQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Química - Biomoléculas',
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
  // Module 6: Biología
  const bioModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Biología Celular y Molecular',
    order: 6,
  });
  const bioLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: bioModule,
    title: 'Estructura y Función Celular',
    order: 1,
    subject: 'Biología',
    videoUrl: 'https://example.com/video-celula-biologia',
    transcript: 'En esta lección aprenderemos sobre la estructura básica de la célula...',
  });
  const bioQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Biología Celular',
    type: 'lesson',
    lessonId: bioLesson1,
    subject: 'Biología',
    durationSec: 600,
    createdBy: adminUser,
  });
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
  // Module 7: Estrategias de Estudio
  const strategiesModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Estrategias de Estudio PAES',
    order: 7,
  });
  const strategiesLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: strategiesModule,
    title: 'Técnicas de Estudio para Medicina',
    order: 1,
    subject: 'Estrategias de Estudio',
    videoUrl: 'https://example.com/video-estudio-medicina',
    transcript: 'Las estrategias de estudio efectivas son clave para el éxito en medicina...',
  });
  const strategiesQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Evaluación de Hábitos de Estudio',
    type: 'lesson',
    lessonId: strategiesLesson1,
    subject: 'Estrategias de Estudio',
    durationSec: 300,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: strategiesQuiz,
    order: 1,
    text: '¿Cuál es la mejor técnica para memorizar conceptos médicos complejos?',
    choices: [
      'Repetición mecánica',
      'Asociación con casos clínicos',
      'Estudio intensivo de última hora',
      'Lectura superficial'
    ],
    correctIndex: 1,
    explanation: 'La asociación con casos clínicos facilita la retención y comprensión de conceptos médicos.',
  });
  // Module 8: Bienestar y Yoga
  const wellnessModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Bienestar y Salud Mental',
    order: 8,
  });

  const yogaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: wellnessModule,
    title: 'Yoga para Estudiantes de Medicina',
    order: 1,
    subject: 'Bienestar',
    videoUrl: 'https://example.com/video-yoga-medicina',
    transcript: 'El yoga es una herramienta esencial para manejar el estrés del estudio médico...',
  });

  const wellnessQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Test Vocacional - Medicina',
    type: 'lesson',
    lessonId: yogaLesson1,
    subject: 'Bienestar',
    durationSec: 300,
    createdBy: adminUser,
  });

  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: wellnessQuiz,
    order: 1,
    text: '¿Qué aspecto de la medicina te atrae más?',
    choices: [
      'La investigación científica',
      'El contacto directo con pacientes',
      'La prevención de enfermedades',
      'La cirugía y procedimientos'
    ],
    correctIndex: 0,
    explanation: 'Esta pregunta ayuda a identificar tus intereses vocacionales en medicina.',
  });
}

async function seedIngenieriaContent(ctx: any, courseId: any, adminUser: any) {
  // Module 1: Matemáticas M1
  const mathM1Module = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Matemáticas M1 - Fundamentos',
    order: 1,
  });
  const mathM1Lesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: mathM1Module,
    title: 'Álgebra y Geometría',
    order: 1,
    subject: 'Matemáticas M1',
    videoUrl: 'https://example.com/video-algebra-ingenieria',
    transcript: 'Los conceptos matemáticos básicos son fundamentales para la ingeniería...',
  });
  const mathM1Quiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Matemáticas M1 - Ingeniería',
    type: 'lesson',
    lessonId: mathM1Lesson1,
    subject: 'Matemáticas M1',
    durationSec: 900,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: mathM1Quiz,
    order: 1,
    text: '¿Cuál es la derivada de x²?',
    choices: ['x', '2x', 'x²', '2'],
    correctIndex: 1,
    explanation: 'La derivada de x² es 2x según la regla de la potencia.',
  });
  // Module 2: Matemáticas M2
  const mathM2Module = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Matemáticas M2 - Avanzado',
    order: 2,
  });
  const mathM2Lesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: mathM2Module,
    title: 'Cálculo Integral y Aplicaciones',
    order: 1,
    subject: 'Matemáticas M2',
    videoUrl: 'https://example.com/video-calculo-ingenieria',
    transcript: 'El cálculo avanzado es esencial para resolver problemas de ingeniería...',
  });
  const mathM2Quiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Matemáticas M2 - Integrales',
    type: 'lesson',
    lessonId: mathM2Lesson1,
    subject: 'Matemáticas M2',
    durationSec: 900,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: mathM2Quiz,
    order: 1,
    text: 'Resuelve la integral ∫(2x + 3) dx',
    choices: ['x² + 3x + C', 'x² + C', '2x² + 3x + C', '(x² + 3x) + C'],
    correctIndex: 0,
    explanation: 'La integral de 2x es x² y la de 3 es 3x, más la constante de integración C.',
  });
  // Module 3: Competencia Lectora
  const lecturaModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Competencia Lectora',
    order: 3,
  });
  const lecturaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: lecturaModule,
    title: 'Comprensión de Textos Técnicos',
    order: 1,
    subject: 'Competencia Lectora',
    videoUrl: 'https://example.com/video-lectura-tecnica',
    transcript: 'La lectura técnica es crucial para la formación en ingeniería...',
  });
  const lecturaQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Competencia Lectora - Textos Técnicos',
    type: 'lesson',
    lessonId: lecturaLesson1,
    subject: 'Competencia Lectora',
    durationSec: 600,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: lecturaQuiz,
    order: 1,
    text: 'Según el texto técnico, ¿cuál es el proceso principal descrito?',
    choices: [
      'Análisis de datos',
      'Diseño de sistemas',
      'Optimización de procesos',
      'Evaluación de resultados'
    ],
    correctIndex: 2,
    explanation: 'El texto se centra en la optimización de procesos técnicos',
  });
  // Module 4: Física
  const fisicaModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Física para Ingeniería',
    order: 4,
  });
  const fisicaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: fisicaModule,
    title: 'Mecánica y Termodinámica',
    order: 1,
    subject: 'Física',
    videoUrl: 'https://example.com/video-fisica-ingenieria',
    transcript: 'Los principios físicos son la base de la ingeniería moderna...',
  });
  const fisicaQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Física - Termodinámica',
    type: 'lesson',
    lessonId: fisicaLesson1,
    subject: 'Física',
    durationSec: 600,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: fisicaQuiz,
    order: 1,
    text: '¿Cuál es la primera ley de la termodinámica?',
    choices: [
      'Conservación de la energía',
      'Entropía siempre aumenta',
      'Temperatura absoluta cero',
      'Ley de los gases ideales'
    ],
    correctIndex: 0,
    explanation: 'La primera ley establece que la energía no se crea ni se destruye, solo se transforma.',
  });
  // Module 5: Química
  const chemModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Química para Ingeniería',
    order: 5,
  });
  const chemLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: chemModule,
    title: 'Química General y de Materiales',
    order: 1,
    subject: 'Química',
    videoUrl: 'https://example.com/video-quimica-ingenieria',
    transcript: 'La química es fundamental para entender materiales y procesos...',
  });
  const chemQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Química - Materiales',
    type: 'lesson',
    lessonId: chemLesson1,
    subject: 'Química',
    durationSec: 600,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: chemQuiz,
    order: 1,
    text: '¿Cuál es el número atómico del carbono?',
    choices: ['4', '6', '8', '12'],
    correctIndex: 1,
    explanation: 'El carbono tiene número atómico 6, lo que significa que tiene 6 protones.',
  });
  // Module 6: Biología
  const bioModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Biología para Ingeniería',
    order: 6,
  });
  const bioLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: bioModule,
    title: 'Biología y Biotecnología',
    order: 1,
    subject: 'Biología',
    videoUrl: 'https://example.com/video-biologia-ingenieria',
    transcript: 'La biología es relevante en biotecnología y bioingeniería...',
  });
  const bioQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Biología - Biotecnología',
    type: 'lesson',
    lessonId: bioLesson1,
    subject: 'Biología',
    durationSec: 600,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: bioQuiz,
    order: 1,
    text: '¿Qué es la biotecnología?',
    choices: [
      'Estudio de los virus',
      'Uso de organismos para procesos industriales',
      'Clasificación de plantas',
      'Análisis de ADN antiguo'
    ],
    correctIndex: 1,
    explanation: 'La biotecnología utiliza organismos vivos para crear productos y procesos industriales.',
  });
  // Module 7: Historia
  const historiaModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Historia y Ciencias Sociales',
    order: 7,
  });
  const historiaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: historiaModule,
    title: 'Historia de la Ciencia y Tecnología',
    order: 1,
    subject: 'Historia',
    videoUrl: 'https://example.com/video-historia-ciencia',
    transcript: 'La historia de la ciencia y tecnología es fundamental para entender el progreso humano...',
  });
  const historiaQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Historia - Ciencia y Tecnología',
    type: 'lesson',
    lessonId: historiaLesson1,
    subject: 'Historia',
    durationSec: 600,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: historiaQuiz,
    order: 1,
    text: '¿Quién es considerado el padre de la computación moderna?',
    choices: [
      'Albert Einstein',
      'Isaac Newton',
      'Alan Turing',
      'Thomas Edison'
    ],
    correctIndex: 2,
    explanation: 'Alan Turing es considerado el padre de la computación moderna por sus trabajos en teoría de la computación.',
  });
  // Module 8: Estrategias de Estudio
  const strategiesModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Estrategias de Estudio PAES',
    order: 8,
  });
  const strategiesLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: strategiesModule,
    title: 'Técnicas de Estudio para Ingeniería',
    order: 1,
    subject: 'Estrategias de Estudio',
    videoUrl: 'https://example.com/video-estudio-ingenieria',
    transcript: 'Las estrategias de estudio en ingeniería requieren pensamiento lógico y resolución de problemas...',
  });
  const strategiesQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Evaluación de Hábitos de Estudio - Ingeniería',
    type: 'lesson',
    lessonId: strategiesLesson1,
    subject: 'Estrategias de Estudio',
    durationSec: 300,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: strategiesQuiz,
    order: 1,
    text: '¿Cuál es el mejor enfoque para resolver problemas de ingeniería?',
    choices: [
      'Memorización de fórmulas',
      'Análisis paso a paso y comprensión de conceptos',
      'Búsqueda rápida en internet',
      'Copia de soluciones de compañeros'
    ],
    correctIndex: 1,
    explanation: 'El análisis paso a paso desarrolla el pensamiento crítico esencial en ingeniería.',
  });
  // Module 9: Bienestar y Yoga
  const wellnessModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Bienestar y Salud Mental',
    order: 9,
  });

  const yogaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: wellnessModule,
    title: 'Yoga para Estudiantes de Ingeniería',
    order: 1,
    subject: 'Bienestar',
    videoUrl: 'https://example.com/video-yoga-ingenieria',
    transcript: 'El yoga ayuda a equilibrar la mente analítica del ingeniero con la creatividad...',
  });

  const wellnessQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Test Vocacional - Ingeniería',
    type: 'lesson',
    lessonId: yogaLesson1,
    subject: 'Bienestar',
    durationSec: 300,
    createdBy: adminUser,
  });

  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: wellnessQuiz,
    order: 1,
    text: '¿Qué tipo de ingeniería te interesa más?',
    choices: [
      'Ingeniería Civil y Construcción',
      'Ingeniería Informática y Software',
      'Ingeniería Mecánica y Diseño',
      'Ingeniería Eléctrica y Electrónica'
    ],
    correctIndex: 1,
    explanation: 'Esta pregunta ayuda a identificar tus intereses específicos en ingeniería.',
  });
}

async function seedHumanistaContent(ctx: any, courseId: any, adminUser: any) {
  // Module 1: Matemáticas M1
  const mathM1Module = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Matemáticas M1 - Fundamentos',
    order: 1,
  });
  const mathM1Lesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: mathM1Module,
    title: 'Matemáticas para Ciencias Sociales',
    order: 1,
    subject: 'Matemáticas M1',
    videoUrl: 'https://example.com/video-matematicas-humanista',
    transcript: 'Las matemáticas son herramientas esenciales para el análisis en ciencias sociales...',
  });
  const mathM1Quiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Matemáticas M1 - Humanista',
    type: 'lesson',
    lessonId: mathM1Lesson1,
    subject: 'Matemáticas M1',
    durationSec: 900,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: mathM1Quiz,
    order: 1,
    text: '¿Cuál es el área de un triángulo con base 6 cm y altura 4 cm?',
    choices: ['10 cm²', '12 cm²', '24 cm²', '14 cm²'],
    correctIndex: 1,
    explanation: 'Área = (base × altura) / 2 = (6 × 4) / 2 = 24/2 = 12 cm²',
  });
  // Module 2: Competencia Lectora
  const lecturaModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Competencia Lectora',
    order: 2,
  });
  const lecturaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: lecturaModule,
    title: 'Comprensión de Textos Humanísticos',
    order: 1,
    subject: 'Competencia Lectora',
    videoUrl: 'https://example.com/video-lectura-humanista',
    transcript: 'La competencia lectora es fundamental para el análisis de textos filosóficos, literarios y sociales...',
  });
  const lecturaQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Competencia Lectora - Textos Humanísticos',
    type: 'lesson',
    lessonId: lecturaLesson1,
    subject: 'Competencia Lectora',
    durationSec: 600,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: lecturaQuiz,
    order: 1,
    text: 'Según el texto filosófico, ¿cuál es la tesis principal del autor?',
    choices: [
      'La importancia de la libertad individual',
      'El rol del Estado en la sociedad',
      'La naturaleza de la justicia',
      'El concepto de felicidad'
    ],
    correctIndex: 2,
    explanation: 'El texto desarrolla una teoría sobre la naturaleza de la justicia en la sociedad',
  });
  // Module 3: Historia
  const historiaModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Historia y Ciencias Sociales',
    order: 3,
  });
  const historiaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: historiaModule,
    title: 'Historia Universal y Chilena',
    order: 1,
    subject: 'Historia',
    videoUrl: 'https://example.com/video-historia-humanista',
    transcript: 'La historia nos ayuda a comprender el desarrollo de las sociedades humanas...',
  });
  const historiaQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Quiz Historia - Procesos Sociales',
    type: 'lesson',
    lessonId: historiaLesson1,
    subject: 'Historia',
    durationSec: 600,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: historiaQuiz,
    order: 1,
    text: '¿Cuál fue el principal impacto de la Revolución Industrial en la sociedad?',
    choices: [
      'Aumento de la producción agrícola',
      'Desarrollo de la clase obrera urbana',
      'Fortalecimiento del feudalismo',
      'Expansión del comercio marítimo'
    ],
    correctIndex: 1,
    explanation: 'La Revolución Industrial creó una nueva clase social urbana: el proletariado industrial.',
  });
  // Module 4: Estrategias de Estudio
  const strategiesModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Estrategias de Estudio PAES',
    order: 4,
  });
  const strategiesLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: strategiesModule,
    title: 'Técnicas de Estudio para Humanistas',
    order: 1,
    subject: 'Estrategias de Estudio',
    videoUrl: 'https://example.com/video-estudio-humanista',
    transcript: 'Las estrategias de estudio en humanidades enfatizan el análisis crítico y la comprensión contextual...',
  });
  const strategiesQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Evaluación de Hábitos de Estudio - Humanista',
    type: 'lesson',
    lessonId: strategiesLesson1,
    subject: 'Estrategias de Estudio',
    durationSec: 300,
    createdBy: adminUser,
  });
  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: strategiesQuiz,
    order: 1,
    text: '¿Cuál es la mejor estrategia para analizar textos filosóficos?',
    choices: [
      'Memorización literal del contenido',
      'Identificación de argumentos y contexto histórico',
      'Búsqueda de resúmenes en internet',
      'Lectura rápida sin reflexión'
    ],
    correctIndex: 1,
    explanation: 'El análisis de argumentos y contexto es fundamental en el estudio de humanidades.',
  });
  // Module 5: Bienestar y Yoga
  const wellnessModule = await ctx.runMutation(api.content.createModule, {
    courseId,
    title: 'Bienestar y Salud Mental',
    order: 5,
  });

  const yogaLesson1 = await ctx.runMutation(api.content.createLesson, {
    moduleId: wellnessModule,
    title: 'Yoga para Estudiantes Humanistas',
    order: 1,
    subject: 'Bienestar',
    videoUrl: 'https://example.com/video-yoga-humanista',
    transcript: 'El yoga fomenta la conexión mente-cuerpo esencial para el desarrollo humanista...',
  });

  const wellnessQuiz = await ctx.runMutation(api.quizzes.createQuiz, {
    title: 'Test Vocacional - Humanista',
    type: 'lesson',
    lessonId: yogaLesson1,
    subject: 'Bienestar',
    durationSec: 300,
    createdBy: adminUser,
  });

  await ctx.runMutation(api.quizzes.createQuestion, {
    quizId: wellnessQuiz,
    order: 1,
    text: '¿Qué área humanista te apasiona más?',
    choices: [
      'Derecho y Justicia Social',
      'Psicología y Ciencias Sociales',
      'Historia y Patrimonio Cultural',
      'Comunicación y Periodismo'
    ],
    correctIndex: 2,
    explanation: 'Esta pregunta ayuda a identificar tus intereses vocacionales en el ámbito humanista.',
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
    const question = paesQuestions[i];
    await ctx.runMutation(api.quizzes.createQuestion, {
      quizId: paesQuiz,
      order: i + 1,
      text: question.text,
      choices: question.choices,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
    });
  }
}
