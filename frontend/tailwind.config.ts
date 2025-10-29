import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // UFS Brand Token Colors (Authoritative)
        'ufs-navy': '#0F204B',
        'ufs-maroon': '#A71930',
        'ufs-gray-900': '#23272A',
        'ufs-gray-700': '#4B5563',
        'ufs-gray-500': '#6B7280',
        'ufs-gray-300': '#D1D5DB',
        'ufs-gray-200': '#E5E7EB',
        'ufs-gray-100': '#F1F3F5',
        'edu-green': '#00675A',
        
        // Semantic colors aligned with UFS brand
        primary: {
          DEFAULT: '#0F204B', // UFS Navy
          50: '#E8ECF5',
          100: '#D1D9EB',
          200: '#A3B3D7',
          300: '#758DC3',
          400: '#4767AF',
          500: '#0F204B',
          600: '#0C1A3C',
          700: '#09132D',
          800: '#060D1E',
          900: '#03060F',
          foreground: '#ffffff'
        },
        secondary: {
          DEFAULT: '#A71930', // UFS Maroon
          50: '#FDE8EB',
          100: '#FBD1D7',
          200: '#F7A3AF',
          300: '#F37587',
          400: '#EF475F',
          500: '#A71930',
          600: '#861426',
          700: '#640F1D',
          800: '#430A13',
          900: '#21050A',
          foreground: '#ffffff'
        },
        education: {
          DEFAULT: '#00675A', // Education Green
          50: '#E6F5F3',
          100: '#CCEBE7',
          200: '#99D7CF',
          300: '#66C3B7',
          400: '#33AF9F',
          500: '#00675A',
          600: '#005248',
          700: '#003E36',
          800: '#002924',
          900: '#001512',
          foreground: '#ffffff'
        },
        success: {
          DEFAULT: '#1F8A70', // Tint of edu-green
          50: '#ECFDF5',
          500: '#1F8A70',
          600: '#00675A',
          foreground: '#ffffff'
        },
        warning: {
          DEFAULT: '#C97A00', // Muted amber
          50: '#FFFBEB',
          500: '#C97A00',
          600: '#A86400',
          foreground: '#4C2A04'
        },
        error: {
          DEFAULT: '#A71930', // UFS Maroon
          50: '#FDE8EB',
          500: '#A71930',
          600: '#861426',
          foreground: '#ffffff'
        },
        info: {
          DEFAULT: '#0F204B', // UFS Navy
          50: '#E8ECF5',
          500: '#0F204B',
          600: '#0C1A3C',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F1F3F5', // UFS Gray 100
          200: '#E5E7EB', // UFS Gray 200
          300: '#D1D5DB', // UFS Gray 300
          400: '#9CA3AF',
          500: '#6B7280', // UFS Gray 500
          600: '#4B5563', // UFS Gray 700
          700: '#4B5563',
          800: '#23272A', // UFS Gray 900
          900: '#23272A',
          950: '#1A1D1F'
        }
      },
      fontFamily: {
        heading: ['"Leitura Sans"', 'Arial', 'system-ui', 'sans-serif'], // UFS brand typography
        body: ['"Leitura Sans"', 'Arial', 'system-ui', 'sans-serif'],    // UFS brand typography
        mono: ['"JetBrains Mono"', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px rgba(15, 32, 75, 0.08)', // UFS card shadow (navy tint)
        'elevation': '0 20px 45px -20px rgba(15, 23, 42, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glow-primary': '0 0 20px rgba(15, 32, 75, 0.3)', // UFS Navy glow
        'glow-secondary': '0 0 20px rgba(167, 25, 48, 0.3)', // UFS Maroon glow
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    }
  },
  plugins: []
};

export default config;
