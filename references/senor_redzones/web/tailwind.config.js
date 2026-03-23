/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        rz: {
          primary: 'var(--rz-primary)',
          'background-light': '#f8f5f6',
          'background-dark': 'var(--rz-background-dark)',
          'panel-dark': 'rgba(var(--rz-background-dark-rgb), 0.85)',
        },
      },
      zIndex: {
        [50]: 999999999999,
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(var(--rz-primary-rgb), 0.4)',
        'neon-strong': '0 0 25px rgba(var(--rz-primary-rgb), 0.6)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
