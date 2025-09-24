'use client';

import { useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { api as generatedApi } from '@/convex/_generated/api';
import { getDemoLessonQuiz } from '@/lib/demo-data';

export default function InlineQuiz({ lessonId }: { lessonId: string }) {
  const api: any = generatedApi as any;
  const convexQuiz = useQuery(
    api.quizzes.getLessonQuiz,
    lessonId ? { lessonId: lessonId as any } : 'skip'
  ) as any;
  const submit = useMutation(api.quizzes.submitLessonQuizAttempt);

  // Use Convex data if available, otherwise use demo data
  const quiz = convexQuiz || getDemoLessonQuiz(lessonId);

  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [startedAt, setStartedAt] = useState<number>(Math.floor(Date.now() / 1000));
  useEffect(() => {
    setStartedAt(Math.floor(Date.now() / 1000));
  }, [lessonId]);

  useEffect(() => {
    if (quiz?.questions) setAnswers(Array(quiz.questions.length).fill(-1));
  }, [quiz]);

  if (!quiz) return null;

  const onSubmit = async () => {
    const res = await submit({ lessonId: lessonId as any, answers, startedAt });
    setResult(res);
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
        {!result && <Button onClick={onSubmit}>Enviar</Button>}
        {result && (
          <div className="text-sm">
            Puntaje: {result.correctCount}/{result.totalCount} ({Math.round(result.score * 100)}%)
          </div>
        )}
      </div>
    </Card>
  );
}
