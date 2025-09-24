'use client';

import { useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { api as generatedApi } from '@/convex/_generated/api';
import { getDemoPaesQuiz } from '@/lib/demo-data';

export default function Simulator() {
  const api: any = generatedApi as any;
  const convexQuiz = useQuery(api.quizzes.getPaesQuiz, {}) as any;
  const submit = useMutation(api.quizzes.submitPaesAttempt);

  // Use Convex data if available, otherwise use demo data
  const quiz = convexQuiz || getDemoPaesQuiz();
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number>(Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (quiz?.questions) setAnswers(Array(quiz.questions.length).fill(-1));
    if (quiz?.durationSec) {
      setSecondsLeft(quiz.durationSec);
      setStartedAt(Math.floor(Date.now() / 1000));
    }
  }, [quiz]);

  useEffect(() => {
    if (!secondsLeft || result) return;
    const t = setInterval(() => setSecondsLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, result]);

  useEffect(() => {
    if (secondsLeft === 0 && quiz && !result) onSubmit();
  }, [secondsLeft]);

  if (!quiz) return <Card className="p-4">No hay simulacros disponibles aún.</Card>;

  const onSubmit = async () => {
    if (!quiz) return;
    const res = await submit({ quizId: quiz._id, answers, startedAt });
    setResult(res);
  };

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">{quiz.title}</div>
        {result ? null : (
          <div className="text-sm text-muted-foreground">
            Tiempo restante: {mm}:{String(ss).padStart(2, '0')}
          </div>
        )}
      </div>
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
                <RadioGroupItem id={`sq${idx}-${i}`} value={String(i)} />
                <Label htmlFor={`sq${idx}-${i}`}>{c}</Label>
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
        {!result && <Button onClick={onSubmit}>Terminar</Button>}
        {result && (
          <div className="text-sm">
            Puntaje: {result.correctCount}/{result.totalCount} ({Math.round(result.score * 100)}%)
          </div>
        )}
      </div>
    </Card>
  );
}
