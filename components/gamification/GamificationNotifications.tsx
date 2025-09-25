'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { 
  Trophy, 
  Star, 
  Crown, 
  Flame, 
  Target, 
  Zap, 
  Award, 
  Gift,
  X,
  Sparkles,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface notificationdata {
  id: string;
  type: 'achievement' | 'level_up' | 'streak' | 'mission_complete' | 'points' | 'perfect_score';
  title: string;
  description: string;
  points?: number;
  level?: number;
  achievement?: {
    title: string;
    description: string;
    tier: string;
    category: string;
    points: number;
  };

  streak?: number;
  autoClose?: boolean;
  duration?: number;
}

interface gamificationnotificationsprops {
  onNotification?: (notification: notificationdata) => void;
}

export function GamificationNotifications({ onNotification }: GamificationNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const { toast } = useToast();

  // Listen for gamification events from the parent component or global state
  useEffect(() => {
    if (onNotification) {
      // This would be connected to your global notification system
      // For now, it's just a placeholder for the API
    }
  }, [onNotification]);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => [...prev, notification]);

    // Trigger celebration effects
    if (['achievement', 'level_up', 'perfect_score'].includes(notification.type)) {
      triggerCelebration(notification.type);
    }

    // Auto-close if specified
    if (notification.autoClose !== false) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration || 5000);
    }

    // Also show as toast for less critical notifications
    if (['points', 'mission_complete'].includes(notification.type)) {
      toast({
        title: notification.title,
        description: notification.description,
        duration: 3000,
      });
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const triggerCelebration = (type: string) => {
    setCelebrationActive(true);

    // Confetti effects
    const colors = {
      achievement: ['#FFD700', '#FFA500', '#FF6347'],
      level_up: ['#4169E1', '#00BFFF', '#87CEEB'],
      perfect_score: ['#32CD32', '#98FB98', '#90EE90']
    };

    const celebrationColors = colors[type as keyof typeof colors] || colors.achievement;

    // Burst confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: celebrationColors
    });

    // Additional effects for major achievements
    if (type === 'level_up') {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: celebrationColors
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: celebrationColors
        });
      }, 400);
    }

    setTimeout(() => {
      setCelebrationActive(false);
    }, 3000);
  };

  // Example function to manually trigger notifications (for testing)
  const triggerTestNotifications = () => {
    // Achievement notification
    addNotification({
      id: `achievement-${Date.now()}`,
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      description: 'Congratulations on your new achievement!',
      achievement: {
        title: 'Speed Demon',
        description: 'Complete a quiz in under 30 seconds',
        tier: 'gold',
        category: 'efficiency',
        points: 75
      }
    });

    // Level up notification
    setTimeout(() => {
      addNotification({
        id: `level-${Date.now()}`,
        type: 'level_up',
        title: '🌟 Level Up!',
        description: 'You reached a new level!',
        level: 15,
        points: 200
      });
    }, 2000);

    // Mission complete
    setTimeout(() => {
      addNotification({
        id: `mission-${Date.now()}`,
        type: 'mission_complete',
        title: '✅ Mission Complete!',
        description: 'Daily Grinder mission completed',
        points: 60,
        autoClose: true,
        duration: 3000
      });
    }, 4000);
  };

  return (
    <>
      {/* Celebration Background Effects */}
      <AnimatePresence>
        {celebrationActive && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-transparent to-blue-200/20 animate-pulse" />
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-blue-400 rounded-full animate-ping delay-100" />
            <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-green-400 rounded-full animate-ping delay-200" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-4 max-w-sm">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Test Button (Remove in production) */}
      <Button
        onClick={triggerTestNotifications}
        className="fixed bottom-4 right-4 z-50"
        size="sm"
      >
        Test Notifications
      </Button>
    </>
  );
}

