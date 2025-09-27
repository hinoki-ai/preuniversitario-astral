'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

import { Card } from '@/components/ui/card';

function TestimonialsSectionInternal() {
  const testimonials = [
    {
      name: 'María González',
      role: 'Estudiante de Medicina - Universidad Nacional',
      content:
        'Gracias a Preuniversitario Astral logré ingresar a la carrera de mis sueños. Las clases virtuales son increíbles y los profesores realmente se preocupan por cada estudiante.',
      rating: 5,
      image: '/placeholder-l9kgf.png',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Estudiante de Ingeniería - Universidad Católica',
      content:
        'La plataforma es súper intuitiva y el seguimiento académico me ayudó a identificar mis debilidades. Mejoré mis notas en un 40% en solo 3 meses.',
      rating: 5,
      image: '/placeholder-rvwee.png',
    },
    {
      name: 'Ana Martínez',
      role: 'Estudiante de Derecho - Universidad de Chile',
      content:
        'Lo que más me gustó fueron las tutorías personalizadas. Poder resolver mis dudas específicas con profesores expertos marcó la diferencia en mi preparación.',
      rating: 5,
      image: '/student-ana.jpg',
    },
  ];

  return (
    <section id="testimonials" className="bg-background/50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Historias de <span className="text-accent">éxito</span>
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            Conoce las experiencias de estudiantes que lograron sus metas <span className="text-violet-400">académicas</span> con nuestra
            plataforma educativa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card/70 p-6 transition-all duration-300 hover:shadow-xl backdrop-blur-sm sm:p-8">
                <div className="mb-6 flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>

                <Quote className="mb-4 h-8 w-8 text-accent/30" />

                <p className="mb-6 text-sm italic leading-relaxed text-muted-foreground sm:text-base">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.image || '/placeholder.svg'}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-card-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <ComponentErrorBoundary context="TestimonialsSection">
      <TestimonialsSectionInternal />
    </ComponentErrorBoundary>
  );
}
