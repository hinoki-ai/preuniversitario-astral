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
            title: 'Estructura de la Célula',
            order: 1,
            subject: 'Biología',
            videoUrl: 'https://example.com/video-celula',
            transcript:
              'En esta lección aprenderemos sobre la estructura básica de la célula. La célula es la unidad fundamental de la vida...',
            attachments: [],
          },
          {
            id: 'membrana-lesson',
            title: 'Membrana Plasmática',
            order: 2,
            subject: 'Biología',
            videoUrl: 'https://example.com/video-membrana',
            transcript: 'La membrana plasmática es una barrera selectiva que rodea la célula...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'bio-quiz',
          title: 'Quiz Biología Celular',
          type: 'lesson',
          subject: 'Biología',
          durationSec: 600,
          questions: [
            {
              id: 'q1',
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
            },
            {
              id: 'q2',
              order: 2,
              text: '¿Qué organelo es responsable de la fotosíntesis?',
              choices: ['Mitocondria', 'Cloroplasto', 'Ribosoma', 'Lisosoma'],
              correctIndex: 1,
              explanation: 'Los cloroplastos contienen clorofila y realizan la fotosíntesis.',
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
            title: 'Enlaces Químicos',
            order: 1,
            subject: 'Química',
            videoUrl: 'https://example.com/video-enlaces',
            transcript: 'Los enlaces químicos son las fuerzas que mantienen unidos a los átomos...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'chem-quiz',
          title: 'Quiz Química Orgánica',
          type: 'lesson',
          subject: 'Química',
          durationSec: 600,
          questions: [
            {
              id: 'q3',
              order: 1,
              text: '¿Cuál es la fórmula del agua?',
              choices: ['H2O', 'CO2', 'NaCl', 'CH4'],
              correctIndex: 0,
              explanation: 'El agua está compuesta por 2 átomos de hidrógeno y 1 de oxígeno.',
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
            title: 'Funciones y Derivadas',
            order: 1,
            subject: 'Matemáticas',
            videoUrl: 'https://example.com/video-funciones',
            transcript: 'Las funciones matemáticas relacionan elementos de dos conjuntos...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'math-quiz',
          title: 'Quiz Matemáticas',
          type: 'lesson',
          subject: 'Matemáticas',
          durationSec: 900,
          questions: [
            {
              id: 'q4',
              order: 1,
              text: '¿Cuál es la derivada de x²?',
              choices: ['x', '2x', 'x²', '2'],
              correctIndex: 1,
              explanation: 'La derivada de x² es 2x según la regla de la potencia.',
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
            title: 'Leyes de Newton',
            order: 1,
            subject: 'Física',
            videoUrl: 'https://example.com/video-newton',
            transcript: 'Las leyes de Newton describen el movimiento de los objetos...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'physics-quiz',
          title: 'Quiz Física Mecánica',
          type: 'lesson',
          subject: 'Física',
          durationSec: 600,
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
            title: 'Independencia de Chile',
            order: 1,
            subject: 'Historia',
            videoUrl: 'https://example.com/video-independencia',
            transcript: 'La independencia de Chile comenzó en 1810...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'history-quiz',
          title: 'Quiz Historia de Chile',
          type: 'lesson',
          subject: 'Historia',
          durationSec: 600,
          questions: [
            {
              id: 'q6',
              order: 1,
              text: '¿En qué año declaró Chile su independencia?',
              choices: ['1810', '1818', '1823', '1830'],
              correctIndex: 1,
              explanation: 'Chile declaró su independencia el 12 de febrero de 1818.',
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
            title: 'Pablo Neruda',
            order: 1,
            subject: 'Literatura',
            videoUrl: 'https://example.com/video-neruda',
            transcript: 'Pablo Neruda fue uno de los más grandes poetas chilenos...',
            attachments: [],
          },
        ],
        quiz: {
          id: 'literature-quiz',
          title: 'Quiz Literatura Chilena',
          type: 'lesson',
          subject: 'Literatura',
          durationSec: 600,
          questions: [
            {
              id: 'q7',
              order: 1,
              text: '¿Cuál es el nombre real de Pablo Neruda?',
              choices: [
                'Ricardo Eliécer Neftalí Reyes Basoalto',
                'Gabriela Mistral',
                'Vicente Huidobro',
                'Nicanor Parra',
              ],
              correctIndex: 0,
              explanation:
                'Pablo Neruda es el seudónimo de Ricardo Eliécer Neftalí Reyes Basoalto.',
            },
          ],
        },
      },
    ],
  },
];

export const demoPaesQuiz = {
  id: 'paes-simulacro',
  title: 'Simulacro PAES 2024',
  type: 'paes',
  subject: 'PAES',
  durationSec: 1800,
  questions: [
    {
      id: 'paes-q1',
      order: 1,
      text: '¿Cuál es el resultado de la integral ∫(2x + 3)dx?',
      choices: ['x² + 3x + C', 'x² + C', '2x² + 3x + C', '(x² + 3x) + C'],
      correctIndex: 0,
      explanation: 'La integral de 2x es x² y la de 3 es 3x, más la constante de integración C.',
    },
    {
      id: 'paes-q2',
      order: 2,
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
      id: 'paes-q3',
      order: 3,
      text: 'En biología, ¿qué tipo de célula carece de núcleo?',
      choices: ['Célula procariota', 'Célula eucariota', 'Célula vegetal', 'Célula animal'],
      correctIndex: 0,
      explanation: 'Las células procariotas, como las bacterias, no tienen núcleo definido.',
    },
    {
      id: 'paes-q4',
      order: 4,
      text: "¿Quién escribió 'Cien años de soledad'?",
      choices: ['Gabriel García Márquez', 'Pablo Neruda', 'Mario Vargas Llosa', 'Julio Cortázar'],
      correctIndex: 0,
      explanation: "Gabriel García Márquez es el autor de 'Cien años de soledad'.",
    },
    {
      id: 'paes-q5',
      order: 5,
      text: 'En química, ¿cuál es el número atómico del carbono?',
      choices: ['4', '6', '8', '12'],
      correctIndex: 1,
      explanation: 'El carbono tiene número atómico 6, lo que significa que tiene 6 protones.',
    },
  ],
};

// Helper functions to get demo data
export const getDemoCourses = () => demoCourses;

export const getDemoPaesQuiz = () => demoPaesQuiz;

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
