import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Password, en archivo propio: así se pueden proveer en `app.config.ts` sin llevar el
 * componente al chunk inicial (como Select, G1.5).
 */

export interface MimiPasswordText {
  /**
   * Nombre fijo del botón; el estado lo da `aria-pressed` (guía APG, «Button»: un botón de
   * alternar no cambia de nombre).
   */
  show: string;
  /** Nombres de los niveles del medidor. */
  weak: string;
  medium: string;
  strong: string;
  /** Lo que anuncia el lector cuando cambia el nivel. */
  announce: (level: string) => string;
  /** Las cuatro reglas por defecto. */
  minLength: string;
  uppercase: string;
  number: string;
  symbol: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_PASSWORD_TEXT_EN: MimiPasswordText = {
  show: 'Show password',
  weak: 'Weak',
  medium: 'Medium',
  strong: 'Strong',
  announce: (level) => `Password strength: ${level}`,
  minLength: '8 characters or more',
  uppercase: 'An uppercase letter',
  number: 'A number',
  symbol: 'A symbol',
};

/** Textos en español: `provideMimiPasswordText(MIMI_PASSWORD_TEXT_ES)`. */
export const MIMI_PASSWORD_TEXT_ES: MimiPasswordText = {
  show: 'Mostrar contraseña',
  weak: 'Débil',
  medium: 'Media',
  strong: 'Fuerte',
  announce: (level) => `Seguridad de la contraseña: ${level}`,
  minLength: '8 caracteres o más',
  uppercase: 'Una mayúscula',
  number: 'Un número',
  symbol: 'Un símbolo',
};

/** Textos activos. Sin `provideMimiPasswordText`, los predeterminados en inglés. */
export const MIMI_PASSWORD_TEXT = new InjectionToken<MimiPasswordText>('MIMI_PASSWORD_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_PASSWORD_TEXT_EN,
});

/**
 * Cambia los textos de Password. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiPasswordText(MIMI_PASSWORD_TEXT_ES)
 * ```
 */
export function provideMimiPasswordText(text: Partial<MimiPasswordText>): Provider {
  return { provide: MIMI_PASSWORD_TEXT, useValue: { ...MIMI_PASSWORD_TEXT_EN, ...text } };
}
