import Image from 'next/image';
import Link from 'next/link';
import { VisitorCounter } from '@/components/VisitorCounter';

const navigationSections = [
  {
    title: 'Educación',
    items: [
      { title: 'Preuniversitario', href: '#hero' },
      { title: 'Carreras', href: '#features' },
      { title: 'Profesores', href: '#testimonials' },
      { title: 'Metodología', href: '#stats' },
    ],
  },
  {
    title: 'Servicios',
    items: [
      { title: 'Clases Virtuales', href: '#features' },
      { title: 'Tutorías', href: '#contact' },
      { title: 'Materiales', href: '#pricing' },
      { title: 'Evaluaciones', href: '#stats' },
    ],
  },
  {
    title: 'Recursos',
    items: [
      { title: 'Biblioteca', href: '#features' },
      { title: 'Simulacros', href: '#pricing' },
      { title: 'Videos', href: '#testimonials' },
      { title: 'Apuntes', href: '#stats' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { title: 'Contacto', href: '#contact' },
      { title: 'Ayuda', href: '#contact' },
      { title: 'FAQ', href: '#contact' },
      { title: 'Inscripciones', href: '#pricing' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { title: 'Política de Privacidad', href: '#' },
      { title: 'Términos de Servicio', href: '#' },
      { title: 'Ministerio de Educación', href: 'https://www.mineduc.cl/' },
    ],
  },
];

const MINEDUC_COLORS = {
  blue: '#0033A0',
  red: '#E1001A',
  white: '#FFFFFF',
  offWhite: '#F5F7FF',
  muted: '#C5D0E6'
}; // Fixed palette matching official MINEDUC branding

export default function Footer() {
  return (
    <footer
      className="text-white bg-[#003366]"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        {/* MINEDUC Navigation Menu */}
        <div className="mb-8 grid gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-5">
          {navigationSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="mb-4 text-lg font-semibold text-white">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={item.href}
                      className="transition-colors duration-200 text-sm hover:text-white text-[#C5D0E6]"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* MINEDUC Branding Bar */}
        <div
          className="mb-6 flex flex-col gap-6 border-t border-[#C5D0E6] py-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* MINEDUC Bars */}
            <div className="flex h-4 w-28 sm:w-32">
              <div
                className="h-full w-1/2 bg-white"
              ></div>
              <div
                className="h-full w-1/2 bg-[#D52B1E]"
              ></div>
            </div>
            <a
              href="https://www.mineduc.cl/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-[#F5F7FF] text-white"
            >
              <span className="text-lg font-bold">Ministerio de Educación</span>
            </a>
          </div>

          {/* Social Media Links */}
          <div className="flex flex-wrap items-center gap-4 sm:justify-end">
            <a
              href="https://www.facebook.com/mineduc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-colors duration-200 hover:text-white text-[#C5D0E6]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
              </svg>
            </a>
            <a
              href="https://twitter.com/mineduc"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X/Twitter"
              className="transition-colors duration-200 hover:text-white text-[#C5D0E6]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.53 6.47a.75.75 0 0 0-1.06 0L12 10.94 7.53 6.47a.75.75 0 0 0-1.06 1.06L10.94 12l-4.47 4.47a.75.75 0 0 0 1.06 1.06L12 13.06l4.47 4.47a.75.75 0 0 0 1.06-1.06L13.06 12l4.47-4.47a.75.75 0 0 0 0-1.06z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/mineducchile/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-colors duration-200 hover:text-white"
              style={{ color: MINEDUC_COLORS.muted }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.635.401 3.678 1.358 2.721 2.315 2.448 3.451 2.39 4.732 2.332 6.012 2.32 6.421 2.32 12c0 5.579.012 5.988.07 7.268.058 1.281.331 2.417 1.288 3.374.957.957 2.093 1.23 3.374 1.288C8.332 23.988 8.741 24 12 24s3.668-.012 4.948-.07c1.281-.058 2.417-.331 3.374-1.288.957-.957 1.23-2.093 1.288-3.374.058-1.28.07-1.689.07-7.268 0-5.579-.012-5.988-.07-7.268-.058-1.281-.331-2.417-1.288-3.374C19.365.401 18.229.128 16.948.07 15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Dev Favicon Copyright */}
        <div
          className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderTop: `1px solid ${MINEDUC_COLORS.muted}` }}
        >
          <div className="flex-1">
            <p className="text-sm mb-2" style={{ color: MINEDUC_COLORS.offWhite }}>
              © {new Date().getFullYear()} Preuniversitario Astral. Todos los derechos reservados.
            </p>
            <div className="text-xs" style={{ color: MINEDUC_COLORS.offWhite }}>
              Desarrollado por{' '}
              <span className="font-mono text-lg tracking-wider" style={{ color: MINEDUC_COLORS.white }}>
                ΛRΛMΛC®
              </span>
            </div>
            <div className="mt-2 flex items-center">
              <Image
                src="/devicon.png"
                alt="Dev Favicon"
                width={32}
                height={32}
                className="mr-2 h-8 w-8 opacity-60"
              />
              <span className="text-xs" style={{ color: MINEDUC_COLORS.offWhite }}>
                Desarrollado con ❤️
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <VisitorCounter />
          </div>
        </div>
      </div>
    </footer>
  );
}
