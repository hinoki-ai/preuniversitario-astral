'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

import { Card } from '@/components/ui/card';

export function TestimonialsSection() {
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
    <section id="testimonials" className="py-24 bg-background/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Historias de <span className="text-accent">éxito</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conoce las experiencias de estudiantes que lograron sus metas académicas con nuestra
            plataforma educativa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full bg-card/70 backdrop-blur-sm border-border/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-accent/30 mb-4" />

                <p className="text-muted-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image || '/placeholder.svg'}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
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
