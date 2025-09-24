'use client';

import { motion } from 'framer-motion';
import { Play, Star, Users, BookOpen } from 'lucide-react';

import { AuroraBackground } from '@/components/ui/aurora-background';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-5xl mx-auto"
        >
          <Badge className="mb-6 bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
            🚀 Plataforma de Educación Virtual Premium
          </Badge>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-deep-blue mb-8 leading-tight">
            Excelencia académica
            <br />
            <span className="text-accent">meets</span> tecnología
            <br />
            <span className="text-sage">avanzada</span>
          </h1>

          <p className="text-xl md:text-2xl text-sage max-w-3xl mx-auto mb-12 leading-relaxed">
            Transforma tu preparación preuniversitaria con clases virtuales interactivas, profesores
            expertos y una plataforma diseñada para tu éxito académico.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-cream px-8 py-4 text-lg font-semibold rounded-full"
            >
              Comenzar Prueba Gratuita
              <Play className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-cream px-8 py-4 text-lg rounded-full bg-transparent"
            >
              Ver Demo en Vivo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-deep-blue mb-2">+5,000 Estudiantes</h3>
              <p className="text-sage">Confiando en nuestra plataforma</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-deep-blue mb-2">98% Satisfacción</h3>
              <p className="text-sage">Calificación promedio de estudiantes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-deep-blue mb-2">50+ Cursos</h3>
              <p className="text-sage">Materias especializadas disponibles</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
