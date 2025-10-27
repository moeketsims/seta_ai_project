export const colors = {
  primary: {
    DEFAULT: '#0066CC',
    light: '#4D94FF',
    dark: '#004C99',
    foreground: '#FFFFFF',
  },
  secondary: {
    DEFAULT: '#7C3AED',
    light: '#A78BFA',
    dark: '#5B21B6',
    foreground: '#FFFFFF',
  },
  success: {
    DEFAULT: '#10B981',
    light: '#6EE7B7',
    dark: '#059669',
    foreground: '#0B4F3C',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
    foreground: '#4C2A04',
  },
  error: {
    DEFAULT: '#EF4444',
    light: '#FCA5A5',
    dark: '#DC2626',
    foreground: '#7F1D1D',
  },
  info: {
    DEFAULT: '#3B82F6',
    light: '#93C5FD',
    dark: '#1D4ED8',
    foreground: '#1E3A8A',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
} as const;

export const typography = {
  fonts: {
    heading: 'Poppins, Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  scale: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const radii = {
  sm: 6,
  md: 12,
  lg: 16,
  pill: 999
} as const;

export const elevation = {
  base: '0 20px 45px -20px rgba(15, 23, 42, 0.25)'
} as const;

export const designTokens = {
  colors,
  spacing,
  typography,
  radii,
  elevation
};
