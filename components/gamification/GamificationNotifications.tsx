'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import {
  Award,
  Bell,
  CheckCircle2,
  Flame,
  Gift,
  Inbox,
  Medal,
  Star,
} from 'lucide-react';

import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { UserStats } from '@/lib/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type GamificationNotificationType = 'achievement' | 'streak' | 'reward' | 'system';

export interface GamificationNotification {
  id: string;
  title: string;
  description: string;
  type: GamificationNotificationType;
  points?: number;
  createdAt: Date;
  read?: boolean;
}

interface GamificationNotificationsProps {
  onNotification?: (notification: GamificationNotification) => void;
}

export function GamificationNotifications({ onNotification }: GamificationNotificationsProps) {
  const userStats = useQuery(api.userStats.getUserStats) as UserStats | undefined;
  const achievements = useQuery(api.userStats.getUserAchievements) as Array<{ id: string; title: string; createdAt?: number }> | undefined;

  const notifications = useMemo<GamificationNotification[]>(() => {
    const base: GamificationNotification[] = [];

    if (userStats?.currentStreak) {
      base.push({
        id: `streak-${userStats.currentStreak}`,
        title: `🔥 Racha de ${userStats.currentStreak} días`,
        description: 'Excelente constancia. Mantén el ritmo para desbloquear recompensas extra.',
        type: 'streak',
        points: userStats.currentStreak * 5,
        createdAt: new Date(),
      });
    }

    achievements?.forEach(achievement => {
      base.push({
        id: `achievement-${achievement.id}`,
        title: `Nuevo logro desbloqueado: ${achievement.title}`,
        description: 'Sigue así para subir en el ranking semanal.',
        type: 'achievement',
        points: 150,
        createdAt: achievement.createdAt ? new Date(achievement.createdAt) : new Date(),
      });
    });

    if (userStats?.weeklyGoals) {
      base.push({
        id: 'weekly-goal',
        title: 'Objetivo semanal disponible',
        description: 'Completa las misiones recomendadas para ganar puntos extra.',
        type: 'reward',
        points: 200,
        createdAt: new Date(),
      });
    }

    return base.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [achievements, userStats]);

  const { filters, markAllAsRead, markNotificationAsRead } = useGamificationNotificationsState({
    notifications,
    onNotification,
  });

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Pergaminos Mágicos
          </CardTitle>
          <CardDescription>
            Enterate de tus conquistas legendarias, tesoros obtenidos y recordatorios importantes para mantener tu espíritu guerrero.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={unreadCount > 0 ? 'default' : 'secondary'}>
            {unreadCount > 0 ? `${unreadCount} pendientes` : 'Todo al día'}
          </Badge>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            Marcar todo como leído
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filters.activeTab} onValueChange={filters.setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Todos los Pergaminos
            </TabsTrigger>
            <TabsTrigger value="achievement" className="flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Conquistas Épicas
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Cadenas de Honor
            </TabsTrigger>
            <TabsTrigger value="reward" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Tesoros Obtenidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filters.activeTab} className="mt-4 space-y-3">
            {filters.filteredNotifications.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No hay pergaminos para mostrar. Completa aventuras legendarias para desbloquear nuevos tesoros.
              </div>
            ) : (
              filters.filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markNotificationAsRead(notification.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: GamificationNotification;
  onMarkAsRead: () => void;
}) {
  const iconConfig: Record<GamificationNotificationType, { icon: React.ComponentType<{ className?: string }>; variant: string }> = {
    achievement: { icon: Star, variant: 'bg-amber-500/10 text-amber-600' },
    streak: { icon: Flame, variant: 'bg-orange-500/10 text-orange-600' },
    reward: { icon: Gift, variant: 'bg-emerald-500/10 text-emerald-600' },
    system: { icon: Award, variant: 'bg-blue-500/10 text-blue-600' },
  };

  const { icon: Icon, variant } = iconConfig[notification.type];

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg border p-4 transition hover:border-primary/40',
        !notification.read && 'border-primary/40 bg-primary/5',
      )}
    >
      <div className="flex flex-1 items-start gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', variant)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium leading-tight">{notification.title}</h3>
            {notification.points ? (
              <Badge variant="outline" className="text-xs">
                +{notification.points} pts
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{notification.description}</p>
          <span className="text-xs text-muted-foreground">
            {notification.createdAt.toLocaleString()}
          </span>
        </div>
      </div>
      {!notification.read ? (
        <Button size="sm" variant="ghost" onClick={onMarkAsRead}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Marcar leído
        </Button>
      ) : null}
    </div>
  );
}

type UseGamificationNotificationsStateOptions = {
  notifications: GamificationNotification[];
  onNotification?: (notification: GamificationNotification) => void;
};

function useGamificationNotificationsState({
  notifications,
  onNotification,
}: UseGamificationNotificationsStateOptions) {
  const [activeTab, setActiveTab] = useState<'all' | GamificationNotificationType>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const filteredNotifications = useMemo(() => {
    const items = notifications.map(notification => ({
      ...notification,
      read: readIds.has(notification.id),
    }));

    if (activeTab === 'all') {
      return items;
    }

    return items.filter(notification => notification.type === activeTab);
  }, [activeTab, notifications, readIds]);

  const markNotificationAsRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    const notification = notifications.find(item => item.id === id);
    if (notification && onNotification) {
      onNotification(notification);
    }
  };

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map(notification => notification.id)));
  };

  return {
    filters: {
      activeTab,
      setActiveTab: (value: string) => setActiveTab(value as typeof activeTab),
      filteredNotifications,
    },
    markNotificationAsRead,
    markAllAsRead,
  };
}

export function useGamificationNotifications() {
  const notifications = useQuery(api.userStats.getUserStats) as UserStats | undefined;

  return useMemo(() => {
    if (!notifications) {
      return { unreadCount: 0 };
    }

    const unread = notifications.currentStreak ? 1 : 0;
    return { unreadCount: unread };
  }, [notifications]);
}
