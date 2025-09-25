'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Brain, Sparkles, Zap, Clock, Users, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type NotificationType = 'recommendation' | 'reminder' | 'alert' | 'achievement';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  actions?: {
    label: string;
    action: () => void;
  }[];
  autoHide?: boolean;
  duration?: number;
}

function NotificationItem({
  notification,
  onDismiss
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.autoHide && notification.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notification.id), 300);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'recommendation':
        return <Brain className="h-4 w-4 text-blue-600" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'alert':
        return <Zap className="h-4 w-4 text-red-600" />;
      case 'achievement':
        return <Sparkles className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getGradient = () => {
    switch (notification.type) {
      case 'recommendation':
        return 'from-blue-500/10 to-purple-500/10 border-blue-200/50';
      case 'reminder':
        return 'from-orange-500/10 to-yellow-500/10 border-orange-200/50';
      case 'alert':
        return 'from-red-500/10 to-pink-500/10 border-red-200/50';
      case 'achievement':
        return 'from-yellow-500/10 to-orange-500/10 border-yellow-200/50';
      default:
        return 'from-gray-500/10 to-gray-600/10 border-gray-200/50';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-r ${getGradient()} border rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden`}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent animate-pulse" />

          <div className="relative flex items-start gap-3">
            <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              {getIcon()}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <Badge
                    variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.priority}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onDismiss(notification.id), 300);
                  }}
                  className="h-6 w-6 p-0 hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">{notification.message}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {notification.timestamp.toLocaleTimeString()}
                </span>

                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={action.action}
                        className="text-xs h-7"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ZoomNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simulate AI-powered notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'recommendation',
        title: 'Clase Óptima Detectada',
        message: 'Tu próxima clase de Matemáticas está programada para las 3:00 PM. Te recomendamos unirte 5 minutos antes.',
        timestamp: new Date(),
        priority: 'medium',
        actions: [
          { label: 'Ver Clase', action: () => console.log('View class') },
          { label: 'Recordatorio', action: () => console.log('Set reminder') }
        ],
        autoHide: false
      },
      {
        id: '2',
        type: 'achievement',
        title: '¡Racha de Asistencia!',
        message: 'Has asistido a 5 clases consecutivas. ¡Mantén el momentum!',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        priority: 'low',
        actions: [{ label: 'Ver Progreso', action: () => console.log('View progress') }],
        autoHide: true,
        duration: 10000
      },
      {
        id: '3',
        type: 'reminder',
        title: 'Material de Estudio Disponible',
        message: 'Nuevo material de estudio para tu clase de Física ha sido compartido.',
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        priority: 'medium',
        actions: [{ label: 'Descargar', action: () => console.log('Download material') }],
        autoHide: false
      }
    ];

    // Add notifications with delay for demo effect
    mockNotifications.forEach((notification, index) => {
      setTimeout(() => {
        setNotifications(prev => [...prev, notification]);
      }, index * 1000);
    });

    // Simulate real-time notification
    const interval = setInterval(() => {
      const liveNotification: Notification = {
        id: Date.now().toString(),
        type: 'alert',
        title: 'Clase en Vivo',
        message: 'La clase de Historia está comenzando ahora. ¡No te la pierdas!',
        timestamp: new Date(),
        priority: 'high',
        actions: [{ label: 'Unirse Ahora', action: () => console.log('Join live class') }],
        autoHide: true,
        duration: 15000
      };

      setNotifications(prev => [liveNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// AI Assistant Chat Component
export function ZoomAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai' as const,
      message: '¡Hola! Soy tu asistente IA para clases en vivo. ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }
  ]);

  const quickActions = [
    { label: 'Próxima clase', action: () => console.log('Next class') },
    { label: 'Unirme a Zoom', action: () => console.log('Join Zoom') },
    { label: 'Material de estudio', action: () => console.log('Study material') },
    { label: 'Mi progreso', action: () => console.log('My progress') }
  ];

  return (
    <>
      {/* Floating AI Assistant Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Brain className="h-6 w-6 text-white" />
          </motion.div>
        </Button>

        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20" />
      </motion.div>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Asistente IA</h3>
                  <p className="text-sm text-muted-foreground">Siempre listo para ayudar</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 max-h-60 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'ai'
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 text-blue-900 dark:text-blue-100'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={action.action}
                    className="text-xs hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}