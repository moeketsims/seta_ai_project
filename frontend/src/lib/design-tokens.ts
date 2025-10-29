export const colors = {
  // UFS Official Brand Colors (Authoritative)
  'ufs-navy': '#0F204B', // UFS Navy (Pantone 2768) - PRIMARY
  'ufs-maroon': '#A71930', // UFS Maroon (Pantone 187) - ACCENT
  'edu-green': '#00675A', // Education Green (Pantone 329C)
  
  // UFS Grays - Cool-toned professional palette
  'ufs-gray-900': '#23272A',
  'ufs-gray-700': '#4B5563',
  'ufs-gray-500': '#6B7280',
  'ufs-gray-300': '#D1D5DB',
  'ufs-gray-200': '#E5E7EB',
  'ufs-gray-100': '#F1F3F5',
  
  // Semantic colors aligned with UFS brand
  primary: {
    DEFAULT: '#0F204B', // UFS Navy
    light: '#2D4270',
    dark: '#081429',
    foreground: '#FFFFFF',
  },
  secondary: {
    DEFAULT: '#A71930', // UFS Maroon
    light: '#D4294C',
    dark: '#7A1123',
    foreground: '#FFFFFF',
  },
  education: {
    DEFAULT: '#00675A', // Education Green
    light: '#00967F',
    dark: '#004A42',
    foreground: '#FFFFFF',
  },
  success: {
    DEFAULT: '#1F8A70', // Tint of edu-green
    light: '#6EE7B7',
    dark: '#00675A',
    foreground: '#FFFFFF',
  },
  warning: {
    DEFAULT: '#C97A00', // Muted amber
    light: '#FCD34D',
    dark: '#A86400',
    foreground: '#4C2A04',
  },
  error: {
    DEFAULT: '#A71930', // UFS Maroon doubles as error
    light: '#D4294C',
    dark: '#7A1123',
    foreground: '#FFFFFF',
  },
  info: {
    DEFAULT: '#0F204B', // UFS Navy for info
    light: '#2D4270',
    dark: '#081429',
    foreground: '#FFFFFF',
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
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F1F3F5', // UFS Gray 100
    tertiary: '#E5E7EB', // UFS Gray 200
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
    heading: 'Leitura Sans, Arial, system-ui, sans-serif', // UFS official typography
    body: 'Leitura Sans, Arial, system-ui, sans-serif',    // UFS official typography
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
  card: 16, // UFS standard card radius
  chip: 9999, // Full-rounded chips
  pill: 9999
} as const;

export const elevation = {
  base: '0 20px 45px -20px rgba(15, 23, 42, 0.25)',
  card: '0 4px 20px rgba(15, 32, 75, 0.08)' // UFS navy shadow
} as const;

export const designTokens = {
  colors,
  spacing,
  typography,
  radii,
  elevation
};
