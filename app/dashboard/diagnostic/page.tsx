'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { api } from '@/convex/_generated/api';
import { useErrorHandler } from '@/lib/core/error-system';
import { Target, BookOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface diagnosticquestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: 'math1',
    subject: 'Matemáticas',
    question: '¿Cuál es el resultado de 2 + 2 × 3?',
    options: ['8', '12', '6', '10'],
    correctIndex: 0,
    difficulty: 'easy'
  },
  {
    id: 'spanish1',
    subject: 'Lenguaje',
    question: '¿Cuál es el antónimo de "rápido"?',
    options: ['Lento', 'Veloz', 'Ágil', 'Rápido'],
    correctIndex: 0,
    difficulty: 'easy'
  },
  {
    id: 'history1',
    subject: 'Historia',
    question: '¿En qué año llegó Cristóbal Colón a América?',
    options: ['1492', '1500', '1485', '1510'],
    correctIndex: 0,
    difficulty: 'easy'
  },
  {
    id: 'science1',
    subject: 'Ciencias',
    question: '¿Cuál es el planeta más cercano al Sol?',
    options: ['Venus', 'Tierra', 'Mercurio', 'Marte'],
    correctIndex: 2,
    difficulty: 'easy'
  },
  {
    id: 'math2',
    subject: 'Matemáticas',
    question: '¿Cuál es la solución de la ecuación x² - 4 = 0?',
    options: ['x = 2', 'x = ±2', 'x = 4', 'x = -4'],
    correctIndex: 1,
    difficulty: 'medium'
  },
  {
    id: 'spanish2',
    subject: 'Lenguaje',
    question: '¿Qué figura literaria se usa en "el sol reía"?',
    options: ['Metáfora', 'Personificación', 'Hipérbole', 'Ironía'],
    correctIndex: 1,
    difficulty: 'medium'
  },
  {
    id: 'history2',
    subject: 'Historia',
    question: '¿Qué tratado puso fin a la Primera Guerra Mundial?',
    options: ['Tratado de Versalles', 'Tratado de París', 'Tratado de Viena', 'Tratado de Westfalia'],
    correctIndex: 0,
    difficulty: 'hard'
  }
];

export default function DiagnosticPage() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveDiagnosticResults = useMutation(api.userStats.saveDiagnosticResults);

  const currentQuestion = diagnosticQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / diagnosticQuestions.length) * 100;

  const handleanswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handlenext = () => {
    if (currentQuestionIndex < diagnosticQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }

 else {
      handleSubmit();
    }
  };

  const handleprevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handlesubmit = async () => {
    setIsSubmitting(true);
    try {
      // Calculate results
      const results = diagnosticQuestions.map(q => ({
        questionId: q.id,
        subject: q.subject,
        correct: answers[q.id] === q.correctIndex,
        difficulty: q.difficulty,
        timeSpent: 30 // Mock time spent
      }));

      const subjectScores = results.reduce((acc, result) => {
        if (!acc[result.subject]) {
          acc[result.subject] = { correct: 0, total: 0 };
        }
        acc[result.subject].correct += result.correct ? 1 : 0;
        acc[result.subject].total += 1;
        return acc;
      }, {} as Record<string, { correct: number; total: number }>);

      const overallScore = results.filter(r => r.correct).length / results.length;

      await saveDiagnosticResults({
        results,
        subjectScores,
        overallScore,
        completedAt: Date.now()
      });

      setShowResults(true);
    } catch (error) {
      handleError(error as Error, 'DiagnosticPage.submit');
    }

 finally {
      setIsSubmitting(false);
    }
  };

  if (showResults) {
    const results = diagnosticQuestions.map(q => ({
      ...q,
      userAnswer: answers[q.id],
      isCorrect: answers[q.id] === q.correctIndex
    }));

    const correctCount = results.filter(r => r.isCorrect).length;
    const subjectBreakdown = results.reduce((acc, result) => {
      if (!acc[result.subject]) {
        acc[result.subject] = { correct: 0, total: 0 };
      }
      acc[result.subject].correct += result.isCorrect ? 1 : 0;
      acc[result.subject].total += 1;
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    return (
      <div className="px-4 lg:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Resultados de la Evaluación Diagnóstica</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Tu Nivel Actual
            </CardTitle>
            <CardDescription>
              Basado en tus respuestas, hemos analizado tus fortalezas y áreas de mejora
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {Math.round((correctCount / diagnosticQuestions.length) * 100)}%
              </div>
              <p className="text-muted-foreground">
                {correctCount} de {diagnosticQuestions.length} preguntas correctas
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(subjectBreakdown).map(([subject, scores]) => (
                <Card key={subject}>
                  <CardContent className="p-4 text-center">
                    <div className="font-semibold">{subject}</div>
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((scores.correct / scores.total) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {scores.correct}/{scores.total} correctas
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Recomendaciones Personalizadas:</h3>
              <div className="grid gap-3">
                {Object.entries(subjectBreakdown).map(([subject, scores]) => {
                  const percentage = (scores.correct / scores.total) * 100;
                  return (
                    <div key={subject} className="flex items-center gap-3 p-3 border rounded-lg">
                      {percentage >= 80 ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : percentage >= 60 ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {percentage >= 80
                            ? '¡Excelente! Mantén este nivel de estudio.'
                            : percentage >= 60
                            ? 'Buen progreso. Enfócate en repasar conceptos clave.'
                            : 'Área prioritaria. Necesitas reforzar estos temas.'
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => router.push('/dashboard/plan')} className="flex-1">
                Ver Plan de Estudio Personalizado
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/biblioteca')} className="flex-1">
                Explorar Biblioteca
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evaluación Diagnóstica</h1>
        <Badge variant="outline" className="gap-1">
          <BookOpen className="w-3 h-3" />
          Pregunta {currentQuestionIndex + 1} de {diagnosticQuestions.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentQuestion.subject}</Badge>
              <Badge variant={
                currentQuestion.difficulty === 'easy' ? 'default' :
                currentQuestion.difficulty === 'medium' ? 'secondary' : 'destructive'
              }>
                {currentQuestion.difficulty === 'easy' ? 'Fácil' :
                 currentQuestion.difficulty === 'medium' ? 'Medio' : 'Difícil'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id]?.toString()}
            onValueChange={(value) => handleAnswer(currentQuestion.id, parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-sm leading-relaxed"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Tiempo estimado: 30s por pregunta
            </div>
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion.id] === undefined || isSubmitting}
            >
              {currentQuestionIndex === diagnosticQuestions.length - 1 ? (
                isSubmitting ? 'Enviando...' : 'Finalizar'
              ) : (
                'Siguiente'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Tip:</strong> Esta evaluación te ayudará a crear un plan de estudio personalizado
            basado en tus fortalezas y áreas que necesitan más atención.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}