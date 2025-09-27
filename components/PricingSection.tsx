'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

function PricingSectionInternal() {
  const plans = [
    {
      name: 'Básico',
      price: '$49',
      period: '/mes',
      description: 'Perfecto para comenzar tu preparación',
      features: [
        'Acceso a 20 cursos básicos',
        'Clases grupales (máx. 15 estudiantes)',
        'Material de estudio digital',
        'Soporte por email',
        'Grabaciones por 30 días',
      ],
      popular: false,
    },
    {
      name: <span className="text-rose-400">Premium</span>,
      price: '$89',
      period: '/mes',
      description: 'La opción más popular entre estudiantes',
      features: [
        'Acceso completo a todos los cursos',
        'Clases grupales + 2 tutorías mensuales',
        'Biblioteca digital completa',
        'Seguimiento académico personalizado',
        'Grabaciones ilimitadas',
        'Simulacros de examen',
        'Soporte prioritario 24/7',
      ],
      popular: true,
    },
    {
      name: 'Elite',
      price: '$149',
      period: '/mes',
      description: 'Máximo nivel de preparación y atención',
      features: [
        'Todo lo incluido en <span className="text-rose-400">Premium</span>',
        'Tutorías ilimitadas 1:1',
        'Plan de estudio personalizado',
        'Mentor académico asignado',
        'Acceso a cursos avanzados',
        'Preparación para becas',
        'Garantía de admisión*',
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="bg-background/50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Invierte en tu <span className="text-accent">futuro</span>
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            Elige el plan que mejor se adapte a tus necesidades y objetivos académicos. Todos
            incluyen garantía de satisfacción de 30 días.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 transform bg-gradient-to-r from-golden to-amber px-3 py-1 text-white shadow-lg">
                  <Star className="mr-1 h-4 w-4" />
                  Más Popular
                </Badge>
              )}

              <Card
                className={`relative h-full p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:p-8 ${
                  plan.popular
                    ? 'border-2 border-golden bg-card shadow-2xl shadow-golden/10'
                    : 'border-border/50 bg-card/70 shadow-lg backdrop-blur-sm'
                }`}
              >
                <div className="mb-8 text-center">
                  <h3 className="mb-2 font-serif text-xl font-bold text-card-foreground sm:text-2xl">
                    {plan.name}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground sm:text-base">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-serif text-4xl font-bold text-card-foreground sm:text-5xl">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="mb-8 space-y-3 sm:space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-golden" />
                      <span className="text-sm text-card-foreground sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-golden to-amber text-white shadow-xl hover:from-golden/90 hover:to-amber/90 hover:shadow-golden/25'
                      : 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/25'
                  }`}
                  size="lg"
                >
                  Comenzar {plan.name}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-xs text-muted-foreground sm:text-sm">
            * Garantía de admisión aplica bajo términos y condiciones específicos.
            <br />
            Todos los planes incluyen período de prueba gratuito de 7 días.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <ComponentErrorBoundary context="PricingSection">
      <PricingSectionInternal />
    </ComponentErrorBoundary>
  );
}
