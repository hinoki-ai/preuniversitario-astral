'use client';

import {
  IconBookmark,
  IconBookmarkPlus,
  IconClock,
  IconNotes,
  IconTrash,
} from '@tabler/icons-react';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useStandardErrorHandling } from '@/lib/core/error-wrapper';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { getDemoLesson } from '@/lib/demo-data';

import InlineQuiz from '@/components/InlineQuiz';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { api } from '@/convex/_generated/api';
// Demo data imports removed - using real data only;
import { Lesson } from '@/lib/types';
import { cn } from '@/lib/utils';

// PDF Viewer Component
function PDFViewer({ url, title }: { url: string; title: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden">
      {error ? (
        <div className="flex items-center justify-center h-full bg-muted">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Error al cargar el PDF</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Descargar PDF
            </a>
          </div>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Cargando PDF...</p>
              </div>
            </div>
          )}
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="w-full h-full"
            title={title}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('No se pudo cargar el PDF');
            }}
          />
        </>
      )}
    </div>
  );
}

// Enhanced Multimedia Viewer
function MultimediaViewer({
  lesson,
  playbackRate,
  setCurrentTime,
  setDuration
}: {
  lesson: Lesson;
  playbackRate: number;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<'video' | 'pdf' | 'transcript'>('video');

  const hasVideo = lesson.videoUrl;
  const hasPdf = lesson.pdfUrl;
  const hasTranscript = lesson.transcript;

  // Auto-select first available content
  useEffect(() => {
    if (hasVideo) setActiveTab('video');
    else if (hasPdf) setActiveTab('pdf');
    else if (hasTranscript) setActiveTab('transcript');
  }, [hasVideo, hasPdf, hasTranscript]);

  if (!hasVideo && !hasPdf && !hasTranscript) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <IconNotes className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay contenido multimedia disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b">
        {hasVideo && (
          <button
            onClick={() => setActiveTab('video')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'video'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Video
          </button>
        )}
        {hasPdf && (
          <button
            onClick={() => setActiveTab('pdf')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'pdf'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Material PDF
          </button>
        )}
        {hasTranscript && (
          <button
            onClick={() => setActiveTab('transcript')}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'transcript'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Transcripción
          </button>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'video' && hasVideo && (
          <div className="space-y-4">
            <YouTubePlayer
              videoId={getyoutubevideoid(lesson.videoUrl) || ''}
              playbackRate={playbackRate}
              onTimeUpdate={(time) => setCurrentTime(time)}
              onDurationChange={(dur) => setDuration(dur)}
            />
            {lesson.pdfUrl && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer">
                    📄 Ver guía PDF
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pdf' && hasPdf && (
          <PDFViewer url={lesson.pdfUrl!} title={`${lesson.title} - Guía PDF`} />
        )}

        {activeTab === 'transcript' && hasTranscript && (
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <IconNotes className="w-5 h-5" />
                <h3 className="font-semibold">Transcripción de la lección</h3>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {lesson.transcript}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];

type lessonannotation = {
  _id: id<'lessonAnnotations'>;
  userId: id<'users'>;
  lessonId: id<'lessons'>;
  type: 'note' | 'bookmark';
  timestampSec?: number | null;
  content: string;
  createdAt: number;
  updatedAt: number;
};

function formatseconds(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0:00';
  const seconds = Math.max(0, Math.floor(value));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

function getyoutubevideoid(url: string | null | undefined) {
  if (!url) return null;
  try {
    const patterns = [
      /youtu\.be\/([^?&#]+)/i,
      /youtube\.com\/embed\/([^?&#]+)/i,
      /youtube\.com\/(?:watch|shorts).*?[?&]v=([^?&#]+)/i,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      const id = match?.[1];
      if (id) return id;
    }
    return null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
}

function CapsulePlayerInternal({ lessonId }: { lessonId: string }) {
  const { handleError, safeAsyncCall, safeSyncCall } = useStandardErrorHandling('CapsulePlayer');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [noteContent, setNoteContent] = useState('');
  const [attachTimestamp, setAttachTimestamp] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [autoPauseForNotes, setAutoPauseForNotes] = useState(false);

  const convexLesson = useQuery(
    api.content.getLesson,
    lessonId ? { id: lessonId as Id<'lessons'> } : 'skip'
  ) as Lesson | null;
  const convexLessonId = convexLesson?._id;

  const annotations = useQuery(
    api.lessonAnnotations.listLessonAnnotations,
    convexLessonId ? { lessonId: convexLessonId } : 'skip'
  ) as LessonAnnotation[] | undefined;

  const youtubePlayerRef = useRef<any | null>(null);
  const markViewed = useMutation(api.content.markLessonViewed);
  const createAnnotation = useMutation(api.lessonAnnotations.createLessonAnnotation);
  const deleteAnnotation = useMutation(api.lessonAnnotations.deleteLessonAnnotation);

  // Use Convex data if available, otherwise use demo data
  const lesson: lesson | (returntype<typeof getdemolesson> & partial<lesson>) | null =
    convexlesson || getdemolesson(lessonid);UseConvexdataifavailable,otherwiseusedemodataconstlesson

  const youtubeVideoId = useMemo(
    () => getYouTubeVideoId(lesson?.videoUrl ?? ''),
    [lesson?.videoUrl]
  );
  const isYouTube = Boolean(youtubeVideoId);

  const isFileVideo = useMemo(() => {
    const url = lesson?.videoUrl;
    if (!url) return false;
    return /\.(mp4|webm|ogg)$/i.test(url) || url.startsWith('/');
  }, [lesson?.videoUrl]);

  const supportsAdvancedControls = isFileVideo || isYouTube;

  const storageKey = useMemo(
    () => `capsule_speed_${convexLessonId ?? lessonId}`,
    [convexLessonId, lessonId]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = Number.parseFloat(stored);
      if (!Number.isNaN(parsed)) {
        setPlaybackRate(parsed);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setAttachTimestamp(supportsAdvancedControls);
  }, [lessonId, lesson?.videoUrl, supportsAdvancedControls]);

  useEffect(() => {
    if (!isYouTube) {
      youtubePlayerRef.current = null;
    }
  }, [isYouTube]);

  const applyPlaybackRateToFileVideo = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;
    element.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, playbackRate.toString());
    }
    if (isFileVideo) {
      applyPlaybackRateToFileVideo();
    }
  }, [applyPlaybackRateToFileVideo, isFileVideo, playbackRate, storageKey]);

  useEffect(() => {
    if (!convexLessonId) return;
    markViewed({ lessonId: convexLessonId }).catch(() => {});
  }, [convexLessonId, markViewed]);

  const canPersist = Boolean(convexLessonId);

  const notes = useMemo(
    () => (annotations || []).filter(annotation => annotation.type === 'note'),
    [annotations]
  );
  const bookmarks = useMemo(
    () => (annotations || []).filter(annotation => annotation.type === 'bookmark'),
    [annotations]
  );

  const handleLoadedMetadata = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;
    setDuration(element.duration || 0);
    setCurrentTime(element.currentTime || 0);
    applyPlaybackRateToFileVideo();
  }, [applyPlaybackRateToFileVideo]);

  const handleTimeUpdate = useCallback(() => {
    const element = videoRef.current;
    if (!element) return;
    setCurrentTime(element.currentTime || 0);
  }, []);

  const seekTo = useCallback(
    (seconds: number) => {
      const target = Math.max(0, seconds);
      if (isFileVideo && videoRef.current) {
        videoRef.current.currentTime = target;
        videoRef.current.focus?.();
      }
      if (isYouTube && youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.seekTo(target, true);
        } catch (_error) {
          // ignore seek errors
        }
      }
    },
    [isFileVideo, isYouTube]
  );

  const handleaddnote = async () => {
    if (!canPersist) {
      toast.error('Conecta esta cápsula a Convex para guardar notas.');
      return;
    }
    const content = noteContent.trim();
    if (!content) {
      toast.error('La nota está vacía.');
      return;
    }

    try {
      setSavingNote(true);
      await createAnnotation({
        lessonId: convexLessonId as Id<'lessons'>,
        type: 'note',
        content,
        timestampSec: attachTimestamp && supportsAdvancedControls ? currentTime : undefined,
      });
      setNoteContent('');
      toast.success('Nota guardada');
    } catch (_error) {
      toast.error('No se pudo guardar la nota.');
    }

 finally {
      setSavingNote(false);
    }
  };

  const handleaddbookmark = async () => {
    if (!canPersist || !supportsAdvancedControls) return;
    try {
      setSavingBookmark(true);
      await createAnnotation({
        lessonId: convexLessonId as Id<'lessons'>,
        type: 'bookmark',
        timestampSec: currentTime,
        content: formatSeconds(currentTime),
      });
      toast.success('Marcador agregado');
    } catch (_error) {
      toast.error('No se pudo crear el marcador.');
    }

 finally {
      setSavingBookmark(false);
    }
  };

  const handledelete = async (id: Id<'lessonAnnotations'>) => {
    try {
      await deleteAnnotation({ id });
      toast.success('Elemento eliminado');
    } catch (_error) {
      toast.error('No se pudo eliminar');
    }
  };

  const handlespeedchange = (rate: number) => {
    if (!supportsAdvancedControls) return;
    setPlaybackRate(rate);
  };

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          // Toggle play/pause
          if (isFileVideo && videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
          if (isYouTube && youtubePlayerRef.current) {
            try {
              const state = youtubePlayerRef.current.getPlayerState?.();
              if (state === 1) { // playing
                youtubePlayerRef.current.pauseVideo();
              } else {
                youtubePlayerRef.current.playVideo();
              }
            } catch (_error) {
              // ignore
            }
          }
          break;
        case 'arrowleft':
          e.preventDefault();
          seekTo(currentTime - 10); // Seek back 10 seconds
          break;
        case 'arrowright':
          e.preventDefault();
          seekTo(currentTime + 10); // Seek forward 10 seconds
          break;
        case 'b':
          e.preventDefault();
          if (supportsAdvancedControls && canPersist) {
            handleAddBookmark();
          }
          break;
        case 'n':
          e.preventDefault();
          // Focus note input
          const noteInput = document.querySelector('textarea[placeholder*="notas"]') as HTMLTextAreaElement;
          if (noteInput) {
            noteInput.focus();
            if (autoPauseForNotes && isFileVideo && videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
            }
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          e.preventDefault();
          const speedIndex = parseInt(e.key) - 1;
          if (speedIndex < SPEED_OPTIONS.length) {
            handleSpeedChange(SPEED_OPTIONS[speedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTime, isFileVideo, isYouTube, supportsAdvancedControls, canPersist, autoPauseForNotes]);

  const exportNotes = useCallback(() => {
    if (!notes.length) {
      toast.error('No hay notas para exportar');
      return;
    }

    const notesContent = notes.map(note => {
      const timestamp = note.timestampSec ? ` (${formatSeconds(note.timestampSec)})` : '';
      return `${note.content}${timestamp}`;
    }).join('\n\n');

    const blob = new Blob([`Notas de: ${lesson?.title}\n\n${notesContent}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas-${lesson?.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'leccion'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Notas exportadas');
  }, [notes, lesson?.title]);

  if (!lesson) return null;

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-4">
        <div>
          <div className="text-lg font-semibold">{lesson.title}</div>
          {lesson.subject && <div className="text-sm text-muted-foreground">{lesson.subject}</div>}
        </div>
        <MultimediaViewer
          lesson={lesson}
          playbackRate={playbackRate}
          setCurrentTime={setCurrentTime}
          setDuration={setDuration}
        />

        <div className="space-y-2">
          {lesson.attachments?.length ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">Materiales adicionales</div>
              <div className="flex flex-wrap gap-2">
                {lesson.attachments.map(
                  (attachment: { name: string; url: string }, index: number) => (
                    <Button key={`${attachment.name}-${index}`} variant="outline" size="sm" asChild>
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                        📎 {attachment.name}
                      </a>
                    </Button>
                  )
                )}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-semibold">
              <IconNotes className="size-5" />
              Notas personales
            </div>
            {!canPersist && <Badge variant="outline">Demo</Badge>}
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Escribe tus notas clave aquí..."
              value={noteContent}
              onChange={event => setNoteContent(event.target.value)}
              disabled={!canPersist}
              className="min-h-[96px]"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={attachTimestamp}
                  disabled={!supportsAdvancedControls}
                  onCheckedChange={value =>
                    setAttachTimestamp(Boolean(value) && supportsAdvancedControls)
                  }
                />
                Adjuntar minuto actual ({formatSeconds(currentTime)})
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={autoPauseForNotes}
                  onCheckedChange={value => setAutoPauseForNotes(Boolean(value))}
                />
                Pausar al tomar notas (N)
              </label>
              <Button
                size="sm"
                type="button"
                onClick={handleAddNote}
                disabled={!canPersist || savingNote}
              >
                Guardar nota
              </Button>
            </div>
          </div>
          {notes.length ? (
            <ScrollArea className="max-h-64 pr-2">
              <div className="space-y-2">
                {notes.map(note => (
                  <div key={note._id} className="rounded-md border bg-muted/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      {typeof note.timestampSec === 'number' ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary"
                          onClick={() => seekTo(note.timestampSec ?? 0)}
                          disabled={!supportsAdvancedControls}
                        >
                          <IconClock className="size-3" />
                          {formatSeconds(note.timestampSec ?? 0)}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin marca de tiempo</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(note._id)}
                        aria-label="Eliminar nota"
                      >
                        <IconTrash className="size-4" />
                      </Button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no registras notas para esta cápsula.
            </p>
          )}
        </Card>

        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-2 text-base font-semibold">
            <IconBookmark className="size-5" />
            Marcadores
          </div>
          {bookmarks.length ? (
            <div className="space-y-2">
              {bookmarks.map(bookmark => (
                <div
                  key={bookmark._id}
                  className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2"
                >
                  <button
                    type="button"
                    className="flex flex-col text-left text-sm"
                    onClick={() => seekTo(bookmark.timestampSec ?? 0)}
                    disabled={!supportsAdvancedControls}
                  >
                    <span className="font-medium">{formatSeconds(bookmark.timestampSec ?? 0)}</span>
                    {bookmark.content &&
                    bookmark.content !== formatSeconds(bookmark.timestampSec ?? 0) ? (
                      <span className="text-xs text-muted-foreground">{bookmark.content}</span>
                    ) : null}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(bookmark._id)}
                    aria-label="Eliminar marcador"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Usa “Guardar marcador” para recordar los momentos clave del video.
            </p>
          )}
        </Card>
      </div>

      <InlineQuiz lessonId={lessonId} />
    </div>
  );
}

export default function CapsulePlayer({ lessonId }: { lessonId: string }) {
  return (
    <ComponentErrorBoundary context="CapsulePlayer">
      <CapsulePlayerInternal lessonId={lessonId} />
    </ComponentErrorBoundary>
  );
}
