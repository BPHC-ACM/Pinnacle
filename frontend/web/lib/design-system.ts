/**
 * Design System Constants
 *
 * This file provides easy access to all design system values.
 * Import and use these constants throughout your application for consistency.
 */

/**
 * Color Palette
 *
 * Usage examples:
 * - Primary CTAs: bg-accent-500 hover:bg-accent-600
 * - Subtle backgrounds: bg-accent-100
 * - Text on dark: text-neutral-50
 * - Borders: border-neutral-300 (light) / border-neutral-700 (dark)
 */
export const Colors = {
  // Primary Blue (lighter in light mode, deeper in dark mode)
  primary: {
    50: 'primary-50',
    100: 'primary-100',
    200: 'primary-200',
    300: 'primary-300',
    400: 'primary-400',
    500: 'primary-500',
    600: 'primary-600',
    700: 'primary-700',
    800: 'primary-800',
    900: 'primary-900',
  },

  // Accent Teal/Cyan (for CTAs and emphasis)
  accent: {
    50: 'accent-50',
    100: 'accent-100', // #E9FBF7 - subtle backgrounds, tags, progress fills
    200: 'accent-200',
    300: 'accent-300',
    400: 'accent-400',
    500: 'accent-500', // #22C1A6 - primary CTAs, active states
    600: 'accent-600', // #1AA38C - hover/pressed states
    700: 'accent-700',
    800: 'accent-800',
    900: 'accent-900',
  },

  // Neutral Cool Grays
  neutral: {
    50: 'neutral-50',
    100: 'neutral-100', // light surfaces
    200: 'neutral-200',
    300: 'neutral-300',
    400: 'neutral-400',
    500: 'neutral-500',
    600: 'neutral-600',
    700: 'neutral-700',
    800: 'neutral-800',
    900: 'neutral-900', // near-black text/backgrounds
    950: 'neutral-950',
  },

  // Semantic Colors
  semantic: {
    success: 'success', // #16A34A green
    warning: 'warning', // #D4A017 muted amber/ochre
    error: 'error', // #DC2626 restrained red
    info: 'info', // blue-tinted from primary
  },
} as const;

/**
 * Typography Scale
 *
 * Usage examples:
 * - Headings: text-4xl font-bold (H1), text-3xl font-bold (H2)
 * - Body text: text-base font-regular
 * - Captions: text-sm font-regular
 * - Buttons: text-sm font-medium
 */
export const Typography = {
  // Font Sizes (rem-based)
  size: {
    xs: 'text-xs', // 0.75rem - 12px
    sm: 'text-sm', // 0.875rem - 14px
    base: 'text-base', // 1rem - 16px
    lg: 'text-lg', // 1.125rem - 18px
    xl: 'text-xl', // 1.25rem - 20px
    '2xl': 'text-2xl', // 1.5rem - 24px
    '3xl': 'text-3xl', // 1.875rem - 30px
    '4xl': 'text-4xl', // 2.25rem - 36px
  },

  // Font Weights
  weight: {
    regular: 'font-regular', // 400
    medium: 'font-medium', // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold', // 700
  },

  // Hierarchy Presets
  hierarchy: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-2xl font-semibold',
    body: 'text-base font-regular',
    bodyBold: 'text-base font-bold',
    caption: 'text-sm font-regular',
    button: 'text-sm font-medium',
  },
} as const;

/**
 * Spacing Scale (8px grid system)
 *
 * Usage examples:
 * - Component padding: p-2 (16px), p-4 (32px)
 * - Margins: m-3 (24px), mt-6 (48px)
 * - Gaps: gap-2 (16px), gap-4 (32px)
 */
export const Spacing = {
  0: 'p-0', // 0px
  0.5: 'p-0.5', // 4px (half unit)
  1: 'p-1', // 8px
  2: 'p-2', // 16px
  3: 'p-3', // 24px
  4: 'p-4', // 32px
  5: 'p-5', // 40px
  6: 'p-6', // 48px
  7: 'p-7', // 56px
  8: 'p-8', // 64px
  9: 'p-9', // 72px
  10: 'p-10', // 80px
  12: 'p-12', // 96px
  16: 'p-16', // 128px
  20: 'p-20', // 160px
  24: 'p-24', // 192px
} as const;

/**
 * Common Component Patterns
 */
export const Patterns = {
  // Cards
  card: 'bg-card text-card-foreground rounded-lg border border-border shadow-sm',
  cardHover: 'transition-colors hover:bg-accent-100 dark:hover:bg-accent-900/10',

  // Buttons
  buttonPrimary: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-600',
  buttonSecondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  buttonOutline:
    'border border-input bg-background hover:bg-accent-100 dark:hover:bg-accent-900/10',
  buttonGhost: 'hover:bg-accent-100 dark:hover:bg-accent-900/10',

  // Inputs
  input:
    'bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent',

  // Text Colors
  textPrimary: 'text-foreground',
  textSecondary: 'text-muted-foreground',
  textAccent: 'text-accent-500',

  // Status Badges
  badgeSuccess: 'bg-success/10 text-success border border-success/20',
  badgeWarning: 'bg-warning/10 text-warning border border-warning/20',
  badgeError: 'bg-error/10 text-error border border-error/20',
  badgeInfo: 'bg-info/10 text-info border border-info/20',
  badgeAccent: 'bg-accent-100 text-accent-900 border border-accent-200',
} as const;

/**
 * Responsive Breakpoints
 */
export const Breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Animation Durations
 */
export const Animation = {
  fast: 'duration-150',
  normal: 'duration-200',
  slow: 'duration-300',
} as const;

/**
 * Z-Index Scale
 */
export const ZIndex = {
  dropdown: 'z-10',
  sticky: 'z-20',
  fixed: 'z-30',
  modalBackdrop: 'z-40',
  modal: 'z-50',
  popover: 'z-60',
  tooltip: 'z-70',
} as const;

/**
 * Example Usage:
 *
 * ```tsx
 * import { Colors, Typography, Patterns } from '@/lib/design-system';
 *
 * // Using color constants
 * <div className={`bg-${Colors.accent[500]} text-white`}>
 *   Primary CTA
 * </div>
 *
 * // Using typography
 * <h1 className={Typography.hierarchy.h1}>
 *   Main Heading
 * </h1>
 *
 * // Using patterns
 * <button className={Patterns.buttonPrimary}>
 *   Click Me
 * </button>
 * ```
 */
