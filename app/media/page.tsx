'use client';

import { useEffect, useState } from 'react';

import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface MediaAbout {
  overview: string;
  features: string[];
  conclusion: string;
}

interface MediaEntry {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

type MediaContentCollection = Record<string, MediaEntry>;

const mediaGallery: MediaContentCollection = {
  clases: {
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with actual educational video
    poster: '/placeholder.jpg',
    background: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920&auto=format&fit=crop',
    title: 'Clases Interactivas Online',
    date: 'Educación Premium',
    scrollToExpand: 'Desplaza para explorar',
    about: {
       overview: 'Nuestras clases en vivo ofrecen una experiencia educativa inmersiva con profesores expertos. Cada sesión está diseñada para maximizar tu aprendizaje y preparación para la PAES.',
      features: [
        'Clases en vivo con interacción en tiempo real',
        'Profesores especializados en PAES',
        'Material de apoyo descargable',
        'Grabaciones disponibles para repaso',
      ],
      conclusion: 'Únete a miles de estudiantes que han mejorado sus resultados con nuestro método probado de enseñanza.',
    },
  },
  laboratorio: {
    src: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1280&auto=format&fit=crop',
    background: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1920&auto=format&fit=crop',
    title: 'Laboratorio Virtual Ciencias',
    date: 'Experimenta y Aprende',
    scrollToExpand: 'Desplaza para descubrir',
    about: {
      overview: 'Explora conceptos científicos complejos a través de nuestro laboratorio virtual interactivo. Realiza experimentos sin límites y comprende la ciencia de manera práctica.',
      features: [
        'Simulaciones interactivas de física y química',
        'Experimentos virtuales seguros',
        'Visualización 3D de conceptos',
        'Práctica ilimitada sin restricciones',
      ],
      conclusion: 'Transforma tu manera de aprender ciencias con tecnología de vanguardia.',
    },
  },
  matematicas: {
    src: 'https://www.youtube.com/watch?v=9bZkp7q19f0', // Replace with math tutorial video
    poster: '/placeholder.jpg',
    background: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1920&auto=format&fit=crop',
    title: 'Matemáticas Visuales',
    date: 'Aprende con Claridad',
    scrollToExpand: 'Desplaza para explorar',
    about: {
      overview: 'Domina las matemáticas con nuestro enfoque visual único. Desde álgebra hasta cálculo, hacemos que los conceptos más complejos sean fáciles de entender.',
      features: [
        'Gráficos interactivos y animaciones',
        'Resolución paso a paso',
        'Ejercicios adaptativos',
        'Retroalimentación instantánea',
      ],
      conclusion: 'Convierte las matemáticas en tu fortaleza con nuestro método innovador.',
    },
  },
  estudiantes: {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1280&auto=format&fit=crop',
    background: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1920&auto=format&fit=crop',
    title: 'Comunidad Estudiantil',
    date: 'Aprende en Equipo',
    scrollToExpand: 'Desplaza para conocer más',
    about: {
      overview: 'Forma parte de una comunidad vibrante de estudiantes motivados. Comparte experiencias, resuelve dudas y alcanza tus metas junto a otros que comparten tu objetivo.',
      features: [
        'Grupos de estudio colaborativo',
        'Foros de discusión moderados',
        'Mentorías entre pares',
        'Eventos y competencias académicas',
      ],
      conclusion: 'El éxito se construye mejor en comunidad. Únete a la nuestra.',
    },
  },
  testimonios: {
    src: 'https://www.youtube.com/watch?v=FTociictyyE', // Replace with testimonial video
    poster: '/placeholder.jpg',
    background: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop',
    title: 'Historias de Éxito',
    date: 'Resultados Reales',
    scrollToExpand: 'Desplaza para inspirarte',
    about: {
      overview: 'Conoce las historias de estudiantes que lograron sus objetivos con nuestro preuniversitario. Sus experiencias pueden ser tu motivación.',
      features: [
        'Testimonios verificados de ex-alumnos',
        'Mejoras promedio de 150+ puntos',
        'Ingreso a las mejores universidades',
        'Apoyo continuo post-admisión',
      ],
      conclusion: 'Tu historia de éxito comienza aquí. Da el primer paso hoy.',
    },
  },
  recursos: {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1280&auto=format&fit=crop',
    background: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1920&auto=format&fit=crop',
    title: 'Biblioteca Digital',
    date: 'Recursos Ilimitados',
    scrollToExpand: 'Desplaza para explorar',
    about: {
      overview: 'Accede a nuestra extensa biblioteca de recursos educativos. Miles de ejercicios, guías y material de estudio a tu disposición 24/7.',
      features: [
        'Más de 10,000 ejercicios resueltos',
        'Guías de estudio actualizadas',
        'Ensayos PAES anteriores',
        'Material multimedia interactivo',
      ],
      conclusion: 'Todo lo que necesitas para tu preparación, en un solo lugar.',
    },
  },
};

const MediaContentSection = ({ media }: { media: MediaEntry }) => {
  return (
    <div className='max-w-5xl mx-auto space-y-12'>
      <div className='text-center space-y-4'>
        <h2 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
          Descubre Nuestro Contenido
        </h2>
        <p className='text-lg text-muted-foreground max-w-3xl mx-auto'>
          {media.about.overview}
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {media.about.features.map((feature, index) => (
          <Card key={index} className='border-2 hover:border-primary/50 transition-colors'>
            <CardHeader>
              <div className='flex items-start space-x-3'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold'>
                  {index + 1}
                </div>
                <CardDescription className='text-base'>{feature}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className='text-center space-y-6 py-8'>
        <p className='text-xl font-medium text-primary'>
          {media.about.conclusion}
        </p>
        <div className='flex gap-4 justify-center'>
          <Button size='lg' className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
            Comenzar Ahora
          </Button>
          <Button size='lg' variant='outline'>
            Solicitar Información
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function MediaPage() {
  const [selectedMedia, setSelectedMedia] = useState<string>('clases');
  const [showSelector, setShowSelector] = useState<boolean>(true);
  const currentMedia = mediaGallery[selectedMedia];
  useEffect(() => {
    window.scrollTo(0, 0);
    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, [selectedMedia]);
  const handleMediaSelect = (key: string) => {
    setSelectedMedia(key);
    setShowSelector(false);
    setTimeout(() => setShowSelector(true), 100);
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Media Selector */}
      <div className='fixed top-20 left-4 right-4 md:left-auto md:right-8 z-50 max-w-full md:max-w-md'>
        <Card className='bg-background/95 backdrop-blur-sm border-2'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>Explorar Contenido</CardTitle>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-3'>
              {Object.keys(mediaGallery).map(key => (
                <Button
                  key={key}
                  size='sm'
                  variant={selectedMedia === key ? 'default' : 'outline'}
                  onClick={() => handleMediaSelect(key)}
                  className='text-xs'
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Scroll Expand Media Component */}
      {showSelector && (
        <ScrollExpandMedia
          mediaType={currentMedia.src.includes('youtube.com') || currentMedia.src.includes('.mp4') ? 'video' : 'image'}
          mediaSrc={currentMedia.src}
          posterSrc={currentMedia.poster}
          bgImageSrc={currentMedia.background}
          title={currentMedia.title}
          date={currentMedia.date}
          scrollToExpand={currentMedia.scrollToExpand}
          textBlend={false}
        >
          <MediaContentSection media={currentMedia} />
        </ScrollExpandMedia>
      )}
    </div>
  );
}
