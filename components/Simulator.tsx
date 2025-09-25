'use client';

import { useMutation, useQuery } from 'convex/react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Trophy, Clock, Target, Zap } from 'lucide-react';
import {
  getDemoPaesAssignments,
  getDemoPaesCatalog,
  getDemoPaesQuiz,
  getPaesAssignmentMeta,
  type DemoPaesQuizPayload,
} from '@/lib/demo-data';
import type { PaesAssignmentMeta, PaesQuiz, PaesCatalogItem, QuizAttempt } from '@/lib/types';

type PaesCatalog = PaesCatalogItem[];
type PaesQuizResult = QuizAttempt;

type LocalPaesResult = {
  correctCount: number;
  totalCount: number;
  score: number;
  review: { correct: boolean; correctIndex: number; explanation?: string }[];
};

type CatalogTestBase = {
  id: string;
  title: string;
  assignment: string;
  assignmentLabel: string;
  questionCount: number;
  durationSec?: number;
  source?: string;
  year?: number;
  session?: string;
};

type ConvexCatalogTest = CatalogTestBase & {
  sourceType: 'convex';
  quizId: Id<'quizzes'>;
};

type DemoCatalogTest = CatalogTestBase & {
  sourceType: 'demo';
  quizId: string;
};

type CatalogTest = ConvexCatalogTest | DemoCatalogTest;

type CatalogAssignment = PaesAssignmentMeta & {
  tests: CatalogTest[];
};

function resolveAssignmentMeta(id?: string): PaesAssignmentMeta {
  if (id) {
    const known = getPaesAssignmentMeta(id as any);
    if (known) return known;
    return {
      id,
      label: id,
      description: 'Asignatura sin categoría definida. Actualiza el campo "assignment" en Convex.',
    };
  }
  return {
    id: 'general',
    label: 'Sin asignatura',
    description: 'Clasifica este ensayo PAES asignando un módulo (M1, M2, etc.).',
  };
}

