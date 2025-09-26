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
    <section id="contact" className="bg-background/50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            Contáctanos
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            Estamos aquí para ayudarte en tu camino hacia el éxito académico. No dudes en
            comunicarte con nosotros.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-5">
          {contactInfo.map((contact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card/70 p-5 text-center transition-all duration-300 hover:shadow-xl backdrop-blur-sm sm:p-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 sm:h-12 sm:w-12">
                    <contact.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-2">{contact.label}</h3>
                    {contact.href !== '#' ? (
                      <a
                        href={contact.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-accent sm:text-base"
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
                      <span className="text-sm text-muted-foreground sm:text-base">{contact.value}</span>
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
