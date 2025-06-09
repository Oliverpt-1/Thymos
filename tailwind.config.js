/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
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
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        // Bright, vibrant color palette with soft edges
        soft: {
          green: {
            50: 'hsl(140 60% 95%)',
            100: 'hsl(140 55% 85%)',
            200: 'hsl(140 60% 75%)',
            300: 'hsl(140 65% 65%)',
            400: 'hsl(140 70% 55%)',
            500: 'hsl(140 75% 45%)',
            600: 'hsl(140 80% 35%)',
            700: 'hsl(140 85% 25%)',
            800: 'hsl(140 90% 15%)',
            900: 'hsl(140 95% 8%)',
          },
          blue: {
            50: 'hsl(200 60% 95%)',
            100: 'hsl(200 55% 85%)',
            200: 'hsl(200 60% 75%)',
            300: 'hsl(200 65% 65%)',
            400: 'hsl(200 70% 55%)',
            500: 'hsl(200 75% 45%)',
            600: 'hsl(200 80% 35%)',
            700: 'hsl(200 85% 25%)',
            800: 'hsl(200 90% 15%)',
            900: 'hsl(200 95% 8%)',
          },
          orange: {
            50: 'hsl(25 60% 95%)',
            100: 'hsl(25 55% 85%)',
            200: 'hsl(25 60% 75%)',
            300: 'hsl(25 65% 65%)',
            400: 'hsl(25 70% 55%)',
            500: 'hsl(25 75% 45%)',
            600: 'hsl(25 80% 35%)',
            700: 'hsl(25 85% 25%)',
            800: 'hsl(25 90% 15%)',
            900: 'hsl(25 95% 8%)',
          },
          purple: {
            50: 'hsl(280 60% 95%)',
            100: 'hsl(280 55% 85%)',
            200: 'hsl(280 60% 75%)',
            300: 'hsl(280 65% 65%)',
            400: 'hsl(280 70% 55%)',
            500: 'hsl(280 75% 45%)',
            600: 'hsl(280 80% 35%)',
            700: 'hsl(280 85% 25%)',
            800: 'hsl(280 90% 15%)',
            900: 'hsl(280 95% 8%)',
          },
          red: {
            50: 'hsl(0 60% 95%)',
            100: 'hsl(0 55% 85%)',
            200: 'hsl(0 60% 75%)',
            300: 'hsl(0 65% 65%)',
            400: 'hsl(0 70% 55%)',
            500: 'hsl(0 75% 45%)',
            600: 'hsl(0 80% 35%)',
            700: 'hsl(0 85% 25%)',
            800: 'hsl(0 90% 15%)',
            900: 'hsl(0 95% 8%)',
          },
          emerald: {
            50: 'hsl(160 60% 95%)',
            100: 'hsl(160 55% 85%)',
            200: 'hsl(160 60% 75%)',
            300: 'hsl(160 65% 65%)',
            400: 'hsl(160 70% 55%)',
            500: 'hsl(160 75% 45%)',
            600: 'hsl(160 80% 35%)',
            700: 'hsl(160 85% 25%)',
            800: 'hsl(160 90% 15%)',
            900: 'hsl(160 95% 8%)',
          },
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'soft-pulse': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.02)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'soft-pulse': 'soft-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};