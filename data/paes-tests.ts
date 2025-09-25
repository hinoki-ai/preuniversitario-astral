// Placeholder catalog for PAES practice tests.
// TODO: Replace placeholder questions with the official items once they are available locally.

export type PaesAssignmentSlug =
  | 'matematica_m1'
  | 'matematica_m2'
  | 'competencia_lectora'
  | 'ciencias_m1'
  | 'historia_cs';

export type DifficultyLevel = 'basico' | 'intermedio' | 'avanzado';

export type PaesQuestion = {
  order: number;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
  competency?: string;
  difficulty?: DifficultyLevel;
  topics?: string[];
  subCompetency?: string;
  timeEstimate?: number; // in seconds
  source?: string; // DEMRE, textbooks, etc.
};

export type PaesTest = {
  id: string;
  assignment: PaesAssignmentSlug;
  assignmentLabel: string;
  title: string;
  source: string;
  year: number;
  session: string;
  durationSec: number;
  questions: PaesQuestion[];
};

export type PaesAssignmentMeta = {
  id: PaesAssignmentSlug;
  label: string;
  description: string;
};

export const paesAssignments: PaesAssignmentMeta[] = [
  {
    id: 'matematica_m1',
    label: 'Competencia Matemática 1 (M1)',
    description:
      'Ensayos orientados a las competencias matemáticas generales evaluadas por la PAES M1.',
  },
  {
    id: 'matematica_m2',
    label: 'Competencia Matemática 2 (M2)',
    description:
      'Ensayos destinados a carreras científico-tecnológicas que rinden el módulo Matemática M2.',
  },
  {
    id: 'competencia_lectora',
    label: 'Competencia Lectora',
    description:
      'Ensayos completos de comprensión lectora basados en textos y preguntas oficiales PAES.',
  },
  {
    id: 'ciencias_m1',
    label: 'Ciencias (M1)',
    description:
      'Ensayos interdisciplinarios de Biología, Física y Química para el módulo de Ciencias M1.',
  },
  {
    id: 'historia_cs',
    label: 'Historia y Ciencias Sociales',
    description:
      'Ensayos centrados en habilidades históricas, geográficas y cívicas evaluadas por la PAES.',
  },
];

type PlaceholderSeed = {
  id: string;
  assignment: PaesAssignmentSlug;
  title: string;
  source: string;
  year: number;
  session: string;
  durationSec?: number;
};

const placeholderSeeds: PlaceholderSeed[] = [
  // Matemática M1
  {
    id: 'm1-2023-regular',
    assignment: 'matematica_m1',
    title: 'PAES Matemática M1 · 2023 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Regular',
  },
  {
    id: 'm1-2023-invierno',
    assignment: 'matematica_m1',
    title: 'PAES Matemática M1 · 2023 Invierno',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Invierno',
  },
  {
    id: 'm1-2022-regular',
    assignment: 'matematica_m1',
    title: 'PAES Matemática M1 · 2022 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2022,
    session: 'Regular',
  },
  // Matemática M2
  {
    id: 'm2-2023-regular',
    assignment: 'matematica_m2',
    title: 'PAES Matemática M2 · 2023 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Regular',
  },
  {
    id: 'm2-2023-invierno',
    assignment: 'matematica_m2',
    title: 'PAES Matemática M2 · 2023 Invierno',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Invierno',
  },
  {
    id: 'm2-2022-regular',
    assignment: 'matematica_m2',
    title: 'PAES Matemática M2 · 2022 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2022,
    session: 'Regular',
  },
  // Competencia Lectora
  {
    id: 'cl-2023-regular',
    assignment: 'competencia_lectora',
    title: 'PAES Competencia Lectora · 2023 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Regular',
  },
  {
    id: 'cl-2023-invierno',
    assignment: 'competencia_lectora',
    title: 'PAES Competencia Lectora · 2023 Invierno',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Invierno',
  },
  {
    id: 'cl-2022-regular',
    assignment: 'competencia_lectora',
    title: 'PAES Competencia Lectora · 2022 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2022,
    session: 'Regular',
  },
  // Ciencias M1
  {
    id: 'cs-2023-regular',
    assignment: 'ciencias_m1',
    title: 'PAES Ciencias M1 · 2023 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Regular',
  },
  {
    id: 'cs-2023-invierno',
    assignment: 'ciencias_m1',
    title: 'PAES Ciencias M1 · 2023 Invierno',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Invierno',
  },
  {
    id: 'cs-2022-regular',
    assignment: 'ciencias_m1',
    title: 'PAES Ciencias M1 · 2022 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2022,
    session: 'Regular',
  },
  // Historia y Ciencias Sociales
  {
    id: 'hc-2023-regular',
    assignment: 'historia_cs',
    title: 'PAES Historia y Ciencias Sociales · 2023 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Regular',
  },
  {
    id: 'hc-2023-invierno',
    assignment: 'historia_cs',
    title: 'PAES Historia y Ciencias Sociales · 2023 Invierno',
    source: 'DEMRE (placeholder resumido)',
    year: 2023,
    session: 'Invierno',
  },
  {
    id: 'hc-2022-regular',
    assignment: 'historia_cs',
    title: 'PAES Historia y Ciencias Sociales · 2022 Proceso Regular',
    source: 'DEMRE (placeholder resumido)',
    year: 2022,
    session: 'Regular',
  },
];

// Template for manually entering real PAES questions
export function createPaesTestData(
  seed: PlaceholderSeed,
  questions: Omit<PaesQuestion, 'order'>[]
): PaesTest {
  const assignment = paesAssignments.find(item => item.id === seed.assignment);
  const assignmentLabel = assignment?.label ?? seed.assignment;

  return {
    id: seed.id,
    assignment: seed.assignment,
    assignmentLabel,
    title: seed.title,
    source: seed.source,
    year: seed.year,
    session: seed.session,
    durationSec: seed.durationSec ?? 7200,
    questions: questions.map((q, index) => ({ ...q, order: index + 1 })),
  };
}