function buildAssignments(
  convexCatalog: PaesCatalog | undefined,
  demoAssignments: PaesAssignmentMeta[],
  demoCatalog: ReturnType<typeof getDemoPaesCatalog>
): CatalogAssignment[] {
  const assignments = new Map<string, CatalogAssignment>();

  const ensureAssignment = (meta: PaesAssignmentMeta) => {
    const existing = assignments.get(meta.id);
    if (existing) return existing;
    const next: CatalogAssignment = { ...meta, tests: [] };
    assignments.set(meta.id, next);
    return next;
  };

  demoAssignments.forEach(meta => ensureAssignment(meta));

  if (convexCatalog && convexCatalog.length > 0) {
    convexCatalog.forEach(entry => {
      const meta = ensureAssignment(resolveAssignmentMeta((entry as any).assignment ?? entry.subject));
      meta.tests.push({
        id: entry._id as unknown as string,
        quizId: entry._id as Id<'quizzes'>,
        sourceType: 'convex',
        title: entry.title,
        assignment: meta.id,
        assignmentLabel: meta.label,
        questionCount: entry.questionCount,
        durationSec: entry.durationSec ?? undefined,
        source: entry.source,
        year: undefined,
        session: undefined,
      });
    });
  }

  demoCatalog.forEach(test => {
    const meta = ensureAssignment(resolveAssignmentMeta(test.assignment));
    const alreadyIncluded = meta.tests.some(current => current.id === test.id);
    if (!alreadyIncluded) {
      meta.tests.push({
        id: test.id,
        quizId: test.id,
        sourceType: 'demo',
        title: test.title,
        assignment: meta.id,
        assignmentLabel: meta.label,
        questionCount: test.questionCount,
        durationSec: test.durationSec,
        source: test.source,
        year: test.year,
        session: test.session,
      });
    }
  });

  return Array.from(assignments.values())
    .map(assignment => ({
      ...assignment,
      tests: assignment.tests.sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default function Simulator() {
  const convexCatalog = useQuery(api.quizzes.getPaesCatalog, {});
  const mockExamCatalog = useQuery(api.mockExams.getMockExamCatalog, {});
  const recommendations = useQuery(api.userStats.getRecommendations);

  const demoAssignments = useMemo(() => getDemoPaesAssignments(), []);
  const demoCatalog = useMemo(() => getDemoPaesCatalog(), []);

  const assignments = useMemo(
    () => buildAssignments(convexCatalog, demoAssignments, demoCatalog),
    [convexCatalog, demoAssignments, demoCatalog]
  );

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | undefined>();
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAssignmentId && assignments.length > 0) {
      setSelectedAssignmentId(assignments[0].id);
    }
  }, [assignments, selectedAssignmentId]);

  const selectedAssignment = useMemo(
    () => assignments.find(item => item.id === selectedAssignmentId),
    [assignments, selectedAssignmentId]
  );

  useEffect(() => {
    if (!selectedAssignment) {
      setSelectedTestId(null);
      return;
    }
    if (selectedAssignment.tests.length === 0) {
      setSelectedTestId(null);
      return;
    }
    const exists = selectedAssignment.tests.some(test => test.id === selectedTestId);
    if (!exists) {
      setSelectedTestId(selectedAssignment.tests[0].id);
    }
  }, [selectedAssignment, selectedTestId]);

  const selectedTest: CatalogTest | null = useMemo(() => {
    if (!selectedAssignment) return null;
    return selectedAssignment.tests.find(test => test.id === selectedTestId) ?? null;
  }, [selectedAssignment, selectedTestId]);

  const convexQuiz = useQuery(
    api.quizzes.getPaesQuiz,
    selectedTest && selectedTest.sourceType === 'convex'
      ? { quizId: selectedTest.quizId }
      : 'skip'
  );

  const demoQuizPayload: DemoPaesQuizPayload | null = useMemo(() => {
    if (!selectedTest || selectedTest.sourceType !== 'demo') return null;
    return getDemoPaesQuiz(selectedTest.quizId);
  }, [selectedTest]);

  const quiz =
    selectedTest?.sourceType === 'convex'
      ? convexQuiz
      : selectedTest?.sourceType === 'demo'
        ? demoQuizPayload?.quiz
        : null;

  const answerKey = selectedTest?.sourceType === 'demo' ? demoQuizPayload?.answerKey ?? [] : [];

  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<(PaesQuizResult | LocalPaesResult) | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number>(Math.floor(Date.now() / 1000));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!quiz || !quiz.questions) return;
    setAnswers(Array(quiz.questions.length).fill(-1));
    setResult(null);
    const duration = quiz.durationSec ?? selectedTest?.durationSec ?? 0;
    setSecondsLeft(duration);
    setStartedAt(Math.floor(Date.now() / 1000));
  }, [quiz, selectedTest]);

  useEffect(() => {
    if (secondsLeft <= 0 || result) return;
    const timer = setInterval(() => setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, result]);

  useEffect(() => {
    if (secondsLeft === 0 && quiz && !result && (selectedTest?.sourceType === 'convex' || answerKey.length > 0)) {
      void onSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const submit = useMutation(api.quizzes.submitPaesAttempt);

  const onSubmit = async () => {
    if (!quiz || quiz.questions.length === 0 || isSubmitting) return;

    if (selectedTest?.sourceType === 'convex') {
      setIsSubmitting(true);
      try {
        const res = await submit({ quizId: selectedTest.quizId, answers, startedAt });
        setResult(res);
      } catch (error) {
        console.error('Error al enviar el simulacro PAES', error);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (selectedTest?.sourceType === 'demo' && answerKey.length > 0) {
      const review = answerKey.map((item, index) => {
        const userAnswer = answers[index];
        const correct = userAnswer === item.correctIndex;
        return {
          correct,
          correctIndex: item.correctIndex,
          explanation: item.explanation,
        };
      });
      const correctCount = review.filter(entry => entry.correct).length;
      const totalCount = answerKey.length;
      const score = totalCount > 0 ? correctCount / totalCount : 0;
      setResult({ correctCount, totalCount, score, review });
    }
  };

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  if (assignments.length === 0) {
    return <Card className="p-4">Aún no hay simulacros PAES configurados.</Card>;
  }

  const isLoadingQuiz = selectedTest?.sourceType === 'convex' && quiz === undefined;
  const hasQuestions = quiz?.questions && quiz.questions.length > 0;

  return (
    <div className="space-y-6">
      {recommendations && recommendations.quizId && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-900">✨ Recomendación personalizada</div>
          <div className="text-sm text-blue-800 mt-1">{recommendations.nextAction}</div>
          <div className="text-xs text-blue-600 mt-1">{recommendations.reason}</div>
          <Button 
            size="sm" 
            className="mt-2" 
            onClick={() => {
              // Auto-select the recommended quiz
              const recommendedQuiz = convexCatalog?.find(q => q._id === recommendations.quizId);
              if (recommendedQuiz) {
                const assignment = assignments.find(a => 
                  a.tests.some(t => t.sourceType === 'convex' && t.quizId === recommendedQuiz._id)
                );
                if (assignment) {
                  setSelectedAssignmentId(assignment.id);
                  const test = assignment.tests.find(t => t.sourceType === 'convex' && t.quizId === recommendedQuiz._id);
                  if (test) {
                    setSelectedTestId(test.id);
                  }
                }
              }
            }}
          >
            Empezar recomendado
          </Button>
        </div>
      )}

      <Tabs defaultValue="practice" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="practice">Práctica por Materia</TabsTrigger>
          <TabsTrigger value="mock">Exámenes Simulacro</TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="space-y-6">
          <Card className="p-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3">
          <div className="text-sm font-medium">Asignatura</div>
          <Select
            value={selectedAssignment?.id ?? ''}
            onValueChange={value => setSelectedAssignmentId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona asignatura" />
            </SelectTrigger>
            <SelectContent>
              {assignments.map(assignment => (
                <SelectItem key={assignment.id} value={assignment.id}>
                  {assignment.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground">{selectedAssignment?.description}</div>
        </div>
        <div className="space-y-3 md:col-span-2">
          <div className="text-sm font-medium">Ensayo</div>
          <Select
            disabled={!selectedAssignment || selectedAssignment.tests.length === 0}
            value={selectedTest?.id ?? ''}
            onValueChange={value => setSelectedTestId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona ensayo" />
            </SelectTrigger>
            <SelectContent>
              {(selectedAssignment?.tests ?? []).map(test => (
                <SelectItem key={test.id} value={test.id}>
                  {test.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTest && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                {selectedTest.questionCount} preguntas · Tiempo sugerido:{' '}
                {Math.round((selectedTest.durationSec ?? 0) / 60)} min
              </div>
              {selectedTest.source && <div>Fuente: {selectedTest.source}</div>}
            </div>
          )}
        </div>
      </div>

      {!selectedTest ? (
        <Card className="p-4 text-sm text-muted-foreground">
          No hay ensayos configurados para esta asignatura todavía.
        </Card>
      ) : isLoadingQuiz ? (
        <Card className="p-4 text-sm text-muted-foreground">Cargando ensayo...</Card>
      ) : !hasQuestions ? (
        <Card className="p-4 text-sm text-muted-foreground">
          Este ensayo aún no tiene preguntas cargadas. Agrega los ítems oficiales para habilitarlo.
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold">{quiz?.title}</div>
            {!result && secondsLeft > 0 && (
              <div className="text-sm text-muted-foreground">
                Tiempo restante: {mm}:{String(ss).padStart(2, '0')}
              </div>
            )}
          </div>
          {quiz?.questions.map((question, index) => (
            <div key={question._id} className="space-y-2">
              <div className="font-medium">
                {index + 1}. {question.text}
              </div>
              <RadioGroup
                value={answers[index] >= 0 ? String(answers[index]) : ''}
                onValueChange={value =>
                  setAnswers(prev =>
                    prev.map((current, i) => (i === index ? Number.parseInt(value, 10) : current))
                  )
                }
              >
                {question.choices.map((choice: string, choiceIndex: number) => (
                  <div key={choiceIndex} className="flex items-center space-x-2">
                    <RadioGroupItem id={`paes-${index}-${choiceIndex}`} value={String(choiceIndex)} />
                    <Label htmlFor={`paes-${index}-${choiceIndex}`}>{choice}</Label>
                  </div>
                ))}
              </RadioGroup>
              {result && (
                <div className="text-sm">
                  {result.review[index].correct ? (
                    <span className="text-green-600">Correcto</span>
                  ) : (
                    <span className="text-red-600">
                      Incorrecto. Respuesta correcta: {result.review[index].correctIndex + 1}
                      {result.review[index].explanation ? ` — ${result.review[index].explanation}` : ''}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-3">
            {!result && (
              <Button onClick={onSubmit} disabled={isSubmitting || (selectedTest.sourceType === 'demo' && answerKey.length === 0)}>
                {isSubmitting ? 'Enviando…' : 'Terminar'}
              </Button>
            )}
            {result && (
              <div className="text-sm">
                Puntaje: {result.correctCount}/{result.totalCount} ({Math.round(result.score * 100)}%)
              </div>
            )}
          </div>
            </div>
          )}
          </Card>
        </TabsContent>

        <TabsContent value="mock" className="space-y-6">
          {mockExamCatalog && mockExamCatalog.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockExamCatalog.map((exam) => (
                <Card key={exam._id} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">{exam.title}</h3>
                    {exam.isRanked && (
                      <Badge variant="outline" className="text-xs">
                        📊 Ranked
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{exam.totalDurationMin} minutos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>{exam.totalQuestions} preguntas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Dificultad: {exam.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {exam.subjects.slice(0, 3).map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {exam.subjects.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{exam.subjects.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                    <div>
                      <span className="font-medium">{exam.totalAttempts}</span>
                      <div>Intentos</div>
                    </div>
                    <div>
                      <span className="font-medium">{exam.averageScore}%</span>
                      <div>Promedio</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={exam.isRanked ? "default" : "outline"}
                  >
                    {exam.scheduledStart ? 'Programado' : 'Comenzar Simulacro'}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay simulacros disponibles</h3>
              <p className="text-sm text-muted-foreground">
                Los exámenes simulacro estarán disponibles próximamente
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
