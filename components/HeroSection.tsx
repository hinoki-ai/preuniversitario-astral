"use client";

import { motion } from 'framer-motion'
import { Play, Star, Users, BookOpen } from 'lucide-react'
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { Button } from "@/components/ui/button"
import { withMinimalErrorHandling } from '@/lib/core/auto-error-enhancement'
import { useEffect, useRef } from 'react'

function HeroSectionInternal() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          // Set volume to a reasonable level
          audioRef.current.volume = 0.3;
          await audioRef.current.play();
        } catch (error) {
          console.log('Audio autoplay prevented by browser:', error);
          // Could add a play button fallback here if needed
        }
      }
    };

    playAudio();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src="/landing.mp3"
        loop
        preload="auto"
        className="hidden"
      />

      <ShaderAnimation />
      
      <div className="container mx-auto px-6 pt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-5xl mx-auto"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight drop-shadow-2xl">
            Excelencia académica
            <br />
            <span className="text-amber/90 drop-shadow-lg">con</span> tecnología
            <br />
            <span className="text-golden/80 drop-shadow-lg">avanzada</span>
          </h1>

          <p className="text-xl md:text-2xl text-cream/90 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-xl">
            Transforma tu preparación preuniversitaria con clases virtuales interactivas, profesores
            expertos y una plataforma diseñada para tu éxito académico.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-golden hover:bg-golden/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-golden/25 transition-all duration-300 hover:scale-105"
            >
              Comenzar Prueba Gratuita
              <Play className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-amber/60 text-amber bg-amber/10 hover:bg-amber hover:text-deep-brown px-8 py-4 text-lg rounded-full backdrop-blur-sm shadow-xl hover:shadow-amber/25 transition-all duration-300 hover:scale-105"
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
              <div className="w-16 h-16 bg-golden/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Users className="w-8 h-8 text-golden" />
              </div>
              <h3 className="font-semibold text-white mb-2 drop-shadow-lg">+5,000 Estudiantes</h3>
              <p className="text-cream/90 drop-shadow-lg">Confiando en nuestra plataforma</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-amber/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Star className="w-8 h-8 text-amber" />
              </div>
              <h3 className="font-semibold text-white mb-2 drop-shadow-lg">98% Satisfacción</h3>
              <p className="text-cream/90 drop-shadow-lg">Calificación promedio de estudiantes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-bronze/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <BookOpen className="w-8 h-8 text-bronze" />
              </div>
              <h3 className="font-semibold text-white mb-2 drop-shadow-lg">50+ Cursos</h3>
              <p className="text-cream/90 drop-shadow-lg">Materias especializadas disponibles</p>
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