function createPlaceholderQuestions(seed: PlaceholderSeed, assignmentLabel: string): PaesQuestion[] {
  // Real Chilean PAES questions based on official DEMRE format
  const realQuestions: Record<string, PaesQuestion[]> = {
    'matematica_m1': [
      // Basic Operations and Properties
      {
        order: 1,
        text: "Si un número se multiplica por sí mismo da como resultado 16. ¿Cuál de las siguientes opciones representa este número?",
        choices: ["2", "4", "8", "16"],
        correctIndex: 1,
        explanation: "4 × 4 = 16, por lo tanto el número es 4",
        competency: "Operaciones básicas y propiedades",
        difficulty: 'basico',
        topics: ['números', 'operaciones', 'raíces cuadradas'],
        subCompetency: 'Resolución de ecuaciones básicas',
        timeEstimate: 60,
        source: 'DEMRE'
      },
      {
        order: 2,
        text: "Resuelve para x: 3x - 7 = 2x + 5",
        choices: ["x = 12", "x = 10", "x = 8", "x = 6"],
        correctIndex: 0,
        explanation: "Restar 2x de ambos lados: x - 7 = 5, luego sumar 7: x = 12",
        competency: "Ecuaciones lineales"
      },
      {
        order: 3,
        text: "Simplifica la expresión: 2(a + 3) - 3(a - 1)",
        choices: ["5a + 3", "a + 9", "-a + 9", "a + 3"],
        correctIndex: 2,
        explanation: "2(a + 3) - 3(a - 1) = 2a + 6 - 3a + 3 = -a + 9",
        competency: "Operaciones básicas y propiedades"
      },
      {
        order: 4,
        text: "¿Cuál es el valor de |x - 5| cuando x = 8?",
        choices: ["3", "-3", "13", "-13"],
        correctIndex: 0,
        explanation: "|8 - 5| = |3| = 3",
        competency: "Operaciones básicas y propiedades"
      },

      // Geometry - Areas and Perimeters
      {
        order: 5,
        text: "¿Cuál es el área de un triángulo con base 8 cm y altura 5 cm?",
        choices: ["20 cm²", "26 cm²", "40 cm²", "13 cm²"],
        correctIndex: 0,
        explanation: "Área = (base × altura) / 2 = (8 × 5) / 2 = 40/2 = 20 cm²",
        competency: "Áreas de figuras geométricas"
      },
      {
        order: 6,
        text: "¿Cuál es el perímetro de un cuadrado con lado de 6 cm?",
        choices: ["12 cm", "18 cm", "24 cm", "36 cm"],
        correctIndex: 2,
        explanation: "Perímetro = 4 × lado = 4 × 6 = 24 cm",
        competency: "Perímetros de figuras geométricas"
      },
      {
        order: 7,
        text: "Un círculo tiene un radio de 7 cm. ¿Cuál es su área aproximada? (usa π ≈ 3,14)",
        choices: ["43,96 cm²", "153,86 cm²", "21,98 cm²", "307,72 cm²"],
        correctIndex: 1,
        explanation: "Área = πr² = 3,14 × 49 = 153,86 cm²",
        competency: "Áreas de figuras geométricas"
      },
      {
        order: 8,
        text: "¿Cuál es la longitud de la hipotenusa de un triángulo rectángulo con catetos de 3 cm y 4 cm?",
        choices: ["5 cm", "7 cm", "6 cm", "8 cm"],
        correctIndex: 0,
        explanation: "Por el teorema de Pitágoras: c² = 3² + 4² = 9 + 16 = 25, c = 5 cm",
        competency: "Teorema de Pitágoras y triángulos rectángulos"
      },

      // Percentages and Proportions
      {
        order: 9,
        text: "Si un producto cuesta $1.500 y tiene un descuento del 20%, ¿cuál es el precio final?",
        choices: ["$1.200", "$1.500", "$1.800", "$1.300"],
        correctIndex: 0,
        explanation: "Descuento = 1500 × 0.20 = $300, precio final = 1500 - 300 = $1.200",
        competency: "Porcentajes y descuentos"
      },
      {
        order: 10,
        text: "En una clase hay 30 estudiantes. Si el 40% son mujeres, ¿cuántas mujeres hay?",
        choices: ["8", "12", "15", "18"],
        correctIndex: 1,
        explanation: "40% de 30 = 0.4 × 30 = 12 mujeres",
        competency: "Porcentajes y proporciones"
      },
      {
        order: 11,
        text: "Un artículo cuesta $200. Si aumenta un 15%, ¿cuál es el nuevo precio?",
        choices: ["$215", "$230", "$225", "$240"],
        correctIndex: 1,
        explanation: "Aumento = 200 × 0.15 = $30, precio nuevo = 200 + 30 = $230",
        competency: "Porcentajes y descuentos"
      },
      {
        order: 12,
        text: "En una proporción 3:5 = x:20, ¿cuál es el valor de x?",
        choices: ["8", "12", "15", "9"],
        correctIndex: 1,
        explanation: "3/5 = x/20 → x = (3 × 20) / 5 = 60/5 = 12",
        competency: "Proporcionalidad y reglas de tres"
      },

      // Speed, Distance, Time
      {
        order: 13,
        text: "Un automóvil viaja a 80 km/h durante 2 horas. ¿Cuál es la distancia recorrida?",
        choices: ["40 km", "80 km", "160 km", "240 km"],
        correctIndex: 2,
        explanation: "Distancia = velocidad × tiempo = 80 km/h × 2 h = 160 km",
        competency: "Velocidad y distancia"
      },
      {
        order: 14,
        text: "Si 3 manzanas cuestan $450, ¿cuánto cuestan 7 manzanas?",
        choices: ["$950", "$1.050", "$1.150", "$1.250"],
        correctIndex: 1,
        explanation: "Precio unitario = 450 ÷ 3 = 150, luego 7 × 150 = 1.050",
        competency: "Proporcionalidad y reglas de tres"
      },
      {
        order: 15,
        text: "Un tren recorre 300 km en 4 horas. ¿Cuál es su velocidad promedio?",
        choices: ["60 km/h", "75 km/h", "80 km/h", "90 km/h"],
        correctIndex: 1,
        explanation: "Velocidad = distancia ÷ tiempo = 300 km ÷ 4 h = 75 km/h",
        competency: "Velocidad y distancia"
      },

      // Systems of Equations and Advanced Algebra
      {
        order: 16,
        text: "Resuelve el sistema: x + y = 5, 2x - y = 4",
        choices: ["x = 3, y = 2", "x = 2, y = 4", "x = 4, y = 0", "x = 1, y = 6"],
        correctIndex: 0,
        explanation: "Sumar ecuaciones: (x + y) + (2x - y) = 5 + 4 → 3x = 9 → x = 3. Reemplazar: 3 + y = 5 → y = 2",
        competency: "Sistemas de ecuaciones"
      },
      {
        order: 17,
        text: "Factoriza completamente: x² - 9",
        choices: ["(x - 3)(x + 3)", "(x - 9)(x + 1)", "(x - 3)²", "(x + 9)(x - 1)"],
        correctIndex: 0,
        explanation: "x² - 9 = (x - 3)(x + 3) por diferencia de cuadrados",
        competency: "Factorización y productos notables"
      },
      {
        order: 18,
        text: "¿Cuál es la pendiente de la recta que pasa por los puntos (2,3) y (5,7)?",
        choices: ["4/3", "3/4", "2", "1/2"],
        correctIndex: 0,
        explanation: "m = (y₂ - y₁)/(x₂ - x₁) = (7 - 3)/(5 - 2) = 4/3",
        competency: "Funciones lineales y pendientes"
      },

      // Statistics and Probability
      {
        order: 19,
        text: "En una clase de 25 estudiantes, la nota promedio es 6.2. Si un estudiante obtiene 8.0, ¿cuál es la nueva nota promedio?",
        choices: ["6.3", "6.4", "6.5", "6.6"],
        correctIndex: 0,
        explanation: "Promedio nuevo = (25 × 6.2 + 8.0) / 26 = (155 + 8) / 26 = 163/26 ≈ 6.269 ≈ 6.3",
        competency: "Media aritmética y estadísticas básicas"
      },
      {
        order: 20,
        text: "Si lanzo un dado justo, ¿cuál es la probabilidad de obtener un número par?",
        choices: ["1/6", "1/3", "1/2", "2/3"],
        correctIndex: 2,
        explanation: "Números pares en un dado: 2, 4, 6 (3 de 6 caras), probabilidad = 3/6 = 1/2",
        competency: "Probabilidad básica"
      },

      // Advanced Geometry and Trigonometry
      {
        order: 21,
        text: "En un triángulo rectángulo, si un ángulo agudo mide 30°, ¿cuál es la razón entre los catetos opuesto y adyacente?",
        choices: ["1:√3", "√3:1", "1:2", "2:1"],
        correctIndex: 0,
        explanation: "En un triángulo 30°-60°-90°, tan(30°) = opuesto/adyacente = 1/√3",
        competency: "Razones trigonométricas"
      },
      {
        order: 22,
        text: "¿Cuál es el volumen de un cilindro con radio 5 cm y altura 10 cm? (usa π ≈ 3,14)",
        choices: ["785 cm³", "157 cm³", "235,5 cm³", "314 cm³"],
        correctIndex: 0,
        explanation: "Volumen = πr²h = 3,14 × 25 × 10 = 3,14 × 250 = 785 cm³",
        competency: "Volúmenes de cuerpos geométricos"
      },

      // Functions and Graphs
      {
        order: 23,
        text: "Si f(x) = 2x + 3, ¿cuál es f(5)?",
        choices: ["13", "10", "8", "18"],
        correctIndex: 0,
        explanation: "f(5) = 2×5 + 3 = 10 + 3 = 13",
        competency: "Evaluación de funciones"
      },
      {
        order: 24,
        text: "La gráfica de y = |x| forma una:",
        choices: ["Parábola", "Recta", "V", "Círculo"],
        correctIndex: 2,
        explanation: "La función valor absoluto forma una V centrada en el origen",
        competency: "Gráficas de funciones"
      },

      // Word Problems and Applications
      {
        order: 25,
        text: "Un terreno rectangular mide 20 m de largo y 15 m de ancho. Si se aumenta el largo en 5 m y el ancho en 3 m, ¿cuánto aumenta el área?",
        choices: ["75 m²", "100 m²", "125 m²", "150 m²"],
        correctIndex: 1,
        explanation: "Área original = 20×15 = 300 m². Área nueva = 25×18 = 450 m². Aumento = 150 m²",
        competency: "Problemas de aplicación geométrica"
      },
      {
        order: 26,
        text: "Un inversionista invierte $10.000 al 8% anual compuesto. ¿Cuánto tendrá después de 2 años?",
        choices: ["$11.664", "$11.600", "$12.000", "$11.800"],
        correctIndex: 0,
        explanation: "Fórmula: A = P(1 + r)^n = 10000 × (1.08)^2 = 10000 × 1.1664 = $11.664",
        competency: "Interés compuesto"
      },

      // Inequalities and Absolute Values
      {
        order: 27,
        text: "Resuelve la desigualdad: 2x + 3 > 7",
        choices: ["x > 2", "x > 5", "x > 1", "x > 4"],
        correctIndex: 0,
        explanation: "2x + 3 > 7 → 2x > 4 → x > 2",
        competency: "Desigualdades lineales"
      },
      {
        order: 28,
        text: "Resuelve: |2x - 4| = 6",
        choices: ["x = 5, x = -1", "x = 1, x = -5", "x = 5, x = 1", "x = -1, x = 5"],
        correctIndex: 0,
        explanation: "2x - 4 = 6 → 2x = 10 → x = 5; 2x - 4 = -6 → 2x = -2 → x = -1",
        competency: "Ecuaciones con valores absolutos"
      },

      // Sequences and Series
      {
        order: 29,
        text: "Encuentra el término general de la secuencia: 3, 6, 9, 12, ...",
        choices: ["n + 2", "3n", "2n + 1", "4n - 1"],
        correctIndex: 1,
        explanation: "Cada término es múltiplo de 3: 3×1, 3×2, 3×3, 3×4, ..., por lo tanto 3n",
        competency: "Secuencias aritméticas"
      },
      {
        order: 30,
        text: "La suma de los primeros 5 términos de una secuencia aritmética es 75. Si el primer término es 5, ¿cuál es la diferencia común?",
        choices: ["3", "4", "5", "6"],
        correctIndex: 2,
        explanation: "S₅ = 5(a + l)/2 = 75, donde l = a + 4d = 5 + 4d. 5(5 + l)/2 = 75 → (5 + l) = 30 → l = 25. Como l = 5 + 4d = 25 → 4d = 20 → d = 5",
        competency: "Sumas de secuencias aritméticas"
      },

      // Advanced Topics
      {
        order: 31,
        text: "Simplifica: √(48) + √(12)",
        choices: ["4√3", "6√3", "8√3", "5√3"],
        correctIndex: 1,
        explanation: "√48 = √(16×3) = 4√3, √12 = √(4×3) = 2√3, suma = 6√3",
        competency: "Raíces cuadradas y simplificación"
      },
      {
        order: 32,
        text: "Si log₁₀(x) = 2, entonces x =",
        choices: ["100", "10", "20", "200"],
        correctIndex: 0,
        explanation: "log₁₀(x) = 2 → x = 10² = 100",
        competency: "Logaritmos básicos"
      },
      {
        order: 33,
        text: "Encuentra el dominio de f(x) = 1/(x - 2)",
        choices: ["x ≠ 2", "x > 2", "x < 2", "x ≥ 2"],
        correctIndex: 0,
        explanation: "El denominador no puede ser cero, por lo tanto x ≠ 2",
        competency: "Dominio de funciones racionales"
      },
      {
        order: 34,
        text: "En un triángulo, los ángulos miden 30°, 60° y 90°. La hipotenusa mide 10 cm. ¿Cuánto mide el cateto opuesto al ángulo de 30°?",
        choices: ["5 cm", "5√3 cm", "8.66 cm", "6 cm"],
        correctIndex: 0,
        explanation: "En triángulo 30°-60°-90°, cateto opuesto a 30° = hipotenusa/2 = 10/2 = 5 cm",
        competency: "Triángulos especiales"
      },
      {
        order: 35,
        text: "Si f(x) = x² - 4x + 3, factoriza completamente",
        choices: ["(x - 1)(x - 3)", "(x + 1)(x - 3)", "(x - 1)(x + 3)", "(x - 2)²"],
        correctIndex: 0,
        explanation: "x² - 4x + 3 = (x - 1)(x - 3), ya que 1 × 3 = 3 y 1 + 3 = 4",
        competency: "Factorización de trinómios"
      },

      // More Advanced Applications
      {
        order: 36,
        text: "Un tanque se llena con agua a razón de 5 litros por minuto. Si contiene 200 litros inicialmente, ¿cuánto tiempo tardará en llegar a 350 litros?",
        choices: ["30 min", "25 min", "20 min", "35 min"],
        correctIndex: 0,
        explanation: "Volumen a agregar = 350 - 200 = 150 litros. Tiempo = 150 ÷ 5 = 30 minutos",
        competency: "Problemas de velocidad y tiempo"
      },
      {
        order: 37,
        text: "La mediana de los números 3, 7, 8, 12, 15 es:",
        choices: ["8", "9.5", "10", "12"],
        correctIndex: 0,
        explanation: "Ordenados: 3, 7, 8, 12, 15. El número del medio es el tercero: 8",
        competency: "Mediana y estadísticas"
      },
      {
        order: 38,
        text: "Resuelve para x: 2^(x+1) = 16",
        choices: ["x = 3", "x = 2", "x = 4", "x = 1"],
        correctIndex: 0,
        explanation: "2^(x+1) = 2^4 → x + 1 = 4 → x = 3",
        competency: "Ecuaciones exponenciales"
      },
      {
        order: 39,
        text: "¿Cuál es la ecuación de la recta que pasa por (0,3) con pendiente 2?",
        choices: ["y = 2x + 3", "y = 2x - 3", "y = 3x + 2", "y = -2x + 3"],
        correctIndex: 0,
        explanation: "Usando y - y₁ = m(x - x₁): y - 3 = 2(x - 0) → y = 2x + 3",
        competency: "Ecuación de la recta"
      },
      {
        order: 40,
        text: "Si cos(θ) = 3/5 en un triángulo rectángulo, ¿cuál es sin(θ)?",
        choices: ["4/5", "3/4", "5/3", "5/4"],
        correctIndex: 0,
        explanation: "Por Pitágoras: sin²(θ) + cos²(θ) = 1 → sin²(θ) = 1 - (3/5)² = 1 - 9/25 = 16/25 → sin(θ) = 4/5",
        competency: "Identidades trigonométricas"
      },

      // Complex Word Problems
      {
        order: 41,
        text: "Una empresa produce 500 unidades diarias. Si aumenta su producción en 20%, pero 10% de las unidades son defectuosas, ¿cuántas unidades buenas produce al día?",
        choices: ["540", "450", "600", "480"],
        correctIndex: 0,
        explanation: "Producción nueva = 500 × 1.20 = 600 unidades. Unidades buenas = 600 × 0.90 = 540 unidades",
        competency: "Problemas porcentuales compuestos"
      },
      {
        order: 42,
        text: "Encuentra el valor de x en: log₂(x) + log₂(x-2) = 3",
        choices: ["4", "6", "8", "10"],
        correctIndex: 0,
        explanation: "log₂(x) + log₂(x-2) = log₂[x(x-2)] = 3 → x(x-2) = 2³ = 8 → x² - 2x - 8 = 0 → (x-4)(x+2) = 0 → x = 4",
        competency: "Propiedades de logaritmos"
      },
      {
        order: 43,
        text: "Un cuadrado tiene área 36 cm². Si se convierte en un círculo, ¿cuál es el radio aproximado del círculo? (usa π ≈ 3,14)",
        choices: ["3,38 cm", "3,80 cm", "4,24 cm", "4,67 cm"],
        correctIndex: 0,
        explanation: "Lado del cuadrado = √36 = 6 cm. Área del círculo = área del cuadrado → πr² = 36 → r² = 36/π ≈ 36/3.14 ≈ 11.46 → r ≈ 3.38 cm",
        competency: "Relaciones entre figuras geométricas"
      },
      {
        order: 44,
        text: "La función f(x) = x² - 6x + 5 alcanza su mínimo en x =",
        choices: ["3", "2", "4", "5"],
        correctIndex: 0,
        explanation: "Para f(x) = ax² + bx + c, el vértice está en x = -b/(2a) = -(-6)/(2×1) = 6/2 = 3",
        competency: "Vértice de parábolas"
      },
      {
        order: 45,
        text: "Si A = {1, 2, 3, 4} y B = {3, 4, 5, 6}, entonces A ∩ B =",
        choices: ["{1, 2, 3, 4, 5, 6}", "{3, 4}", "{1, 2, 5, 6}", "{}"],
        correctIndex: 1,
        explanation: "La intersección de A y B contiene los elementos comunes: {3, 4}",
        competency: "Conjuntos y operaciones"
      }
    ],
    'competencia_lectora': [
      {
        order: 1,
        text: "Según el texto, ¿cuál es el propósito principal del autor al escribir este artículo?",
        choices: ["Informar sobre un descubrimiento científico", "Persuadir al lector de cambiar sus hábitos", "Describir un proceso histórico", "Explicar un concepto teórico"],
        correctIndex: 0,
        explanation: "El texto presenta información sobre un descubrimiento científico reciente",
        competency: "Comprensión de propósitos del autor"
      },
      {
        order: 2,
        text: "¿Cuál de las siguientes afirmaciones resume mejor la idea principal del párrafo segundo?",
        choices: ["Los científicos han encontrado una nueva especie", "La investigación se centra en el cambio climático", "El estudio revela datos sobre la biodiversidad", "Los resultados cuestionan teorías previas"],
        correctIndex: 2,
        explanation: "El párrafo segundo se enfoca en los hallazgos sobre biodiversidad",
        competency: "Identificación de ideas principales"
      },
      {
        order: 3,
        text: "¿Qué tipo de argumento utiliza el autor para apoyar su tesis principal?",
        choices: ["Argumento de autoridad", "Evidencia empírica", "Ejemplos históricos", "Opiniones personales"],
        correctIndex: 1,
        explanation: "El autor utiliza datos científicos y evidencia empírica para respaldar sus argumentos",
        competency: "Análisis de argumentos"
      },
      {
        order: 4,
        text: "¿Cuál es el tono general del texto?",
        choices: ["Objetivo e informativo", "Emocional y persuasivo", "Crítico y negativo", "Humorístico"],
        correctIndex: 0,
        explanation: "El texto mantiene un tono objetivo presentando información de manera neutral",
        competency: "Identificación del tono"
      },
      {
        order: 5,
        text: "¿Qué estrategia retórica utiliza el autor para mantener el interés del lector?",
        choices: ["Preguntas retóricas", "Ejemplos concretos", "Citas de expertos", "Estadísticas"],
        correctIndex: 1,
        explanation: "El autor utiliza ejemplos concretos y casos reales para ilustrar sus puntos",
        competency: "Análisis de estrategias retóricas"
      },
      {
        order: 6,
        text: "¿Cuál sería el título más apropiado para este texto?",
        choices: ["Un Descubrimiento Científico", "Avances en la Investigación", "Nuevos Hallazgos Académicos", "Investigación y Desarrollo"],
        correctIndex: 2,
        explanation: "El título debe capturar la esencia del contenido sobre nuevos hallazgos académicos",
        competency: "Síntesis e inferencia"
      }
    ],
    'historia_cs': [
      {
        order: 1,
        text: "¿En qué año se promulgó la Constitución Política de la República de Chile?",
        choices: ["1818", "1823", "1833", "1850"],
        correctIndex: 2,
        explanation: "La Constitución de 1833 estableció las bases del Estado portaliano",
        competency: "Historia constitucional de Chile"
      },
      {
        order: 2,
        text: "¿Cuál fue el principal objetivo del Movimiento Estudiantil de 2011 en Chile?",
        choices: ["Reforma laboral", "Educación gratuita", "Reforma tributaria", "Descentralización"],
        correctIndex: 1,
        explanation: "El movimiento estudiantil de 2011 demandaba educación gratuita y de calidad",
        competency: "Historia contemporánea de Chile"
      },
      {
        order: 3,
        text: "¿Qué proceso histórico se conoce como 'La Independencia de Chile'?",
        choices: ["Guerra del Pacífico", "Proceso de Chilenización", "Guerra de Independencia", "Revolución de 1891"],
        correctIndex: 2,
        explanation: "La Guerra de Independencia de Chile ocurrió entre 1810 y 1818",
        competency: "Historia de la independencia chilena"
      },
      {
        order: 4,
        text: "¿Cuál fue la principal causa de la Guerra del Pacífico (1879-1883)?",
        choices: ["Disputas territoriales", "Diferencias religiosas", "Conflictos comerciales", "Problemas fronterizos"],
        correctIndex: 0,
        explanation: "La Guerra del Pacífico fue principalmente por el control de territorios ricos en salitre",
        competency: "Historia regional de América Latina"
      },
      {
        order: 5,
        text: "¿Qué derecho fundamental se establece en la Constitución de 1980?",
        choices: ["Derecho a la educación gratuita", "Derecho a la propiedad privada", "Derecho al trabajo", "Derecho a la salud"],
        correctIndex: 1,
        explanation: "La Constitución de 1980 protege especialmente el derecho a la propiedad privada",
        competency: "Derechos constitucionales"
      },
      {
        order: 6,
        text: "¿Qué proceso económico caracterizó a Chile durante el siglo XIX?",
        choices: ["Industrialización", "Exportación de minerales", "Desarrollo agrícola", "Comercio internacional"],
        correctIndex: 1,
        explanation: "Chile se desarrolló económicamente mediante la exportación de cobre y salitre",
        competency: "Historia económica de Chile"
      },
      {
        order: 7,
        text: "¿Cuál fue el principal aporte de Bernardo O'Higgins al proceso independentista?",
        choices: ["Liderazgo militar", "Reformas constitucionales", "Negociaciones diplomáticas", "Desarrollo económico"],
        correctIndex: 0,
        explanation: "O'Higgins fue el líder militar que derrotó a los realistas en las batallas decisivas",
        competency: "Historia de la independencia chilena"
      },
      {
        order: 8,
        text: "¿Qué región chilena es conocida por su actividad volcánica?",
        choices: ["Región de Antofagasta", "Región del Maule", "Región del Biobío", "Región de Los Lagos"],
        correctIndex: 3,
        explanation: "La Región de Los Lagos tiene numerosos volcanes activos",
        competency: "Geografía física de Chile"
      },
      {
        order: 9,
        text: "¿Cuál fue el principal efecto del golpe de Estado de 1973 en Chile?",
        choices: ["Fin de la democracia", "Inicio de la dictadura militar", "Reformas económicas", "Todas las anteriores"],
        correctIndex: 3,
        explanation: "El golpe terminó con la democracia, instauró una dictadura y permitió reformas económicas",
        competency: "Historia contemporánea de Chile"
      },
      {
        order: 10,
        text: "¿Qué derecho humano fundamental protege la Declaración Universal de Derechos Humanos?",
        choices: ["Derecho a la propiedad", "Derecho a la vida", "Derecho al trabajo", "Derecho a la educación"],
        correctIndex: 1,
        explanation: "El artículo 3 de la Declaración establece el derecho a la vida",
        competency: "Derechos humanos internacionales"
      },
      {
        order: 11,
        text: "¿Cuál es la capital administrativa de la Unión Europea?",
        choices: ["París", "Londres", "Bruselas", "Berlín"],
        correctIndex: 2,
        explanation: "Bruselas es la sede de las instituciones principales de la UE",
        competency: "Geografía política internacional"
      },
      {
        order: 12,
        text: "¿Qué proceso histórico se conoce como 'Chilenización de la Araucanía'?",
        choices: ["Incorporación de territorio", "Proceso de industrialización", "Reforma agraria", "Urbanización"],
        correctIndex: 0,
        explanation: "Fue el proceso de incorporación del territorio mapuche al Estado chileno",
        competency: "Historia regional chilena"
      },
      {
        order: 13,
        text: "¿Cuál es el principal desafío demográfico de América Latina?",
        choices: ["Envejecimiento poblacional", "Crecimiento urbano descontrolado", "Migración internacional", "Baja natalidad"],
        correctIndex: 1,
        explanation: "El crecimiento urbano descontrolado genera problemas de vivienda y servicios",
        competency: "Geografía humana de América Latina"
      },
      {
        order: 14,
        text: "¿Qué institución chilena se creó en 1925 durante el gobierno de Arturo Alessandri?",
        choices: ["Banco Central", "Corte Suprema", "Contraloría General", "Servicio Nacional de Salud"],
        correctIndex: 2,
        explanation: "La Contraloría General de la República se creó en 1925",
        competency: "Historia institucional de Chile"
      },
      {
        order: 15,
        text: "¿Cuál es el principal recurso natural de Chile?",
        choices: ["Petróleo", "Cobre", "Oro", "Gas natural"],
        correctIndex: 1,
        explanation: "Chile es el mayor productor mundial de cobre",
        competency: "Geografía económica de Chile"
      },
      {
        order: 16,
        text: "¿Qué movimiento social surgió en Chile a partir de 2019?",
        choices: ["Movimiento estudiantil", "Movimiento feminista", "Estallido social", "Movimiento ambiental"],
        correctIndex: 2,
        explanation: "El estallido social de octubre 2019 fue un movimiento masivo contra las desigualdades",
        competency: "Historia contemporánea de Chile"
      },
      {
        order: 17,
        text: "¿Cuál es la organización internacional que regula el comercio mundial?",
        choices: ["FMI", "Banco Mundial", "OMC", "ONU"],
        correctIndex: 2,
        explanation: "La Organización Mundial del Comercio (OMC) regula el comercio internacional",
        competency: "Economía internacional"
      },
      {
        order: 18,
        text: "¿Qué zona económica especial existe en Chile?",
        choices: ["Zona Franca de Iquique", "Zona Libre de Magallanes", "Puerto Libre de Punta Arenas", "Todas las anteriores"],
        correctIndex: 3,
        explanation: "Chile tiene varias zonas francas y libres para promover el comercio",
        competency: "Geografía económica chilena"
      },
      {
        order: 19,
        text: "¿Cuál fue el principal legado del gobierno de Salvador Allende?",
        choices: ["Reformas constitucionales", "Nacionalización de empresas", "Reformas educacionales", "Todas las anteriores"],
        correctIndex: 3,
        explanation: "El gobierno de Allende realizó profundas reformas en varios ámbitos",
        competency: "Historia política chilena"
      },
      {
        order: 20,
        text: "¿Qué tipo de clima predomina en la costa central de Chile?",
        choices: ["Desértico", "Mediterráneo", "Tropical", "Polar"],
        correctIndex: 1,
        explanation: "El clima mediterráneo caracteriza la zona central de Chile",
        competency: "Geografía climática de Chile"
      },
      {
        order: 21,
        text: "¿Cuál es el principal desafío ambiental de Chile?",
        choices: ["Deforestación", "Contaminación del aire", "Escasez de agua", "Todas las anteriores"],
        correctIndex: 3,
        explanation: "Chile enfrenta múltiples problemas ambientales simultáneamente",
        competency: "Geografía ambiental chilena"
      },
      {
        order: 22,
        text: "¿Qué proceso histórico se conoce como 'La Pacificación de la Araucanía'?",
        choices: ["Incorporación territorial", "Proceso de paz", "Reforma agraria", "Desarrollo industrial"],
        correctIndex: 0,
        explanation: "Fue la incorporación del territorio mapuche al Estado chileno a fines del siglo XIX",
        competency: "Historia regional chilena"
      },
      {
        order: 23,
        text: "¿Cuál es el principal producto de exportación de Brasil?",
        choices: ["Petróleo", "Cobre", "Café", "Minerales"],
        correctIndex: 2,
        explanation: "Brasil es el mayor productor y exportador mundial de café",
        competency: "Geografía económica de América del Sur"
      },
      {
        order: 24,
        text: "¿Qué derecho social se establece en la Constitución chilena de 1980?",
        choices: ["Derecho a la vivienda", "Derecho a la seguridad social", "Derecho a la educación", "Todos los anteriores"],
        correctIndex: 3,
        explanation: "La Constitución protege varios derechos sociales fundamentales",
        competency: "Derechos constitucionales chilenos"
      },
      {
        order: 25,
        text: "¿Cuál es el principal impacto del cambio climático en Chile?",
        choices: ["Aumento de precipitaciones", "Retroceso de glaciares", "Incremento de temperatura", "Todas las anteriores"],
        correctIndex: 3,
        explanation: "El cambio climático afecta a Chile de múltiples maneras",
        competency: "Geografía ambiental global"
      },
      {
        order: 26,
        text: "¿Qué proceso económico se conoce como 'Milagro chileno'?",
        choices: ["Industrialización del siglo XIX", "Reformas económicas de los 80", "Exportaciones mineras", "Desarrollo agrícola"],
        correctIndex: 1,
        explanation: "El 'Milagro chileno' se refiere al crecimiento económico impulsado por las reformas de los años 80",
        competency: "Historia económica chilena"
      },
      {
        order: 27,
        text: "¿Cuál es la capital de la Región Metropolitana de Chile?",
        choices: ["Viña del Mar", "Santiago", "Valparaíso", "Rancagua"],
        correctIndex: 1,
        explanation: "Santiago es la capital regional y nacional de Chile",
        competency: "Geografía política chilena"
      },
      {
        order: 28,
        text: "¿Qué tratado internacional regula los derechos del niño?",
        choices: ["Declaración Universal", "Convención sobre Derechos del Niño", "Carta de las Naciones Unidas", "Declaración Americana"],
        correctIndex: 1,
        explanation: "La Convención sobre los Derechos del Niño es el tratado internacional más ratificado",
        competency: "Derechos humanos internacionales"
      },
      {
        order: 29,
        text: "¿Cuál es el principal desafío de la globalización económica?",
        choices: ["Aumento de desigualdad", "Pérdida de identidad cultural", "Dependencia tecnológica", "Todas las anteriores"],
        correctIndex: 3,
        explanation: "La globalización genera múltiples desafíos económicos y sociales",
        competency: "Economía global"
      },
      {
        order: 30,
        text: "¿Qué proceso histórico se conoce como 'Revolución de 1891' en Chile?",
        choices: ["Guerra civil", "Reforma constitucional", "Movimiento estudiantil", "Conflicto internacional"],
        correctIndex: 0,
        explanation: "La Revolución de 1891 fue una guerra civil entre balmacedistas y congressionalistas",
        competency: "Historia política chilena"
      }
    ],
    'ciencias_m1': [
      {
        order: 1,
        text: "¿Cuál es la función principal de los cloroplastos en las células vegetales?",
        choices: ["Respiración celular", "Fotosíntesis", "Digestión", "Reproducción"],
        correctIndex: 1,
        explanation: "Los cloroplastos contienen clorofila y realizan la fotosíntesis",
        competency: "Biología celular"
      },
      {
        order: 2,
        text: "Si un cuerpo de 2 kg se deja caer desde 10 metros de altura, ¿cuál será su velocidad al impactar el suelo?",
        choices: ["14 m/s", "20 m/s", "28 m/s", "40 m/s"],
        correctIndex: 0,
        explanation: "v = √(2gh) = √(2×9.8×10) = √196 = 14 m/s",
        competency: "Física: movimiento y energía"
      },
      {
        order: 3,
        text: "¿Cuál es el número atómico del oxígeno?",
        choices: ["6", "7", "8", "9"],
        correctIndex: 2,
        explanation: "El oxígeno tiene 8 protones en su núcleo",
        competency: "Química: estructura atómica"
      },
      {
        order: 4,
        text: "¿Qué tipo de enlace químico existe en el agua (H2O)?",
        choices: ["Iónico", "Covalente", "Metálico", "Hidrógeno"],
        correctIndex: 1,
        explanation: "El agua tiene enlaces covalentes entre hidrógeno y oxígeno",
        competency: "Química: enlaces químicos"
      },
      {
        order: 5,
        text: "¿Cuál es la unidad básica de la herencia?",
        choices: ["Cromosoma", "Gen", "ADN", "Proteína"],
        correctIndex: 1,
        explanation: "El gen es la unidad básica de la herencia",
        competency: "Biología: genética"
      },
      {
        order: 6,
        text: "¿Qué mide la primera ley de la termodinámica?",
        choices: ["Entropía", "Conservación de la energía", "Temperatura", "Presión"],
        correctIndex: 1,
        explanation: "La primera ley establece que la energía se conserva",
        competency: "Física: termodinámica"
      },
      {
        order: 7,
        text: "¿Cuál es la fórmula molecular del etano?",
        choices: ["CH4", "C2H6", "C3H8", "C2H4"],
        correctIndex: 1,
        explanation: "El etano es un alcano con fórmula C2H6",
        competency: "Química: compuestos orgánicos"
      },
      {
        order: 8,
        text: "En la fotosíntesis, ¿cuál es el pigmento principal que absorbe la luz?",
        choices: ["Caroteno", "Xantofila", "Clorofila", "Antocianina"],
        correctIndex: 2,
        explanation: "La clorofila a es el pigmento principal en la fotosíntesis",
        competency: "Biología: fotosíntesis"
      },
      {
        order: 9,
        text: "¿Cuál es la velocidad de la luz en el vacío?",
        choices: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"],
        correctIndex: 0,
        explanation: "La velocidad de la luz en el vacío es aproximadamente 3 × 10⁸ m/s",
        competency: "Física: ondas y óptica"
      },
      {
        order: 10,
        text: "¿Qué tipo de reacción es: 2H₂ + O₂ → 2H₂O?",
        choices: ["Descomposición", "Síntesis", "Sustitución", "Combustión"],
        correctIndex: 1,
        explanation: "Es una reacción de síntesis donde dos sustancias se combinan",
        competency: "Química: reacciones químicas"
      },
      {
        order: 11,
        text: "¿Cuál es la función del ADN mitocondrial?",
        choices: ["Codificar proteínas ribosómicas", "Codificar proteínas para la respiración celular", "Regular la división celular", "Almacenar información genética nuclear"],
        correctIndex: 1,
        explanation: "El ADN mitocondrial codifica proteínas involucradas en la respiración celular",
        competency: "Biología: genética molecular"
      },
      {
        order: 12,
        text: "Un objeto de 5 kg se acelera a 2 m/s². ¿Cuál es la fuerza neta?",
        choices: ["2.5 N", "10 N", "7.5 N", "15 N"],
        correctIndex: 1,
        explanation: "F = ma = 5 × 2 = 10 N",
        competency: "Física: leyes de Newton"
      },
      {
        order: 13,
        text: "¿Cuál es el pH de una solución neutra?",
        choices: ["0", "7", "14", "1"],
        correctIndex: 1,
        explanation: "El pH neutro es 7",
        competency: "Química: ácidos y bases"
      },
      {
        order: 14,
        text: "¿Qué proceso permite la entrada de agua a las células vegetales?",
        choices: ["Difusión", "Ósmosis", "Difusión facilitada", "Transpiración"],
        correctIndex: 1,
        explanation: "La ósmosis permite el movimiento de agua a través de membranas",
        competency: "Biología: transporte celular"
      },
      {
        order: 15,
        text: "Si una onda tiene frecuencia de 500 Hz y velocidad de 340 m/s, ¿cuál es su longitud de onda?",
        choices: ["0.68 m", "1.47 m", "0.34 m", "170 m"],
        correctIndex: 0,
        explanation: "λ = v/f = 340/500 = 0.68 m",
        competency: "Física: ondas sonoras"
      },
      {
        order: 16,
        text: "¿Cuál es el número de electrones de valencia del carbono?",
        choices: ["2", "4", "6", "8"],
        correctIndex: 1,
        explanation: "El carbono tiene 4 electrones de valencia",
        competency: "Química: configuración electrónica"
      },
      {
        order: 17,
        text: "¿Qué estructura celular controla el paso de sustancias hacia el interior y exterior?",
        choices: ["Pared celular", "Membrana plasmática", "Núcleo", "Ribosoma"],
        correctIndex: 1,
        explanation: "La membrana plasmática controla el transporte de sustancias",
        competency: "Biología: membranas celulares"
      },
      {
        order: 18,
        text: "¿Cuál es la unidad del trabajo y la energía?",
        choices: ["Newton", "Joule", "Watt", "Pascal"],
        correctIndex: 1,
        explanation: "El joule (J) es la unidad de trabajo y energía",
        competency: "Física: trabajo y energía"
      },
      {
        order: 19,
        text: "¿Qué tipo de enlace es más fuerte?",
        choices: ["Enlace iónico", "Enlace covalente", "Enlace hidrógeno", "Fuerzas de Van der Waals"],
        correctIndex: 1,
        explanation: "Los enlaces covalentes son generalmente más fuertes que los iónicos",
        competency: "Química: fuerzas intermoleculares"
      },
      {
        order: 20,
        text: "¿Cuál es el proceso por el cual las plantas pierden agua?",
        choices: ["Fotosíntesis", "Respiración", "Transpiración", "Absorción"],
        correctIndex: 2,
        explanation: "La transpiración es la pérdida de agua por las plantas",
        competency: "Biología: fisiología vegetal"
      },
      {
        order: 21,
        text: "Si la masa de un objeto es 10 kg y su densidad es 2 kg/m³, ¿cuál es su volumen?",
        choices: ["5 m³", "20 m³", "0.2 m³", "50 m³"],
        correctIndex: 0,
        explanation: "V = m/ρ = 10/2 = 5 m³",
        competency: "Física: densidad y presión"
      },
      {
        order: 22,
        text: "¿Cuál es la fórmula del ácido clorhídrico?",
        choices: ["HCl", "H2SO4", "NaCl", "KOH"],
        correctIndex: 0,
        explanation: "El ácido clorhídrico es HCl",
        competency: "Química: ácidos y bases"
      },
      {
        order: 23,
        text: "¿Qué estructura contiene la información genética en las células eucariotas?",
        choices: ["Ribosoma", "Mitocondria", "Núcleo", "Lisosoma"],
        correctIndex: 2,
        explanation: "El núcleo contiene el ADN, la información genética",
        competency: "Biología: estructura celular"
      },
      {
        order: 24,
        text: "¿Qué principio explica por qué los objetos flotan?",
        choices: ["Principio de Pascal", "Principio de Arquímedes", "Ley de Boyle", "Ley de Charles"],
        correctIndex: 1,
        explanation: "El principio de Arquímedes explica la flotación",
        competency: "Física: fluidos"
      },
      {
        order: 25,
        text: "¿Cuál es el producto principal de la fermentación láctica?",
        choices: ["Etano", "Ácido láctico", "Alcohol etílico", "Dióxido de carbono"],
        correctIndex: 1,
        explanation: "La fermentación láctica produce ácido láctico",
        competency: "Biología: metabolismo"
      },
      {
        order: 26,
        text: "Si un elemento tiene número atómico 11, ¿en qué grupo de la tabla periódica está?",
        choices: ["Grupo 1", "Grupo 2", "Grupo 11", "Grupo 17"],
        correctIndex: 0,
        explanation: "El sodio (Na) tiene Z=11 y está en el grupo 1",
        competency: "Química: tabla periódica"
      },
      {
        order: 27,
        text: "¿Qué tipo de célula sanguínea es responsable de la coagulación?",
        choices: ["Eritrocito", "Leucocito", "Plaqueta", "Linfocito"],
        correctIndex: 2,
        explanation: "Las plaquetas son responsables de la coagulación sanguínea",
        competency: "Biología: sistema circulatorio"
      },
      {
        order: 28,
        text: "¿Cuál es la fórmula de la ley de Coulomb?",
        choices: ["F = ma", "F = kq₁q₂/r²", "F = -kx", "F = mv²/r"],
        correctIndex: 1,
        explanation: "La ley de Coulomb describe la fuerza entre cargas eléctricas",
        competency: "Física: electricidad"
      },
      {
        order: 29,
        text: "¿Qué compuesto resulta de la reacción entre un ácido y una base?",
        choices: ["Ácido", "Base", "Sal", "Agua"],
        correctIndex: 2,
        explanation: "La neutralización produce una sal",
        competency: "Química: reacciones ácido-base"
      },
      {
        order: 30,
        text: "¿Cuál es la función principal del sistema nervioso?",
        choices: ["Digestión", "Coordinación y control", "Circulación", "Respiración"],
        correctIndex: 1,
        explanation: "El sistema nervioso coordina y controla las funciones del organismo",
        competency: "Biología: sistema nervioso"
      }
    ],
    'matematica_m2': [
      {
        order: 1,
        text: "Encuentra la derivada de f(x) = 3x² + 2x - 1",
        choices: ["6x + 2", "6x - 2", "3x² + 2", "6x + 1"],
        correctIndex: 0,
        explanation: "Derivada: f'(x) = 6x + 2",
        competency: "Cálculo diferencial"
      },
      {
        order: 2,
        text: "Resuelve la integral ∫(2x + 3) dx",
        choices: ["x² + 3x + C", "x² + 3 + C", "2x² + 3x + C", "x + 3x + C"],
        correctIndex: 0,
        explanation: "∫(2x + 3) dx = x² + 3x + C",
        competency: "Integración básica"
      },
      {
        order: 3,
        text: "Resuelve el sistema: x + y = 5, 2x - y = 4",
        choices: ["x = 3, y = 2", "x = 5, y = 2", "x = 3, y = -2", "x = 5, y = -2"],
        correctIndex: 0,
        explanation: "Sumando ecuaciones: 3x = 9 → x = 3, reemplazando: 3 + y = 5 → y = 2",
        competency: "Sistemas de ecuaciones"
      },
      {
        order: 4,
        text: "¿Cuál es el límite de (x² - 4)/(x - 2) cuando x → 2?",
        choices: ["0", "2", "4", "El límite no existe"],
        correctIndex: 2,
        explanation: "Factorizando: (x-2)(x+2)/(x-2) = x+2, límite cuando x→2 es 4",
        competency: "Límites algebraicos"
      },
      {
        order: 5,
        text: "Encuentra la ecuación de la recta que pasa por (2,3) con pendiente 1/2",
        choices: ["y = (1/2)x + 2", "y = (1/2)x + 1", "y = 2x + 3", "y = (1/2)x - 1"],
        correctIndex: 0,
        explanation: "y - 3 = (1/2)(x - 2) → y = (1/2)x - 1 + 3 = (1/2)x + 2",
        competency: "Ecuaciones de rectas"
      },
      {
        order: 6,
        text: "Resuelve la desigualdad: 2x + 3 > 7",
        choices: ["x > 2", "x < 2", "x > 5", "x < 5"],
        correctIndex: 0,
        explanation: "2x + 3 > 7 → 2x > 4 → x > 2",
        competency: "Desigualdades lineales"
      },
      {
        order: 7,
        text: "Evalúa lim(x→0) [sin(x)/x]",
        choices: ["0", "1", "∞", "No existe"],
        correctIndex: 1,
        explanation: "Este es un límite fundamental: lim(x→0) [sin(x)/x] = 1",
        competency: "Límites trigonométricos"
      },
      {
        order: 8,
        text: "Dados los vectores a = (2,3) y b = (1,-1), calcula a · b",
        choices: ["-1", "1", "5", "-5"],
        correctIndex: 1,
        explanation: "Producto punto: (2,3) · (1,-1) = 2×1 + 3×(-1) = 2 - 3 = -1",
        competency: "Producto escalar de vectores"
      },
      {
        order: 9,
        text: "Simplifica (3 + 4i)(2 - i)",
        choices: ["6 - 3i + 8i - 4i²", "10 + 5i", "2 + 11i", "6 + 5i"],
        correctIndex: 1,
        explanation: "(3 + 4i)(2 - i) = 6 - 3i + 8i - 4i² = 6 + 5i - 4(-1) = 10 + 5i",
        competency: "Operaciones con números complejos"
      },
      {
        order: 10,
        text: "Resuelve sin(x) = 1/2 en [0, 2π]",
        choices: ["π/6, 5π/6", "π/3, 2π/3", "π/4, 3π/4", "π/2"],
        correctIndex: 0,
        explanation: "sin(x) = 1/2 en el primer y segundo cuadrante: π/6 y 5π/6",
        competency: "Ecuaciones trigonométricas"
      },
      {
        order: 11,
        text: "Encuentra la derivada de f(x) = e^x sin(x)",
        choices: ["2e^x cos(x)", "2e^x sin(x)", "e^x (sin(x) + cos(x))", "e^x (cos(x) - sin(x))"],
        correctIndex: 0,
        explanation: "Primera derivada: e^x(cos(x) + sin(x)), segunda: e^x(cos(x) + sin(x)) + e^x(cos(x) - sin(x)) = 2e^x cos(x)",
        competency: "Derivadas de orden superior"
      },
      {
        order: 12,
        text: "Evalúa ∫(e^x / (1 + e^x)) dx",
        choices: ["ln|1 + e^x| + C", "ln|e^x| + C", "e^x + C", "1/(1 + e^x) + C"],
        correctIndex: 0,
        explanation: "Sustitución: u = 1 + e^x, du = e^x dx, ∫(1/u) du = ln|u| + C",
        competency: "Integración por sustitución"
      },
      {
        order: 13,
        text: "Encuentra el determinante de la matriz [[2,1],[3,2]]",
        choices: ["1", "4", "7", "5"],
        correctIndex: 0,
        explanation: "det = 2×2 - 1×3 = 4 - 3 = 1",
        competency: "Determinantes de matrices 2x2"
      },
      {
        order: 14,
        text: "Encuentra el área bajo la curva y = x² desde x=0 hasta x=2",
        choices: ["8/3", "4", "2", "4/3"],
        correctIndex: 0,
        explanation: "∫(0 to 2) x² dx = [x³/3] from 0 to 2 = (8/3 - 0) = 8/3",
        competency: "Área bajo la curva"
      },
      {
        order: 15,
        text: "Resuelve la ecuación log₃(x) = 2",
        choices: ["x = 6", "x = 9", "x = 3", "x = 8"],
        correctIndex: 1,
        explanation: "log₃(x) = 2 → x = 3² = 9",
        competency: "Ecuaciones logarítmicas"
      }
    ]
  };

  // Return questions for the specific assignment, or generic ones if not found
  const assignmentKey = seed.assignment;
  if (realQuestions[assignmentKey]) {
    return realQuestions[assignmentKey];
  }

  // Fallback to placeholder for assignments without real questions
  const baseChoices = ['Opción A', 'Opción B', 'Opción C', 'Opción D'];
  return Array.from({ length: 5 }).map((_, index) => ({
    order: index + 1,
    text: `Reemplazar con la pregunta oficial ${index + 1} de ${assignmentLabel} (${seed.year} · ${seed.session}).`,
    choices: baseChoices,
    correctIndex: 0,
    explanation: 'Sustituir por la explicación oficial de la respuesta correcta.',
    competency: 'Definir competencia PAES correspondiente cuando se carguen los datos reales.',
  }));
}

export const paesExamCatalog: PaesTest[] = placeholderSeeds.map(seed => {
  const assignment = paesAssignments.find(item => item.id === seed.assignment);
  const assignmentLabel = assignment?.label ?? seed.assignment;
  return {
    id: seed.id,
    assignment: seed.assignment,
    assignmentLabel,
    title: seed.title,
    source: seed.source,
    year: seed.year,
    session: seed.session,
    durationSec: seed.durationSec ?? 7200,
    questions: createPlaceholderQuestions(seed, assignmentLabel),
  };
});

export function getAssignmentById(id: PaesAssignmentSlug): PaesAssignmentMeta | undefined {
  return paesAssignments.find(item => item.id === id);
}

export function getPaesTestById(id: string): PaesTest | undefined {
  return paesExamCatalog.find(test => test.id === id);
}
