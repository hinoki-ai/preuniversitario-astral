'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

function StatsSectionInternal() {
  const stats = [
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Tasa de aprobación',
      description: 'de estudiantes en exámenes de admisión',
      color: 'text-accent',
    },
    {
      icon: Clock,
      value: '24/7',
      label: 'Acceso a plataforma',
      description: 'Estudia cuando y donde quieras',
      color: 'text-deep-blue',
    },
    {
      icon: Target,
      value: '85%',
      label: 'Mejora promedio',
      description: 'en calificaciones de estudiantes',
      color: 'text-accent',
    },
    {
      icon: Award,
      value: '15+',
      label: 'Años de experiencia',
      description: 'formando futuros profesionales',
      color: 'text-deep-blue',
    },
  ];

  return (
    <section id="stats" className="bg-background/50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Resultados que hablan por sí solos
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            Nuestros números reflejan el compromiso con la <span className="text-violet-400">excelencia</span> educativa y el éxito de
            nuestros estudiantes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 p-6 text-center transition-all duration-300 hover:shadow-lg backdrop-blur-sm sm:p-8">
                <div
                  className={`mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent/10 to-deep-blue/10 shadow-md sm:h-16 sm:w-16`}
                >
                  <stat.icon className={`h-7 w-7 ${stat.color} sm:h-8 sm:w-8`} />
                </div>
                <h3 className="mb-2 font-serif text-3xl font-bold text-card-foreground sm:text-4xl">
                  {stat.value}
                </h3>
                <h4 className="mb-2 font-semibold text-card-foreground">{stat.label}</h4>
                <p className="text-sm text-muted-foreground sm:text-base">{stat.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <ComponentErrorBoundary context="StatsSection">
      <StatsSectionInternal />
    </ComponentErrorBoundary>
  );
}
