'use client';

import { useQuery } from 'convex/react';
import { useMemo, useState } from 'react';
import { Search, Filter, BookOpen, Clock, Target, Trophy, TrendingUp, Calendar, Star, PlayCircle } from 'lucide-react';

import CapsulePlayer from '@/components/CapsulePlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnergyOrb } from '@/components/EnergyOrb';
import { api } from '@/convex/_generated/api';
import { useErrorHandler } from '@/lib/core/error-system';
import { PaymentGate } from '@/components/PaymentGate';
// Demo data imports removed - using real data only
import { cn } from '@/lib/utils';

type LessonSummary = any; // Using any for now - proper typing needed

type FilterType = 'all' | 'completed' | 'in-progress' | 'not-started' | 'recommended';

interface lessoncardprops {
  lesson: lessonsummary;
  isSelected: boolean;
  onClick: () => void;
  progress?: {
    completed: boolean;
    watchedMinutes: number;
    totalMinutes: number;
  };

  isRecommended?: boolean;
}

function LessonCard({ lesson, isSelected, onClick, progress, isRecommended }: LessonCardProps) {
  const progressPercentage = progress ? (progress.watchedMinutes / progress.totalMinutes) * 100 : 0;progressPercentageprogressprogress.watchedMinutesprogress.totalMinutes100

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md group",
        isSelected && "ring-2 ring-primary bg-primary/5",
        isRecommended && "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {lesson.title}
              </h3>
              {isRecommended && (
                <Badge variant="secondary" className="text-xs px-2 py-0">
                  <Star className="w-3 h-3 mr-1" />
                  Recomendado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {lesson.subject}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.floor((lesson.duration || 0) / 60)} min
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {lesson.difficulty || 'Básico'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <PlayCircle className="w-4 h-4 text-primary" />
              {progress?.completed && <Trophy className="w-4 h-4 text-yellow-500" />}
            </div>
            {progress && (
              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full bg-primary transition-all duration-300",
                    progressPercentage <= 25 && "w-4",
                    progressPercentage > 25 && progressPercentage <= 50 && "w-8",
                    progressPercentage > 50 && progressPercentage <= 75 && "w-12",
                    progressPercentage > 75 && "w-16"
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {lesson.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {lesson.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {lesson.tags?.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {progress?.completed ? 'Completado' : progress?.watchedMinutes ? 'En progreso' : 'Nuevo'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BibliotecaPage() {
  const { handleError } = useErrorHandler();
  const [subject, setSubject] = useState<string | undefined>(undefined);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'title' | 'duration' | 'difficulty' | 'progress'>('title');

  // Try to get data from Convex, fall back to demo data
  const convexSubjects = useQuery(api.content.listSubjects, {});
  const convexLessons = useQuery(api.content.listLessons, { subject });
  const progressData = useQuery(api.progress.overview, {});

  // Handle query errors with logging but continue with demo data
  if (convexSubjects === null) {
    handleError(
      new Error('Error al cargar las asignaturas desde Convex'),
      'BibliotecaPage.convexSubjects'
    );
  }

  if (convexLessons === null) {
    handleError(
      new Error('Error al cargar las lecciones desde Convex'),
      'BibliotecaPage.convexLessons'
    );
  }

  // Basic free content - limited lessons
  const freeBasicLessons = [
    {
      _id: 'basic-math-intro',
      title: 'Introducción a Matemáticas PAES',
      subject: 'Matemáticas',
      duration: 15,
      difficulty: 'Básico',
      description: 'Conceptos fundamentales para comenzar tu preparación PAES'
    },
    {
      _id: 'basic-spanish-intro', 
      title: 'Comprensión Lectora Básica',
      subject: 'Lenguaje',
      duration: 20,
      difficulty: 'Básico',
      description: 'Estrategias básicas de comprensión lectora'
    },
    {
      _id: 'basic-sciences-intro',
      title: 'Introducción a Ciencias',
      subject: 'Ciencias',
      duration: 18,
      difficulty: 'Básico', 
      description: 'Conceptos científicos fundamentales para la PAES'
    }
  ];

  const subjects = convexSubjects || ['Matemáticas', 'Lenguaje', 'Ciencias'];
  const allLessons = convexLessons || freeBasicLessons;
  const lessons = useMemo<LessonSummary[]>(() => allLessons || [], [allLessons]);

  // Mock progress data for demo - in real app this would come from backend
  const mockProgress = useMemo(() => {
    const progressMap: Record<string, { completed: boolean; watchedMinutes: number; totalMinutes: number }> = {};
    lessons.forEach(lesson => {
      const duration = lesson.duration || 30;
      const watched = Math.random() * duration;
      progressMap[lesson._id] = {
        completed: Math.random() > 0.7,
        watchedMinutes: Math.floor(watched),
        totalMinutes: duration
      };
    });
    return progressMap;
  }, [lessons]);

  // Filter and sort lessons
  const filteredLessons = useMemo(() => {
    let filtered = lessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lesson.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' ||
                          (filterType === 'completed' && mockProgress[lesson._id]?.completed) ||
                          (filterType === 'in-progress' && mockProgress[lesson._id] && !mockProgress[lesson._id]?.completed) ||
                          (filterType === 'not-started' && !mockProgress[lesson._id]) ||
                          (filterType === 'recommended' && lesson._id.includes('recommended'));

      return matchesSearch && matchesFilter;
    });

    // Sort lessons
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        case 'difficulty':
          const diffOrder = { 'Básico': 0, 'Intermedio': 1, 'Avanzado': 2 };
          return (diffOrder[a.difficulty as keyof typeof diffOrder] || 0) -
                 (diffOrder[b.difficulty as keyof typeof diffOrder] || 0);
        case 'progress':
          const aProgress = mockProgress[a._id]?.watchedMinutes || 0;
          const bProgress = mockProgress[b._id]?.watchedMinutes || 0;
          return bProgress - aProgress;
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [lessons, searchTerm, filterType, sortBy, mockProgress]);

  const recommendedLessons = useMemo(() =>
    lessons.filter(lesson =>
      lesson._id.includes('celula') || lesson._id.includes('enlaces')
    ).slice(0, 3),
    [lessons]
  );

  const recentActivity: any[] = [];recentActivity // Recent lessons functionality disabled

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Biblioteca de Estudio
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredLessons.length} lecciones disponibles • Continúa tu aprendizaje
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            Racha: 7 días
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Trophy className="w-4 h-4 mr-1" />
            12/20 completadas
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-5 h-5" />
                Buscar y Filtrar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar lecciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las lecciones</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="in-progress">En progreso</SelectItem>
                  <SelectItem value="not-started">No iniciadas</SelectItem>
                  <SelectItem value="recommended">Recomendadas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Título</SelectItem>
                  <SelectItem value="duration">Duración</SelectItem>
                  <SelectItem value="difficulty">Dificultad</SelectItem>
                  <SelectItem value="progress">Progreso</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subject ?? 'all'} onValueChange={(v) => setSubject(v === 'all' ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Asignatura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las asignaturas</SelectItem>
                  {(subjects || []).map(s => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Study Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tu Progreso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completadas hoy</span>
                  <span className="font-semibold">3/5</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Semanal</span>
                  <span className="font-semibold">12/20</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiempo estudiado hoy</span>
                  <span className="font-semibold">2h 30m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Objetivo diario</span>
                  <span className="text-muted-foreground">3h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.slice(0, 3).map((lesson: any) => (
                    <div key={lesson._id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <EnergyOrb 
                        size="sm" 
                        userId={lesson._id} 
                        variant="subtle" 
                        className="w-8 h-8" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="all">Todas ({filteredLessons.length})</TabsTrigger>
              <TabsTrigger value="recommended">Recomendadas ({recommendedLessons.length})</TabsTrigger>
              <TabsTrigger value="in-progress">En Progreso</TabsTrigger>
              <TabsTrigger value="completed">Completadas</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-3">
                {filteredLessons.map((lesson) => (
                  <LessonCard
                    key={lesson._id}
                    lesson={lesson}
                    isSelected={selectedLesson === lesson._id}
                    onClick={() => setSelectedLesson(lesson._id)}
                    progress={mockProgress[lesson._id]}
                    isRecommended={recommendedLessons.some(r => r._id === lesson._id)}
                  />
                ))}
                {filteredLessons.length === 0 && (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No se encontraron lecciones</p>
                      <p className="text-sm">Intenta ajustar tus filtros o términos de búsqueda</p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommended" className="space-y-4">
              <div className="grid gap-3">
                {recommendedLessons.map((lesson) => (
                  <LessonCard
                    key={lesson._id}
                    lesson={lesson}
                    isSelected={selectedLesson === lesson._id}
                    onClick={() => setSelectedLesson(lesson._id)}
                    progress={mockProgress[lesson._id]}
                    isRecommended={true}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="in-progress" className="space-y-4">
              <div className="grid gap-3">
                {filteredLessons
                  .filter(lesson => mockProgress[lesson._id] && !mockProgress[lesson._id]?.completed)
                  .map((lesson) => (
                    <LessonCard
                      key={lesson._id}
                      lesson={lesson}
                      isSelected={selectedLesson === lesson._id}
                      onClick={() => setSelectedLesson(lesson._id)}
                      progress={mockProgress[lesson._id]}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <div className="grid gap-3">
                {filteredLessons
                  .filter(lesson => mockProgress[lesson._id]?.completed)
                  .map((lesson) => (
                    <LessonCard
                      key={lesson._id}
                      lesson={lesson}
                      isSelected={selectedLesson === lesson._id}
                      onClick={() => setSelectedLesson(lesson._id)}
                      progress={mockProgress[lesson._id]}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Player Section */}
      {selectedLesson && (
        <div className="border-t pt-6">
          <div className="max-w-4xl mx-auto">
            <CapsulePlayer lessonId={selectedLesson} />
          </div>
        </div>
      )}
    </div>
  );
}
