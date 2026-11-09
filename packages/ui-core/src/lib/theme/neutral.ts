import type { MimiThemePreset } from './types';

/**
 * El tema neutro que tenía Mimi hasta la 0.5.0 (R.0): negro y blanco sin color de marca. Para
 * quien no quiere el violeta: `provideMimiTheme(MIMI_THEME_NEUTRAL)`.
 *
 * Solo cambia lo que el tema de marca cambió: fondo, texto, superficies oscuras, primario y
 * anillo. El hover del botón primario ahora se deriva hacia `foreground` (antes, hacia el fondo).
 */
export const MIMI_THEME_NEUTRAL: MimiThemePreset = {
  name: 'neutral',
  colors: {
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    cardForeground: 'oklch(0.145 0 0)',
    popoverForeground: 'oklch(0.145 0 0)',
    primary: 'oklch(0.205 0 0)',
    primaryForeground: 'oklch(0.985 0 0)',
    ring: 'oklch(0.708 0 0)',
    brandText: 'oklch(0.145 0 0)',
  },
  darkColors: {
    background: 'oklch(0.145 0 0)',
    card: 'oklch(0.175 0 0)',
    popover: 'oklch(0.205 0 0)',
    primary: 'oklch(0.922 0 0)',
    primaryForeground: 'oklch(0.205 0 0)',
    secondary: 'oklch(0.269 0 0)',
    muted: 'oklch(0.225 0 0)',
    mutedForeground: 'oklch(0.708 0 0)',
    accent: 'oklch(0.269 0 0)',
    ring: 'oklch(0.556 0 0)',
    brandText: 'oklch(0.985 0 0)',
  },
};
