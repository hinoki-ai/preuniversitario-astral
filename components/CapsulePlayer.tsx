'use client';

import {
  IconBookmark,
  IconBookmarkPlus,
  IconClock,
  IconNotes,
  IconTrash,
} from '@tabler/icons-react';
import { Id } from 'convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import InlineQuiz from '@/components/InlineQuiz';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { YouTubePlayer } from '@/components/YouTubePlayer';
import { api } from '@/convex/_generated/api';
import { getDemoLesson } from '@/lib/demo-data';
import { Lesson } from '@/lib/types';
import { cn } from '@/lib/utils';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];

type LessonAnnotation = {
  _id: Id<'lessonAnnotations'>;
  userId: Id<'users'>;
  lessonId: Id<'lessons'>;
  type: 'note' | 'bookmark';
  timestampSec?: number | null;
  content: string;
  createdAt: number;
  updatedAt: number;
};

function formatSeconds(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0:00';
  const seconds = Math.max(0, Math.floor(value));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

function getYouTubeVideoId(url: string | null | undefined) {
  if (!url) return null;
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
}

export default function CapsulePlayer({ lessonId }: { lessonId: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [noteContent, setNoteContent] = useState('');
  const [attachTimestamp, setAttachTimestamp] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

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
  const lesson: Lesson | (ReturnType<typeof getDemoLesson> & Partial<Lesson>) | null =
    convexLesson || getDemoLesson(lessonId);

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

  const handleAddNote = async () => {
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
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddBookmark = async () => {
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
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleDelete = async (id: Id<'lessonAnnotations'>) => {
    try {
      await deleteAnnotation({ id });
      toast.success('Elemento eliminado');
    } catch (_error) {
      toast.error('No se pudo eliminar');
    }
  };

  const handleSpeedChange = (rate: number) => {
    if (!supportsAdvancedControls) return;
    setPlaybackRate(rate);
  };

  if (!lesson) return null;

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-4">
        <div>
          <div className="text-lg font-semibold">{lesson.title}</div>
          {lesson.subject && <div className="text-sm text-muted-foreground">{lesson.subject}</div>}
        </div>
        {lesson.videoUrl ? (
          <div className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
              {isFileVideo ? (
                <video
                  ref={videoRef}
                  controls
                  className="h-full w-full"
                  src={lesson.videoUrl}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : isYouTube && youtubeVideoId ? (
                <YouTubePlayer
                  videoId={youtubeVideoId}
                  playbackRate={playbackRate}
                  onReady={player => {
                    youtubePlayerRef.current = player;
                  }}
                  onTimeUpdate={time => {
                    if (typeof time === 'number' && !Number.isNaN(time)) {
                      setCurrentTime(time);
                    }
                  }}
                  onDurationChange={value => {
                    if (typeof value === 'number' && !Number.isNaN(value)) {
                      setDuration(value);
                    }
                  }}
                />
              ) : (
                <iframe
                  src={lesson.videoUrl}
                  allow="autoplay; fullscreen"
                  className="h-full w-full"
                  title={`Video: ${lesson.title}`}
                />
              )}
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconClock className="size-4" />
                <span>
                  {formatSeconds(currentTime)} / {duration ? formatSeconds(duration) : '—'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Velocidad
                </span>
                {SPEED_OPTIONS.map(option => (
                  <Button
                    key={option}
                    size="sm"
                    type="button"
                    variant={option === playbackRate ? 'default' : 'outline'}
                    className={cn('h-8 px-2 text-xs', option === playbackRate && 'font-semibold')}
                    onClick={() => handleSpeedChange(option)}
                    disabled={!supportsAdvancedControls}
                  >
                    {`${option}x`}
                  </Button>
                ))}
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={handleAddBookmark}
                  disabled={!canPersist || !supportsAdvancedControls || savingBookmark}
                >
                  <IconBookmarkPlus className="mr-1 size-4" />
                  Guardar marcador
                </Button>
              </div>
            </div>
            {!supportsAdvancedControls && (
              <p className="text-xs text-muted-foreground">
                Los controles avanzados solo funcionan con archivos internos (MP4/WebM) o videos
                alojados en YouTube.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            Esta cápsula aún no tiene un video asociado.
          </div>
        )}
        <div className="space-y-2">
          {lesson.pdfUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer">
                Descargar guía PDF
              </a>
            </Button>
          )}
          {lesson.attachments?.length ? (
            <div className="flex flex-wrap gap-2 text-sm">
              {lesson.attachments.map(
                (attachment: { name: string; url: string }, index: number) => (
                  <a
                    key={`${attachment.name}-${index}`}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {attachment.name}
                  </a>
                )
              )}
            </div>
          ) : null}
        </div>
        {lesson.transcript && (
          <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            <div className="mb-2 font-medium">Transcripción</div>
            <div className="whitespace-pre-wrap leading-relaxed">{lesson.transcript}</div>
          </div>
        )}
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
