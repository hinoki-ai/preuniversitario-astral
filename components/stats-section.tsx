"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { TrendingUp, Clock, Target, Award } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: TrendingUp,
      value: "95%",
      label: "Tasa de aprobación",
      description: "de estudiantes en exámenes de admisión",
      color: "text-accent",
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Acceso a plataforma",
      description: "Estudia cuando y donde quieras",
      color: "text-deep-blue",
    },
    {
      icon: Target,
      value: "85%",
      label: "Mejora promedio",
      description: "en calificaciones de estudiantes",
      color: "text-accent",
    },
    {
      icon: Award,
      value: "15+",
      label: "Años de experiencia",
      description: "formando futuros profesionales",
      color: "text-deep-blue",
    },
  ]

  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-deep-blue mb-6">
            Resultados que hablan por sí solos
          </h2>
          <p className="text-xl text-sage max-w-3xl mx-auto">
            Nuestros números reflejan el compromiso con la excelencia educativa y el éxito de nuestros estudiantes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 text-center bg-white/50 backdrop-blur-sm border-sage/20 hover:shadow-lg transition-all duration-300">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br from-accent/10 to-deep-blue/10 flex items-center justify-center mx-auto mb-6`}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <h3 className="font-serif text-4xl font-bold text-deep-blue mb-2">{stat.value}</h3>
                <h4 className="font-semibold text-deep-blue mb-2">{stat.label}</h4>
                <p className="text-sage text-sm">{stat.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
