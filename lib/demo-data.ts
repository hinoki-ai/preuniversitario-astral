import {
  getAssignmentById,
  getPaesTestById,
  paesAssignments,
  paesExamCatalog,
  type PaesAssignmentMeta,
  type PaesAssignmentSlug,
} from '@/data/paes-tests';

// Demo data for development and seeding
export const demoCourses = [
  {
    id: 'medicina-course',
    title: 'Preparación PAES Medicina',
    track: 'Medicina',
    modules: [
      {
        id: 'bio-module',
        title: 'Biología Celular y Molecular',
        order: 1,
        lessons: [
          {
            id: 'celula-lesson',
            title: 'Estructura y Función de la Célula - PAES Biología',
            order: 1,
            subject: 'Biología',
            videoUrl: 'https://example.com/video-celula-paes',
            transcript:
              'En esta lección estudiaremos la estructura celular según los contenidos PAES. La célula es la unidad básica de la vida y se divide en procariotas y eucariotas. Las células eucariotas contienen organelos especializados como núcleo, mitocondrias y cloroplastos...',
            attachments: [],
          },
          {
            id: 'membrana-lesson',
            title: 'Membrana Plasmática y Transporte Celular',
            order: 2,
            subject: 'Biología',
            videoUrl: 'https://example.com/video-membrana-paes',
            transcript: 'La membrana plasmática mantiene la homeostasis celular mediante transporte activo y pasivo. Según la PAES, es fundamental comprender difusión, ósmosis y transporte mediado por proteínas...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'bio-quiz',
          title: 'Quiz Biología Celular PAES',
          type: 'lesson',
          subject: 'Biología',
          durationSec: 900,
          questions: [
            {
              id: 'q1',
              order: 1,
              text: '¿Cuál es la función principal del núcleo celular según los contenidos PAES?',
              choices: [
                'Producir energía celular',
                'Controlar las actividades celulares y contener el ADN',
                'Sintetizar proteínas ribosómicas',
                'Almacenar moléculas de reserva',
              ],
              correctIndex: 1,
              explanation: 'El núcleo contiene el ADN y controla todas las actividades celulares, siendo fundamental para la división celular y la transmisión genética.',
            },
            {
              id: 'q2',
              order: 2,
              text: '¿Qué organelo es responsable de la fotosíntesis en las células vegetales?',
              choices: ['Mitocondria', 'Cloroplasto', 'Ribosoma', 'Lisosoma'],
              correctIndex: 1,
              explanation: 'Los cloroplastos contienen clorofila y realizan la fotosíntesis, convirtiendo la energía solar en energía química.',
            },
            {
              id: 'q3',
              order: 3,
              text: '¿Cuál es el proceso mediante el cual las sustancias entran y salen de la célula?',
              choices: ['Fotosíntesis', 'Transporte celular', 'Respiración', 'Replicación'],
              correctIndex: 1,
              explanation: 'El transporte celular incluye difusión, ósmosis y transporte activo, manteniendo el equilibrio interno.',
            },
          ],
        },
      },
      {
        id: 'chem-module',
        title: 'Química Orgánica',
        order: 2,
        lessons: [
          {
            id: 'enlaces-lesson',
            title: 'Enlaces Químicos - Contenidos PAES',
            order: 1,
            subject: 'Química',
            videoUrl: 'https://example.com/video-enlaces-paes',
            transcript: 'Los enlaces químicos determinan las propiedades de las sustancias. Según la PAES, es fundamental distinguir entre enlaces iónicos, covalentes y metálicos, y comprender su relación con la reactividad química...',
            attachments: [],
          },
          {
            id: 'reacciones-lesson',
            title: 'Reacciones Químicas y Estequiometría',
            order: 2,
            subject: 'Química',
            videoUrl: 'https://example.com/video-reacciones-paes',
            transcript: 'Las reacciones químicas siguen la ley de conservación de la masa. La estequiometría permite calcular cantidades de reactivos y productos según las proporciones molares...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'chem-quiz',
          title: 'Quiz Química PAES - Enlaces y Reacciones',
          type: 'lesson',
          subject: 'Química',
          durationSec: 900,
          questions: [
            {
              id: 'q3',
              order: 1,
              text: '¿Cuál es la fórmula molecular del agua?',
              choices: ['H2O', 'CO2', 'NaCl', 'CH4'],
              correctIndex: 0,
              explanation: 'El agua está compuesta por 2 átomos de hidrógeno y 1 de oxígeno, formando H2O.',
            },
            {
              id: 'q4',
              order: 2,
              text: '¿Qué tipo de enlace se forma entre el sodio y el cloro en NaCl?',
              choices: ['Enlace covalente', 'Enlace iónico', 'Enlace metálico', 'Enlace hidrógeno'],
              correctIndex: 1,
              explanation: 'NaCl se forma por transferencia de electrones del sodio al cloro, creando un enlace iónico.',
            },
            {
              id: 'q5',
              order: 3,
              text: 'Si 2 moles de H2 reaccionan con 1 mol de O2, ¿cuántos moles de H2O se producen?',
              choices: ['1 mol', '2 moles', '3 moles', '4 moles'],
              correctIndex: 1,
              explanation: 'La reacción 2H2 + O2 → 2H2O muestra que 2 moles de H2 producen 2 moles de H2O.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'ingenieria-course',
    title: 'Preparación PAES Ingeniería',
    track: 'Ingenieria',
    modules: [
      {
        id: 'math-module',
        title: 'Matemáticas Avanzadas',
        order: 1,
        lessons: [
          {
            id: 'funciones-lesson',
            title: 'Funciones y Límites - PAES Matemáticas M2',
            order: 1,
            subject: 'Matemáticas',
            videoUrl: 'https://example.com/video-funciones-paes',
            transcript: 'Las funciones son relaciones matemáticas que asignan a cada elemento del dominio un elemento del codominio. En la PAES M2 se enfatiza el estudio de funciones polinomiales, racionales y trascendentes...',
            attachments: [],
          },
          {
            id: 'derivadas-lesson',
            title: 'Derivadas e Integrales - Cálculo Diferencial',
            order: 2,
            subject: 'Matemáticas',
            videoUrl: 'https://example.com/video-derivadas-paes',
            transcript: 'El cálculo diferencial estudia las razones de cambio. La derivada representa la pendiente de la tangente y se utiliza para encontrar máximos y mínimos en la PAES...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'math-quiz',
          title: 'Quiz Matemáticas PAES M2 - Cálculo',
          type: 'lesson',
          subject: 'Matemáticas',
          durationSec: 1200,
          questions: [
            {
              id: 'q4',
              order: 1,
              text: '¿Cuál es la derivada de la función f(x) = x²?',
              choices: ['x', '2x', 'x²', '2'],
              correctIndex: 1,
              explanation: 'La derivada de x² es 2x según la regla de la potencia. La derivada de x^n es n*x^(n-1).',
            },
            {
              id: 'q5',
              order: 2,
              text: 'Encuentre el límite de (x² - 1)/(x - 1) cuando x tiende a 1',
              choices: ['0', '1', '2', 'No existe'],
              correctIndex: 2,
              explanation: 'Factorizando: (x-1)(x+1)/(x-1) = x+1 cuando x ≠ 1. El límite es 2.',
            },
            {
              id: 'q6',
              order: 3,
              text: '¿Cuál es la integral definida de ∫₀² 2x dx?',
              choices: ['0', '2', '4', '8'],
              correctIndex: 2,
              explanation: '∫ 2x dx = x² + C. De 0 a 2: (4) - (0) = 4.',
            },
          ],
        },
      },
      {
        id: 'physics-module',
        title: 'Física Mecánica',
        order: 2,
        lessons: [
          {
            id: 'newton-lesson',
            title: 'Leyes de Newton - PAES Física',
            order: 1,
            subject: 'Física',
            videoUrl: 'https://example.com/video-newton-paes',
            transcript: 'Las leyes de Newton son fundamentales en la física clásica. La primera ley establece la inercia, la segunda relaciona fuerza y aceleración (F=ma), y la tercera describe la acción-reacción...',
            attachments: [],
          },
          {
            id: 'energia-lesson',
            title: 'Energía y Trabajo - Contenidos PAES',
            order: 2,
            subject: 'Física',
            videoUrl: 'https://example.com/video-energia-paes',
            transcript: 'La energía se presenta en diversas formas: cinética, potencial, térmica. El principio de conservación de la energía establece que la energía total de un sistema aislado permanece constante...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'physics-quiz',
          title: 'Quiz Física PAES - Mecánica',
          type: 'lesson',
          subject: 'Física',
          durationSec: 900,
          questions: [
            {
              id: 'q5',
              order: 1,
              text: '¿Cuál es la primera ley de Newton?',
              choices: ['Ley de la inercia', 'F = ma', 'Acción-Reacción', 'Ley de la gravitación'],
              correctIndex: 0,
              explanation:
                'La primera ley de Newton establece que un objeto en reposo permanece en reposo y uno en movimiento mantiene su velocidad constante a menos que actúe una fuerza externa.',
            },
            {
              id: 'q6',
              order: 2,
              text: 'Si un objeto de 2 kg tiene una aceleración de 5 m/s², ¿cuál es la fuerza neta que actúa sobre él?',
              choices: ['3 N', '7 N', '10 N', '15 N'],
              correctIndex: 2,
              explanation: 'F = m × a = 2 kg × 5 m/s² = 10 N.',
            },
            {
              id: 'q7',
              order: 3,
              text: '¿Cuál es la energía potencial gravitatoria de un objeto de 3 kg a 5 metros de altura?',
              choices: ['15 J', '49 J', '147 J', '735 J'],
              correctIndex: 2,
              explanation: 'Ep = m × g × h = 3 × 9.8 × 5 = 147 J (aproximadamente).',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'humanista-course',
    title: 'Preparación PAES Humanista',
    track: 'Humanista',
    modules: [
      {
        id: 'history-module',
        title: 'Historia de Chile',
        order: 1,
        lessons: [
          {
            id: 'independencia-lesson',
            title: 'Proceso de Independencia de Chile - PAES Historia',
            order: 1,
            subject: 'Historia',
            videoUrl: 'https://example.com/video-independencia-paes',
            transcript: 'El proceso de independencia de Chile se inició el 18 de septiembre de 1810 con la Primera Junta de Gobierno. Los hitos fundamentales incluyen la Patria Vieja (1810-1814), Reconquista española (1814-1817) y Patria Nueva (1817-1823)...',
            attachments: [],
          },
          {
            id: 'constitucion-lesson',
            title: 'Historia Constitucional de Chile',
            order: 2,
            subject: 'Historia',
            videoUrl: 'https://example.com/video-constitucion-paes',
            transcript: 'Las constituciones chilenas marcan los períodos históricos: 1833 (portaliana), 1925 (presidencialista), 1980 (actual con reformas) y el proceso constituyente actual. La PAES enfatiza la comprensión de la evolución institucional...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'history-quiz',
          title: 'Quiz Historia de Chile PAES',
          type: 'lesson',
          subject: 'Historia',
          durationSec: 900,
          questions: [
            {
              id: 'q6',
              order: 1,
              text: '¿En qué año se firmó el Acta de Independencia de Chile?',
              choices: ['1810', '1818', '1823', '1830'],
              correctIndex: 1,
              explanation: 'Chile firmó su Acta de Independencia el 12 de febrero de 1818, tras la Batalla de Chacabuco.',
            },
            {
              id: 'q7',
              order: 2,
              text: '¿Cuál fue el período histórico conocido como "Patria Vieja"?',
              choices: ['1810-1814', '1814-1817', '1817-1823', '1823-1830'],
              correctIndex: 0,
              explanation: 'La Patria Vieja (1810-1814) fue el primer período independentista, finalizado por la Reconquista española.',
            },
            {
              id: 'q8',
              order: 3,
              text: '¿Quién fue el director supremo durante la promulgación de la Constitución de 1828?',
              choices: ['Bernardo O\'Higgins', 'José Miguel Carrera', 'Francisco Antonio Pinto', 'Diego Portales'],
              correctIndex: 2,
              explanation: 'Francisco Antonio Pinto fue director supremo cuando se promulgó la Constitución liberal de 1828.',
            },
          ],
        },
      },
      {
        id: 'literature-module',
        title: 'Literatura Chilena',
        order: 2,
        lessons: [
          {
            id: 'neruda-lesson',
            title: 'Pablo Neruda y la Generación del 27 - PAES Literatura',
            order: 1,
            subject: 'Literatura',
            videoUrl: 'https://example.com/video-neruda-paes',
            transcript: 'Pablo Neruda (1904-1973) es uno de los poetas más importantes del siglo XX. Su obra evoluciona desde el modernismo hacia la poesía comprometida. "Veinte poemas de amor y una canción desesperada" lo consagró internacionalmente...',
            attachments: [],
          },
          {
            id: 'mistral-lesson',
            title: 'Gabriela Mistral - Premio Nobel Chilena',
            order: 2,
            subject: 'Literatura',
            videoUrl: 'https://example.com/video-mistral-paes',
            transcript: 'Gabriela Mistral (1889-1957) fue la primera latinoamericana en recibir el Premio Nobel de Literatura (1945). Su poesía combina elementos modernistas con temas sociales, educativos y maternales...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'literature-quiz',
          title: 'Quiz Literatura Chilena PAES',
          type: 'lesson',
          subject: 'Literatura',
          durationSec: 900,
          questions: [
            {
              id: 'q7',
              order: 1,
              text: '¿Cuál es el nombre real de Pablo Neruda?',
              choices: [
                'Ricardo Eliécer Neftalí Reyes Basoalto',
                'Lucila Godoy Alcayaga',
                'Vicente García Huidobro',
                'Nicanor Segundo Parra Sandoval',
              ],
              correctIndex: 0,
              explanation:
                'Pablo Neruda es el seudónimo de Ricardo Eliécer Neftalí Reyes Basoalto, adoptado para evitar conflictos con su familia.',
            },
            {
              id: 'q8',
              order: 2,
              text: '¿Cuál es la obra más conocida de Pablo Neruda?',
              choices: [
                'Desolación',
                'Veinte poemas de amor y una canción desesperada',
                'Altazor',
                'Canto general',
              ],
              correctIndex: 1,
              explanation:
                '"Veinte poemas de amor y una canción desesperada" (1924) es la obra que consagró internacionalmente a Neruda.',
            },
            {
              id: 'q9',
              order: 3,
              text: '¿En qué año recibió Gabriela Mistral el Premio Nobel de Literatura?',
              choices: ['1924', '1938', '1945', '1957'],
              correctIndex: 2,
              explanation: 'Gabriela Mistral recibió el Premio Nobel en 1945, siendo la primera latinoamericana en obtenerlo.',
            },
          ],
        },
      },
    ],
  },
];

// Helper functions to get demo data
export const getDemoCourses = () => demoCourses;

export const getDemoSubjects = () => {
  const subjects = new Set<string>();
  demoCourses.forEach(course => {
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.subject) subjects.add(lesson.subject);
      });
    });
  });
  return Array.from(subjects).sort();
};

export const getDemoLessons = (subject?: string) => {
  const lessons: any[] = [];
  demoCourses.forEach(course => {
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (!subject || lesson.subject === subject) {
          lessons.push({
            _id: lesson.id,
            title: lesson.title,
            subject: lesson.subject,
            videoUrl: lesson.videoUrl,
            pdfUrl: lesson.pdfUrl,
          });
        }
      });
    });
  });

  // Add Chilean PAES PDF resources
  const paesPdfResources = [
    {
      _id: 'paes-m1-2024-guide',
      title: 'Guía de Estudio PAES Matemática M1 2024 - DEMRE',
      subject: 'Matemáticas',
      pdfUrl: 'https://example.com/paes-m1-2024-guide.pdf',
    },
    {
      _id: 'paes-lectora-2024-guide',
      title: 'Guía Competencia Lectora PAES 2024 - Ministerio de Educación',
      subject: 'Competencia Lectora',
      pdfUrl: 'https://example.com/paes-lectora-2024-guide.pdf',
    },
    {
      _id: 'paes-ciencias-2024-guide',
      title: 'Guía PAES Ciencias 2024 - Biología, Física, Química',
      subject: 'Ciencias',
      pdfUrl: 'https://example.com/paes-ciencias-2024-guide.pdf',
    },
    {
      _id: 'paes-historia-2024-guide',
      title: 'Guía PAES Historia y Ciencias Sociales 2024',
      subject: 'Historia',
      pdfUrl: 'https://example.com/paes-historia-2024-guide.pdf',
    },
    {
      _id: 'marco-curricular-paes',
      title: 'Marco Curricular PAES 2024 - Contenidos y Competencias',
      subject: 'General',
      pdfUrl: 'https://example.com/marco-curricular-paes-2024.pdf',
    },
    {
      _id: 'prepauniversitarios-ejercicios',
      title: 'Banco de Ejercicios PAES 2024 - PrepaUniversitarios.cl',
      subject: 'General',
      pdfUrl: 'https://example.com/prepauniversitarios-ejercicios-2024.pdf',
    }
  ];

  // Filter by subject if specified
  const filteredPaesResources = subject
    ? paesPdfResources.filter(resource =>
        resource.subject === subject ||
        resource.subject === 'General'
      )
    : paesPdfResources;

  lessons.push(...filteredPaesResources);

  return lessons.sort((a, b) => a.title.localeCompare(b.title));
};

export const getDemoLesson = (id: string) => {
  for (const course of demoCourses) {
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.id === id);
      if (lesson) return lesson;
    }
  }
  return null;
};

export const getDemoLessonQuiz = (lessonId: string) => {
  for (const course of demoCourses) {
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson && module.quiz) {
        return {
          _id: module.quiz.id,
          title: module.quiz.title,
          durationSec: module.quiz.durationSec,
          questions: module.quiz.questions.map(q => ({
            _id: q.id,
            order: q.order,
            text: q.text,
            choices: q.choices,
          })),
        };
      }
    }
  }
  return null;
};

export type DemoPaesQuizPayload = {
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
      assignment: PaesAssignmentSlug;
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

export const getDemoPaesAssignments = (): PaesAssignmentMeta[] => paesAssignments;

export const getDemoPaesCatalog = () =>
  paesExamCatalog.map(test => ({
    id: test.id,
    title: test.title,
    assignment: test.assignment,
    assignmentLabel: test.assignmentLabel,
    questionCount: test.questions.length,
    durationSec: test.durationSec,
    source: test.source,
    year: test.year,
    session: test.session,
  }));

export const getDemoPaesQuiz = (id: string): DemoPaesQuizPayload | null => {
  const test = getPaesTestById(id);
  if (!test) return null;
  return {
    quiz: {
      _id: `demo-${test.id}`,
      title: test.title,
      durationSec: test.durationSec,
      questions: test.questions.map((question, index) => ({
        _id: `${test.id}-q${index + 1}`,
        order: question.order,
        text: question.text,
        choices: question.choices,
      })),
      metadata: {
        assignment: test.assignment,
        assignmentLabel: test.assignmentLabel,
        source: test.source,
        year: test.year,
        session: test.session,
      },
    },
    answerKey: test.questions.map(question => ({
      order: question.order,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      competency: question.competency,
    })),
  };
};

export const getPaesAssignmentMeta = (slug: PaesAssignmentSlug) => getAssignmentById(slug);
