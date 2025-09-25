'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Sparkles, Brain, Activity, Zap } from 'lucide-react';

import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BasicSchedule from '@/components/zoom/BasicSchedule';
import TeacherPanel from '@/components/zoom/TeacherPanel';
import ZoomJoinClient from '@/components/zoom/ZoomJoinClient';

type Selected = {
  meetingNumber?: string;
  passcode?: string;
};

function ZoomDashboardInternal() {
  const [selected, setSelected] = useState<Selected | null>(null);

  return (
    <div className="space-y-8">
      {/* AI-Powered Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
              <div className="text-xs text-muted-foreground">Clases este mes</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">247</div>
              <div className="text-xs text-muted-foreground">Estudiantes activos</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-green-500/10 border border-cyan-200/50 dark:border-cyan-800/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">94%</div>
              <div className="text-xs text-muted-foreground">Tasa de asistencia</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-200/50 dark:border-yellow-800/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Brain className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">AI</div>
              <div className="text-xs text-muted-foreground">Optimizado</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 lg:col-span-2"
        >
          {/* Enhanced Schedule Card */}
          <Card className="p-6 space-y-4 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Agenda Inteligente de Clases</h3>
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecciona una clase para autocompletar el formulario de Zoom con IA predictiva
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="h-5 w-5 text-yellow-500" />
              </motion.div>
            </div>
            <BasicSchedule
              onPick={m => setSelected({ meetingNumber: m.meetingNumber, passcode: m.passcode })}
            />
          </Card>

          {/* Teacher Panel with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TeacherPanel />
          </motion.div>
        </motion.div>

        {/* Enhanced Join Client */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-6">
            <ZoomJoinClient
              initialMeetingNumber={selected?.meetingNumber}
              initialPasscode={selected?.passcode}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ZoomDashboard() {
  return (
    <ComponentErrorBoundary context="ZoomDashboard">
      <ZoomDashboardInternal />
    </ComponentErrorBoundary>
  );
}
