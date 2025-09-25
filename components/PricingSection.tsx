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
      name: 'Premium',
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
        'Todo lo incluido en Premium',
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
    <section id="pricing" className="py-24 bg-background/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Invierte en tu <span className="text-accent">futuro</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y objetivos académicos. Todos
            incluyen garantía de satisfacción de 30 días.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-golden to-amber text-white px-4 py-1 z-10 shadow-lg">
                  <Star className="w-4 h-4 mr-1" />
                  Más Popular
                </Badge>
              )}

              <Card
                className={`p-8 h-full relative ${
                  plan.popular
                    ? 'bg-card border-golden border-2 shadow-2xl scale-105 shadow-golden/10'
                    : 'bg-card/70 backdrop-blur-sm border-border/50 shadow-lg'
                } hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="text-center mb-8">
                  <h3 className="font-serif text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-serif text-5xl font-bold text-card-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-golden flex-shrink-0 mt-0.5" />
                      <span className="text-card-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-golden to-amber hover:from-golden/90 hover:to-amber/90 text-white shadow-xl hover:shadow-golden/25'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25'
                  } transition-all duration-300 hover:scale-105`}
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
          <p className="text-muted-foreground text-sm">
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
