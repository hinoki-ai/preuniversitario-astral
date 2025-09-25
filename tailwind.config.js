module.exports = {
  darkMode: ['class'],
  content: ['./components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        short: { raw: '(max-height: 748px)' },
      },
      spacing: {
        inset: 'var(--inset)',
        sides: 'var(--sides)',
        'footer-safe-area': 'var(--footer-safe-area)',
      },
      backgroundImage: {
        'gradient-primary':
          'linear-gradient(90deg,rgba(255,255,255, 0.1) 0%,rgba(255,255,255, 0.4) 100%),rgba(85,85,85,0.1)',
        'gradient-warm': 'linear-gradient(135deg, oklch(0.65 0.18 80), oklch(0.55 0.15 75), oklch(0.45 0.12 70))',
        'gradient-golden': 'linear-gradient(135deg, oklch(0.65 0.18 80), oklch(0.7 0.16 85))',
        'gradient-bronze': 'linear-gradient(135deg, oklch(0.5 0.18 55), oklch(0.6 0.15 60))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      transitionProperty: {
        'colors-and-shadows':
          'color, background-color, border-color, text-decoration-color, fill, stroke, box-shadow',
      },
      animation: {
        shine: 'shine 2s ease-in-out infinite',
      },
      fontFamily: {
        serif: ['var(--font-instrument-serif)', 'serif'],
      },
      boxShadow: {
        button:
          'inset 0 0 1px 1px rgba(255, 255, 255, 0.05), inset 0 0 2px 1px rgba(255, 255, 255, 0.2), inset -1px -1px 1px 0px rgba(0, 0, 0, 0.0), 0 0 10px 0 rgba(255, 255, 255, 0.1)',
        'button-hover':
          'inset 0 0 5px 1px rgba(255, 255, 255, 0.2), inset 0.5px 0.5px 1px 0.5px rgba(255, 255, 255, 0.5), inset -0.5px -0.5px 0.5px 0.5px rgba(0, 0, 0, 0.2), 0 0 12px 4px rgba(255, 255, 255, 0.5)',
        premium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'premium-golden': '0 4px 15px -3px rgba(184, 134, 63, 0.15), 0 2px 8px -2px rgba(184, 134, 63, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'premium-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        'deep-brown': 'rgb(var(--deep-brown) / <alpha-value>)',
        'warm-sage': 'rgb(var(--warm-sage) / <alpha-value>)',
        'cream': 'rgb(var(--cream) / <alpha-value>)',
        'golden': 'rgb(var(--golden) / <alpha-value>)',
        'bronze': 'rgb(var(--bronze) / <alpha-value>)',
        'amber': 'rgb(var(--amber) / <alpha-value>)',
        
        /* Legacy support for existing components */
        'deep-blue': 'rgb(var(--deep-brown) / <alpha-value>)',
        'sage': 'rgb(var(--warm-sage) / <alpha-value>)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
