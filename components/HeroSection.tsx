"use client";

import { motion } from 'framer-motion'
import { Play, Star, Users, BookOpen } from 'lucide-react'
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { Button } from "@/components/ui/button"
import { withMinimalErrorHandling } from '@/lib/core/auto-error-enhancement'

function HeroSectionInternal() {

  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] items-center justify-center pt-24 pb-16 sm:pt-28 sm:pb-24"
    >
      <ShaderAnimation />
      
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mx-auto max-w-4xl text-center md:max-w-5xl"
        >
          <h1 className="mb-8 font-serif text-4xl font-bold leading-tight text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
            Excelencia <span className="text-purple-300 drop-shadow-lg">académica</span>
            <br />
            <span className="text-amber/90 drop-shadow-lg">con</span> tecnología
            <br />
            <span className="text-amber drop-shadow-lg">avanzada</span>
          </h1>

          <p className="mx-auto mb-12 max-w-3xl text-base leading-relaxed text-cream/90 drop-shadow-xl sm:text-lg md:text-xl">
            Transforma tu preparación preuniversitaria con clases virtuales interactivas, profesores
            expertos y una plataforma diseñada para tu éxito académico.
          </p>

          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Button
              size="lg"
              className="rounded-full bg-golden px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-golden/90 hover:shadow-golden/25"
            >
              Comenzar Prueba Gratuita
              <Play className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-amber/60 bg-amber/10 px-8 py-4 text-lg text-amber backdrop-blur-sm shadow-xl transition-all duration-300 hover:scale-105 hover:bg-amber hover:text-deep-brown hover:shadow-amber/25"
            >
              Ver Demo en Vivo
            </Button>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-golden/20 shadow-xl sm:h-16 sm:w-16">
                <Users className="h-7 w-7 text-golden sm:h-8 sm:w-8" />
              </div>
              <h3 className="mb-2 font-semibold text-white drop-shadow-lg">+5,000 Estudiantes</h3>
              <p className="text-sm text-cream/90 drop-shadow-lg sm:text-base">Confiando en nuestra plataforma</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber/20 shadow-xl sm:h-16 sm:w-16">
                <Star className="h-7 w-7 text-amber sm:h-8 sm:w-8" />
              </div>
              <h3 className="mb-2 font-semibold text-white drop-shadow-lg">98% Satisfacción</h3>
              <p className="text-sm text-cream/90 drop-shadow-lg sm:text-base">Calificación promedio de estudiantes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bronze/20 shadow-xl sm:h-16 sm:w-16">
                <BookOpen className="h-7 w-7 text-bronze sm:h-8 sm:w-8" />
              </div>
              <h3 className="mb-2 font-semibold text-white drop-shadow-lg">50+ Cursos</h3>
              <p className="text-sm text-cream/90 drop-shadow-lg sm:text-base">Materias especializadas disponibles</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export const HeroSection = withMinimalErrorHandling(HeroSectionInternal, {
  componentName: 'HeroSection',
  showFallback: true
});