function NotificationCard({ 
  notification, 
  onClose 
}: { 
  notification: NotificationData; 
  onClose: () => void;
}) {
  const getNotificationConfig = (type: string) => {
    const configs = {
      achievement: {
        icon: Trophy,
        color: 'text-yellow-600',
        bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        sound: 'achievement'
      },
      level_up: {
        icon: Crown,
        color: 'text-purple-600',
        bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        sound: 'level_up'
      },
      streak: {
        icon: Flame,
        color: 'text-orange-600',
        bgColor: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        sound: 'streak'
      },
      mission_complete: {
        icon: Target,
        color: 'text-green-600',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
        sound: 'mission'
      },
      perfect_score: {
        icon: Star,
        color: 'text-cyan-600',
        bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20',
        borderColor: 'border-cyan-200 dark:border-cyan-800',
        sound: 'perfect'
      },
      points: {
        icon: Sparkles,
        color: 'text-indigo-600',
        bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20',
        borderColor: 'border-indigo-200 dark:border-indigo-800',
        sound: 'points'
      }
    };

    return configs[type as keyof typeof configs] || configs.points;
  };

  const config = getNotificationConfig(notification.type);
  const IconComponent = config.icon;

  const tierColors = {
    bronze: 'text-amber-700 bg-amber-100 border-amber-300',
    silver: 'text-gray-600 bg-gray-100 border-gray-300',
    gold: 'text-yellow-600 bg-yellow-100 border-yellow-300',
    legendary: 'text-purple-600 bg-purple-100 border-purple-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="relative"
    >
      <Card className={cn(
        "shadow-lg border-2",
        config.bgColor,
        config.borderColor,
        "animate-in slide-in-from-right-full duration-300"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              "p-2 rounded-full flex-shrink-0",
              config.color === 'text-yellow-600' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              config.color === 'text-purple-600' ? 'bg-purple-100 dark:bg-purple-900/30' :
              config.color === 'text-orange-600' ? 'bg-orange-100 dark:bg-orange-900/30' :
              config.color === 'text-green-600' ? 'bg-green-100 dark:bg-green-900/30' :
              config.color === 'text-cyan-600' ? 'bg-cyan-100 dark:bg-cyan-900/30' :
              'bg-indigo-100 dark:bg-indigo-900/30'
            )}>
              <IconComponent className={cn("h-5 w-5", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-sm leading-tight">
                {notification.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {notification.description}
              </div>

              {/* Achievement Details */}
              {notification.achievement && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{notification.achievement.title}</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        tierColors[notification.achievement.tier as keyof typeof tierColors]
                      )}
                    >
                      {notification.achievement.tier}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {notification.achievement.description}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                    <Star className="h-3 w-3" />
                    <span>{notification.achievement.points} points</span>
                  </div>
                </div>
              )}

              {/* Level Up Details */}
              {notification.type === 'level_up' && notification.level && (
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Crown className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-sm">Level {notification.level}</span>
                  </div>
                  {notification.points && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Star className="h-3 w-3" />
                      <span>+{notification.points} XP</span>
                    </div>
                  )}
                </div>
              )}

              {/* Points */}
              {notification.points && !notification.achievement && notification.type !== 'level_up' && (
                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1">
                  <Star className="h-3 w-3" />
                  <span>+{notification.points} points</span>
                </div>
              )}

              {/* Streak Info */}
              {notification.streak && (
                <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-1">
                  <Flame className="h-3 w-3" />
                  <span>{notification.streak} day streak!</span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sparkle Animation */}
      {['achievement', 'level_up', 'perfect_score'].includes(notification.type) && (
        <div className="absolute -inset-2 pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, 20, 40],
              y: [0, -10, -20],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="absolute top-2 right-0 w-1 h-1 bg-blue-400 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, -15, -30],
              y: [0, 5, 10],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute bottom-0 right-4 w-1.5 h-1.5 bg-green-400 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, 10, 20],
              y: [0, -5, -10],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: 1,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

// Hook to use gamification notifications
export function useGamificationNotifications() {
  const [notificationQueue, setNotificationQueue] = useState<NotificationData[]>([]);

  const showAchievementUnlocked = (achievement: any) => {
    const notification: NotificationData = {
      id: `achievement-${Date.now()}`,
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      description: 'You earned a new achievement!',
      achievement: {
        title: achievement.title,
        description: achievement.description,
        tier: achievement.tier,
        category: achievement.category,
        points: achievement.points
      }
    };
    setNotificationQueue(prev => [...prev, notification]);
  };

  const showLevelUp = (level: number, points: number) => {
    const notification: NotificationData = {
      id: `level-${Date.now()}`,
      type: 'level_up',
      title: '🌟 Level Up!',
      description: `Congratulations! You reached level ${level}!`,
      level,
      points
    };
    setNotificationQueue(prev => [...prev, notification]);
  };

  const showMissionComplete = (missionTitle: string, points: number) => {
    const notification: NotificationData = {
      id: `mission-${Date.now()}`,
      type: 'mission_complete',
      title: '✅ Mission Complete!',
      description: `${missionTitle} completed!`,
      points,
      autoClose: true,
      duration: 3000
    };
    setNotificationQueue(prev => [...prev, notification]);
  };

  const showStreakAchieved = (streak: number) => {
    const notification: NotificationData = {
      id: `streak-${Date.now()}`,
      type: 'streak',
      title: '🔥 Streak Achievement!',
      description: `Amazing! You maintained a ${streak}-day streak!`,
      streak
    };
    setNotificationQueue(prev => [...prev, notification]);
  };

  const showPerfectScore = (points: number) => {
    const notification: NotificationData = {
      id: `perfect-${Date.now()}`,
      type: 'perfect_score',
      title: '⭐ Perfect Score!',
      description: 'Outstanding! You scored 100%!',
      points
    };
    setNotificationQueue(prev => [...prev, notification]);
  };

  const showPointsEarned = (points: number, reason: string) => {
    const notification: NotificationData = {
      id: `points-${Date.now()}`,
      type: 'points',
      title: '💎 Points Earned!',
      description: reason,
      points,
      autoClose: true,
      duration: 2000
    };
    setNotificationQueue(prev => [...prev, notification]);
  };

  return {
    showAchievementUnlocked,
    showLevelUp,
    showMissionComplete,
    showStreakAchieved,
    showPerfectScore,
    showPointsEarned,
    notificationQueue,
    clearNotifications: () => setNotificationQueue([])
  };
}}