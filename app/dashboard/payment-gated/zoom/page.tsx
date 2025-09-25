'use client';

import { useUser } from '@clerk/nextjs';
import { GraduationCap, Brain, Zap, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

import ErrorBoundary from '@/components/ErrorBoundary';
import ZoomDashboard from '@/components/zoom/ZoomDashboard';
import ZoomNotifications, { ZoomAIAssistant } from '@/components/zoom/ZoomNotifications';

export default function ZoomPaidPage() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) return null;

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen">
        {/* AI-inspired background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-cyan-950/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-200/20 to-blue-200/20 dark:from-purple-800/10 dark:to-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-200/20 to-green-200/20 dark:from-cyan-800/10 dark:to-green-800/10 rounded-full blur-3xl" />

        {/* Floating AI elements */}
        <div className="absolute top-20 left-10 animate-float">
          <Brain className="h-6 w-6 text-purple-400/60" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Sparkles className="h-5 w-5 text-cyan-400/60" />
        </div>
        <div className="absolute bottom-32 left-20 animate-float">
          <Activity className="h-4 w-4 text-green-400/60" />
        </div>

        <div className="relative px-4 lg:px-6 space-y-8 py-8">
          {/* Enhanced header with AI vibes */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-30" />
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Aula Inteligente en Vivo
                  </h1>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </motion.div>
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Conecta con IA avanzada, profesores expertos y compañeros en clases interactivas
                </p>
              </div>
            </div>

            {/* AI-powered features preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl"
            >
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Análisis Predictivo</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sugerencias inteligentes basadas en tu rendimiento
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Monitoreo en Tiempo Real</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Estadísticas y participación actualizada al instante
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-green-500/10 border border-cyan-200/50 dark:border-cyan-800/50 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm font-medium">Experiencia Adaptativa</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contenido personalizado según tu nivel de aprendizaje
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Main dashboard with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ZoomDashboard />
          </motion.div>
        </div>

        {/* AI-Powered Notifications */}
        <ZoomNotifications />

        {/* AI Assistant */}
        <ZoomAIAssistant />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </ErrorBoundary>
  );
}
