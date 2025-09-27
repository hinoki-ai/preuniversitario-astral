'use client';

import { motion } from 'framer-motion';

import {
  Video,
  Users,
  BookOpen,
  BarChart3,
  MessageSquare,
  Calendar,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

function FeaturesSectionInternal() {
  const features = [
    {
      icon: Video,
      title: 'Clases Virtuales HD',
      description:
        'Experiencia de aprendizaje inmersiva con video de alta calidad y audio cristalino.',
      benefits: ['Grabaciones disponibles 24/7', 'Pizarra interactiva', 'Compartir pantalla'],
    },
    {
      icon: Users,
      title: 'Grupos Reducidos',
      description:
        'Máximo 15 estudiantes por clase para atención personalizada y mejor aprendizaje.',
      benefits: ['Atención individualizada', 'Participación activa', 'Networking estudiantil'],
    },
    {
      icon: BarChart3,
      title: 'Seguimiento Académico',
      description: 'Dashboard completo para monitorear tu progreso y identificar áreas de mejora.',
      benefits: ['Reportes detallados', 'Métricas de rendimiento', 'Alertas tempranas'],
    },
    {
      icon: MessageSquare,
      title: 'Tutoría Personalizada',
      description: 'Sesiones uno a uno con profesores expertos para resolver dudas específicas.',
      benefits: ['Horarios flexibles', 'Profesores especializados', 'Material exclusivo'],
    },
    {
      icon: BookOpen,
      title: 'Biblioteca Digital',
      description:
        'Acceso ilimitado a recursos educativos, libros digitales y material de estudio.',
      benefits: ['Miles de recursos', 'Búsqueda avanzada', 'Descarga offline'],
    },
    {
      icon: Calendar,
      title: 'Planificación Inteligente',
      description: 'Sistema de calendario que se adapta a tu horario y objetivos académicos.',
      benefits: ['Recordatorios automáticos', 'Sincronización móvil', 'Metas personalizadas'],
    },
  ];

  return (
    <section id="features" className="bg-background/50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            <span className="text-teal-400">Tecnología</span> al servicio de
            <br />
            <span className="text-accent">tu educación</span>
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            Descubre cómo nuestra plataforma revoluciona la experiencia de aprendizaje con
            herramientas diseñadas para maximizar tu potencial académico.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="group h-full bg-card/90 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-golden/10 backdrop-blur-sm sm:p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-golden/15 to-amber/10 shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16">
                  <feature.icon className="h-7 w-7 text-golden sm:h-8 sm:w-8" />
                </div>

                <h3 className="mb-4 font-serif text-xl font-bold text-card-foreground sm:text-2xl">
                  {feature.title}
                </h3>

                <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {feature.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-card-foreground">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-golden" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="ghost"
                  className="w-full justify-between text-golden transition-transform duration-300 hover:bg-golden/10 hover:text-golden group-hover:translate-x-1"
                >
                  Explorar función
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <ComponentErrorBoundary context="FeaturesSection">
      <FeaturesSectionInternal />
    </ComponentErrorBoundary>
  );
}
