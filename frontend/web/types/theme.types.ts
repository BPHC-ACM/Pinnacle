/**
 * Theme Type Definitions
 *
 * This file contains TypeScript type definitions for the theming system.
 * It ensures type safety when working with theme values throughout the application.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

/**
 * CSS Variable names used in the theme system
 */
export const ThemeCSSVariables = {
  // Neutral Scale
  neutral50: '--neutral-50',
  neutral100: '--neutral-100',
  neutral200: '--neutral-200',
  neutral300: '--neutral-300',
  neutral400: '--neutral-400',
  neutral500: '--neutral-500',
  neutral600: '--neutral-600',
  neutral700: '--neutral-700',
  neutral800: '--neutral-800',
  neutral900: '--neutral-900',
  neutral950: '--neutral-950',

  // Primary Blue
  primary50: '--primary-50',
  primary100: '--primary-100',
  primary200: '--primary-200',
  primary300: '--primary-300',
  primary400: '--primary-400',
  primary500: '--primary-500',
  primary600: '--primary-600',
  primary700: '--primary-700',
  primary800: '--primary-800',
  primary900: '--primary-900',

  // Accent Teal/Cyan
  accent50: '--accent-50',
  accent100: '--accent-100',
  accent200: '--accent-200',
  accent300: '--accent-300',
  accent400: '--accent-400',
  accent500: '--accent-500',
  accent600: '--accent-600',
  accent700: '--accent-700',
  accent800: '--accent-800',
  accent900: '--accent-900',

  // Semantic Colors
  success: '--success',
  successForeground: '--success-foreground',
  warning: '--warning',
  warningForeground: '--warning-foreground',
  error: '--error',
  errorForeground: '--error-foreground',
  info: '--info',
  infoForeground: '--info-foreground',

  // Background Colors
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',

  // UI Elements
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',

  // Borders & Inputs
  border: '--border',
  input: '--input',
  ring: '--ring',

  // Radii
  radius: '--radius',
} as const;

export type ThemeCSSVariable = (typeof ThemeCSSVariables)[keyof typeof ThemeCSSVariables];

/**
 * Neutral color scale type
 */
export type NeutralColor = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/**
 * Primary blue color scale type
 */
export type PrimaryColor = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/**
 * Accent teal/cyan color scale type
 */
export type AccentColor = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/**
 * Semantic color types
 */
export type SemanticColor = 'success' | 'warning' | 'error' | 'info';

/**
 * Font size scale (rem-based)
 */
export const FontSizes = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
} as const;

export type FontSize = keyof typeof FontSizes;

/**
 * Font weight scale
 */
export const FontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export type FontWeight = keyof typeof FontWeights;

/**
 * Typography hierarchy
 */
export const TypographyHierarchy = {
  h1: { size: '4xl' as FontSize, weight: 'bold' as FontWeight },
  h2: { size: '3xl' as FontSize, weight: 'bold' as FontWeight },
  h3: { size: '2xl' as FontSize, weight: 'semibold' as FontWeight },
  body: { size: 'base' as FontSize, weight: 'regular' as FontWeight },
  bodyBold: { size: 'base' as FontSize, weight: 'bold' as FontWeight },
  caption: { size: 'sm' as FontSize, weight: 'regular' as FontWeight },
  button: { size: 'sm' as FontSize, weight: 'medium' as FontWeight },
} as const;

export type TypographyVariant = keyof typeof TypographyHierarchy;

/**
 * 8px grid spacing system
 */
export const GridSpacing = {
  0: 0,
  0.5: 4, // Half unit
  1: 8,
  2: 16,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  7: 56,
  8: 64,
  9: 72,
  10: 80,
  12: 96,
  16: 128,
  20: 160,
  24: 192,
} as const;

export type GridSpacingKey = keyof typeof GridSpacing;

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  mode: ThemeMode;
  storageKey: string;
}

/**
 * Default theme configuration
 */
export const defaultThemeConfig: ThemeConfig = {
  mode: 'dark',
  storageKey: 'pinnacle-theme',
};

/**
 * Design tokens export for easy access
 */
export const DesignTokens = {
  colors: {
    primary: {
      light: 'hsl(210 90% 45%)',
      dark: 'hsl(210 86% 38%)',
    },
    accent: {
      main: '#22C1A6',
      hover: '#1AA38C',
      subtle: '#E9FBF7',
    },
    semantic: {
      success: '#16A34A',
      warning: '#D4A017',
      error: '#DC2626',
      info: 'hsl(210 94% 52%)',
    },
  },
  typography: {
    fontFamily: 'Inter',
    scale: FontSizes,
    weights: FontWeights,
    hierarchy: TypographyHierarchy,
  },
  spacing: {
    unit: 8, // Base 8px grid
    scale: GridSpacing,
  },
} as const;
