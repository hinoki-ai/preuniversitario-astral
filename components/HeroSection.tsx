"use client";

import { motion } from 'framer-motion'
import { Play, Star, Users, BookOpen } from 'lucide-react'
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <ShaderAnimation />
      
      <div className="container mx-auto px-6 pt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-5xl mx-auto"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
            Excelencia académica
            <br />
            <span className="text-blue-200">con</span> tecnología
            <br />
            <span className="text-slate-200">avanzada</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-md">
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
              className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg rounded-full bg-white/10 backdrop-blur-sm"
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
              <h3 className="font-semibold text-white mb-2 drop-shadow-sm">+5,000 Estudiantes</h3>
              <p className="text-slate-200 drop-shadow-sm">Confiando en nuestra plataforma</p>
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
              <h3 className="font-semibold text-white mb-2 drop-shadow-sm">98% Satisfacción</h3>
              <p className="text-slate-200 drop-shadow-sm">Calificación promedio de estudiantes</p>
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
              <h3 className="font-semibold text-white mb-2 drop-shadow-sm">50+ Cursos</h3>
              <p className="text-slate-200 drop-shadow-sm">Materias especializadas disponibles</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
