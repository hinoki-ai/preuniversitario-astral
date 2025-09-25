'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, Globe, MapPin, Instagram } from 'lucide-react';

import { Card } from '@/components/ui/card';

export function ContactSection() {
  const contactInfo = [
    {
      icon: Phone,
      label: 'Teléfono',
      value: '+56934349595',
      href: 'tel:+56934349595',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'contacto@preuastral.cl',
      href: 'mailto:contacto@preuastral.cl',
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: '@preuastral',
      href: 'https://instagram.com/preuastral',
    },
    {
      icon: Globe,
      label: 'Sitio Web',
      value: 'www.preuastral.cl',
      href: 'https://www.preuastral.cl',
    },
    {
      icon: MapPin,
      label: 'Ubicación',
      value: 'Chile',
      href: '#',
    },
  ];

  return (
    <section id="contact" className="py-24 bg-background/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Contáctanos
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Estamos aquí para ayudarte en tu camino hacia el éxito académico. No dudes en
            comunicarte con nosotros.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {contactInfo.map((contact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center bg-card/70 backdrop-blur-sm border-border/20 hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <contact.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">{contact.label}</h3>
                    {contact.href !== '#' ? (
                      <a
                        href={contact.href}
                        className="text-muted-foreground hover:text-accent transition-colors"
                        target={
                          contact.label === 'Sitio Web' || contact.label === 'Instagram'
                            ? '_blank'
                            : undefined
                        }
                        rel={
                          contact.label === 'Sitio Web' || contact.label === 'Instagram'
                            ? 'noopener noreferrer'
                            : undefined
                        }
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{contact.value}</span>
                    )}
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
