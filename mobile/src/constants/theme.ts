/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

import { Brand as DesignBrand, layout, spacing as designSpacing } from '@/design/tokens';

/** @deprecated Prefer `@/design/tokens` — kept for existing screens */
export const Brand = DesignBrand;

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#60646C',
    textTertiary: '#889096',
    background: '#FAFAFA',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    backgroundCard: '#FFFFFF',
    border: '#E4E7EB',
    shadow: 'rgba(0,0,0,0.08)',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#B0B4BA',
    textTertiary: '#70777D',
    background: '#0D0F10',
    backgroundElement: '#1C1F21',
    backgroundSelected: '#2E3135',
    backgroundCard: '#18191B',
    border: '#2E3135',
    shadow: 'rgba(0,0,0,0.4)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: designSpacing.xxs,
  one: designSpacing.xs,
  two: designSpacing.sm,
  three: designSpacing.lg,
  four: designSpacing['2xl'],
  five: designSpacing['3xl'],
  six: designSpacing['6xl'],
} as const;

export { layout as Layout } from '@/design/tokens';

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Typography = {
  hero: { fontSize: 32, fontWeight: '800', lineHeight: 38 },
  h1: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  small: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  smallBold: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 0.5 },
} as const;

export type TypographyKey = keyof typeof Typography;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
