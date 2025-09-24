"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Video, Users, BookOpen, BarChart3, MessageSquare, Calendar, ArrowRight, CheckCircle } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Video,
      title: "Clases Virtuales HD",
      description: "Experiencia de aprendizaje inmersiva con video de alta calidad y audio cristalino.",
      benefits: ["Grabaciones disponibles 24/7", "Pizarra interactiva", "Compartir pantalla"],
    },
    {
      icon: Users,
      title: "Grupos Reducidos",
      description: "Máximo 15 estudiantes por clase para atención personalizada y mejor aprendizaje.",
      benefits: ["Atención individualizada", "Participación activa", "Networking estudiantil"],
    },
    {
      icon: BarChart3,
      title: "Seguimiento Académico",
      description: "Dashboard completo para monitorear tu progreso y identificar áreas de mejora.",
      benefits: ["Reportes detallados", "Métricas de rendimiento", "Alertas tempranas"],
    },
    {
      icon: MessageSquare,
      title: "Tutoría Personalizada",
      description: "Sesiones uno a uno con profesores expertos para resolver dudas específicas.",
      benefits: ["Horarios flexibles", "Profesores especializados", "Material exclusivo"],
    },
    {
      icon: BookOpen,
      title: "Biblioteca Digital",
      description: "Acceso ilimitado a recursos educativos, libros digitales y material de estudio.",
      benefits: ["Miles de recursos", "Búsqueda avanzada", "Descarga offline"],
    },
    {
      icon: Calendar,
      title: "Planificación Inteligente",
      description: "Sistema de calendario que se adapta a tu horario y objetivos académicos.",
      benefits: ["Recordatorios automáticos", "Sincronización móvil", "Metas personalizadas"],
    },
  ]

  return (
    <section id="features" className="py-24 bg-white/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-deep-blue mb-6">
            Tecnología al servicio de
            <br />
            <span className="text-accent">tu educación</span>
          </h2>
          <p className="text-xl text-sage max-w-3xl mx-auto">
            Descubre cómo nuestra plataforma revoluciona la experiencia de aprendizaje con herramientas diseñadas para
            maximizar tu potencial académico.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full bg-white/70 backdrop-blur-sm border-sage/20 hover:shadow-xl transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-deep-blue/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>

                <h3 className="font-serif text-2xl font-bold text-deep-blue mb-4">{feature.title}</h3>

                <p className="text-sage mb-6 leading-relaxed">{feature.description}</p>

                <ul className="space-y-3 mb-6">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-deep-blue">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <Button
                  variant="ghost"
                  className="w-full justify-between text-accent hover:text-accent hover:bg-accent/10 group-hover:translate-x-1 transition-transform duration-300"
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
  )
}
