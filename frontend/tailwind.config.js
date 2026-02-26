import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                heading: ['"Playfair Display"', 'Georgia', 'serif'],
                display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
                body: ['Lato', 'system-ui', 'sans-serif'],
            },
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                // Brand tokens — Royal Maroon & Antique Gold
                maroon: {
                    DEFAULT: 'oklch(var(--maroon))',
                    light: 'oklch(var(--maroon-light))',
                    dark: 'oklch(var(--maroon-dark))',
                    deep: 'oklch(var(--maroon-deep))',
                },
                gold: {
                    DEFAULT: 'oklch(var(--gold))',
                    light: 'oklch(var(--gold-light))',
                    dark: 'oklch(var(--gold-dark))',
                    bright: 'oklch(var(--gold-bright))',
                },
                ivory: {
                    DEFAULT: 'oklch(var(--ivory))',
                    warm: 'oklch(var(--ivory-warm))',
                    dark: 'oklch(var(--ivory-dark))',
                },
                // Legacy aliases
                crimson: {
                    DEFAULT: 'oklch(var(--crimson))',
                    light: 'oklch(var(--crimson-light))',
                    dark: 'oklch(var(--crimson-dark))',
                },
                teal: {
                    DEFAULT: 'oklch(var(--teal))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                silk: '0 4px 20px oklch(0.32 0.16 18 / 0.12)',
                'silk-lg': '0 8px 40px oklch(0.32 0.16 18 / 0.20)',
                gold: '0 4px 16px oklch(0.75 0.15 68 / 0.40)',
                'gold-lg': '0 8px 32px oklch(0.75 0.15 68 / 0.35)',
                maroon: '0 4px 16px oklch(0.32 0.16 18 / 0.30)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'gold-pulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 oklch(0.75 0.15 68 / 0.4)' },
                    '50%': { boxShadow: '0 0 0 8px oklch(0.75 0.15 68 / 0)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                shimmer: 'shimmer 2s linear infinite',
                'fade-up': 'fade-up 0.6s ease-out forwards',
                'gold-pulse': 'gold-pulse 2s ease-in-out infinite',
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
