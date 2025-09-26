'use client';

import { useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useErrorHandler } from '@/lib/core/error-system';
// Demo data imports removed - using real data only
import type { LessonQuiz, QuizAttempt } from '@/lib/types';
import { getDemoLessonQuiz } from '@/lib/demo-data';

type QuizResult = {
  correctCount: number;
  totalCount: number;
  score: number;
  review: {
    correct: boolean;
    correctIndex: number;
    explanation?: string;
  }[];
};

type LessonQuizResult = QuizAttempt;

export default function InlineQuiz({ lessonId }: { lessonId: string }) {
  const { handleError, wrapAsync } = useErrorHandler();

  const convexLessonId = lessonId as Id<'lessons'>;
  const convexQuiz = useQuery(
    api.quizzes.getLessonQuiz,
    lessonId ? { lessonId: convexLessonId } : 'skip'
  );
  const submit = useMutation(api.quizzes.submitLessonQuizAttempt);

  // Use Convex data if available, otherwise use demo data
  const quiz = convexQuiz || getDemoLessonQuiz(lessonId);

  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [startedAt, setStartedAt] = useState<number>(Math.floor(Date.now() / 1000));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStartedAt(Math.floor(Date.now() / 1000));
  }, [lessonId]);

  useEffect(() => {
    if (quiz?.questions) setAnswers(Array(quiz.questions.length).fill(-1));
  }, [quiz]);

  // Handle loading state
  if (convexQuiz === undefined) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Cargando quiz...</div>
      </Card>
    );
  }

  // Handle error state
  if (convexQuiz === null) {
    handleError(new Error('Error al cargar el quiz de la lección'), 'InlineQuiz.useQuery');
    return (
      <Card className="p-4 text-center text-destructive">
        Error al cargar el quiz. Por favor, intenta recargar la página.
      </Card>
    );
  }

  if (!quiz) {
    handleError(new Error('No se encontró quiz para esta lección'), 'InlineQuiz.noQuiz');
    return null;
  }

  const onsubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await wrapAsync(
        () => submit({ lessonId: convexLessonId, answers, startedAt }),
        'InlineQuiz.submit'
      );
      if (res) setResult(res);
    } catch (error) {
      handleError(error as Error, 'InlineQuiz.onSubmit');
    }

 finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="text-base font-semibold">Quiz</div>
      {quiz.questions.map((q: any, idx: number) => (
        <div key={q._id} className="space-y-2">
          <div className="font-medium">
            {idx + 1}. {q.text}
          </div>
          <RadioGroup
            value={String(answers[idx])}
            onValueChange={v => setAnswers(prev => prev.map((x, i) => (i === idx ? Number(v) : x)))}
          >
            {q.choices.map((c: string, i: number) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem id={`q${idx}-${i}`} value={String(i)} />
                <Label htmlFor={`q${idx}-${i}`}>{c}</Label>
              </div>
            ))}
          </RadioGroup>
          {result && (
            <div className="text-sm">
              {result.review[idx].correct ? (
                <span className="text-green-600">Correcto</span>
              ) : (
                <span className="text-red-600">
                  Incorrecto. Respuesta correcta: {result.review[idx].correctIndex + 1}
                  {result.review[idx].explanation ? ` — ${result.review[idx].explanation}` : ''}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center gap-3">
        {!result && (
          <Button onClick={onsubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        )}
        {result && (
          <div className="text-sm">
            Puntaje: {result.correctCount}/{result.totalCount} ({Math.round(result.score * 100)}%)
          </div>
        )}
      </div>
    </Card>
  );
}
